const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'mctiers.db'));

// Initialize tables
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        discordId TEXT PRIMARY KEY,
        ign TEXT,
        tier TEXT DEFAULT 'Unranked',
        region TEXT,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        lastTested TEXT
    );

    CREATE TABLE IF NOT EXISTS queue (
        userId TEXT,
        ign TEXT,
        gamemode TEXT,
        joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (userId, gamemode)
    );

    CREATE TABLE IF NOT EXISTS queue_testers (
        userId TEXT,
        username TEXT,
        gamemode TEXT,
        PRIMARY KEY (userId, gamemode)
    );

    CREATE TABLE IF NOT EXISTS user_tiers (
        userId TEXT,
        gamemode TEXT,
        tier TEXT DEFAULT 'Unranked',
        PRIMARY KEY (userId, gamemode)
    );

    CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
    );
`);

module.exports = {
    // User functions
    getUser: (id) => db.prepare('SELECT * FROM users WHERE discordId = ?').get(id),
    updateUser: (id, ign, tier, region) => {
        return db.prepare(`
            INSERT INTO users (discordId, ign, tier, region)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(discordId) DO UPDATE SET
                ign = excluded.ign,
                tier = excluded.tier,
                region = excluded.region
        `).run(id, ign, tier, region);
    },

    // Tier functions (Per Gamemode)
    getTier: (userId, gamemode) => {
        const row = db.prepare('SELECT tier FROM user_tiers WHERE userId = ? AND gamemode = ?').get(userId, gamemode);
        return row ? row.tier : 'Unranked';
    },
    setTier: (userId, gamemode, tier) => {
        return db.prepare(`
            INSERT INTO user_tiers (userId, gamemode, tier)
            VALUES (?, ?, ?)
            ON CONFLICT(userId, gamemode) DO UPDATE SET tier = excluded.tier
        `).run(userId, gamemode, tier);
    },

    // Queue functions
    addToQueue: (id, ign, gamemode) => db.prepare('INSERT OR IGNORE INTO queue (userId, ign, gamemode) VALUES (?, ?, ?)').run(id, ign, gamemode),
    removeFromQueue: (id, gamemode) => db.prepare('DELETE FROM queue WHERE userId = ? AND gamemode = ?').run(id, gamemode),
    getQueue: (gamemode) => db.prepare('SELECT * FROM queue WHERE gamemode = ? ORDER BY joinedAt ASC').all(gamemode),
    clearQueue: (gamemode) => db.prepare('DELETE FROM queue WHERE gamemode = ?').run(gamemode),

    // Tester functions
    addTester: (id, username, gamemode) => db.prepare('INSERT OR IGNORE INTO queue_testers (userId, username, gamemode) VALUES (?, ?, ?)').run(id, username, gamemode),
    removeTester: (id, gamemode) => db.prepare('DELETE FROM queue_testers WHERE userId = ? AND gamemode = ?').run(id, gamemode),
    getTesters: (gamemode) => db.prepare('SELECT * FROM queue_testers WHERE gamemode = ?').all(gamemode),
    clearTesters: (gamemode) => db.prepare('DELETE FROM queue_testers WHERE gamemode = ?').run(gamemode),

    // Config functions
    getConfig: (key) => db.prepare('SELECT value FROM config WHERE key = ?').get(key)?.value,
    setConfig: (key, value) => db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run(key, value),

    // Leaderboard function
    getLeaderboard: (gamemode, limit = 10) => {
        return db.prepare(`
            SELECT u.ign, ut.userId, ut.tier, u.region 
            FROM user_tiers ut
            JOIN users u ON ut.userId = u.discordId
            WHERE ut.gamemode = ? AND ut.tier != 'Unranked'
            ORDER BY 
                CASE ut.tier
                    WHEN 'HT1' THEN 1 WHEN 'LT1' THEN 2
                    WHEN 'HT2' THEN 3 WHEN 'LT2' THEN 4
                    WHEN 'HT3' THEN 5 WHEN 'LT3' THEN 6
                    WHEN 'HT4' THEN 7 WHEN 'LT4' THEN 8
                    WHEN 'HT5' THEN 9 WHEN 'LT5' THEN 10
                    ELSE 11
                END ASC
            LIMIT ?
        `).all(gamemode, limit);
    }
};
