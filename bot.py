import os
import requests
import random
import string
from flask import Flask, request, redirect, jsonify

TOKEN = "8790088326:AAHKaigWjGSbwr11seLukJXeyWXO2eAtNNg"
MY_ADMIN_ID = 5773841673
BOT_USERNAME = "lelyahackbot"

app = Flask('')

# База данных в памяти сервера
DATABASE = {
    "banned": set(),       # Забаненные HWID
    "keys": {},            # Ключ: количество дней
    "active_users": {},    # HWID: количество оставшихся дней
    "hwid_to_tg": {}       # HWID: Telegram ID / username игрока
}

@app.route('/')
def home():
    return "Lelya Bot is alive and working!"

# Перенаправление из игры в Telegram-бота с HWID
@app.route('/start')
def web_start():
    hwid = request.args.get('hwid', '')
    if hwid:
        msg = f"🚨 **Запрос ключа от игрока!**\nHWID: `{hwid}`\n\nСоздатель: `vtmin7`"
        url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
        requests.post(url, json={"chat_id": MY_ADMIN_ID, "text": msg, "parse_mode": "Markdown"})
    return redirect(f"https://t.me/{BOT_USERNAME}?start={hwid}")

# Проверка ключа и фоновый пинг из игры
@app.route('/verify', methods=['GET'])
def verify_key():
    hwid = request.args.get('hwid', '')
    key = request.args.get('key', '').strip()
    
    if hwid in DATABASE["banned"]:
        return jsonify({"status": "banned", "message": "Ваш HWID заблокирован!"})

    if key in DATABASE["keys"]:
        days = DATABASE["keys"][key]
        del DATABASE["keys"][key]
        DATABASE["active_users"][hwid] = days
        return jsonify({"status": "success", "message": f"Активировано на {days} дней!"})
    
    if key == "PING_CHECK" and hwid in DATABASE["active_users"]:
        return jsonify({"status": "success", "message": "Active"})

    if key == "LELYA-3M6UOB":
        return jsonify({"status": "success", "message": "Активировано!"})

    return jsonify({"status": "error", "message": "Неверный или уже использованный ключ!"})

# Обработка команд от тебя и сообщений от игроков в Telegram
@app.route('/webhook', methods=['POST'])
def telegram_webhook():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return "OK", 200

        message = data['message']
        chat_id = message['chat']['id']
        user_id = message['from']['id']
        username = message['from'].get('username', 'Нет юзернейма')
        text = message.get('text', '').strip()

        # ------------------- ОБРАБОТКА /start -------------------
        if text.startswith('/start'):
            # Если передали HWID (например: /start HWID123), сохраняем связь
            parts = text.split()
            if len(parts) > 1:
                hwid_arg = parts[1]
                DATABASE["hwid_to_tg"][hwid_arg] = f"@{username} (ID: {user_id})"

            # Отправляем единое сообщение пользователю
            send_telegram_msg(
                chat_id, 
                "Чтобы получить ключ, дайте лут создателю. Discord: vtmin7"
            )
            return "OK", 200
        # --------------------------------------------------------

        # Проверка прав администратора для остальных команд
        if user_id != MY_ADMIN_ID:
            send_telegram_msg(chat_id, "Чтобы получить ключ, дайте лут создателю. Discord: vtmin7")
            return "OK", 200

        parts = text.split()
        cmd = parts[0].lower() if parts else ""

        # 1. gen - Сгенерировать ключ
        if '/gen' in cmd:
            days = 30
            if len(parts) > 1 and parts[1].isdigit():
                days = int(parts[1])
            
            new_key = "LELYA-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            DATABASE["keys"][new_key] = days
            send_telegram_msg(chat_id, f"✅ Твой ключ на {days} дней:\n`{new_key}`", parse_mode="Markdown")

        # 2. adddays - Продлить подписку
        elif '/adddays' in cmd or '/extend' in cmd:
            if len(parts) > 2 and parts[2].isdigit():
                hwid = parts[1]
                days_add = int(parts[2])
                if hwid in DATABASE["active_users"]:
                    DATABASE["active_users"][hwid] += days_add
                    send_telegram_msg(chat_id, f"⏳ Подписка HWID `{hwid}` продлена на {days_add} дн.", parse_mode="Markdown")
                else:
                    send_telegram_msg(chat_id, "⚠️ Этот HWID не найден среди активных игроков.")
            else:
                send_telegram_msg(chat_id, "Использование: `/adddays [HWID] [дни]`", parse_mode="Markdown")

        # 3. ban - Бан
        elif '/ban' in cmd:
            if len(parts) > 1:
                hwid = parts[1]
                DATABASE["banned"].add(hwid)
                if hwid in DATABASE["active_users"]:
                    del DATABASE["active_users"][hwid]
                send_telegram_msg(chat_id, f"🔨 HWID `{hwid}` заблокирован.", parse_mode="Markdown")
            else:
                send_telegram_msg(chat_id, "Укажи HWID. Пример: `/ban HWID-XXXX`", parse_mode="Markdown")

        # 4. unban - Разбан
        elif '/unban' in cmd:
            if len(parts) > 1:
                hwid = parts[1]
                if hwid in DATABASE["banned"]:
                    DATABASE["banned"].remove(hwid)
                    send_telegram_msg(chat_id, f"✅ HWID `{hwid}` разбанен.", parse_mode="Markdown")
                else:
                    send_telegram_msg(chat_id, "⚠️ Этот HWID не найден в бан-листе.")
            else:
                send_telegram_msg(chat_id, "Укажи HWID. Пример: `/unban HWID-XXXX`", parse_mode="Markdown")

        # 5. reset - Сброс
        elif '/reset' in cmd:
            if len(parts) > 1:
                hwid = parts[1]
                if hwid in DATABASE["active_users"]:
                    del DATABASE["active_users"][hwid]
                if hwid in DATABASE["banned"]:
                    DATABASE["banned"].remove(hwid)
                if hwid in DATABASE["hwid_to_tg"]:
                    del DATABASE["hwid_to_tg"][hwid]
                send_telegram_msg(chat_id, f"🔄 HWID `{hwid}` полностью сброшен.", parse_mode="Markdown")
            else:
                send_telegram_msg(chat_id, "Укажи HWID. Пример: `/reset HWID-XXXX`", parse_mode="Markdown")

        # 6. online / users — Показать активных игроков, их HWID и ТГ
        elif '/online' in cmd or '/users' in cmd:
            if not DATABASE["active_users"]:
                send_telegram_msg(chat_id, "⚪ Сейчас нет активных игроков со скриптом.")
            else:
                text_msg = "🟢 **Активные устройства и их владельцы:**\n\n"
                for hwid, days in DATABASE["active_users"].items():
                    tg_info = DATABASE["hwid_to_tg"].get(hwid, "Telegram не зафиксирован")
                    text_msg += f"• **Игрок:** {tg_info}\n  💻 HWID: `{hwid}`\n  ⏳ Дней осталось: **{days}**\n\n"
                send_telegram_msg(chat_id, text_msg, parse_mode="Markdown")

        # 7. all - Статистика
        elif '/all' in cmd or '/stats' in cmd:
            stats_msg = (
                f"📊 **Статистика бота:**\n\n"
                f"🟢 Активных игроков: **{len(DATABASE['active_users'])}**\n"
                f"🔑 Свободных ключей: **{len(DATABASE['keys'])}**\n"
                f"🔴 Забанено: **{len(DATABASE['banned'])}**"
            )
            send_telegram_msg(chat_id, stats_msg, parse_mode="Markdown")

        else:
            help_text = (
                "🤖 **Команды управления:**\n"
                "• `/gen [дни]` — Создать ключ\n"
                "• `/online` — Кто играет (HWID + Телеграм)\n"
                "• `/all` — Статистика\n"
                "• `/adddays [HWID] [дни]` — Продлить\n"
                "• `/ban [HWID]` — Бан\n"
                "• `/unban [HWID]` — Разбан\n"
                "• `/reset [HWID]` — Сброс"
            )
            send_telegram_msg(chat_id, help_text, parse_mode="Markdown")

    except Exception as e:
        send_telegram_msg(MY_ADMIN_ID, f"⚠️ Ошибка: {str(e)}")

    return "OK", 200

def send_telegram_msg(chat_id, text, parse_mode=None):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    if parse_mode:
        payload["parse_mode"] = parse_mode
    requests.post(url, json=payload)
# --- Выдача заобфусцированного ядра скрипта ---
@app.route('/get-core-script', methods=['GET'])
def get_core_script():
    hwid = request.args.get('hwid', '')
    key = request.args.get('key', '').strip()

    # Проверка на бан
    if hwid in DATABASE["banned"]:
        return jsonify({"status": "error", "message": "Вы забанены!"}), 403

    # Авто-вход по уже сохраненному HWID
    if key == 'AUTO_PING' or key == 'PING_CHECK':
        if hwid in DATABASE["active_users"] and DATABASE["active_users"][hwid] > 0:
            try:
                with open('core_obfuscated.js', 'r', encoding='utf-8') as f:
                    return jsonify({"status": "success", "script": f.read()})
            except Exception as e:
                return jsonify({"status": "error", "message": "Файл скрипта не найден!"}), 500
        else:
            return jsonify({"status": "error", "message": "Подписка не активна!"}), 403

    # Активация по новому ключу
    if key in DATABASE["keys"]:
        days = DATABASE["keys"].pop(key)
        DATABASE["active_users"][hwid] = days
        
        try:
            with open('core_obfuscated.js', 'r', encoding='utf-8') as f:
                return jsonify({"status": "success", "script": f.read()})
        except Exception as e:
            return jsonify({"status": "error", "message": "Файл скрипта не найден!"}), 500

    return jsonify({"status": "error", "message": "Неверный ключ!"}), 403
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
