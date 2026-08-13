import os
import random
import string
import requests
from flask import Flask, request, redirect, jsonify

# Данные берутся из переменных или ставятся по умолчанию
TOKEN = os.environ.get("BOT_TOKEN", "8790088326:AAHKaigWjGSbwr11seLukJXeyWXO2eAtNNg")
MY_ADMIN_ID = int(os.environ.get("ADMIN_ID", 5773841673))
BOT_USERNAME = os.environ.get("BOT_USERNAME", "lelyahackbot")
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "my_super_secret_key_123")

app = Flask(__name__)

DATABASE = {
    "banned": set(),
    "keys": {},
    "active_users": {},
    "hwid_to_tg": {}
}

def send_telegram_msg(chat_id, text, parse_mode=None):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    if parse_mode:
        payload["parse_mode"] = parse_mode
    try:
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        print(f"Ошибка отправки сообщения: {e}")

@app.route('/')
def home():
    return "Lelya Bot is alive and working!"

@app.route('/start')
def web_start():
    hwid = request.args.get('hwid', '').strip()
    if hwid:
        msg = f"🚨 **Запрос ключа от игрока!**\nHWID: `{hwid}`\n\nСоздатель: `vtmin7`"
        send_telegram_msg(MY_ADMIN_ID, msg, parse_mode="Markdown")
        return redirect(f"https://t.me/{BOT_USERNAME}?start={hwid}")
    return redirect(f"https://t.me/{BOT_USERNAME}")

@app.route('/verify', methods=['GET'])
def verify_key():
    hwid = request.args.get('hwid', '').strip()
    key = request.args.get('key', '').strip()
    
    if not hwid:
        return jsonify({"status": "error", "message": "HWID не указан!"})

    if hwid in DATABASE["banned"]:
        return jsonify({"status": "banned", "message": "Ваш HWID заблокирован!"})

    # Проверка фонового пинга
    if key == "PING_CHECK" and hwid in DATABASE["active_users"]:
        return jsonify({"status": "success", "message": "Active"})

    # Активация ключа
    if key in DATABASE["keys"]:
        days = DATABASE["keys"][key]
        del DATABASE["keys"][key]
        DATABASE["active_users"][hwid] = days
        return jsonify({"status": "success", "message": f"Активировано на {days} дней!"})

    return jsonify({"status": "error", "message": "Неверный или уже использованный ключ!"})

@app.route('/webhook', methods=['POST'])
def telegram_webhook():
    secret_header = request.headers.get('X-Telegram-Bot-Api-Secret-Token')
    if WEBHOOK_SECRET and secret_header != WEBHOOK_SECRET:
        return "Unauthorized", 403

    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return "OK", 200

        message = data['message']
        chat_id = message['chat']['id']
        user_id = message['from']['id']
        username = message['from'].get('username', 'Нет юзернейма')
        text = message.get('text', '').strip()

        # Старт для игроков
        if text.startswith('/start'):
            parts = text.split(maxsplit=1)
            if len(parts) > 1:
                hwid_arg = parts[1]
                DATABASE["hwid_to_tg"][hwid_arg] = f"@{username} (ID: {user_id})"
            
            welcome_msg = "👋 Привет! Чтобы получить ключ, нужно **заплатить лутом** в игре.\n\n📩 Напиши в Discord: **vtmin7**"
            send_telegram_msg(chat_id, welcome_msg, parse_mode="Markdown")
            return "OK", 200

        # Доступ к админке только для тебя
        if user_id != MY_ADMIN_ID:
            send_telegram_msg(chat_id, "❌ У тебя нет доступа к командам управления.")
            return "OK", 200

        parts = text.split()
        cmd = parts[0].lower() if parts else ""

        # 1. Генерация ключа
        if cmd in ['/gen', 'gen']:
            days = 30
            if len(parts) > 1 and parts[1].isdigit():
                days = int(parts[1])
            
            new_key = "LELYA-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            DATABASE["keys"][new_key] = days
            send_telegram_msg(chat_id, f"✅ Твой ключ на {days} дней:\n`{new_key}`", parse_mode="Markdown")

        # 2. Продление подписки
        elif cmd in ['/adddays', '/extend']:
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

        # 3. Бан
        elif cmd in ['/ban']:
            if len(parts) > 1:
                hwid = parts[1]
                DATABASE["banned"].add(hwid)
                DATABASE["active_users"].pop(hwid, None)
                send_telegram_msg(chat_id, f"🔨 HWID `{hwid}` заблокирован.", parse_mode="Markdown")
            else:
                send_telegram_msg(chat_id, "Пример: `/ban HWID-XXXX`", parse_mode="Markdown")

        # 4. Разбан
        elif cmd in ['/unban']:
            if len(parts) > 1:
                hwid = parts[1]
                DATABASE["banned"].discard(hwid)
                send_telegram_msg(chat_id, f"✅ HWID `{hwid}` разбанен.", parse_mode="Markdown")
            else:
                send_telegram_msg(chat_id, "Пример: `/unban HWID-XXXX`", parse_mode="Markdown")

        # 5. Сброс HWID
        elif cmd in ['/reset']:
            if len(parts) > 1:
                hwid = parts[1]
                DATABASE["active_users"].pop(hwid, None)
                DATABASE["banned"].discard(hwid)
                DATABASE["hwid_to_tg"].pop(hwid, None)
                send_telegram_msg(chat_id, f"🔄 HWID `{hwid}` полностью сброшен.", parse_mode="Markdown")
            else:
                send_telegram_msg(chat_id, "Пример: `/reset HWID-XXXX`", parse_mode="Markdown")

        # 6. Список игроков
        elif cmd in ['/online', '/users']:
            if not DATABASE["active_users"]:
                send_telegram_msg(chat_id, "⚪ Сейчас нет активных игроков.")
            else:
                text_msg = "🟢 **Активные устройства:**\n\n"
                for hwid, days in DATABASE["active_users"].items():
                    tg_info = DATABASE["hwid_to_tg"].get(hwid, "Telegram не зафиксирован")
                    text_msg += f"• **Игрок:** {tg_info}\n  💻 HWID: `{hwid}`\n  ⏳ Дней: **{days}**\n\n"
                send_telegram_msg(chat_id, text_msg, parse_mode="Markdown")

        # 7. Общая статистика
        elif cmd in ['/all', '/stats']:
            stats_msg = (
                f"📊 **Статистика бота:**\n\n"
                f"🟢 Активных игроков: **{len(DATABASE['active_users'])}**\n"
                f"🔑 Свободных ключей: **{len(DATABASE['keys'])}**\n"
                f"🔴 Забанено: **{len(DATABASE['banned'])}**"
            )
            send_telegram_msg(chat_id, stats_msg, parse_mode="Markdown")

        # Помощь по командам
        else:
            help_text = (
                "🤖 **Команды управления:**\n"
                "• `/gen [дни]` — Создать ключ\n"
                "• `/online` — Активные игроки\n"
                "• `/all` — Статистика\n"
                "• `/adddays [HWID] [дни]` — Продлить\n"
                "• `/ban [HWID]` — Забанить\n"
                "• `/unban [HWID]` — Разбанить\n"
                "• `/reset [HWID]` — Сбросить HWID"
            )
            send_telegram_msg(chat_id, help_text, parse_mode="Markdown")

    except Exception as e:
        send_telegram_msg(MY_ADMIN_ID, f"⚠️ Ошибка сервера: {str(e)}")

    return "OK", 200

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
