const { Telegraf } = require('telegraf');
const fs = require('fs');

// Твои данные
const BOT_TOKEN = '8790088326:AAH1h0kbxX5p832XGL9R0JPDlf3-hQH63ww';
const ADMIN_ID = 5773841673;

const bot = new Telegraf(BOT_TOKEN);
const TOKENS_FILE = './tokens.json';

// Функция загрузки токенов
function loadTokens() {
    if (!fs.existsSync(TOKENS_FILE)) {
        fs.writeFileSync(TOKENS_FILE, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
}

// Функция сохранения токенов
function saveTokens(tokens) {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

// Команда /start (приветствие и кнопка получения токена)
bot.start((ctx) => {
    ctx.reply(
        '👋 Привет! Добро пожаловать в бота LelyaHack.\n\n' +
        'Чтобы получить токен доступа к скрипту, обратитесь к администратору или запросите его.'
    );
});

// 1. Генерация токена (Только для тебя)
bot.command('gentoken', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return ctx.reply('⛔ У тебя нет прав администратора.');

    const tokens = loadTokens();
    const newToken = 'TOK-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    tokens[newToken] = {
        status: 'active',
        userId: null,
        createdAt: new Date().toISOString()
    };

    saveTokens(tokens);
    ctx.reply(`✅ Успешно создан новый токен:\n\`${newToken}\``, { parse_mode: 'Markdown' });
});

// 2. Бан токена (Только для тебя)
bot.command('bantoken', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return ctx.reply('⛔ У тебя нет прав администратора.');

    const args = ctx.message.text.split(' ');
    const tokenToBan = args[1];

    if (!tokenToBan) return ctx.reply('ℹ️ Использование: `/bantoken TOK-XXXXXX`', { parse_mode: 'Markdown' });

    const tokens = loadTokens();
    if (!tokens[tokenToBan]) {
        return ctx.reply('❌ Такой токен не найден.');
    }

    tokens[tokenToBan].status = 'banned';
    saveTokens(tokens);

    ctx.reply(`🚫 Токен \`${tokenToBan}\` успешно забанен!`, { parse_mode: 'Markdown' });
});

// Запуск бота
bot.launch();
console.log('🤖 Telegram-бот успешно запущен и готов к работе!');

// Корреактная остановка
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
