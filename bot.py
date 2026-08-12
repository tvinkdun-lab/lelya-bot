import os
import threading
import telebot
from flask import Flask

TOKEN = "8790088326:AAHKaigWjGSbwr11seLukJXeyWXO2eAtNNg"
bot = telebot.TeleBot(TOKEN)

# НАСТРОЙКИ
ADMIN_ID = 5773841673  # Вставь сюда свой ID из Telegram
BLOCKED_USERS = []    # Сюда можно добавлять ID тех, кого надо забанить

# 1. Веб-сервер
app = Flask('')
@app.route('/')
def home(): return "Lelya Bot is active"
def run_web(): app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 8080)))

# 2. Функции защиты
def is_blocked(user_id):
    return user_id in BLOCKED_USERS

# 3. Логика бота
@bot.message_handler(commands=['start'])
def send_welcome(message):
    bot.reply_to(message, "👋 Привет! Отправь мне свой HWID для генерации ключа.")

@bot.message_handler(commands=['ban'])
def ban_user(message):
    if message.from_user.id == ADMIN_ID:
        try:
            target_id = int(message.text.split()[1])
            BLOCKED_USERS.append(target_id)
            bot.reply_to(message, f"✅ Пользователь {target_id} заблокирован.")
        except: bot.reply_to(message, "Используй: /ban <ID>")

@bot.message_handler(func=lambda message: True)
def handle_hwid(message):
    if is_blocked(message.from_user.id):
        bot.reply_to(message, "❌ Доступ ограничен.")
        return

    hwid = message.text.strip()
    # Пример логики генерации ключа (можно усложнить)
    key = f"L-PRO-{hwid[-4:]}-8826" 
    
    bot.reply_to(message, f"✅ Ключ успешно сгенерирован:\n`{key}`", parse_mode="Markdown")
    
    # Уведомление тебе (админу)
    if message.from_user.id != ADMIN_ID:
        bot.send_message(ADMIN_ID, f"👤 Новый запрос:\nНик: {message.from_user.username}\nID: {message.from_user.id}\nHWID: {hwid}")

if __name__ == "__main__":
    t = threading.Thread(target=run_web)
    t.start()
    bot.infinity_polling()
