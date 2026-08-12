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
    "active_users": {}     # HWID: количество оставшихся дней
}

@app.route('/')
def home():
    return "Lelya Bot is alive and working!"

# Перенаправление из игры в Telegram-бота с HWID
@app.route('/start')
def web_start():
    hwid = request.args.get('hwid', '')
    if hwid:
        # Проверяем текущий статус для сообщения администратору
        if hwid in DATABASE["banned"]:
            status_text = "🔴 (Забанен)"
        elif hwid in DATABASE["active_users"]:
            status_text = f"🟢 (Активен: {DATABASE['active_users'][hwid]} дн.)"
        else:
            status_text = "⚪ (Нет подписки)"

        msg = f"🚨 **Запрос ключа от игрока!**\nHWID: `{hwid}`\nСтатус: {status_text}\n\nСоздатель: `vtmin7`"
        url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
        requests.post(url, json={"chat_id": MY_ADMIN_ID, "text": msg, "parse_mode": "Markdown"})
    return redirect(f"https://t.me/{BOT_USERNAME}?start={hwid}")

# Проверка ключа и фоновый пинг из игры
@app.route('/verify', methods=['GET'])
def verify_key():
    hwid = request.args.get('hwid', '')
    key = request.args.get('key', '').strip()
    
    # Если HWID в бане, возвращаем точный статус banned для мгновенного отключения в скрипте
    if hwid in DATABASE["banned"]:
        return jsonify({"status": "banned", "message": "Ваш HWID заблокирован!"})

    if key in DATABASE["keys"]:
        days = DATABASE["keys"][key]
        del DATABASE["keys"][key]  # Ключ сгорает после использования
        DATABASE["active_users"][hwid] = days
        return jsonify({"status": "success", "message": f"Активировано на {days} дней!"})
    
    # Фоновая проверка пинга (когда скрипт стучится с ключом PING_CHECK)
    if key == "PING_CHECK" and hwid in DATABASE["active_users"]:
        return jsonify({"status": "success", "message": "Active"})

    # Тестовый/запасной ключ
    if key == "LELYA-3M6UOB":
        return jsonify({"status": "success", "message": "Активировано!"})

    return jsonify({"status": "error", "message": "Неверный или уже использованный ключ!"})

# Обработка команд от тебя в Telegram
@app.route('/webhook', methods=['POST'])
def telegram_webhook():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return "OK", 200

        message = data['message']
        chat_id = message['chat']['id']
        user_id = message['from']['id']
        text = message.get('text', '').strip()

        if user_id != MY_ADMIN_ID:
            send_telegram_msg(chat_id, "❌ У тебя нет доступа к этому боту.")
            return "OK", 200

        parts = text.split()
        cmd = parts[0].lower() if parts else ""

        # Генерация ключа: /gen [дни]
        if '/gen' in cmd:
            days = 30
            if len(parts) > 1 and parts[1].isdigit():
                days = int(parts[1])
            
            new_key = "LELYA-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            DATABASE["keys"][new_key] = days
            
            send_telegram_msg(chat_id, f"✅ Твой ключ на {days} дней:\n`{new_key}`", parse_mode="Markdown")

        # Бан игрока: /ban HWID-...
        elif '/ban' in cmd:
            if len(parts) > 1:
                hwid = parts[1]
                DATABASE["banned"].add(hwid)
                if hwid in DATABASE["active_users"]:
                    del DATABASE["active_users"][hwid]
                send_telegram_msg(chat_id, f"🔨 HWID `{hwid}` заблокирован. 🔴 Статус обновлен, скрипт игрока отключится автоматически.", parse_mode="Markdown")
            else:
                send_telegram_msg(chat_id, "Укажи HWID. Пример: `/ban HWID-XXXX`", parse_mode="Markdown")

        # Разбан игрока: /unban HWID-...
        elif '/unban' in cmd:
            if len(parts) > 1:
                hwid = parts[1]
                if hwid in DATABASE["banned"]:
                    DATABASE["banned"].remove(hwid)
                    send_telegram_msg(chat_id, f"✅ HWID `{hwid}` разбанен. 🟢 Статус изменен.", parse_mode="Markdown")
                else:
                    send_telegram_msg(chat_id, "⚠️ Этот HWID не найден в списке забаненных.")
            else:
                send_telegram_msg(chat_id, "Укажи HWID. Пример: `/unban HWID-XXXX`", parse_mode="Markdown")

        # Проверка статуса игрока: /check HWID-...
        elif '/check' in cmd:
            if len(parts) > 1:
                hwid = parts[1]
                if hwid in DATABASE["banned"]:
                    status = "🔴 Статус: Забанен"
                elif hwid in DATABASE["active_users"]:
                    days_left = DATABASE["active_users"][hwid]
                    status = f"🟢 Статус: Активен (осталось дней: {days_left})"
                else:
                    status = "⚪ Статус: Нет активной подписки"
                
                send_telegram_msg(chat_id, f"ℹ️ Информация о HWID `{hwid}`:\n{status}", parse_mode="Markdown")
            else:
                send_telegram_msg(chat_id, "Укажи HWID. Пример: `/check HWID-XXXX`", parse_mode="Markdown")

        else:
            send_telegram_msg(chat_id, "🤖 Бот активен!\nКоманды:\n`/gen 30` — создать ключ\n`/ban [HWID]` — бан со статусом\n`/unban [HWID]` — разбан\n`/check [HWID]` — проверить статус", parse_mode="Markdown")

    except Exception as e:
        send_telegram_msg(MY_ADMIN_ID, f"⚠️ Ошибка: {str(e)}")

    return "OK", 200

def send_telegram_msg(chat_id, text, parse_mode=None):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    if parse_mode:
        payload["parse_mode"] = parse_mode
    requests.post(url, json=payload)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
