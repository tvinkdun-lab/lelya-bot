const { Telegraf } = require('telegraf');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
app.use(express.json());

// База данных клиентов в памяти
// Структура: HWID -> { key, hwid, expiresAt, isBanned, lastSeen }
const db = new Map();

// Время (мс), после которого клиент считается оффлайн (35 секунд)
const TIMEOUT_MS = 35000;

// ==================== API ДЛЯ TAMPERMONKEY ====================

app.get('/verify', (req, res) => {
    const { hwid, key } = req.query;

    if (!hwid || !key) {
        return res.json({ status: 'error', message: 'Missing hwid or key' });
    }

    const client = db.get(hwid);

    if (!client) {
        return res.json({ status: 'invalid', message: 'HWID not registered' });
    }

    if (client.isBanned) {
        return res.json({ status: 'banned', message: 'User is banned' });
    }

    if (client.key !== key) {
        return res.json({ status: 'invalid', message: 'Invalid key' });
    }

    if (Date.now() > client.expiresAt) {
        return res.json({ status: 'expired', message: 'Subscription expired' });
    }

    // Обновляем время последнего онлайна
    client.lastSeen = Date.now();
    db.set(hwid, client);

    return res.json({ status: 'success', message: 'Active' });
});

// ==================== КОМАНДЫ TELEGRAM БОТА ====================

// /gen HWID — Сгенерировать ключ
bot.command('gen', (ctx) => {
    const args = ctx.message.text.split(' ');
    const hwid = args[1];

    if (!hwid) {
        return ctx.reply('❌ Использование: /gen HWID');
    }

    const key = 'KEY-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 дней

    db.set(hwid, {
        key,
        hwid,
        expiresAt,
        isBanned: false,
        lastSeen: 0
    });

    ctx.reply(`✅ Ключ успешно сгенерирован!\n\n🔑 Ключ: <code>${key}</code>\n💻 HWID: <code>${hwid}</code>\n⏳ Срок: 30 дней`, { parse_mode: 'HTML' });
});

// /adddays HWID дни — Продлить подписку
bot.command('adddays', (ctx) => {
    const args = ctx.message.text.split(' ');
    const hwid = args[1];
    const days = parseInt(args[2]);

    if (!hwid || !days) {
        return ctx.reply('❌ Использование: /adddays HWID количество_дней');
    }

    const client = db.get(hwid);
    if (!client) {
        return ctx.reply('❌ Клиент с таким HWID не найден в базе.');
    }

    const baseTime = client.expiresAt > Date.now() ? client.expiresAt : Date.now();
    client.expiresAt = baseTime + days * 24 * 60 * 60 * 1000;
    db.set(hwid, client);

    ctx.reply(`✅ Подписка для <code>${hwid}</code> продлена на ${days} дн.`, { parse_mode: 'HTML' });
});

// /ban HWID (или ответом на сообщение) — Забанить пользователя
bot.command('ban', (ctx) => {
    const args = ctx.message.text.split(' ');
    let hwid = args[1];

    if (!hwid && ctx.message.reply_to_message) {
        const text = ctx.message.reply_to_message.text || ctx.message.reply_to_message.caption;
        const match = text && text.match(/([a-zA-Z0-9_-]{10,})/);
        if (match) hwid = match[1];
    }

    if (!hwid) {
        return ctx.reply('❌ Использование: /ban HWID (или ответьте на сообщение)');
    }

    const client = db.get(hwid);
    if (!client) {
        return ctx.reply('❌ Клиент не найден в базе.');
    }

    client.isBanned = true;
    db.set(hwid, client);

    ctx.reply(`⛔ Пользователь <code>${hwid}</code> успешно заблокирован.`, { parse_mode: 'HTML' });
});

// /unban HWID — Разбанить пользователя
bot.command('unban', (ctx) => {
    const args = ctx.message.text.split(' ');
    const hwid = args[1];

    if (!hwid) {
        return ctx.reply('❌ Использование: /unban HWID');
    }

    const client = db.get(hwid);
    if (!client) {
        return ctx.reply('❌ Клиент не найден.');
    }

    client.isBanned = false;
    db.set(hwid, client);

    ctx.reply(`🟢 Пользователь <code>${hwid}</code> разблокирован.`, { parse_mode: 'HTML' });
});

// /reset HWID — Удалить из базы
bot.command('reset', (ctx) => {
    const args = ctx.message.text.split(' ');
    const hwid = args[1];

    if (!hwid) {
        return ctx.reply('❌ Использование: /reset HWID');
    }

    if (db.has(hwid)) {
        db.delete(hwid);
        ctx.reply(`🗑 HWID <code>${hwid}</code> удален из базы.`, { parse_mode: 'HTML' });
    } else {
        ctx.reply('❌ HWID не найден в базе.');
    }
});

// /online — Список активных и неактивных устройств
bot.command('online', (ctx) => {
    const now = Date.now();
    let onlineList = [];
    let offlineList = [];

    db.forEach((data, hwid) => {
        if (data.isBanned) return;
        const diff = now - data.lastSeen;

        if (data.lastSeen > 0 && diff < TIMEOUT_MS) {
            onlineList.push(`🟢 <code>${hwid}</code> (активен ${Math.round(diff / 1000)}с назад)`);
        } else {
            const min = data.lastSeen === 0 ? 'никогда' : `${Math.round(diff / 60000)} мин.`;
            offlineList.push(`🔴 <code>${hwid}</code> (был ${min} назад)`);
        }
    });

    let msg = "<b>📊 Список активных устройств:</b>\n\n";
    msg += "<b>В сети:</b>\n" + (onlineList.length ? onlineList.join('\n') : 'Никого нет') + "\n\n";
    msg += "<b>Не в сети:</b>\n" + (offlineList.length ? offlineList.join('\n') : 'Никого нет');

    ctx.replyWithHTML(msg);
});

// /all — Полная статистика и список забаненных
bot.command('all', (ctx) => {
    let total = db.size;
    let bannedList = [];

    db.forEach((data, hwid) => {
        if (data.isBanned) {
            bannedList.push(`⛔ <code>${hwid}</code>`);
        }
    });

    let msg = `<b>📈 Полная статистика бота:</b>\n`;
    msg += `👥 Всего устройств в базе: <b>${total}</b>\n`;
    msg += `⛔ Забанено: <b>${bannedList.length}</b>\n\n`;

    if (bannedList.length > 0) {
        msg += "<b>Список забаненных:</b>\n" + bannedList.join('\n');
    }

    ctx.replyWithHTML(msg);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
