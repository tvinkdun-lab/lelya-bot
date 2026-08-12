import random
import telebot

TOKEN = "8790088326:AAHKaigWjGSbwr11seLukJXeyWXO2eAtNNg"
bot = telebot.TeleBot(TOKEN)

banned_users = set()

@bot.message_handler(commands=['start'])
def send_welcome(message):
    bot.reply_to(message, "Привет! Используй команду /key для получения ключа активации или /status для проверки статуса.")

@bot.message_handler(commands=['ban'])
def ban_user(message):
    if message.reply_to_message:
        user_to_ban = message.reply_to_message.from_user.id
        banned_users.add(user_to_ban)
        bot.reply_to(message, f"Пользователь {user_to_ban} заблокирован.")
    else:
        bot.reply_to(message, "Ответьте этим сообщением на реплику того, кого хотите забанить.")

@bot.message_handler(commands=['unban'])
def unban_user(message):
    if message.reply_to_message:
        user_to_unban = message.reply_to_message.from_user.id
        if user_to_unban in banned_users:
            banned_users.remove(user_to_unban)
            bot.reply_to(message, f"Пользователь {user_to_unban} разблокирован.")
        else:
            bot.reply_to(message, "Этот пользователь не был забанен.")
    else:
        bot.reply_to(message, "Ответьте этим сообщением на реплику того, кого хотите разбанить.")

@bot.message_handler(commands=['status'])
def check_status(message):
    user_id = message.from_user.id
    if user_id in banned_users:
        bot.reply_to(message, "Ваш статус: Заблокирован ❌")
    else:
        bot.reply_to(message, "Ваш статус: Активен ✅")

@bot.message_handler(commands=['key'])
def generate_key(message):
    if message.from_user.id in banned_users:
        bot.reply_to(message, "Вам заблокирован доступ к генерации ключей ❌")
        return
    
    random_part = "".join(random.choices("0123456789ABCDEF", k=4))
    key = f"LHC-PRO-{random_part}-ECC2-636A"
    
    bot.reply_to(message, f"✅ Ключ успешно сгенерирован:\n{key}")

# Обработка обычного текста, чтобы бот не путал его с генерацией ключей
@bot.message_handler(func=lambda message: True)
def echo_all(message):
    bot.reply_to(message, "Неизвестная команда. Напиши /key для получения ключа.")

if __name__ == "__main__":
    print("Бот запущен...")
    bot.infinity_polling()
