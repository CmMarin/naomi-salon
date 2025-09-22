import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '../../database/bookings.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Promisify database methods
export const dbRun = (sql: string, params?: any[]): Promise<{lastID?: number; changes?: number}> => {
  return new Promise((resolve, reject) => {
    function callback(this: sqlite3.RunResult, err: Error | null) {
      if (err) {
        reject(err);
      } else {
        resolve({
          lastID: this.lastID,
          changes: this.changes
        });
      }
    }
    
    if (params) {
      db.run(sql, params, callback);
    } else {
      db.run(sql, callback);
    }
  });
};

export const dbGet = promisify(db.get.bind(db)) as (sql: string, params?: any[]) => Promise<any>;
export const dbAll = promisify(db.all.bind(db)) as (sql: string, params?: any[]) => Promise<any[]>;

export const initializeDatabase = async () => {
  try {
    // Services table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        duration INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bookings table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT,
        service_id INTEGER NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status TEXT DEFAULT 'confirmed',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services (id)
      )
    `);

    // Admin table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default services
    const existingServices = await dbAll('SELECT COUNT(*) as count FROM services');
    if (existingServices[0].count === 0) {
      await dbRun(`INSERT INTO services (name, duration, price, description) VALUES 
        ('Basic Haircut', 30, 25.00, 'Classic haircut and styling'),
        ('Beard Trim', 15, 15.00, 'Professional beard trimming and shaping'),
        ('Haircut + Beard', 45, 35.00, 'Complete grooming package'),
        ('Hot Towel Shave', 30, 30.00, 'Traditional hot towel shave'),
        ('Kids Cut', 20, 20.00, 'Haircut for children under 12')
      `);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export { db };