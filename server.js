const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const TOKEN = process.env.BOT_TOKEN || '8790088326:AAHdEeGW4HlDTXOAPGWW1BoxBxAVwNgfv0A';
const ADMIN_ID = Number(process.env.ADMIN_ID || 5773841673);

const DB_FILE = path.join(__dirname, 'db.json');

// --- ЗАГРУЗКА И СОХРАНЕНИЕ ДАННЫХ В ФАЙЛ ---
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
const keysDb = new Map(initialData.keys || []);
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

function isKeyValid(data) {
    if (!data) return false;
    return Date.now() < data.expiresAt;
}

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

    bot.sendMessage(ADMIN_ID, `🚨 *Запрос ключа от игрока!*\n\nHWID: \`${hwid}\``, { 
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔑 Выдать на 30 дней', callback_data: `gen_30_${hwid}` }],
                [{ text: '🚫 Забанить HWID', callback_data: `ban_${hwid}` }]
            ]
        }
    }).catch(() => {});

    if (botUsername) {
        return res.redirect(`https://t.me/${botUsername}?start=auth_${hwid}`);
    }

    res.send(`
        <html>
            <head>
                <title>Lelya Hack Client - Получение ключа</title>
                <meta charset="utf-8">
                <style>
                    body { background: #0c0c10; color: #fff; font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                    .card { background: rgba(20,20,25,0.95); padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); text-align: center; max-width: 400px; width: 100%; box-shadow: 0 0 30px rgba(0,0,0,0.9); }
                    p { font-size: 13px; color: #aaa; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>Перенаправление в Telegram...</h2>
                    <p>Твой HWID: <code>${hwid}</code></p>
                </div>
            </body>
        </html>
    `);
});

// --- ROUTE /verify ---
app.get('/verify', (req, res) => {
    const { hwid, key } = req.query;

    if (!hwid) {
        return res.json({ status: 'invalid', message: 'Не указан HWID!' });
    }

    if (bannedHwids.has(hwid)) {
        return res.json({ status: 'banned', message: 'Устройство заблокировано!' });
    }

    if (!key) {
        return res.json({ status: 'invalid', message: 'Не указан ключ!' });
    }

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
        return bot.sendMessage(chatId, `✅ **Твой HWID успешно зафиксирован!**\n\nHWID: \`${hwid}\`\n\nОжидай, пока администратор проверит запрос и выдаст тебе ключ.`, { parse_mode: 'Markdown' });
    }

    if (chatId !== ADMIN_ID) {
        return bot.sendMessage(chatId, 'Чтобы получить ключ заплати лутом создателю, дискорд vtmin7');
    }

    const args = text.split(' ');
    const cmd = args[0];

    if (cmd === '/gen') {
        let hwid = args[1];
        let days = parseInt(args[2]) || 30;

        if (!hwid && msg.reply_to_message && msg.reply_to_message.text) {
            const match = msg.reply_to_message.text.match(/HWID:\s*`([^`]+)`/);
            if (match) hwid = match[1];
            if (!isNaN(parseInt(args[1]))) days = parseInt(args[1]);
        }

        if (!hwid) return bot.sendMessage(chatId, '❌ Использование: `/gen [HWID] [дни]`', { parse_mode: 'Markdown' });
        if (bannedHwids.has(hwid)) return bot.sendMessage(chatId, `❌ Ошибка: HWID \`${hwid}\` находится в бане!`, { parse_mode: 'Markdown' });

        const newKey = 'LELYA-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;

        keysDb.set(newKey, { hwid, tgId: chatId, expiresAt });
        saveData(); // <--- Сохраняем изменение
        
        const targetTgId = pendingHwids.get(hwid);
        if (targetTgId) {
            bot.sendMessage(targetTgId, `🎉 **Твой ключ успешно выдан!**\n\nКлюч: \`${newKey}\`\nСрок: ${days} дн.\n\nСкопируй его и вставь в скрипт.`, { parse_mode: 'Markdown' }).catch(() => {});
            pendingHwids.delete(hwid);
        }

        return bot.sendMessage(chatId, `✅ Ключ успешно сгенерирован!\n\nHWID: \`${hwid}\`\nКлюч: \`${newKey}\`\nСрок: ${days} дн.`, { parse_mode: 'Markdown' });
    }

    if (cmd === '/ban') {
        let hwid = args[1];
        if (!hwid && msg.reply_to_message && msg.reply_to_message.text) {
            const match = msg.reply_to_message.text.match(/HWID:\s*`([^`]+)`/);
            if (match) hwid = match[1];
        }

        if (!hwid) return bot.sendMessage(chatId, '❌ Использование: `/ban HWID`', { parse_mode: 'Markdown' });

        bannedHwids.add(hwid);
        for (let [k, v] of keysDb.entries()) {
            if (v.hwid === hwid) keysDb.delete(k);
        }
        pendingHwids.delete(hwid);
        saveData(); // <--- Сохраняем изменение

        return bot.sendMessage(chatId, `🚫 HWID \`${hwid}\` успешно заблокирован.`, { parse_mode: 'Markdown' });
    }

    if (cmd === '/unban') {
        const hwid = args[1];
        if (!hwid) return bot.sendMessage(chatId, '❌ Использование: `/unban HWID`', { parse_mode: 'Markdown' });

        bannedHwids.delete(hwid);
        saveData(); // <--- Сохраняем изменение

        return bot.sendMessage(chatId, `🟢 HWID \`${hwid}\` разблокирован.`, { parse_mode: 'Markdown' });
    }

    if (cmd === '/all') {
        let bList = Array.from(bannedHwids).join('\n') || 'Нет';
        return bot.sendMessage(chatId, `📊 **Статистика:**\n- Активных ключей: ${keysDb.size}\n- Забаненных HWID: ${bannedHwids.size}\n\n🛑 **Баны:**\n${bList}`, { parse_mode: 'Markdown' });
    }
});

// --- CALLBACK BUTTONS ---
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    if (chatId !== ADMIN_ID) return;

    const parts = query.data.split('_');
    const action = parts[0];

    if (action === 'gen') {
        const days = parseInt(parts[1]) || 30;
        const hwid = parts.slice(2).join('_');

        if (bannedHwids.has(hwid)) {
            return bot.answerCallbackQuery(query.id, { text: '❌ HWID заблокирован!', show_alert: true });
        }

        const newKey = 'LELYA-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;

        keysDb.set(newKey, { hwid, tgId: chatId, expiresAt });
        saveData(); // <--- Сохраняем изменение
        
        const targetTgId = pendingHwids.get(hwid);
        if (targetTgId) {
            bot.sendMessage(targetTgId, `🎉 **Ключ выдан!**\n\nКлюч: \`${newKey}\``, { parse_mode: 'Markdown' }).catch(() => {});
            pendingHwids.delete(hwid);
        }

        bot.editMessageText(`✅ Ключ выдан: \`${newKey}\` (HWID: \`${hwid}\`)`, { chat_id: chatId, message_id: query.message.message_id, parse_mode: 'Markdown' });
        bot.answerCallbackQuery(query.id, { text: 'Готово!' });
    } 
    else if (action === 'ban') {
        const hwid = parts.slice(1).join('_');
        bannedHwids.add(hwid);
        for (let [k, v] of keysDb.entries()) {
            if (v.hwid === hwid) keysDb.delete(k);
        }
        pendingHwids.delete(hwid);
        saveData(); // <--- Сохраняем изменение

        bot.editMessageText(`🚫 HWID \`${hwid}\` заблокирован.`, { chat_id: chatId, message_id: query.message.message_id, parse_mode: 'Markdown' });
        bot.answerCallbackQuery(query.id, { text: 'Забанено!' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
