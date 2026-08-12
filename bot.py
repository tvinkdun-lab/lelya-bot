import os
import requests
from flask import Flask, request, redirect

TOKEN = "8790088326:AAHKaigWjGSbwr11seLukJXeyWXO2eAtNNg"
MY_ADMIN_ID = 5773841673
BOT_USERNAME = "lelyahackbot"

app = Flask('')

@app.route('/')
def home():
    return "Lelya Bot is alive!"

@app.route('/start')
def web_start():
    hwid = request.args.get('hwid', '')
    
    # Отправляем тебе уведомление в Telegram через прямой API-запрос (без падений библиотеки)
    if hwid:
        msg = f"🚨 Запрос ключа от игрока!\nHWID: `{hwid}`\n\nDiscord: `vtmin7`"
        url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
        requests.post(url, json={"chat_id": MY_ADMIN_ID, "text": msg, "parse_mode": "Markdown"})

    return redirect(f"https://t.me/{BOT_USERNAME}?start={hwid}")

@app.route('/verify', methods=['GET'])
def verify_key():
    hwid = request.args.get('hwid', '')
    key = request.args.get('key', '')
    
    # Пример проверки ключа (можешь заменить на свою логику)
    if key == "LELYA-3M6UOB":
        return {"status": "success", "message": "Активировано!"}
    
    return {"status": "error", "message": "Неверный ключ!"}

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
