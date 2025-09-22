// Vercel Serverless Function - Bookings API
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
      // Create new database
      const db = new Database(dbPath);
      
      // Create all required tables
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
        );
        
        CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          service_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'confirmed',
          session_id TEXT,
          ip_address TEXT,
          user_agent TEXT,
          FOREIGN KEY (service_id) REFERENCES services (id)
        );
        
        CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME
        );
        
        CREATE TABLE IF NOT EXISTS user_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT UNIQUE NOT NULL,
          user_data TEXT,
          ip_address TEXT,
          user_agent TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
          booking_count INTEGER DEFAULT 0
        );
        
        CREATE TABLE IF NOT EXISTS security_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_type TEXT NOT NULL,
          ip_address TEXT,
          user_agent TEXT,
          details TEXT,
          severity TEXT DEFAULT 'info',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
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
      const bookings = db.prepare(`
        SELECT b.*, s.name as service_name, s.duration, s.price
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        ORDER BY b.date, b.time
      `).all();
      db.close();
      return res.status(200).json(bookings);
    }
    
    if (req.method === 'POST') {
      const { name, email, phone, serviceId, date, time } = req.body;
      
      // Validate required fields
      if (!name || !email || !phone || !serviceId || !date || !time) {
        db.close();
        return res.status(400).json({ error: 'All fields are required' });
      }
      
      // Check for existing booking at same time
      const existingBooking = db.prepare(`
        SELECT id FROM bookings 
        WHERE date = ? AND time = ?
      `).get(date, time);
      
      if (existingBooking) {
        db.close();
        return res.status(409).json({ error: 'Time slot already booked' });
      }
      
      // Create booking
      const insertBooking = db.prepare(`
        INSERT INTO bookings (name, email, phone, service_id, date, time, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = insertBooking.run(
        name, email, phone, serviceId, date, time,
        req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
        req.headers['user-agent'] || 'unknown'
      );
      
      db.close();
      return res.status(201).json({ 
        id: result.lastInsertRowid,
        message: 'Booking created successfully' 
      });
    }
    
    db.close();
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Bookings API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}