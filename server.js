const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Твои данные
const BOT_TOKEN = '8790088326:AAH1h0kbxX5p832XGL9R0JPDlf3-hQH63ww';
const ADMIN_ID = 5773841673;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const TOKENS_FILE = './tokens.json';

function loadTokens() {
    if (!fs.existsSync(TOKENS_FILE)) {
        fs.writeFileSync(TOKENS_FILE, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
}

function saveTokens(tokens) {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

// Эндпоинт для проверки токена лоадером
app.get('/verify', (req, res) => {
    const token = req.query.token;
    if (!token) return res.json({ status: 'error', message: 'Токен не указан' });

    const tokens = loadTokens();
    const tokenData = tokens[token];

    if (!tokenData) return res.json({ status: 'error', message: 'Неверный токен' });
    if (tokenData.status === 'banned') return res.json({ status: 'banned' });

    return res.json({ status: 'success' });
});

// Команды бота
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, '👋 Привет! Добро пожаловать в бота LelyaHack.');
});

bot.onText(/\/gentoken/, (msg) => {
    if (msg.from.id !== ADMIN_ID) return bot.sendMessage(msg.chat.id, '⛔ У тебя нет прав.');

    const tokens = loadTokens();
    const newToken = 'TOK-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    tokens[newToken] = { status: 'active', createdAt: new Date().toISOString() };
    saveTokens(tokens);

    bot.sendMessage(msg.chat.id, `✅ Новый токен:\n\`${newToken}\``, { parse_mode: 'Markdown' });
});

bot.onText(/\/bantoken (.+)/, (msg, match) => {
    if (msg.from.id !== ADMIN_ID) return bot.sendMessage(msg.chat.id, '⛔ У тебя нет прав.');

    const tokenToBan = match[1].trim();
    const tokens = loadTokens();

    if (!tokens[tokenToBan]) return bot.sendMessage(msg.chat.id, '❌ Токен не найден.');

    tokens[tokenToBan].status = 'banned';
    saveTokens(tokens);

    bot.sendMessage(msg.chat.id, `🚫 Токен \`${tokenToBan}\` забанен!`, { parse_mode: 'Markdown' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
