import os
import requests
import random
import string
from flask import Flask, request, redirect

TOKEN = "8790088326:AAHKaigWjGSbwr11seLukJXeyWXO2eAtNNg"
MY_ADMIN_ID = 5773841673
BOT_USERNAME = "lelyahackbot"

app = Flask('')

# База данных
DATABASE = {
    "banned": set(),
    "keys": {},            # Ключ: дни
    "active_users": {}     # HWID: дни
}

@app.route('/')
def home():
    return "Lelya Bot is alive and working!"

@app.route('/start')
def web_start():
    hwid = request.args.get('hwid', '')
    if hwid:
        msg = f"🚨 **Запрос ключа от игрока!**\nHWID: `{hwid}`\n\nСоздатель: `vtmin7`"
        url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
        requests.post(url, json={"chat_id": MY_ADMIN_ID, "text": msg, "parse_mode": "Markdown"})
    return redirect(f"https://t.me/{BOT_USERNAME}?start={hwid}")

@app.route('/verify', methods=['GET'])
def verify_key():
    hwid = request.args.get('hwid', '')
    key = request.args.get('key', '')
    
    if hwid in DATABASE["banned"]:
        return {"status": "error", "message": "Ваш HWID заблокирован!"}

    if key in DATABASE["keys"]:
        days = DATABASE["keys"][key]
        del DATABASE["keys"][key]
        DATABASE["active_users"][hwid] = days
        return {"status": "success", "message": f"Активировано на {days} дней!"}
    
    if key == "LELYA-3M6UOB":
        return {"status": "success", "message": "Активировано!"}

    return {"status": "error", "message": "Неверный или уже использованный ключ!"}

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
            send_telegram_msg(chat_id, "❌ У тебя нет доступа.")
            return "OK", 200

        # Разбор команды
        parts = text.split()
        cmd = parts[0].lower() if parts else ""

        # Команда /gen
        if '/gen' in cmd:
            days = 30
            if len(parts) > 1 and parts[1].isdigit():
                days = int(parts[1])
            
            new_key = "LELYA-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            DATABASE["keys"][new_key] = days
            
            send_telegram_msg(chat_id, f"✅ Твой ключ на {days} дней:\n`{new_key}`", parse_mode="Markdown")

        # Команда /ban
        elif '/ban' in cmd:
            if len(parts) > 1:
                hwid = parts[1]
                DATABASE["banned"].add(hwid)
                send_telegram_msg(chat_id, f"🔨 HWID `{hwid}` заблокирован.", parse_mode="Markdown")
            else:
                send_telegram_msg(chat_id, "Укажи HWID для бана. Пример: /ban HWID-XXXX")

        # Команда /unban
        elif '/unban' in cmd:
            if len(parts) > 1:
                hwid = parts[1]
                if hwid in DATABASE["banned"]:
                    DATABASE["banned"].remove(hwid)
                    send_telegram_msg(chat_id, f"✅ HWID `{hwid}` разбанен.", parse_mode="Markdown")
                else:
                    send_telegram_msg(chat_id, "⚠️ Этот HWID не найден в бане.")
            else:
                send_telegram_msg(chat_id, "Укажи HWID для разбана. Пример: /unban HWID-XXXX")

        # Любой другой текст или /start
        else:
            send_telegram_msg(chat_id, f"Бот на связи! Команды:\n/gen [дни] — создать ключ\n/ban [HWID] — забан\n/unban [HWID] — разбан")

    except Exception as e:
        # Если произойдет любая ошибка в коде, бот напишет ее тебе в ЛС
        send_telegram_msg(MY_ADMIN_ID, f"⚠️ Ошибка в коде: {str(e)}")

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
