from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command

TOKEN = "ВАШ_ТОКЕН_БОТА"
bot = Bot(token=TOKEN)
dp = Dispatcher()

# Множество для хранения заблокированных ID (в реальном проекте лучше использовать базу данных)
banned_users = set()

# Команда /ban
@dp.message(Command("ban"))
async def ban_user(message: types.Message):
    # Проверяем, ответил ли администратор на сообщение пользователя, которого нужно забанить
    if message.reply_to_message:
        user_to_ban = message.reply_to_message.from_user.id
        banned_users.add(user_to_ban)
        await message.reply(f" Пользователь {user_to_ban} заблокирован.")
    else:
        await message.reply("Ответьте этим сообщением на реплику того, кого хотите забанить.")

# Команда /unban
@dp.message(Command("unban"))
async def unban_user(message: types.Message):
    if message.reply_to_message:
        user_to_unban = message.reply_to_message.from_user.id
        if user_to_unban in banned_users:
            banned_users.remove(user_to_unban)
            await message.reply(f" Пользователь {user_to_unban} разблокирован.")
        else:
            await message.reply("Этот пользователь не был забанен.")
    else:
        await message.reply("Ответьте этим сообщением на реплику того, кого хотите разбанить.")

# Команда /status
@dp.message(Command("status"))
async def check_status(message: types.Message):
    user_id = message.from_user.id
    if user_id in banned_users:
        await message.reply(" Ваш статус: Заблокирован ❌")
    else:
        await message.reply(" Ваш статус: Активен ✅")
