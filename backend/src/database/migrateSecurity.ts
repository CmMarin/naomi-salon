import { Database } from 'sqlite3';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_URL || './database/bookings.db';

async function migrateSecurityTables() {
  return new Promise<void>((resolve, reject) => {
    const db = new Database(dbPath);

    db.serialize(() => {
      // Create admin users table
      db.run(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME,
          failed_attempts INTEGER DEFAULT 0,
          locked_until DATETIME
        )
      `, (err) => {
        if (err) {
          console.error('Error creating admin_users table:', err);
          reject(err);
          return;
        }
        console.log('✅ Admin users table created/verified');
      });

      // Create sessions table for tracking user sessions and booking cooldowns
      db.run(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id TEXT PRIMARY KEY,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
          ip_address TEXT,
          user_agent TEXT,
          last_booking_attempt DATETIME,
          booking_count INTEGER DEFAULT 0,
          is_suspicious BOOLEAN DEFAULT 0,
          blocked_until DATETIME
        )
      `, (err) => {
        if (err) {
          console.error('Error creating user_sessions table:', err);
          reject(err);
          return;
        }
        console.log('✅ User sessions table created/verified');
      });

      // Create security logs table
      db.run(`
        CREATE TABLE IF NOT EXISTS security_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          event_type TEXT NOT NULL,
          session_id TEXT,
          ip_address TEXT,
          user_agent TEXT,
          details TEXT,
          severity TEXT DEFAULT 'INFO'
        )
      `, (err) => {
        if (err) {
          console.error('Error creating security_logs table:', err);
          reject(err);
          return;
        }
        console.log('✅ Security logs table created/verified');
      });

      // Insert default admin user with hashed password
      const adminUsername = process.env.ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.ADMIN_PASSWORD || 'NaomiSalon2025!SecureAdmin#';
      const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');

      bcrypt.hash(adminPassword, bcryptRounds, (err, hash) => {
        if (err) {
          console.error('Error hashing admin password:', err);
          reject(err);
          return;
        }

        db.run(`
          INSERT OR REPLACE INTO admin_users (username, password_hash)
          VALUES (?, ?)
        `, [adminUsername, hash], (err) => {
          if (err) {
            console.error('Error inserting admin user:', err);
            reject(err);
            return;
          }
          console.log('✅ Default admin user created/updated');
          
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
              reject(err);
            } else {
              console.log('🔒 Security database migration completed successfully');
              resolve();
            }
          });
        });
      });
    });
  });
}

if (require.main === module) {
  migrateSecurityTables()
    .then(() => {
      console.log('Security migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Security migration failed:', error);
      process.exit(1);
    });
}

export { migrateSecurityTables };