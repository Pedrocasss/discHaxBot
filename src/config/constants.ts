export const REPLAY_API = {
    BASE_URL: 'https://replay.hax.ma',
    ENDPOINTS: {
        SAVE_REPLAY: '/save-replay',
        GET_REPLAY: (id: string) => `/replays/${id}.hbr2`,
        GET_STATS: (id: string) => `/stats/${id}.json`
    },
    POLLING: {
        MAX_ATTEMPTS: 3,
        INTERVAL_MS: 2000
    }
};

export const DISCORD = {
    COLOR: {
        SUCCESS: 0x00ff00,
        ERROR: 0xff0000,
        INFO: 0x0099ff
    }
};