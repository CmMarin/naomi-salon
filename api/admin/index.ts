// Vercel Serverless Function - Admin API
import { VercelRequest, VercelResponse } from '@vercel/node';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

// Initialize database
const initDatabase = () => {
  const dbPath = '/tmp/bookings.db';
  
  if (!fs.existsSync(dbPath)) {
    const sourceDb = path.join(process.cwd(), 'backend/database/bookings.db');
    if (fs.existsSync(sourceDb)) {
      fs.copyFileSync(sourceDb, dbPath);
    }
  }
  
  return new Database(dbPath);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const db = initDatabase();
    
    if (req.method === 'POST' && req.url?.endsWith('/login')) {
      const { username, password } = req.body;
      
      if (!username || !password) {
        db.close();
        return res.status(400).json({ error: 'Username and password required' });
      }
      
      // Get admin user
      const admin = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
      
      if (!admin) {
        db.close();
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check password
      const validPassword = await bcrypt.compare(password, admin.password_hash);
      
      if (!validPassword) {
        db.close();
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Create JWT token
      const token = jwt.sign(
        { id: admin.id, username: admin.username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      // Update last login
      db.prepare('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(admin.id);
      
      db.close();
      return res.status(200).json({ 
        token,
        admin: { id: admin.id, username: admin.username }
      });
    }
    
    if (req.method === 'GET') {
      // Verify JWT token
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        db.close();
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const token = authHeader.split(' ')[1];
      
      try {
        jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      } catch (error) {
        db.close();
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // Get all bookings with service details
      const bookings = db.prepare(`
        SELECT b.*, s.name as service_name, s.duration, s.price
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        ORDER BY b.created_at DESC
      `).all();
      
      db.close();
      return res.status(200).json(bookings);
    }
    
    db.close();
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}