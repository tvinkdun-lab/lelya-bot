import hmac
import hashlib
import json
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
import asyncio

TOKEN = "8790088326:AAGvmIZWF-Zbxkxm4Re2eV4wnLy-aaDh3ps"
SECRET_SALT = "LelyaSuperSecretSalt2026_ProtectYourClient"
ADMIN_ID = 5773841673

bot = Bot(token=TOKEN)
dp = Dispatcher()

# Временное хранилище в памяти бота
BANNED_HWIDS = set()

def generate_key(hwid: str) -> str:
    signature = hmac.new(
        SECRET_SALT.encode('utf-8'),
        hwid.encode('utf-8'),
        hashlib.sha256
    ).hexdigest().upper()
    return f"LHC-PRO-{signature[0:4]}-{signature[4:8]}-{signature[8:12]}"

@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    args = message.text.split(maxsplit=1)
    if len(args) > 1:
        hwid = args[1].strip()
        
        # Проверка на бан
        if hwid in BANNED_HWIDS:
            await message.answer("❌ **Доступ заблокирован!**\n\nВаш HWID находится в черном списке разработчика.", parse_mode="Markdown")
            return
        
        key = generate_key(hwid)
        await message.answer(
            f"✅ **Успешный запрос ключа!**\n\n👤 Ваш HWID: `{hwid}`\n🔑 Ваш ключ активации:\n`{key}`",
            parse_mode="Markdown"
        )
    else:
        await message.answer("👋 Привет! Используй кнопку получения ключа из клиента Lelya Hack.")

# Команда для блокировки: /ban HWID-XXXXXX
@dp.message(lambda message: message.text and message.text.startswith("/ban "))
async def ban_hwid(message: types.Message):
    if message.from_user.id != ADMIN_ID:
        return
    
    hwid_to_ban = message.text.replace("/ban ", "").strip()
    if hwid_to_ban:
        BANNED_HWIDS.add(hwid_to_ban)
        await message.answer(f"🚫 HWID `{hwid_to_ban}` успешно заблокирован!", parse_mode="Markdown")

# Команда для разблокировки: /unban HWID-XXXXXX
@dp.message(lambda message: message.text and message.text.startswith("/unban "))
async def unban_hwid(message: types.Message):
    if message.from_user.id != ADMIN_ID:
        return
    
    hwid_to_unban = message.text.replace("/unban ", "").strip()
    if hwid_to_unban in BANNED_HWIDS:
        BANNED_HWIDS.remove(hwid_to_unban)
        await message.answer(f"✅ HWID `{hwid_to_unban}` разблокирован.", parse_mode="Markdown")
    else:
        await message.answer(f"⚠️ Этот HWID не найден в черном списке.")

# Команда посмотреть список всех заблокированных: /list
@dp.message(lambda message: message.text == "/list")
async def list_banned(message: types.Message):
    if message.from_user.id != ADMIN_ID:
        return
    if not BANNED_HWIDS:
        await message.answer("📂 Черный список пуст.")
    else:
        text = "🚫 **Заблокированные HWID:**\n\n" + "\n".join(BANNED_HWIDS)
        await message.answer(text, parse_mode="Markdown")

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
