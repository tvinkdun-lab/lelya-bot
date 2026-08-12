import os
import threading
import telebot
from telebot import types
from flask import Flask

TOKEN = "8790088326:AAHKaigWjGSbwr11seLukJXeyWXO2eAtNNg"
bot = telebot.TeleBot(TOKEN)

ADMIN_ID = 5773841673 
BLOCKED_USERS = []
BLOCKED_HWIDS = []

# 1. Веб-сервер
app = Flask('')
@app.route('/')
def home(): return "Lelya Bot is active"
def run_web(): app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 8080)))

# 2. Меню с кнопками
@bot.message_handler(commands=['start'])
def send_welcome(message):
    markup = types.InlineKeyboardMarkup(row_width=1)
    btn_help = types.InlineKeyboardButton("ℹ️ Инструкция", callback_data="help")
    markup.add(btn_help)
    
    bot.reply_to(
        message, 
        "👋 Привет! Я бот клиента Lelya Hack.\n\nОтправь мне свой HWID в сообщении, чтобы сгенерировать ключ доступа.", 
        reply_markup=markup
    )

# Обработка нажатий на инлайн-кнопки
@bot.callback_query_handler(func=lambda call: True)
def callback_inline(call):
    if call.data == "help":
        bot.answer_callback_query(call.id)
        bot.send_message(
            call.message.chat.id, 
            "📖 **Как получить ключ:**\n1. Скопируй HWID из своего клиента.\n2. Отправь его сюда ответным сообщением.\n3. Скопируй полученный ключ и вставь в чит.",
            parse_mode="Markdown"
        )
    elif call.data.startswith("ban_"):
        if call.from_user.id == ADMIN_ID:
            hwid_to_ban = call.data.replace("ban_", "")
            if hwid_to_ban not in BLOCKED_HWIDS:
                BLOCKED_HWIDS.append(hwid_to_ban)
            bot.answer_callback_query(call.id, f"HWID заблокирован!")
            bot.edit_message_text(
                chat_id=call.message.chat.id, 
                message_id=call.message.id, 
                text=call.message.text + "\n\n❌ **СТАТУС: ЗАБЛОКИРОВАН АДМИНИСТРАТОРОМ**", 
                parse_mode="Markdown"
            )

# Команда для бана через чат
@bot.message_handler(commands=['banhwid'])
def ban_hwid_cmd(message):
    if message.from_user.id == ADMIN_ID:
        try:
            hwid_to_ban = message.text.split(maxsplit=1)[1].strip()
            BLOCKED_HWIDS.append(hwid_to_ban)
            bot.reply_to(message, f"🚫 HWID `{hwid_to_ban}` добавлен в черный список.", parse_mode="Markdown")
        except: bot.reply_to(message, "Используй: /banhwid <HWID>")

# Обработка HWID
@bot.message_handler(func=lambda message: True)
def handle_hwid(message):
    hwid = message.text.strip()
    
    if hwid in BLOCKED_HWIDS:
        bot.reply_to(message, "❌ Этот HWID заблокирован навсегда.")
        return

    key = f"L-PRO-{hwid[-4:]}-8826" 
    bot.reply_to(message, f"✅ Ключ успешно сгенерирован:\n`{key}`", parse_mode="Markdown")
    
    # Отправка уведомления админу с кнопкой блокировки в один клик
    if message.from_user.id != ADMIN_ID:
        markup = types.InlineKeyboardMarkup()
        btn_ban = types.InlineKeyboardButton("🚫 Заблокировать этот HWID", callback_data=f"ban_{hwid}")
        markup.add(btn_ban)
        
        bot.send_message(
            ADMIN_ID, 
            f"👤 **Новый запрос ключа:**\nНик: @{message.from_user.username}\nID: {message.from_user.id}\nHWID: `{hwid}`", 
            parse_mode="Markdown", 
            reply_markup=markup
        )

if __name__ == "__main__":
    t = threading.Thread(target=run_web)
    t.start()
    bot.infinity_polling()
