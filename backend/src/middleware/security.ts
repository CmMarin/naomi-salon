import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbGet, dbRun } from '../database/db';

// Extend Express Request to include sessionId
declare global {
  namespace Express {
    interface Request {
      sessionId: string;
      userSession?: any;
    }
  }
}

export interface UserSession {
  id: string;
  created_at: string;
  last_activity: string;
  ip_address: string;
  user_agent: string;
  last_booking_attempt: string | null;
  booking_count: number;
  is_suspicious: boolean;
  blocked_until: string | null;
}

// Session management middleware
export const sessionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get session ID from cookie or create new one
    let sessionId = req.cookies?.['naomi-session'] || req.headers['x-session-id'] as string;
    
    if (!sessionId) {
      sessionId = uuidv4();
      res.cookie('naomi-session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 60 * 1000 // 30 minutes
      });
    }

    req.sessionId = sessionId;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    // Get or create session in database
    let session = await dbGet(`
      SELECT * FROM user_sessions WHERE id = ?
    `, [sessionId]) as UserSession | undefined;

    if (!session) {
      // Create new session
      await dbRun(`
        INSERT INTO user_sessions (id, ip_address, user_agent, last_activity)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `, [sessionId, clientIP, userAgent]);
      
      session = await dbGet(`
        SELECT * FROM user_sessions WHERE id = ?
      `, [sessionId]) as UserSession;
    } else {
      // Update last activity
      await dbRun(`
        UPDATE user_sessions 
        SET last_activity = CURRENT_TIMESTAMP,
            ip_address = COALESCE(ip_address, ?),
            user_agent = COALESCE(user_agent, ?)
        WHERE id = ?
      `, [clientIP, userAgent, sessionId]);
    }

    req.userSession = session;
    next();
  } catch (error) {
    console.error('Session middleware error:', error);
    next(error);
  }
};

// Booking cooldown middleware
export const bookingCooldownMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.userSession as UserSession;
    const cooldownMinutes = parseInt(process.env.BOOKING_COOLDOWN_MINUTES || '5');
    
    if (session?.last_booking_attempt) {
      const lastAttempt = new Date(session.last_booking_attempt);
      const cooldownEnd = new Date(lastAttempt.getTime() + cooldownMinutes * 60 * 1000);
      const now = new Date();
      
      if (now < cooldownEnd) {
        const remainingSeconds = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000);
        
        // Log suspicious activity if too many requests
        if (session.booking_count > 3) {
          await dbRun(`
            UPDATE user_sessions 
            SET is_suspicious = 1
            WHERE id = ?
          `, [session.id]);
          
          await dbRun(`
            INSERT INTO security_logs (event_type, session_id, ip_address, user_agent, details, severity)
            VALUES (?, ?, ?, ?, ?, ?)
          `, ['BOOKING_SPAM', session.id, session.ip_address, session.user_agent, 
              `Multiple booking attempts: ${session.booking_count}`, 'WARN']);
        }
        
        return res.status(429).json({ 
          error: 'Too many booking requests. Please wait before trying again.',
          retryAfter: remainingSeconds 
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Booking cooldown middleware error:', error);
    next(error);
  }
};

// Anti-trolling pattern detection
export const antiTrollingMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.userSession as UserSession;
    const { customer_name, customer_phone, customer_email } = req.body;
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /^(.)\1{2,}$/, // Repeated characters (aaa, bbb, etc.)
      /^(test|fake|spam|troll)/i,
      /^\d{1,3}$/, // Just numbers
      /^[^\w\s]{3,}$/, // Only special characters
    ];
    
    let suspiciousCount = 0;
    let suspiciousDetails = [];
    
    // Check name patterns
    if (customer_name && suspiciousPatterns.some(pattern => pattern.test(customer_name))) {
      suspiciousCount++;
      suspiciousDetails.push('Suspicious name pattern');
    }
    
    // Check for obvious fake phones
    if (customer_phone) {
      const phoneDigits = customer_phone.replace(/\D/g, '');
      if (phoneDigits.length < 8 || /^(.)\1{5,}$/.test(phoneDigits)) {
        suspiciousCount++;
        suspiciousDetails.push('Suspicious phone pattern');
      }
    }
    
    // Check for obvious fake emails
    if (customer_email && /^(test|fake|spam|troll|noreply)@/i.test(customer_email)) {
      suspiciousCount++;
      suspiciousDetails.push('Suspicious email pattern');
    }
    
    // If multiple suspicious patterns detected
    if (suspiciousCount >= 2) {
      await dbRun(`
        UPDATE user_sessions 
        SET is_suspicious = 1, blocked_until = datetime('now', '+1 hour')
        WHERE id = ?
      `, [session.id]);
      
      await dbRun(`
        INSERT INTO security_logs (event_type, session_id, ip_address, user_agent, details, severity)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['TROLLING_DETECTED', session.id, session.ip_address, session.user_agent, 
          suspiciousDetails.join(', '), 'WARN']);
      
      return res.status(400).json({ 
        error: 'Please provide valid contact information.' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Anti-trolling middleware error:', error);
    next(error);
  }
};

// Update booking attempt tracking
export const trackBookingAttempt = async (sessionId: string) => {
  try {
    await dbRun(`
      UPDATE user_sessions 
      SET last_booking_attempt = CURRENT_TIMESTAMP,
          booking_count = booking_count + 1
      WHERE id = ?
    `, [sessionId]);
  } catch (error) {
    console.error('Error tracking booking attempt:', error);
  }
};

export default { 
  sessionMiddleware, 
  bookingCooldownMiddleware, 
  antiTrollingMiddleware, 
  trackBookingAttempt 
};