import sqlite3
from aiogram import Bot, Dispatcher, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import Command
import asyncio
import threading
from flask import Flask, request, jsonify

# --- Настройки ---
TOKEN = "8790088326:AAHdEeGW4HlDTXOAPGWW1BoxBxAVwNgfv0A"  # Замени на токен своего бота от @BotFather
ADMIN_ID = 5773841673  # Укажи свой Telegram ID (администратора)

# --- Инициализация БД ---
def init_db():
    conn = sqlite3.connect('lelya_users.db', check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            hwid TEXT PRIMARY KEY,
            activation_key TEXT,
            is_banned INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

init_db()

def get_db():
    return sqlite3.connect('lelya_users.db', check_same_thread=False)

# --- Flask Сервер для скрипта ---
app = Flask(__name__)

@app.route('/verify', methods=['GET'])
def verify_key():
    hwid = request.args.get('hwid')
    key = request.args.get('key')
    
    if not hwid or not key:
        return jsonify({"status": "error", "message": "Missing parameters"})
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Проверяем, не забанен ли HWID
    cursor.execute('SELECT is_banned FROM users WHERE hwid = ?', (hwid,))
    row = cursor.fetchone()
    if row and row[0] == 1:
        conn.close()
        return jsonify({"status": "error", "message": "Ваш HWID заблокирован администратором!"})
    
    # Проверяем ключ
    cursor.execute('SELECT activation_key FROM users WHERE hwid = ?', (hwid,))
    row = cursor.fetchone()
    
    if row and row[0] == key:
        conn.close()
        return jsonify({"status": "success"})
    
    conn.close()
    return jsonify({"status": "error", "message": "Неверный ключ активации!"})

@app.route('/start', methods=['GET'])
def start_web():
    hwid = request.args.get('hwid')
    return f"<h3>Твой HWID для бота: {hwid}</h3><p>Перешли его Telegram-боту, чтобы получить ключ.</p>"

def run_flask():
    app.run(host='0.0.0.0', port=5000)

# --- Telegram Бот (aiogram v3) ---
bot = Bot(token=TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def cmd_start(message: Message):
    args = message.text.split()
    hwid = args[1] if len(args) > 1 else None
    
    if hwid:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT activation_key, is_banned FROM users WHERE hwid = ?', (hwid,))
        row = cursor.fetchone()
        
        if row and row[1]:
            if row[1] == 1:
                await message.answer("❌ Ваш HWID заблокирован в системе!")
                conn.close()
                return
            await message.answer(f"🔑 Ваш сохраненный ключ: `{row[0]}`", parse_mode="Markdown")
        else:
            # Генерируем новый ключ
            import random, string
            new_key = ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))
            cursor.execute('INSERT OR REPLACE INTO users (hwid, activation_key, is_banned) VALUES (?, ?, 0)', (hwid, new_key))
            conn.commit()
            await message.answer(f"✅ Ваш новый ключ активации:\n`{new_key}`\n\nВведите его в скрипте игры!", parse_mode="Markdown")
        conn.close()
    else:
        await message.answer("Привет! Чтобы получить ключ, перейди по кнопке «ЗАПРОСИТЬ КЛЮЧ У БОТА» из самого скрипта игры.")

# Админ-панель: Бан / Разбан
@dp.message(Command("ban"))
async def cmd_ban(message: Message):
    if message.from_user.id != ADMIN_ID:
        return
    parts = message.text.split()
    if len(parts) < 2:
        await message.answer("Использование: /ban HWID-XXXX")
        return
    hwid = parts[1]
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET is_banned = 1 WHERE hwid = ?', (hwid,))
    conn.commit()
    conn.close()
    await message.answer(f"⛔ HWID `{hwid}` успешно заблокирован.", parse_mode="Markdown")

@dp.message(Command("unban"))
async def cmd_unban(message: Message):
    if message.from_user.id != ADMIN_ID:
        return
    parts = message.text.split()
    if len(parts) < 2:
        await message.answer("Использование: /unban HWID-XXXX")
        return
    hwid = parts[1]
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET is_banned = 0 WHERE hwid = ?', (hwid,))
    conn.commit()
    conn.close()
    await message.answer(f"✅ HWID `{hwid}` разблокирован.", parse_mode="Markdown")

async def main():
    # Запускаем Flask в отдельном потоке
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()
    
    # Запускаем бота
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())
