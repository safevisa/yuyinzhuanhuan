const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

class Database {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        // Use in-memory database for serverless environments
        const dbPath = process.env.NODE_ENV === 'production' 
            ? ':memory:' 
            : path.join(__dirname, 'data.db');
            
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err);
            } else {
                console.log('📊 Database connected successfully');
                this.createTables();
            }
        });
    }

    createTables() {
        // Users table
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active INTEGER DEFAULT 1,
                avatar_url TEXT,
                display_name TEXT,
                hasPurchased INTEGER DEFAULT 0,
                purchaseExpiresAt DATETIME,
                purchaseInfo TEXT,
                trialCount INTEGER DEFAULT 0,
                maxTrials INTEGER DEFAULT 10
            )
        `;

        // Audio recordings table
        const createRecordingsTable = `
            CREATE TABLE IF NOT EXISTS recordings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT NOT NULL,
                original_filename TEXT NOT NULL,
                processed_filename TEXT,
                effect_type TEXT NOT NULL,
                file_size INTEGER,
                duration REAL,
                is_public INTEGER DEFAULT 0,
                share_token TEXT UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                play_count INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `;

        // User sessions table
        const createSessionsTable = `
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `;

        // Audio likes table
        const createLikesTable = `
            CREATE TABLE IF NOT EXISTS audio_likes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                recording_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (recording_id) REFERENCES recordings (id) ON DELETE CASCADE,
                UNIQUE(user_id, recording_id)
            )
        `;

        this.db.serialize(() => {
            this.db.run(createUsersTable, (err) => {
                if (err) console.error('Error creating users table:', err);
            });
            
            this.db.run(createRecordingsTable, (err) => {
                if (err) console.error('Error creating recordings table:', err);
            });
            
            this.db.run(createSessionsTable, (err) => {
                if (err) console.error('Error creating sessions table:', err);
            });
            
            this.db.run(createLikesTable, (err) => {
                if (err) console.error('Error creating likes table:', err);
            });
        });
    }

    // User methods
    async createUser(username, email, password) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    reject(err);
                    return;
                }

                const stmt = this.db.prepare(`
                    INSERT INTO users (username, email, password_hash) 
                    VALUES (?, ?, ?)
                `);
                
                stmt.run([username, email, hash], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, username, email });
                    }
                });
                stmt.finalize();
            });
        });
    }

    async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM users WHERE email = ? AND is_active = 1',
                [email],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    async getUserById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT id, username, email, created_at, avatar_url, display_name, hasPurchased, purchaseExpiresAt, purchaseInfo, trialCount, maxTrials FROM users WHERE id = ? AND is_active = 1',
                [id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    async updateUserPurchase(userId, purchaseData) {
        return new Promise((resolve, reject) => {
            const { planType, price, currency, status, purchaseDate, expiresAt } = purchaseData;
            const purchaseInfo = JSON.stringify({
                planType,
                price,
                currency,
                status,
                purchaseDate
            });
            
            this.db.run(
                'UPDATE users SET hasPurchased = 1, purchaseExpiresAt = ?, purchaseInfo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [expiresAt, purchaseInfo, userId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, changes: this.changes });
                    }
                }
            );
        });
    }

    async incrementTrialCount(userId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE users SET trialCount = trialCount + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [userId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }

    async getTrialInfo(userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT trialCount, maxTrials, hasPurchased FROM users WHERE id = ? AND is_active = 1',
                [userId],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    async verifyPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    // Recording methods
    async createRecording(userId, title, originalFilename, effectType, fileSize, duration) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT INTO recordings (user_id, title, original_filename, effect_type, file_size, duration) 
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            
            stmt.run([userId, title, originalFilename, effectType, fileSize, duration], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
            stmt.finalize();
        });
    }

    async updateRecordingProcessed(id, processedFilename) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE recordings SET processed_filename = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [processedFilename, id],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes > 0);
                    }
                }
            );
        });
    }

    async getUserRecordings(userId, limit = 50, offset = 0) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT * FROM recordings 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
            `, [userId, limit, offset], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getPublicRecordings(limit = 20, offset = 0) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT r.*, u.username, u.display_name 
                FROM recordings r
                JOIN users u ON r.user_id = u.id
                WHERE r.is_public = 1 AND u.is_active = 1
                ORDER BY r.created_at DESC 
                LIMIT ? OFFSET ?
            `, [limit, offset], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async shareRecording(id, userId) {
        const { v4: uuidv4 } = require('uuid');
        const shareToken = uuidv4();
        
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE recordings SET is_public = 1, share_token = ? WHERE id = ? AND user_id = ?',
                [shareToken, id, userId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else if (this.changes === 0) {
                        reject(new Error('Recording not found or access denied'));
                    } else {
                        resolve({ shareToken });
                    }
                }
            );
        });
    }

    async getRecordingByShareToken(shareToken) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT r.*, u.username, u.display_name 
                FROM recordings r
                JOIN users u ON r.user_id = u.id
                WHERE r.share_token = ? AND r.is_public = 1 AND u.is_active = 1
            `, [shareToken], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async incrementPlayCount(id) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE recordings SET play_count = play_count + 1 WHERE id = ?',
                [id],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes > 0);
                    }
                }
            );
        });
    }

    // Close database connection
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('📊 Database connection closed');
                }
            });
        }
    }
}

module.exports = Database;
