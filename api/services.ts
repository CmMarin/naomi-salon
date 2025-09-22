// Vercel Serverless Function - Services API
import { VercelRequest, VercelResponse } from '@vercel/node';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Initialize database
const initDatabase = () => {
  const dbPath = '/tmp/bookings.db';
  
  // Copy database if it doesn't exist
  if (!fs.existsSync(dbPath)) {
    const sourceDb = path.join(process.cwd(), 'backend/database/bookings.db');
    if (fs.existsSync(sourceDb)) {
      fs.copyFileSync(sourceDb, dbPath);
    } else {
      // Create new database if source doesn't exist
      const db = new Database(dbPath);
      
      // Create services table
      db.exec(`
        CREATE TABLE IF NOT EXISTS services (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          duration INTEGER NOT NULL,
          price REAL NOT NULL,
          description TEXT,
          name_ro TEXT,
          name_ru TEXT,
          description_ro TEXT,
          description_ru TEXT
        )
      `);
      
      // Insert default services
      const insertService = db.prepare(`
        INSERT INTO services (name, duration, price, description, name_ro, name_ru, description_ro, description_ru)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const services = [
        ['Haircut', 30, 25, 'Professional haircut and styling', 'Tunsoare', 'Стрижка', 'Tunsoare profesională și styling', 'Профессиональная стрижка и укладка'],
        ['Beard Trim', 20, 15, 'Beard trimming and shaping', 'Aranjare barbă', 'Стрижка бороды', 'Aranjarea și modelarea bărbii', 'Стрижка и моделирование бороды'],
        ['Hair Wash', 15, 10, 'Hair washing and conditioning', 'Spălare păr', 'Мытье волос', 'Spălarea și îngrijirea părului', 'Мытье и кондиционирование волос'],
        ['Styling', 25, 20, 'Hair styling and finishing', 'Styling păr', 'Укладка', 'Styling și finisare păr', 'Укладка и финишная обработка']
      ];
      
      services.forEach(service => insertService.run(...service));
      db.close();
    }
  }
  
  return new Database(dbPath);
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const db = initDatabase();
    
    if (req.method === 'GET') {
      const services = db.prepare('SELECT * FROM services ORDER BY id').all();
      db.close();
      return res.status(200).json(services);
    }
    
    db.close();
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Services API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}