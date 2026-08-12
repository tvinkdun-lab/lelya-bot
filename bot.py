import hmac
import hashlib
import telebot
from telebot import types

TOKEN = "8790088326:AAHKaigWjGSbwr11seLukJXeyWXO2eAtNNg"
ADMIN_ID = 5773841673
SECRET_SALT = "LelyaSuperSecretSalt2026_ProtectYourClient"

bot = telebot.TeleBot(TOKEN)

banned_users = set()
banned_hwids = set()

def generate_hwid_key(hwid: str) -> str:
    key = hmac.new(SECRET_SALT.encode('utf-8'), hwid.encode('utf-8'), hashlib.sha256).hexdigest().upper()
    return f"LHC-PRO-{key[:4]}-{key[4:8]}-{key[8:12]}"

@bot.message_handler(commands=['start'])
def start(message):
    args = message.text.split()
    if len(args) > 1:
        hwid = args[1].strip()
        if message.from_user.id in banned_users or hwid in banned_hwids:
            bot.reply_to(message, "❌ Ваш аккаунт или HWID заблокированы администратором.")
            return

        markup = types.InlineKeyboardMarkup()
        btn = types.InlineKeyboardButton("✅ Одобрить ключ", callback_data=f"give_{message.from_user.id}_{hwid}")
        markup.add(btn)
        
        bot.send_message(ADMIN_ID, f"🔔 ЗАЯВКА НА КЛЮЧ\n👤 Игрок: @{message.from_user.username}\n🆔 ID: {message.from_user.id}\n💻 HWID: `{hwid}`", parse_mode="Markdown", reply_markup=markup)
        bot.reply_to(message, "⏳ Запрос отправлен администратору. Ожидайте.")
    else:
        bot.reply_to(message, "👋 Привет! Используй меню в игре для получения ключа.\n\n🛠 По вопросам и поддержке: Discord: `vtmin7`", parse_mode="Markdown")

@bot.message_handler(commands=['support', 'admin'])
def support(message):
    bot.reply_to(message, "🛠 **Поддержка и связь с создателем:**\nDiscord: `vtmin7`", parse_mode="Markdown")

@bot.message_handler(commands=['status'])
def status(message):
    if message.from_user.id in banned_users:
        bot.reply_to(message, "Ваш статус: Заблокирован ❌")
    else:
        bot.reply_to(message, "Ваш статус: Активен ✅")

@bot.message_handler(commands=['ban'])
def ban(message):
    if message.from_user.id != ADMIN_ID: return
    args = message.text.split()
    if message.reply_to_message:
        uid = message.reply_to_message.from_user.id
        banned_users.add(uid)
        bot.reply_to(message, f"🚫 Юзер {uid} забанен.")
    elif len(args) > 1:
        banned_hwids.add(args[1])
        bot.reply_to(message, f"🚫 HWID {args[1]} забанен.")

@bot.message_handler(commands=['unban'])
def unban(message):
    if message.from_user.id != ADMIN_ID: return
    args = message.text.split()
    if message.reply_to_message:
        uid = message.reply_to_message.from_user.id
        banned_users.discard(uid)
        bot.reply_to(message, f"✅ Юзер {uid} разбанен.")
    elif len(args) > 1:
        banned_hwids.discard(args[1])
        bot.reply_to(message, f"✅ HWID {args[1]} разбанен.")

@bot.callback_query_handler(func=lambda call: call.data.startswith('give_'))
def approve(call):
    data = call.data.split('_')
    uid, hwid = int(data[1]), data[2]
    key = generate_hwid_key(hwid)
    bot.send_message(uid, f"✅ Ваша заявка одобрена!\n\nКлюч: `{key}`", parse_mode="Markdown")
    bot.edit_message_text(f"✅ Выдано для {uid}", call.message.chat.id, call.message.message_id)

if __name__ == "__main__":
    bot.infinity_polling()
