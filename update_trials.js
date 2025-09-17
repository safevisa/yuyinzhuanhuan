const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    console.log('📊 Connected to database');
});

// Update maxTrials for all users
db.run("UPDATE users SET maxTrials = 10 WHERE maxTrials = 3", function(err) {
    if (err) {
        console.error('Error updating maxTrials:', err);
    } else {
        console.log(`✅ Updated ${this.changes} users to have 10 trials`);
    }
    
    // Also update any users who don't have maxTrials set yet
    db.run("UPDATE users SET maxTrials = 10 WHERE maxTrials IS NULL OR maxTrials = 0", function(err) {
        if (err) {
            console.error('Error updating NULL maxTrials:', err);
        } else {
            console.log(`✅ Updated ${this.changes} additional users to have 10 trials`);
        }
        
        // Show current trial counts
        db.all("SELECT id, username, email, trialCount, maxTrials FROM users", (err, rows) => {
            if (err) {
                console.error('Error fetching users:', err);
            } else {
                console.log('\n📋 Current user trial status:');
                rows.forEach(row => {
                    console.log(`User ${row.id} (${row.username}): ${row.trialCount}/${row.maxTrials} trials used`);
                });
            }
            
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('\n✅ Database update completed');
                }
            });
        });
    });
});
