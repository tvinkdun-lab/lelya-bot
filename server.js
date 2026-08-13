const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Укажи свой Telegram Token (лучше вынести в переменные среды Render: BOT_TOKEN)
const TOKEN = process.env.BOT_TOKEN || '8790088326:AAHdEeGW4HlDTXOAPGWW1BoxBxAVwNgfv0A';
// Укажи свой Telegram ID (чтобы только ты мог использовать админ-команды)
const ADMIN_ID = Number(process.env.ADMIN_ID || 5773841673);

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

    // Уведомляем администратора в Telegram о запросе с кнопкой для ответа или генерации
    bot.sendMessage(ADMIN_ID, `🚨 *Запрос ключа от игрока!*\n\nHWID: \`${hwid}\``, { 
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔑 Выдать на 30 дней', callback_data: `gen_30_${hwid}` }],
                [{ text: '🚫 Забанить HWID', callback_data: `ban_${hwid}` }]
            ]
        }
    }).catch(()=>{});

    res.send(`
        <html>
            <head>
                <title>Lelya Hack Client - Получение ключа</title>
                <meta charset="utf-8">
                <style>
                    body { background: #0c0c10; color: #fff; font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                    .card { background: rgba(20,20,25,0.95); padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); text-align: center; max-width: 400px; width: 100%; box-shadow: 0 0 30px rgba(0,0,0,0.9); }
                    .key-box { background: rgba(5,5,5,0.9); padding: 12px; border: 1px dashed rgba(138,109,238,0.5); border-radius: 8px; font-family: monospace; font-size: 16px; color: #8a6dee; margin: 15px 0; user-select: text; }
                    p { font-size: 13px; color: #aaa; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>Запрос отправлен</h2>
                    <p>Твой HWID: <code>${hwid}</code></p>
                    <div class="key-box">Ожидай одобрения администратора в Telegram-боте.</div>
                    <p>После выдачи ключа обнови страницу или введи его в игре.</p>
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

// Обработка нажатий на инлайн-кнопки
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    if (chatId !== ADMIN_ID) return;

    const data = query.data;
    const parts = data.split('_');
    const action = parts[0];

    if (action === 'gen') {
        const days = parseInt(parts[1]) || 30;
        const hwid = parts.slice(2).join('_');

        if (bannedHwids.has(hwid)) {
            return bot.answerCallbackQuery(query.id, { text: '❌ Этот HWID заблокирован!', show_alert: true });
        }

        const newKey = 'LELYA-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;

        keysDb.set(newKey, { hwid, tgId: chatId, expiresAt });
        
        bot.editMessageText(`✅ Ключ успешно сгенерирован!\n\nHWID: \`${hwid}\`\nКлюч: \`${newKey}\`\nСрок: ${days} дн.`, {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: 'Markdown'
        });
        bot.answerCallbackQuery(query.id, { text: 'Ключ выдан!' });
    } 
    else if (action === 'ban') {
        const hwid = parts.slice(1).join('_');
        bannedHwids.add(hwid);
        for (let [k, v] of keysDb.entries()) {
            if (v.hwid === hwid) keysDb.delete(k);
        }
        bot.editMessageText(`🚫 HWID \`${hwid}\` успешно заблокирован.`, {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: 'Markdown'
        });
        bot.answerCallbackQuery(query.id, { text: 'HWID заблокирован!' });
    }
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text ? msg.text.trim() : '';

    if (chatId !== ADMIN_ID) {
        return bot.sendMessage(chatId, '⛔ У тебя нет доступа к этому боту.');
    }

    const args = text.split(' ');
    const cmd = args[0];

    // Поддержка ответа на сообщение (/gen или /gen 1)
    if (cmd === '/gen') {
        let hwid = args[1];
        let days = parseInt(args[2]) || 30;

        // Если команда отправлена реплаем на сообщение бота с запросом
        if (!hwid && msg.reply_to_message && msg.reply_to_message.text) {
            const replyText = msg.reply_to_message.text;
            // Пытаемся вытащить HWID из текста сообщения
            const match = replyText.match(/HWID:\s*`([^`]+)`/);
            if (match) {
                hwid = match[1];
            }
            // Если после /gen указано число (например, /gen 7 в ответ на сообщение)
            if (!isNaN(parseInt(args[1]))) {
                days = parseInt(args[1]);
            }
        }

        if (!hwid) {
            return bot.sendMessage(chatId, '❌ Использование: `/gen [HWID] [дни]` или ответь на сообщение с запросом командой `/gen [дни]`', { parse_mode: 'Markdown' });
        }

        if (bannedHwids.has(hwid)) {
            return bot.sendMessage(chatId, `❌ Ошибка: HWID \`${hwid}\` находится в бане!`, { parse_mode: 'Markdown' });
        }

        const newKey = 'LELYA-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;

        keysDb.set(newKey, { hwid, tgId: chatId, expiresAt });
        return bot.sendMessage(chatId, `✅ Ключ успешно сгенерирован!\n\nHWID: \`${hwid}\`\nКлюч: \`${newKey}\`\nСрок: ${days} дн.`, { parse_mode: 'Markdown' });
    }

    // /ban <HWID> (или через реплай)
    if (cmd === '/ban') {
        let hwid = args[1];
        if (!hwid && msg.reply_to_message && msg.reply_to_message.text) {
            const match = msg.reply_to_message.text.match(/HWID:\s*`([^`]+)`/);
            if (match) hwid = match[1];
        }

        if (!hwid) return bot.sendMessage(chatId, '❌ Использование: `/ban HWID` (или ответь на сообщение)', { parse_mode: 'Markdown' });

        bannedHwids.add(hwid);
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
