const TelegramBot = require("node-telegram-bot-api");

function createSlug(title) {
    return String(title || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]/g, "");
}

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TOKEN || !CHAT_ID || TOKEN === "TOKEN_BOT_MOI") {
    throw new Error("Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong .env");
}

const bot = new TelegramBot(TOKEN, {
    polling: false
});

function escapeHTML(text) {
    return String(text ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

async function sendNewQuest(quest, community) {
    const typeIcons = {
        like: "❤️",
        retweet: "🔁",
        comment: "💬",
        follow: "👤",
        discord: "🎮",
        telegram: "✈️",
        visit: "🌐",
        quiz: "❓",
        x_custom: "𝕏",
        custom: "⚙️"
    };

    const types = quest.task_types || ["custom"];

    const taskText = types
        .map(type => `${typeIcons[type] || "⚙️"} ${type.toUpperCase()}`)
        .join("\n");

    const taskDetails = (quest.task_details || [])
        .map((task, index) => {
            const taskType = (task.types || ["custom"])
                .map(type => type.toUpperCase())
                .join(" + ");

            return `${index + 1}. ${escapeHTML(taskType)}`;
        })
        .join("\n");

    const slug = createSlug(quest.title);

    const questUrl =
        `https://zealy.io/cw/${encodeURIComponent(community)}/questboard/${slug}/${encodeURIComponent(quest.id)}`;

    const message = [
        "🚀 <b>NEW ZEALY QUEST</b>",
        "",
        `🌐 Community: <b>${escapeHTML(community)}</b>`,
        `📌 Quest: <b>${escapeHTML(quest.title)}</b>`,
        `🎁 Reward: <b>${Number(quest.reward) || 0} XP</b>`,
        "",
        "⚡ <b>TASK TYPES</b>",
        taskText,
        "",
        `📋 Total tasks: <b>${quest.task_count || 0}</b>`,
        `🔗 Condition: <b>${escapeHTML(quest.condition_operator || "AND")}</b>`,
        "",
        taskDetails ? `<b>Task details:</b>\n${taskDetails}` : "",
        `🆔 ID: <code>${escapeHTML(quest.id)}</code>`
    ].filter(Boolean).join("\n");

    await bot.sendMessage(CHAT_ID, message, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "🔎 OPEN QUEST",
                        url: questUrl
                    }
                ]
            ]
        }
    });

    console.log(`[TELEGRAM] Đã gửi: ${quest.title}`);

    return true;
}

module.exports = { sendNewQuest };