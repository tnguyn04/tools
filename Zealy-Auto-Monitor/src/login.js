
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

async function main() {
    const browser = await chromium.launch({
        headless: false,
        args: ["--start-maximized"]
    });

    const context = await browser.newContext({
        viewport: null
    });

    const page = await context.newPage();

    await page.goto("https://zealy.io", {
        waitUntil: "domcontentloaded"
    });

    console.log("Hãy đăng nhập tài khoản Zealy trong Chromium.");
    console.log("Sau khi đăng nhập xong, quay lại PowerShell.");
    console.log("Nhấn ENTER để lưu trạng thái đăng nhập.");

    await new Promise(resolve => {
        process.stdin.once("data", resolve);
    });

    const dataDir = path.join(process.cwd(), "data");

    fs.mkdirSync(dataDir, { recursive: true });

    await context.storageState({
        path: path.join(dataDir, "zealy-auth.json")
    });

    console.log("[LOGIN] Đã lưu trạng thái đăng nhập.");

    await browser.close();
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
