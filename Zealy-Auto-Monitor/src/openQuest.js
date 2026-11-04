
const { openQuest } = require("./services/browser");

async function main() {
    const community = process.argv[2];
    const questId = process.argv[3];
    const title = process.argv.slice(4).join(" ");

    if (!community || !questId || !title) {
        console.log(
            'Cách dùng: npm run open -- "community" "questId" "quest title"'
        );
        process.exit(1);
    }

    try {
        await openQuest(community, questId, title);

    } catch (error) {
        console.error("[BROWSER ERROR]", error.message);
        process.exit(1);
    }
}

main();
