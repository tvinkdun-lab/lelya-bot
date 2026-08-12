import os
import threading
import telebot
import hmac
import hashlib
from datetime import datetime
from telebot import types
from flask import Flask

TOKEN = "8790088326:AAHKaigWjGSbwr11seLukJXeyWXO2eAtNNg"
bot = telebot.TeleBot(TOKEN)

ADMIN_ID = 5773841673 
BLOCKED_HWIDS = []
SECRET_SALT = "LelyaSuperSecretSalt2026_ProtectYourClient"

app = Flask('')
@app.route('/')
def home(): return "Lelya Bot is active"
def run_web(): app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 8080)))

def generate_key(hwid):
    try:
        key_bytes = SECRET_SALT.encode('utf-8')
        message_bytes = hwid.encode('utf-8')
        signature = hmac.new(key_bytes, message_bytes, hashlib.sha256).hexdigest().upper()
        return f"LHC-PRO-{signature[0:4]}-{signature[4:8]}-{signature[8:12]}"
    except:
        return "INVALID"

@bot.message_handler(commands=['start'])
def send_welcome(message):
    args = message.text.split()
    if len(args) > 1:
        hwid = args[1].strip()
        if hwid in BLOCKED_HWIDS:
            bot.reply_to(message, "❌ Этот HWID заблокирован.")
            return
        
        key = generate_key(hwid)
        bot.reply_to(message, f"🔑 Твой ключ активации для HWID `{hwid}`:\n\n`{key}`", parse_mode="Markdown")
        
        if message.from_user.id != ADMIN_ID:
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            markup = types.InlineKeyboardMarkup(row_width=2)
            btn_ban = types.InlineKeyboardButton("🚫 Забанить", callback_data=f"ban_{hwid}")
            btn_info = types.InlineKeyboardButton("ℹ️ Статус: Активен", callback_data=f"info_{hwid}")
            markup.add(btn_ban, btn_info)
            
            bot.send_message(
                ADMIN_ID, 
                f"🚨 **Успешная активация клиента!**\n👤 Ник: @{message.from_user.username or 'Не указан'}\n🆔 ID: {message.from_user.id}\n💻 HWID: `{hwid}`\n⏰ Время: {now}", 
                parse_mode="Markdown", 
                reply_markup=markup
            )
    else:
        bot.reply_to(message, "👋 Привет! Нажми кнопку в игре «Получить ключ в Telegram».")

@bot.callback_query_handler(func=lambda call: True)
def callback_inline(call):
    data = call.data
    if call.from_user.id != ADMIN_ID:
        bot.answer_callback_query(call.id, "⛔ У тебя нет прав администратора!")
        return

    if data.startswith("ban_"):
        hwid = data.replace("ban_", "")
        if hwid not in BLOCKED_HWIDS:
            BLOCKED_HWIDS.append(hwid)
        
        markup = types.InlineKeyboardMarkup(row_width=2)
        btn_unban = types.InlineKeyboardButton("✅ Разбанить", callback_data=f"unban_{hwid}")
        btn_info = types.InlineKeyboardButton("🔴 Статус: Забанен", callback_data=f"info_{hwid}")
        markup.add(btn_unban, btn_info)
        
        try:
            bot.edit_message_reply_markup(chat_id=call.message.chat.id, message_id=call.message.id, reply_markup=markup)
        except: pass
        bot.answer_callback_query(call.id, f"HWID заблокирован!")

    elif data.startswith("unban_"):
        hwid = data.replace("unban_", "")
        if hwid in BLOCKED_HWIDS:
            BLOCKED_HWIDS.remove(hwid)
        
        markup = types.InlineKeyboardMarkup(row_width=2)
        btn_ban = types.InlineKeyboardButton("🚫 Забанить", callback_data=f"ban_{hwid}")
        btn_info = types.InlineKeyboardButton("🟢 Статус: Активен", callback_data=f"info_{hwid}")
        markup.add(btn_ban, btn_info)
        
        try:
            bot.edit_message_reply_markup(chat_id=call.message.chat.id, message_id=call.message.id, reply_markup=markup)
        except: pass
        bot.answer_callback_query(call.id, f"HWID разблокирован!")

    elif data.startswith("info_"):
        hwid = data.replace("info_", "")
        status = "🔴 В бане" if hwid in BLOCKED_HWIDS else "🟢 Активен"
        bot.answer_callback_query(call.id, f"Статус HWID: {status}", show_alert=True)

@bot.message_handler(func=lambda message: True)
def handle_hwid(message):
    hwid = message.text.strip()
    if hwid in BLOCKED_HWIDS:
        bot.reply_to(message, "❌ Этот HWID заблокирован.")
        return

    key = generate_key(hwid)
    bot.reply_to(message, f"✅ Ключ успешно сгенерирован:\n`{key}`", parse_mode="Markdown")

if __name__ == "__main__":
    t = threading.Thread(target=run_web)
    t.start()
    bot.infinity_polling()
