const FILTERS = {
    // [] = nhận tất cả loại task
    includeTypes: [],

    // Những loại task không muốn nhận
    excludeTypes: [],

    // XP tối thiểu
    minXP: 0,

    // Cộng đồng không muốn theo dõi
    excludedCommunities: []
};

function shouldNotify(quest, community) {
    const types = quest.task_types || ["custom"];
    const xp = Number(quest.reward || 0);

    if (xp < FILTERS.minXP) {
        return false;
    }

    if (FILTERS.excludedCommunities.includes(community)) {
        return false;
    }

    if (
        FILTERS.includeTypes.length > 0 &&
        !types.some(type => FILTERS.includeTypes.includes(type))
    ) {
        return false;
    }

    if (types.some(type => FILTERS.excludeTypes.includes(type))) {
        return false;
    }

    return true;
}

module.exports = { FILTERS, shouldNotify };