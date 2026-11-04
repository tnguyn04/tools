
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

let browser = null;
let context = null;

const PROFILE_DIR = path.join(
    process.cwd(),
    "data",
    "zealy-browser"
);

const AUTH_FILE = path.join(
    process.cwd(),
    "data",
    "zealy-auth.json"
);

function createSlug(title) {
    return String(title || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]/g, "");
}

async function getBrowserContext() {
    if (browser && context) {
        return context;
    }

    fs.mkdirSync(PROFILE_DIR, { recursive: true });

    browser = await chromium.launch({
        headless: false,
        args: ["--start-maximized"]
    });

    const options = {
        viewport: null
    };

    if (fs.existsSync(AUTH_FILE)) {
        options.storageState = AUTH_FILE;
        console.log("[BROWSER] Đã tìm thấy dữ liệu đăng nhập");
    } else {
        console.log("[BROWSER] Chưa có dữ liệu đăng nhập");
    }

    context = await browser.newContext(options);

    browser.on("disconnected", () => {
        browser = null;
        context = null;
    });

    console.log("[BROWSER] Chromium đã khởi động");

    return context;
}


async function openQuest(community, questId, title) {
    if (!community || !questId) {
        throw new Error("Thiếu community hoặc quest ID");
    }

    const slug = createSlug(title);

    const questUrl =
        `https://zealy.io/cw/${encodeURIComponent(community)}` +
        `/questboard/${slug}/${encodeURIComponent(questId)}`;

    const browserContext = await getBrowserContext();
    const page = await browserContext.newPage();

    try {
        const response = await page.goto(questUrl, {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        await page.waitForTimeout(2000);
        // Kiểm tra các nút hiển thị trên Zealy
        const buttons = await page.locator("button").evaluateAll(
            elements => elements.map(button => ({
                text: button.innerText.trim(),
                disabled: button.disabled,
                ariaLabel: button.getAttribute("aria-label")
            }))
        );

        console.log("[DEBUG BUTTONS]", JSON.stringify(buttons, null, 2));

        // Kiểm tra các liên kết
        const links = await page.locator("a").evaluateAll(
            elements => elements.map(link => ({
                text: link.innerText.trim(),
                href: link.href
            }))
        );

        console.log("[DEBUG LINKS]", JSON.stringify(links, null, 2));

        console.log("[BROWSER] URL:", page.url());
        console.log("[BROWSER] HTTP:", response?.status());
        console.log("[BROWSER] Title:", await page.title());

        return page;

    } catch (error) {
        await page.close();
        throw error;
    }
}


async function saveLogin() {
    if (!context) {
        throw new Error("Browser chưa được khởi động");
    }

    fs.mkdirSync(path.dirname(AUTH_FILE), {
        recursive: true
    });

    await context.storageState({
        path: AUTH_FILE
    });

    console.log("[BROWSER] Đã lưu trạng thái đăng nhập");
}

async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
        context = null;
    }
}

module.exports = {
    openQuest,
    saveLogin,
    closeBrowser
};
