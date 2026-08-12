import hmac
import hashlib
import telebot

TOKEN = "8790088326:AAHKaigWjGSbwr11seLukJXeyWXO2eAtNNg"
ADMIN_ID = 5773841673  # Ваш Telegram ID
SECRET_SALT = "LelyaSuperSecretSalt2026_ProtectYourClient"

bot = telebot.TeleBot(TOKEN)
banned_users = set()

def generate_hwid_key(hwid: str) -> str:
    key = hmac.new(
        SECRET_SALT.encode('utf-8'),
        hwid.encode('utf-8'),
        hashlib.sha256
    ).hexdigest().upper()
    return f"LHC-PRO-{key[:4]}-{key[4:8]}-{key[8:12]}"

@bot.message_handler(commands=['start'])
def send_welcome(message):
    args = message.text.split()
    user_id = message.from_user.id
    username = f"@{message.from_user.username}" if message.from_user.username else f"ID: {user_id}"

    if user_id in banned_users:
        bot.reply_to(message, "❌ Ваш доступ заблокирован.")
        return

    if len(args) > 1:
        hwid = args[1].strip()
        
        # Уведомляем вас (админа), что кто-то запросил ключ
        markup = telebot.types.InlineKeyboardMarkup()
        btn_accept = telebot.types.InlineKeyboardButton("✅ Одобрить ключ", callback_data=f"give_{user_id}_{hwid}")
        markup.add(btn_accept)

        bot.send_message(
            ADMIN_ID, 
            f"🔔 Запрос ключа!\n👤 Игрок: {username}\n🆔 ID: {user_id}\n💻 HWID: `{hwid}`", 
            parse_mode="Markdown", 
            reply_markup=markup
        )
        
        bot.reply_to(message, "⏳ Ваш запрос отправлен администратору. Ожидайте подтверждения.")
    else:
        bot.reply_to(message, "👋 Перейдите из чит-меню в игре, чтобы запросить ключ.")

# Обработка нажатия кнопки админом
@bot.callback_query_handler(func=lambda call: call.data.startswith('give_'))
def approve_key(call):
    if call.from_user.id != ADMIN_ID:
        bot.answer_callback_query(call.id, "❌ Вы не администратор!")
        return

    _, target_user_id, hwid = call.data.split('_')
    target_user_id = int(target_user_id)

    valid_key = generate_hwid_key(hwid)

    # Отправляем ключ игроку в ЛС
    try:
        bot.send_message(
            target_user_id, 
            f"✅ Ваша заявка одобрена!\n\n**Ваш ключ активации:**\n`{valid_key}`", 
            parse_mode="Markdown"
        )
        bot.edit_message_text(
            f"✅ Ключ успешно выдан игроку (`{target_user_id}`) для HWID: `{hwid}`", 
            call.message.chat.id, 
            call.message.message_id
        )
    except Exception as e:
        bot.answer_callback_query(call.id, f"Ошибка отправки: {e}")

@bot.message_handler(commands=['ban'])
def ban_user(message):
    if message.reply_to_message:
        user_to_ban = message.reply_to_message.from_user.id
        banned_users.add(user_to_ban)
        bot.reply_to(message, f"🚫 Пользователь {user_to_ban} заблокирован.")

if __name__ == "__main__":
    print("Бот запущен с системой подтверждения...")
    bot.infinity_polling()
