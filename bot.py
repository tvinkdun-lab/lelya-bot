import telebot
import hashlib
import sqlite3
import os
from datetime import datetime, timedelta

TOKEN = '8790088326:AAHKaigWjGSbwr11seLukJXeyWXO2eAtNNg'
ADMIN_ID = 0  # <--- Обязательно впиши свой Telegram ID цифрами!

bot = telebot.TeleBot(TOKEN)
DB_FILE = "keys.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS licenses (
            hwid TEXT PRIMARY KEY,
            key TEXT,
            user_id TEXT,
            username TEXT,
            created_at TEXT,
            expires_at TEXT,
            status TEXT DEFAULT 'active'
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@bot.callback_query_handler(func=lambda call: True)
def callback_handler(call):
    data = call.data
    parts = data.split('_')
    action = parts[0]
    hwid = parts[1]

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    if action == "ban":
        cursor.execute("UPDATE licenses SET status = 'banned' WHERE hwid = ?", (hwid,))
        conn.commit()
        bot.answer_callback_query(call.id, "🔴 Пользователь заблокирован!")
        bot.edit_message_text("❌ **СТАТУС: ЗАБЛОКИРОВАН**", call.message.chat.id, call.message.message_id, parse_mode="Markdown")
    
    elif action == "unban":
        cursor.execute("UPDATE licenses SET status = 'active' WHERE hwid = ?", (hwid,))
        conn.commit()
        bot.answer_callback_query(call.id, "🟢 Пользователь разблокирован!")
        bot.edit_message_text("✅ **СТАТУС: АКТИВЕН**", call.message.chat.id, call.message.message_id, parse_mode="Markdown")

    elif action == "add30":
        cursor.execute("SELECT expires_at FROM licenses WHERE hwid = ?", (hwid,))
        row = cursor.fetchone()
        if row:
            current_exp = datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S")
            new_exp = max(datetime.now(), current_exp) + timedelta(days=30)
            new_exp_str = new_exp.strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute("UPDATE licenses SET expires_at = ? WHERE hwid = ?", (new_exp_str, hwid))
            conn.commit()
            bot.answer_callback_query(call.id, "➕ Добавлено 30 дней!")
            bot.send_message(call.message.chat.id, f"✅ Подписка для HWID `{hwid}` продлена до: `{new_exp_str}`", parse_mode="Markdown")

    conn.close()

@bot.message_handler(commands=['start'])
def send_welcome(message):
    args = message.text.split(maxsplit=1)
    
    if len(args) > 1:
        hwid = args[1].strip()
        
        if hwid.startswith("HWID-") and len(hwid) >= 10:
            user_id = str(message.from_user.id)
            username = message.from_user.username or "Скрыт"
            current_time = datetime.now()
            expires_time = current_time + timedelta(days=30)
            
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            
            cursor.execute("SELECT key, status, expires_at FROM licenses WHERE hwid = ?", (hwid,))
            row = cursor.fetchone()
            
            if row:
                key, status, expires_at = row
                
                if status == 'banned':
                    bot.send_message(message.chat.id, "❌ Ваш HWID заблокирован администратором!")
                    conn.close()
                    return

                if ADMIN_ID != 0 and message.from_user.id != ADMIN_ID:
                    bot.send_message(ADMIN_ID, f"🎮 **Игрок зашел в игру!**\n\n👤 @{username} (ID: `{user_id}`)\n💻 HWID: `{hwid}`", parse_mode="Markdown")

            else:
                random_bytes = os.urandom(8)
                hash_hex = hashlib.sha256(hwid.encode() + random_bytes).hexdigest().upper()
                key = f"LHC-PRO-{hash_hex[0:4]}-{hash_hex[4:8]}-{hash_hex[8:12]}"
                
                cursor.execute(
                    "INSERT INTO licenses (hwid, key, user_id, username, created_at, expires_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                    (hwid, key, user_id, username, current_time.strftime("%Y-%m-%d %H:%M:%S"), expires_time.strftime("%Y-%m-%d %H:%M:%S"), 'active')
                )
                conn.commit()

                if ADMIN_ID != 0 and message.from_user.id != ADMIN_ID:
                    bot.send_message(ADMIN_ID, f"🚀 **НОВАЯ АКТИВАЦИЯ!**\n\n👤 @{username}\n🆔 ID: `{user_id}`\n💻 HWID: `{hwid}`\n🔑 Ключ: `{key}`", parse_mode="Markdown")

            conn.close()
            bot.send_message(message.chat.id, f"✅ Твой персональный ключ:\n`{key}`", parse_mode="Markdown")
            return

    bot.send_message(message.chat.id, "Привет! Перейди по кнопке 'Запросить ключ' в меню скрипта.")

@bot.message_handler(commands=['adddays'])
def add_days_command(message):
    if message.from_user.id != ADMIN_ID and ADMIN_ID != 0:
        return
    
    parts = message.text.split()
    if len(parts) >= 3:
        target_hwid = parts[1].strip()
        try:
            days_to_add = int(parts[2])
        except ValueError:
            bot.send_message(message.chat.id, "❌ Ошибка: количество дней должно быть числом!", parse_mode="Markdown")
            return

        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("SELECT expires_at FROM licenses WHERE hwid = ?", (target_hwid,))
        row = cursor.fetchone()

        if row:
            current_exp = datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S")
            new_exp = max(datetime.now(), current_exp) + timedelta(days=days_to_add)
            new_exp_str = new_exp.strftime("%Y-%m-%d %H:%M:%S")
            
            cursor.execute("UPDATE licenses SET expires_at = ? WHERE hwid = ?", (new_exp_str, target_hwid))
            conn.commit()
            conn.close()
            bot.send_message(message.chat.id, f"✅ К HWID `{target_hwid}` добавлено **{days_to_add} дн.**\n📅 Новый срок: `{new_exp_str}`", parse_mode="Markdown")
        else:
            conn.close()
            bot.send_message(message.chat.id, "❌ Такой HWID не найден в базе данных.")
    else:
        bot.send_message(message.chat.id, "📌 Использование: `/adddays <HWID> <дни>`", parse_mode="Markdown")

@bot.message_handler(commands=['ban'])
def ban_command(message):
    if message.from_user.id != ADMIN_ID and ADMIN_ID != 0:
        return
    
    parts = message.text.split(maxsplit=1)
    if len(parts) > 1:
        target_hwid = parts[1].strip()
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("UPDATE licenses SET status = 'banned' WHERE hwid = ?", (target_hwid,))
        conn.commit()
        conn.close()
        bot.send_message(message.chat.id, f"🔴 HWID `{target_hwid}` успешно заблокирован!", parse_mode="Markdown")
    else:
        bot.send_message(message.chat.id, "📌 Использование: `/ban <HWID>`", parse_mode="Markdown")

@bot.message_handler(commands=['unban'])
def unban_command(message):
    if message.from_user.id != ADMIN_ID and ADMIN_ID != 0:
        return
    
    parts = message.text.split(maxsplit=1)
    if len(parts) > 1:
        target_hwid = parts[1].strip()
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("UPDATE licenses SET status = 'active' WHERE hwid = ?", (target_hwid,))
        conn.commit()
        conn.close()
        bot.send_message(message.chat.id, f"🟢 HWID `{target_hwid}` успешно разблокирован!", parse_mode="Markdown")
    else:
        bot.send_message(message.chat.id, "📌 Использование: `/unban <HWID>`", parse_mode="Markdown")

@bot.message_handler(commands=['reset'])
def reset_hwid(message):
    if message.from_user.id != ADMIN_ID and ADMIN_ID != 0:
        return
    
    args = message.text.split(maxsplit=1)
    if len(args) > 1:
        target_hwid = args[1].strip()
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM licenses WHERE hwid = ?", (target_hwid,))
        conn.commit()
        conn.close()
        bot.send_message(message.chat.id, f"🗑 HWID `{target_hwid}` удален из базы.", parse_mode="Markdown")
    else:
        bot.send_message(message.chat.id, "📌 Использование: `/reset <HWID>`", parse_mode="Markdown")

@bot.message_handler(func=lambda message: True)
def handle_admin_check(message):
    text = message.text.strip()
    
    if text.startswith("HWID-") and len(text) >= 10:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("SELECT key, user_id, username, created_at, expires_at, status FROM licenses WHERE hwid = ?", (text,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            key, user_id, username, created_at, expires_at, status = row
            
            exp_time = datetime.strptime(expires_at, "%Y-%m-%d %H:%M:%S")
            is_expired = datetime.now() > exp_time
            status_text = "❌ Заблокирован" if status == 'banned' else ("⏳ Истекла" if is_expired else "🟢 Активна")

            info_msg = (
                f"🔍 **Информация по HWID:**\n\n"
                f"💻 HWID: `{text}`\n"
                f"🔑 Ключ: `{key}`\n"
                f"🆔 Telegram ID: `{user_id}`\n"
                f"👤 Username: @{username}\n"
                f"📅 Активирован: `{created_at}`\n"
                f"⏳ Годен до: `{expires_at}`\n"
                f"📌 Статус: **{status_text}**"
            )

            markup = telebot.types.InlineKeyboardMarkup()
            if status == 'banned':
                markup.add(telebot.types.InlineKeyboardButton("🟢 Разблокировать", callback_data=f"unban_{text}"))
            else:
                markup.add(telebot.types.InlineKeyboardButton("🔴 Заблокировать", callback_data=f"ban_{text}"))
            
            markup.add(telebot.types.InlineKeyboardButton("➕ Добавить 30 дней", callback_data=f"add30_{text}"))

            bot.send_message(message.chat.id, info_msg, parse_mode="Markdown", reply_markup=markup)
        else:
            bot.send_message(message.chat.id, "❌ Такой HWID не найден в базе данных.")
    else:
        bot.send_message(message.chat.id, "❌ Неверный формат или команда.")

bot.infinity_polling()
