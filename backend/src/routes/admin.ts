import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet, dbRun } from '../database';
import rateLimit from 'express-rate-limit';
import { testEmailConfig } from '../services/emailService';

const router = express.Router();

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.LOGIN_COOLDOWN_MINUTES || '15') * 60 * 1000,
  max: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Security logging function
async function logSecurityEvent(
  eventType: string,
  sessionId: string | null,
  ip: string,
  userAgent: string,
  details: string,
  severity: 'INFO' | 'WARN' | 'ERROR' = 'INFO'
) {
  try {
    await dbRun(`
      INSERT INTO security_logs (event_type, session_id, ip_address, user_agent, details, severity)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [eventType, sessionId, ip, userAgent, details, severity]);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Admin login with database authentication
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    if (!username || !password) {
      await logSecurityEvent('LOGIN_FAILED', null, clientIP, userAgent, 'Missing credentials', 'WARN');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Get admin user from database
    const admin = await dbGet(`
      SELECT id, username, password_hash, failed_attempts, locked_until
      FROM admin_users 
      WHERE username = ?
    `, [username]) as any;

    if (!admin) {
      await logSecurityEvent('LOGIN_FAILED', null, clientIP, userAgent, `Invalid username: ${username}`, 'WARN');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      await logSecurityEvent('LOGIN_BLOCKED', null, clientIP, userAgent, `Account locked: ${username}`, 'WARN');
      return res.status(429).json({ error: 'Account is temporarily locked. Please try again later.' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatch) {
      // Increment failed attempts
      const failedAttempts = (admin.failed_attempts || 0) + 1;
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
      const lockUntil = failedAttempts >= maxAttempts 
        ? new Date(Date.now() + parseInt(process.env.LOGIN_COOLDOWN_MINUTES || '15') * 60 * 1000)
        : null;

      await dbRun(`
        UPDATE admin_users 
        SET failed_attempts = ?, locked_until = ?
        WHERE id = ?
      `, [failedAttempts, lockUntil?.toISOString(), admin.id]);

      await logSecurityEvent('LOGIN_FAILED', null, clientIP, userAgent, 
        `Wrong password for ${username}. Attempts: ${failedAttempts}`, 'WARN');

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset failed attempts and update last login
    await dbRun(`
      UPDATE admin_users 
      SET failed_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [admin.id]);

    // Create JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.TOKEN_EXPIRY || '24h' } as jwt.SignOptions
    );

    await logSecurityEvent('LOGIN_SUCCESS', null, clientIP, userAgent, 
      `Successful login for ${username}`, 'INFO');

    res.json({
      success: true,
      token,
      user: { id: admin.id, username: admin.username, role: 'admin' }
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    await logSecurityEvent('LOGIN_ERROR', null, clientIP, userAgent, 
      `Login system error: ${error}`, 'ERROR');
    
    res.status(500).json({ error: 'Login failed' });
  }
});

// Middleware to verify admin token
export const verifyAdminToken = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  if (!token) {
    await logSecurityEvent('AUTH_FAILED', null, clientIP, userAgent, 'Missing token', 'WARN');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Verify admin still exists and is not locked
    const admin = await dbGet(`
      SELECT id, username, locked_until
      FROM admin_users 
      WHERE id = ? AND username = ?
    `, [decoded.id, decoded.username]);

    if (!admin) {
      await logSecurityEvent('AUTH_FAILED', null, clientIP, userAgent, 
        'Token valid but admin not found', 'WARN');
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      await logSecurityEvent('AUTH_BLOCKED', null, clientIP, userAgent, 
        'Admin account locked', 'WARN');
      return res.status(429).json({ error: 'Account is temporarily locked' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    await logSecurityEvent('AUTH_FAILED', null, clientIP, userAgent, 
      `Token verification failed: ${error}`, 'WARN');
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Verify token endpoint
router.get('/verify', verifyAdminToken, (req, res) => {
  res.json({ valid: true, user: (req as any).user });
});

// Test email configuration endpoint
router.get('/test-email', verifyAdminToken, async (req, res) => {
  try {
    const result = await testEmailConfig();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Email test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;