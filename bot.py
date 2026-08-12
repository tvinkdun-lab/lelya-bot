import os
import threading
from flask import Flask
import telebot

TOKEN = "8790088326:AAHKaigWjGSbwr11seLukJXeyWXO2eAtNNg"
bot = telebot.TeleBot(TOKEN)

# 1. Создаем мини-веб-сервер для Render, чтобы он не усыплял бота
app = Flask('')

@app.route('/')
def home():
    return "Lelya Bot is alive and running!"

def run_web():
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)

# 2. Логика твоего бота
@bot.message_handler(commands=['start'])
def send_welcome(message):
    bot.reply_to(message, "Привет, хозяин! Отправь мне HWID, чтобы сгенерировать ключ.")

@bot.message_handler(func=lambda message: True)
def handle_hwid(message):
    hwid = message.text.strip()
    # Здесь твоя генерация ключа (или оставь свою логику)
    bot.reply_to(message, f"Получен HWID: {hwid}")

# 3. Запускаем веб-сервер и бота одновременно
if __name__ == "__main__":
    t = threading.Thread(target=run_web)
    t.start()
    bot.infinity_polling()
