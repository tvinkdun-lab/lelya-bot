const { Telegraf } = require('telegraf');
const fs = require('fs');

const bot = new Telegraf('8790088326:AAH1h0kbxX5p832XGL9R0JPDlf3-hQH63ww');
const ADMIN_ID = 5773841673; // Замени на свой Telegram ID для доступа к админке

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

// 1. Генерация токена (Только для админа)
bot.command('gentoken', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return ctx.reply('⛔ У тебя нет прав.');

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

// 2. Бан / Удаление токена (Только для админа)
bot.command('bantoken', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return ctx.reply('⛔ У тебя нет прав.');

    const args = ctx.message.text.split(' ');
    const tokenToBan = args[1];

    if (!tokenToBan) return ctx.reply('ℹ️ Использование: /bantoken <ТОКЕН>');

    const tokens = loadTokens();
    if (!tokens[tokenToBan]) {
        return ctx.reply('❌ Такой токен не найден.');
    }

    tokens[tokenToBan].status = 'banned';
    saveTokens(tokens);

    ctx.reply(`🚫 Токен \`${tokenToBan}\` успешно забанен!`, { parse_mode: 'Markdown' });
});

// 3. Активация токена пользователем
bot.command('activate', (ctx) => {
    const args = ctx.message.text.split(' ');
    const userToken = args[1];
    const userId = ctx.from.id;

    if (!userToken) return ctx.reply('ℹ️ Использование: /activate <ТОКЕН>');

    const tokens = loadTokens();
    const tokenData = tokens[userToken];

    if (!tokenData) {
        return ctx.reply('❌ Неверный токен.');
    }

    if (tokenData.status === 'banned') {
        return ctx.reply('⛔ Этот токен заблокирован администратором.');
    }

    if (tokenData.status === 'used' && tokenData.userId !== userId) {
        return ctx.reply('❌ Этот токен уже используется другим пользователем.');
    }

    // Привязываем токен к пользователю
    tokens[userToken].status = 'used';
    tokens[userToken].userId = userId;
    saveTokens(tokens);

    ctx.reply('🎉 Токен успешно активирован! Доступ разрешен.');
});

bot.launch();
console.log('Бот запущен!');
