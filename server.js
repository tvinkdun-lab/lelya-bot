const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const TOKEN = process.env.BOT_TOKEN || '8790088326:AAH1h0kbxX5p832XGL9R0JPDlf3-hQH63ww';
const ADMIN_ID = Number(process.env.ADMIN_ID || 5773841673);

const DB_FILE = path.join(__dirname, 'db.json');

// --- ЗАГРУЗКА И СОХРАНЕНИЕ ДАННЫХ ---
function loadData() {
    if (!fs.existsSync(DB_FILE)) {
        return { keys: [], bans: [] };
    }
    try {
        const fileData = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(fileData);
    } catch (e) {
        console.error('Ошибка при чтении db.json:', e);
        return { keys: [], bans: [] };
    }
}

const initialData = loadData();

const keysDb = new Map(Array.isArray(initialData.keys) ? initialData.keys : []);
const bannedHwids = new Set(initialData.bans || []);
const pendingHwids = new Map();

function saveData() {
    try {
        const dataToSave = {
            keys: Array.from(keysDb.entries()), 
            bans: Array.from(bannedHwids)       
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
    } catch (e) {
        console.error('Ошибка при сохранении в db.json:', e);
    }
}

// --- TELEGRAM BOT ---
const bot = new TelegramBot(TOKEN, { polling: true });

let botUsername = '';
bot.getMe().then((info) => {
    botUsername = info.username;
    console.log(`Telegram Bot @${botUsername} успешно запущен!`);
}).catch((err) => {
    console.error('Не удалось получить информацию о боте:', err);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ПИНГ ДЛЯ CRON-JOB
app.get('/', (req, res) => {
    console.log(`[PING] Запрос от cron-job принят в ${new Date().toLocaleTimeString()}`);
    res.send('Server is alive!');
});

function isKeyValid(data) {
    if (!data) return false;
    return Date.now() < data.expiresAt;
}

// Вспомогательная функция отправки запроса админу
function sendAdminKeyRequest(hwid) {
    bot.sendMessage(ADMIN_ID, `🚨 *Запрос ключа от игрока!*\n\n*HWID:* \`${hwid}\``, { 
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔑 Выдать на 30 дней', callback_data: `gen_30_${hwid}` }],
                [{ text: '🚫 Забанить HWID', callback_data: `ban_${hwid}` }],
                [{ text: '✅ Разбанить HWID', callback_data: `unban_${hwid}` }]
            ]
        }
    }).catch(err => console.error('Ошибка отправки админу:', err));
}

// Эндпоинт отправки запроса ключа
app.get('/request-key', (req, res) => {
    const hwid = req.query.hwid;
    if (!hwid) return res.json({ status: 'error', message: 'No HWID' });

    if (bannedHwids.has(hwid)) {
        return res.json({ status: 'banned', message: 'HWID Banned' });
    }

    sendAdminKeyRequest(hwid);
    res.json({ status: 'success' });
});

// --- ROUTE /start ---
app.get('/start', (req, res) => {
    const hwid = req.query.hwid;
    if (!hwid) {
        return res.status(400).send('<h1>Ошибка: Не указан HWID!</h1>');
    }

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

    sendAdminKeyRequest(hwid);

    if (botUsername) {
        return res.redirect(`https://t.me/${botUsername}?start=auth_${hwid}`);
    }

    res.send('<h1>Перенаправление в Telegram...</h1>');
});

// --- ROUTE /verify ---
app.get('/verify', (req, res) => {
    const { hwid, key } = req.query;

    if (!hwid) return res.json({ status: 'invalid', message: 'Не указан HWID!' });
    if (bannedHwids.has(hwid)) return res.json({ status: 'banned', message: 'Устройство заблокировано!' });
    if (!key) return res.json({ status: 'invalid', message: 'Не указан ключ!' });

    const keyData = keysDb.get(key);

    if (keyData && keyData.hwid === hwid) {
        if (!isKeyValid(keyData)) {
            return res.json({ status: 'expired', message: 'Срок действия ключа истек!' });
        }
        return res.json({ status: 'success' });
    } else {
        return res.json({ status: 'invalid', message: 'Ключ недействителен или привязан к другому устройству!' });
    }
});

// --- TELEGRAM COMMANDS ---
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text ? msg.text.trim() : '';

    if (text.startsWith('/start auth_')) {
        const hwid = text.replace('/start auth_', '');
        pendingHwids.set(hwid, chatId);
        sendAdminKeyRequest(hwid);
        return bot.sendMessage(chatId, `✅ **Твой HWID успешно зафиксирован!**\n\nHWID: \`${hwid}\`\n\nОжидай, пока администратор проверит запрос и выдаст тебе ключ.`, { parse_mode: 'Markdown' });
    }

    // Ручная генерация ключа администратором (/gen <HWID> [дни])
    if (text.startsWith('/gen')) {
        if (chatId !== ADMIN_ID) {
            return bot.sendMessage(chatId, '⛔ У вас нет прав на использование этой команды.');
        }

        const args = text.split(' ').filter(Boolean);
        const hwid = args[1];
        const days = parseInt(args[2]) || 30;

        if (!hwid) {
            return bot.sendMessage(chatId, '⚠️ *Использование:* `/gen <HWID> [дни]`\n*Пример:* `/gen my_hwid_123 30`', { parse_mode: 'Markdown' });
        }

        if (bannedHwids.has(hwid)) {
            return bot.sendMessage(chatId, `❌ HWID \`${hwid}\` находится в бане! Сначала разбаньте его.`, { parse_mode: 'Markdown' });
        }

        const newKey = 'LELYA-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;

        keysDb.set(newKey, { hwid, tgId: chatId, expiresAt });
        saveData();

        const targetTgId = pendingHwids.get(hwid);
        if (targetTgId) {
            bot.sendMessage(targetTgId, `🎉 **Твой ключ успешно выдан!**\n\nКлюч: \`${newKey}\`\nСрок: ${days} дн.`, { parse_mode: 'Markdown' }).catch(() => {});
            pendingHwids.delete(hwid);
        }

        return bot.sendMessage(chatId, `✅ **Ключ сгенерирован!**\n\n*HWID:* \`${hwid}\`\n*Ключ:* \`${newKey}\`\n*Срок:* ${days} дней`, { parse_mode: 'Markdown' });
    }

    if (chatId !== ADMIN_ID) {
        return bot.sendMessage(chatId, 'Чтобы получить ключ, обратитесь к создателю.');
    }
});

// --- CALLBACK BUTTONS (ОБРАБОТКА НАЖАТИЙ НА КНОПКИ) ---
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    if (chatId !== ADMIN_ID) return;

    const data = query.data;

    if (data.startsWith('gen_')) {
        const parts = data.split('_');
        const days = parseInt(parts[1]) || 30;
        const hwid = parts.slice(2).join('_');

        if (bannedHwids.has(hwid)) {
            return bot.answerCallbackQuery(query.id, { text: '❌ Этот HWID заблокирован!', show_alert: true });
        }

        const newKey = 'LELYA-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;

        keysDb.set(newKey, { hwid, tgId: chatId, expiresAt });
        saveData(); 

        const targetTgId = pendingHwids.get(hwid);
        if (targetTgId) {
            bot.sendMessage(targetTgId, `🎉 **Твой ключ успешно выдан!**\n\nКлюч: \`${newKey}\`\nСрок: ${days} дн.`, { parse_mode: 'Markdown' }).catch(() => {});
            pendingHwids.delete(hwid);
        }

        bot.editMessageText(`✅ **Ключ успешно выдан!**\n\n*HWID:* \`${hwid}\`\n*Ключ:* \`${newKey}\`\n*Срок:* ${days} дней`, {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: 'Markdown'
        });
        bot.answerCallbackQuery(query.id, { text: 'Ключ сгенерирован!' });
    } 
    else if (data.startsWith('ban_')) {
        const hwid = data.replace('ban_', '');
        bannedHwids.add(hwid);
        for (let [k, v] of keysDb.entries()) {
            if (v.hwid === hwid) keysDb.delete(k);
        }
        pendingHwids.delete(hwid);
        saveData(); 

        bot.editMessageText(`🚫 **HWID \`${hwid}\` заблокирован.**`, {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: 'Markdown'
        });
        bot.answerCallbackQuery(query.id, { text: 'HWID забанен!' });
    }
    else if (data.startsWith('unban_')) {
        const hwid = data.replace('unban_', '');

        if (!bannedHwids.has(hwid)) {
            return bot.answerCallbackQuery(query.id, { text: '⚠️ Этот HWID и так не забанен!', show_alert: true });
        }

        bannedHwids.delete(hwid);
        saveData();

        bot.editMessageText(`✅ **HWID \`${hwid}\` успешно разблокирован.**`, {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: 'Markdown'
        });
        bot.answerCallbackQuery(query.id, { text: 'HWID разбанен!' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
