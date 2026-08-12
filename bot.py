import os
from flask import Flask, request, redirect
from telegram import Bot
from telegram.ext import Updater, CommandHandler

# Твои данные
TOKEN = "8790088326:AAHKaigWjGSbwr11seLukJXeyWXO2eAtNNg"
MY_ADMIN_ID = 5773841673
BOT_USERNAME = "lelyahackbot"

app = Flask('')

# База данных для банов
BANNED_HWIDS = set()

@app.route('/')
def home():
    return "Lelya Bot is alive!"

# Исправление ошибки Not Found и мгновенный редирект в бота с HWID
@app.route('/start')
def web_start():
    hwid = request.args.get('hwid', '')
    return redirect(f"https://t.me/{BOT_USERNAME}?start={hwid}")

def run_web():
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)

# Обработка команды /start в самом Telegram
def start_command(update, context):
    user_id = update.effective_user.id
    args = context.args
    user_hwid = args[0] if args else "Не указан"
    
    if user_id == MY_ADMIN_ID:
        update.message.reply_text(f"Привет, создатель! Бот запущен.\nПолучен HWID игрока: {user_hwid}")
        return

    if user_hwid in BANNED_HWIDS:
        update.message.reply_text("❌ Доступ заблокирован! Твой HWID находится в черном списке.")
        return

    # Отправляем уведомление тебе в ЛС
    context.bot.send_message(
        chat_id=MY_ADMIN_ID, 
        text=f"🚨 Запрос ключа от игрока!\nHWID: `{user_hwid}`\n\nDiscord: `vtmin7`", 
        parse_mode="Markdown"
    )
    
    update.message.reply_text(f"Привет! Твой HWID: {user_hwid}\nЗапрос отправлен создателю (vtmin7). Ожидай выдачи ключа!")

def unban_command(update, context):
    if update.effective_user.id != MY_ADMIN_ID:
        return
    args = context.args
    if not args:
        update.message.reply_text("Использование: /unban HWID-XXXXXX")
        return
    hwid_to_unban = args[0]
    if hwid_to_unban in BANNED_HWIDS:
        BANNED_HWIDS.remove(hwid_to_unban)
        update.message.reply_text(f"✅ Успешно! HWID {hwid_to_unban} разбанен.")
    else:
        update.message.reply_text(f"⚠️ Этот HWID не найден в списке забаненных.")

def ban_command(update, context):
    if update.effective_user.id != MY_ADMIN_ID:
        return
    args = context.args
    if not args:
        update.message.reply_text("Использование: /ban HWID-XXXXXX")
        return
    hwid_to_ban = args[0]
    BANNED_HWIDS.add(hwid_to_ban)
    update.message.reply_text(f"🔨 Игрок с HWID {hwid_to_ban} заблокирован.")

def main():
    updater = Updater(TOKEN, use_context=True)
    dp = updater.dispatcher
    
    dp.add_handler(CommandHandler("start", start_command))
    dp.add_handler(CommandHandler("unban", unban_command))
    dp.add_handler(CommandHandler("ban", ban_command))
    
    import threading
    t = threading.Thread(target=run_web)
    t.start()
    
    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
