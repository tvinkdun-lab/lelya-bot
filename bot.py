import random
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command

TOKEN = "8790088326:AAHKaigWjGSbwr11seLukJXeyWXO2eAtNNg"
bot = Bot(token=TOKEN)
dp = Dispatcher()

# Множество для хранения заблокированных ID
banned_users = set()

# 1. Команда /ban (работает только в ответ на сообщение пользователя)
@dp.message(Command("ban"))
async def ban_user(message: types.Message):
    if message.reply_to_message:
        user_to_ban = message.reply_to_message.from_user.id
        banned_users.add(user_to_ban)
        await message.reply(f"Пользователь {user_to_ban} заблокирован.")
    else:
        await message.reply("Ответьте этим сообщением на реплику того, кого хотите забанить.")

# 2. Команда /unban (работает только в ответ на сообщение пользователя)
@dp.message(Command("unban"))
async def unban_user(message: types.Message):
    if message.reply_to_message:
        user_to_unban = message.reply_to_message.from_user.id
        if user_to_unban in banned_users:
            banned_users.remove(user_to_unban)
            await message.reply(f"Пользователь {user_to_unban} разблокирован.")
        else:
            await message.reply("Этот пользователь не был забанен.")
    else:
        await message.reply("Ответьте этим сообщением на реплику того, кого хотите разбанить.")

# 3. Команда /status
@dp.message(Command("status"))
async def check_status(message: types.Message):
    user_id = message.from_user.id
    if user_id in banned_users:
        await message.reply("Ваш статус: Заблокирован ❌")
    else:
        await message.reply("Ваш статус: Активен ✅")

# 4. Команда для генерации ключа (/key)
@dp.message(Command("key"))
async def generate_key(message: types.Message):
    if message.from_user.id in banned_users:
        await message.reply("Вам заблокирован доступ к генерации ключей ❌")
        return
    
    random_part = "".join(random.choices("0123456789ABCDEF", k=4))
    key = f"LHC-PRO-{random_part}-ECC2-636A"
    
    await message.reply(f"✅ Ключ успешно сгенерирован:\n{key}")

# Запуск бота
if __name__ == "__main__":
    import asyncio
    async def main():
        await dp.start_polling(bot)
    asyncio.run(main())
