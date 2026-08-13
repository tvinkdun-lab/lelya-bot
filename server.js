const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Укажи свой Telegram Token (лучше вынести в переменные среды Render: BOT_TOKEN)
const TOKEN = process.env.BOT_TOKEN || 'ТВОЙ_TELEGRAM_BOT_TOKEN';
// Укажи свой Telegram ID (чтобы только ты мог использовать админ-команды)
const ADMIN_ID = Number(process.env.ADMIN_ID) || 123456789; 

const bot = new TelegramBot(TOKEN, { polling: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Базы данных в памяти:
// keysDb: key -> { hwid, tgId, expiresAt }
const keysDb = new Map();
// bannedHwids: Set с забаненными HWID
const bannedHwids = new Set();
// pendingHwids: hwid -> tgId (для запросов)
const pendingHwids = new Map();

// Проверка валидности подписки
function isKeyValid(data) {
    if (!data) return false;
    return Date.now() < data.expiresAt;
}

// --- WEB ЭНДПОИНТЫ ДЛЯ СКРИПТА ---

// Страница запроса ключа (/start?hwid=...)
app.get('/start', (req, res) => {
    const hwid = req.query.hwid;
    if (!hwid) {
        return res.status(400).send('<h1>Ошибка: Не указан HWID!</h1>');
    }

    // Проверяем, не в бане ли пользователь
    if (bannedHwids.has(hwid)) {
        return res.send(`
            <html>
                <head><meta charset="utf-8"><title>Заблокировано</title></head>
                <body style="background:#0c0c10;color:#ff4444;font-family:sans-serif;text-align:center;padding-top:50px;">
                    <h2>🚫 Твой HWID заблокирован администратором!</h2>
                </body>
            </html>
        `);
    }

    // Ищем существующий активный ключ для этого HWID
    let activeKey = null;
    for (let [k, v] of keysDb.entries()) {
        if (v.hwid === hwid && isKeyValid(v)) {
            activeKey = k;
            break;
        }
    }

    if (!activeKey) {
        // Генерируем новый временный ключ (до активации/генерации админом)
        activeKey = 'LELYA-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        keysDb.set(activeKey, { hwid: hwid, tgId: null, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
    }

    // Уведомляем администратора в Telegram о новом запросе
    bot.sendMessage(ADMIN_ID, `🚨 *Запрос ключа от игрока!*\n\nHWID: \`${hwid}\`\nКлюч: \`${activeKey}\`\n\nСкопируй команду для выдачи:\n\`/gen ${hwid}\``, { parse_mode: 'Markdown' }).catch(()=>{});

    res.send(`
        <html>
            <head>
                <title>Lelya Hack Client - Получение ключа</title>
                <meta charset="utf-8">
                <style>
                    body { background: #0c0c10; color: #fff; font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                    .card { background: rgba(20,20,25,0.95); padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); text-align: center; max-width: 400px; width: 100%; box-shadow: 0 0 30px rgba(0,0,0,0.9); }
                    .key-box { background: rgba(5,5,5,0.9); padding: 12px; border: 1px dashed rgba(138,109,238,0.5); border-radius: 8px; font-family: monospace; font-size: 18px; color: #8a6dee; margin: 15px 0; user-select: text; }
                    p { font-size: 13px; color: #aaa; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>Активация Lelya Hack</h2>
                    <p>Твой HWID: <code>${hwid}</code></p>
                    <p>Твой ключ активации:</p>
                    <div class="key-box">${activeKey}</div>
                    <p>Отправь этот ключ в игре для входа.</p>
                </div>
            </body>
        </html>
    `);
});

// Проверка ключа клиентом Tampermonkey
app.get('/verify', (req, res) => {
    const { hwid, key } = req.query;

    if (!hwid || !key) {
        return res.json({ status: 'error', message: 'Неверные параметры!' });
    }

    if (bannedHwids.has(hwid)) {
        return res.json({ status: 'error', message: 'Устройство заблокировано!' });
    }

    const keyData = keysDb.get(key);

    if (keyData && keyData.hwid === hwid && isKeyValid(keyData)) {
        return res.json({ status: 'success' });
    } else {
        return res.json({ status: 'error', message: 'Ключ недействителен, истек или привязан к другому устройству!' });
    }
});


// --- TELEGRAM БОТ АДМИН-ПАНЕЛЬ ---

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text ? msg.text.trim() : '';

    if (chatId !== ADMIN_ID) {
        return bot.sendMessage(chatId, '⛔ У тебя нет доступа к этому боту.');
    }

    const args = text.split(' ');
    const cmd = args[0];

    // /gen <HWID> [дней]
    if (cmd === '/gen') {
        const hwid = args[1];
        const days = parseInt(args[2]) || 30; // По умолчанию на 30 дней
        if (!hwid) return bot.sendMessage(chatId, '❌ Использование: `/gen HWID [дни]`', { parse_mode: 'Markdown' });

        const newKey = 'LELYA-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;

        keysDb.set(newKey, { hwid, tgId: chatId, expiresAt });
        return bot.sendMessage(chatId, `✅ Ключ успешно сгенерирован!\n\nHWID: \`${hwid}\`\nКлюч: \`${newKey}\`\nСрок: ${days} дн.`, { parse_mode: 'Markdown' });
    }

    // /ban <HWID>
    if (cmd === '/ban') {
        const hwid = args[1];
        if (!hwid) return bot.sendMessage(chatId, '❌ Использование: `/ban HWID`', { parse_mode: 'Markdown' });

        bannedHwids.add(hwid);
        // Удаляем все его ключи
        for (let [k, v] of keysDb.entries()) {
            if (v.hwid === hwid) keysDb.delete(k);
        }
        return bot.sendMessage(chatId, `🚫 HWID \`${hwid}\` успешно заблокирован.`, { parse_mode: 'Markdown' });
    }

    // /unban <HWID>
    if (cmd === '/unban') {
        const hwid = args[1];
        if (!hwid) return bot.sendMessage(chatId, '❌ Использование: `/unban HWID`', { parse_mode: 'Markdown' });

        bannedHwids.delete(hwid);
        return bot.sendMessage(chatId, `🟢 HWID \`${hwid}\` разблокирован.`, { parse_mode: 'Markdown' });
    }

    // /reset <HWID> (сбросить привязку)
    if (cmd === '/reset') {
        const hwid = args[1];
        if (!hwid) return bot.sendMessage(chatId, '❌ Использование: `/reset HWID`', { parse_mode: 'Markdown' });

        let count = 0;
        for (let [k, v] of keysDb.entries()) {
            if (v.hwid === hwid) {
                keysDb.delete(k);
                count++;
            }
        }
        return bot.sendMessage(chatId, `🔄 Сброшено привязок для HWID \`${hwid}\`: ${count}`, { parse_mode: 'Markdown' });
    }

    // /adddays <HWID> <дни>
    if (cmd === '/adddays') {
        const hwid = args[1];
        const days = parseInt(args[2]);
        if (!hwid || isNaN(days)) return bot.sendMessage(chatId, '❌ Использование: `/adddays HWID количество_дней`', { parse_mode: 'Markdown' });

        let found = false;
        for (let [k, v] of keysDb.entries()) {
            if (v.hwid === hwid) {
                v.expiresAt = Math.max(v.expiresAt, Date.now()) + days * 24 * 60 * 60 * 1000;
                found = true;
            }
        }

        if (found) {
            return bot.sendMessage(chatId, `⏱ К HWID \`${hwid}\` успешно добавлено ${days} дней.`, { parse_mode: 'Markdown' });
        } else {
            return bot.sendMessage(chatId, `❌ Активных ключей для HWID \`${hwid}\` не найдено.`);
        }
    }

    // /online (активные устройства)
    if (cmd === '/online') {
    if (keysDb.size === 0) return bot.sendMessage(chatId, 'Активных устройств нет.');
        let msgText = '📋 **Активные ключи и устройства:**\n\n';
        let i = 1;
        for (let [k, v] of keysDb.entries()) {
            if (isKeyValid(v)) {
                const daysLeft = Math.ceil((v.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
                msgText += `${i}. HWID: \`${v.hwid}\`\n   Ключ: \`${k}\` (Осталось: ${daysLeft} дн.)\n\n`;
                i++;
            }
        }
        return bot.sendMessage(chatId, msgText, { parse_mode: 'Markdown' });
    }

    // /all (статистика и баны)
    if (cmd === '/all') {
        let bList = Array.from(bannedHwids).join('\n') || 'Нет';
        return bot.sendMessage(chatId, `📊 **Статистика бота:**\n\n- Активных ключей: ${keysDb.size}\n- Забаненных HWID: ${bannedHwids.size}\n\n🛑 **Список банов:**\n${bList}`, { parse_mode: 'Markdown' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
