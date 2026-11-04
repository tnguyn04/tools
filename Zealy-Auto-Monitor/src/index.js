require("dotenv").config();

const { openQuest } = require("./services/browser");
const { shouldNotify, FILTERS } = require("./config/filters");
const COMMUNITIES = require("./config/communities");
const { startMonitor } = require("./workers/monitor");
const { sendNewQuest } = require("./services/telegram");

async function main() {
    console.log("================================");
    console.log("     ZEALY AUTO MONITOR");
    console.log("================================");

    console.log("Communities:", COMMUNITIES.join(", "));
    console.log("Filters:", FILTERS);

    await startMonitor(
        COMMUNITIES,
        async (quest, community) => {
            console.log("\n========== NEW QUEST ==========");
            console.log("Community:", community);
            console.log("Title:", quest.title);
            console.log("ID:", quest.id);
            console.log("XP:", quest.reward);
            console.log("Types:", quest.task_types.join(", "));
            console.log("===============================\n");

            if (!shouldNotify(quest, community)) {
                console.log(`[FILTER] Bỏ qua: ${quest.title}`);
                return true;
            }

            const sent = await sendNewQuest(quest, community);

            if (!sent) {
                return false;
            }

            try {
                await openQuest(
                    community,
                    quest.id,
                    quest.title
                );
            } catch (error) {
                console.error("[BROWSER ERROR]", error.message);
            }

            return true;
        }
    );
}

main().catch(error => {
    console.error("Application error:", error.message);
    process.exit(1);
});