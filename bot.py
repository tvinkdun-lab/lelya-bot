import os
import threading
import telebot
import hmac
import hashlib
from telebot import types
from flask import Flask

TOKEN = "8790088326:AAHKaigWjGSbwr11seLukJXeyWXO2eAtNNg"
bot = telebot.TeleBot(TOKEN)

ADMIN_ID = 5773841673 
BLOCKED_USERS = []
BLOCKED_HWIDS = []
SECRET_SALT = "LelyaSuperSecretSalt2026_ProtectYourClient"

app = Flask('')
@app.route('/')
def home(): return "Lelya Bot is active"
def run_web(): app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 8080)))

# Функция генерации точного ключа, как в Tampermonkey
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
    # Если пользователь перешел из скрипта по кнопке (с передачей HWID)
    args = message.text.split()
    if len(args) > 1:
        hwid = args[1].strip()
        if hwid in BLOCKED_HWIDS:
            bot.reply_to(message, "❌ Этот HWID заблокирован.")
            return
        
        key = generate_key(hwid)
        bot.reply_to(message, f"🔑 Твой ключ активации для HWID `{hwid}`:\n\n`{key}`", parse_mode="Markdown")
        
        if message.from_user.id != ADMIN_ID:
            markup = types.InlineKeyboardMarkup()
            btn_ban = types.InlineKeyboardButton("🚫 Заблокировать этот HWID", callback_data=f"ban_{hwid}")
            markup.add(btn_ban)
            bot.send_message(ADMIN_ID, f"👤 **Запрос ключа:**\nНик: @{message.from_user.username}\nID: {message.from_user.id}\nHWID: `{hwid}`\nКлюч: `{key}`", parse_mode="Markdown", reply_markup=markup)
    else:
        bot.reply_to(message, "👋 Привет! Отправь мне свой HWID или нажми кнопку в игре «Получить ключ в Telegram».")

@bot.callback_query_handler(func=lambda call: True)
def callback_inline(call):
    if call.data.startswith("ban_"):
        if call.from_user.id == ADMIN_ID:
            hwid_to_ban = call.data.replace("ban_", "")
            if hwid_to_ban not in BLOCKED_HWIDS:
                BLOCKED_HWIDS.append(hwid_to_ban)
            bot.answer_callback_query(call.id, f"HWID заблокирован!")
            bot.edit_message_text(chat_id=call.message.chat.id, message_id=call.message.id, text=call.message.text + "\n\n❌ **СТАТУС: ЗАБЛОКИРОВАН**", parse_mode="Markdown")

@bot.message_handler(commands=['banhwid'])
def ban_hwid_cmd(message):
    if message.from_user.id == ADMIN_ID:
        try:
            hwid_to_ban = message.text.split(maxsplit=1)[1].strip()
            BLOCKED_HWIDS.append(hwid_to_ban)
            bot.reply_to(message, f"🚫 HWID `{hwid_to_ban}` заблокирован.", parse_mode="Markdown")
        except: bot.reply_to(message, "Используй: /banhwid <HWID>")

@bot.message_handler(func=lambda message: True)
def handle_hwid(message):
    hwid = message.text.strip()
    if hwid in BLOCKED_HWIDS:
        bot.reply_to(message, "❌ Этот HWID заблокирован.")
        return

    key = generate_key(hwid)
    bot.reply_to(message, f"✅ Ключ успешно сгенерирован:\n`{key}`", parse_mode="Markdown")
    
    if message.from_user.id != ADMIN_ID:
        markup = types.InlineKeyboardMarkup()
        btn_ban = types.InlineKeyboardButton("🚫 Заблокировать этот HWID", callback_data=f"ban_{hwid}")
        markup.add(btn_ban)
        bot.send_message(ADMIN_ID, f"👤 **Запрос ключа:**\nНик: @{message.from_user.username}\nID: {message.from_user.id}\nHWID: `{hwid}`", parse_mode="Markdown", reply_markup=markup)

if __name__ == "__main__":
    t = threading.Thread(target=run_web)
    t.start()
    bot.infinity_polling()
