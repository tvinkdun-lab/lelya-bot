import os
import requests
from flask import Flask, request, redirect

TOKEN = "8790088326:AAHKaigWjGSbwr11seLukJXeyWXO2eAtNNg"
MY_ADMIN_ID = 5773841673
BOT_USERNAME = "lelyahackbot"

app = Flask('')

# Простая база данных в памяти
DATABASE = {
    "banned": set(),       # Забаненные HWID
    "keys": {},            # Ключ: количество дней
    "active_users": {}     # HWID: сколько дней осталось / статус
}

@app.route('/')
def home():
    return "Lelya Bot is alive and working!"

# 1. Редирект из игры в бота (исправляет ошибку 404 / Not Found)
@app.route('/start')
def web_start():
    hwid = request.args.get('hwid', '')
    
    if hwid:
        msg = f"🚨 **Запрос ключа от игрока!**\nHWID: `{hwid}`\n\nСоздатель: `vtmin7`"
        url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
        requests.post(url, json={"chat_id": MY_ADMIN_ID, "text": msg, "parse_mode": "Markdown"})

    return redirect(f"https://t.me/{BOT_USERNAME}?start={hwid}")

# 2. Проверка ключа клиентом из игры
@app.route('/verify', methods=['GET'])
def verify_key():
    hwid = request.args.get('hwid', '')
    key = request.args.get('key', '')
    
    if hwid in DATABASE["banned"]:
        return {"status": "error", "message": "Ваш HWID заблокирован!"}

    if key in DATABASE["keys"]:
        days = DATABASE["keys"][key]
        del DATABASE["keys"][key]  # Ключ одноразовый — сгорает при активации
        DATABASE["active_users"][hwid] = days
        return {"status": "success", "message": f"Активировано на {days} дней!"}
    
    # Запасной встроенный ключ на крайний случай
    if key == "LELYA-3M6UOB":
        return {"status": "success", "message": "Активировано!"}

    return {"status": "error", "message": "Неверный или уже использованный ключ!"}

# 3. Обработка команд от тебя (админа) через Telegram API (Webhook)
@app.route('/webhook', methods=['POST'])
def telegram_webhook():
    data = request.get_json()
    if not data or 'message' not in data:
        return "OK", 200

    message = data['message']
    chat_id = message['chat']['id']
    user_id = message['from']['id']
    text = message.get('text', '')

    # Проверяем, что команды пишет именно создатель
    if user_id != MY_ADMIN_ID:
        send_telegram_msg(chat_id, "❌ У тебя нет доступа к админ-панели этого бота.")
        return "OK", 200

    parts = text.split()
    cmd = parts[0] if parts else ""

    # Команда /gen [дни] — сгенерировать ключ
    if cmd == '/gen':
        if len(parts) < 2:
            send_telegram_msg(chat_id, "Использование: /gen [кол-во дней]\nПример: /gen 30")
            return "OK", 200
        
        days = parts[1]
        import random, string
        new_key = "LELYA-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        DATABASE["keys"][new_key] = int(days)
        
        send_telegram_msg(chat_id, f"✅ Сгенерирован ключ на {days} дней:\n`{new_key}`", parse_mode="Markdown")

    # Команда /ban [HWID] — заблокировать
    elif cmd == '/ban':
        if len(parts) < 2:
            send_telegram_msg(chat_id, "Использование: /ban [HWID]")
            return "OK", 200
        hwid = parts[1]
        DATABASE["banned"].add(hwid)
        if hwid in DATABASE["active_users"]:
            del DATABASE["active_users"][hwid]
        send_telegram_msg(chat_id, f"🔨 HWID `{hwid}` заблокирован.", parse_mode="Markdown")

    # Команда /unban [HWID] — разблокировать
    elif cmd == '/unban':
        if len(parts) < 2:
            send_telegram_msg(chat_id, "Использование: /unban [HWID]")
            return "OK", 200
        hwid = parts[1]
        if hwid in DATABASE["banned"]:
            DATABASE["banned"].remove(hwid)
            send_telegram_msg(chat_id, f"✅ HWID `{hwid}` разбанен.", parse_mode="Markdown")
        else:
            send_telegram_msg(chat_id, f"⚠️ HWID не найден в бане.")

    # Команда /check [HWID] — проверить статус
    elif cmd == '/check':
        if len(parts) < 2:
            send_telegram_msg(chat_id, "Использование: /check [HWID]")
            return "OK", 200
        hwid = parts[1]
        status = "Забанен" if hwid in DATABASE["banned"] else ("Активен" if hwid in DATABASE["active_users"] else "Нет подписки")
        send_telegram_msg(chat_id, f"ℹ️ Статус HWID `{hwid}`:\nСостояние: *{status}*", parse_mode="Markdown")

    elif cmd == '/start':
        args = parts[1] if len(parts) > 1 else "Не указан"
        send_telegram_msg(chat_id, f"Привет, создатель! Бот работает.\nПолучен HWID игрока: `{args}`", parse_mode="Markdown")

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
