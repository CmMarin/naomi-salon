import express from 'express';
import { body, validationResult } from 'express-validator';
import { dbRun, dbAll, dbGet } from '../database/database';
import { verifyAdminToken } from './admin';
import { bookingCooldownMiddleware, antiTrollingMiddleware, trackBookingAttempt } from '../middleware/security';
import { sendBookingConfirmation } from '../services/emailService';

const router = express.Router();

// Input validation rules
const bookingValidation = [
  body('service_id').isInt({ min: 1 }).withMessage('Valid service ID is required'),
  body('appointment_date').isISO8601().withMessage('Valid date is required'),
  body('appointment_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required (HH:MM)'),
  body('customer_name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('customer_phone').trim().matches(/^[\+]?[\d\s\-\(\)]{6,15}$/).withMessage('Valid phone number required'),
  body('customer_email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Valid email address required'),
  body('notes').optional({ checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters')
];

// Get occupied timeslots for public booking calendar (no auth required)
router.get('/occupied-slots', async (req, res) => {
  try {
    const { date } = req.query;
    
    let query = `
      SELECT appointment_date, appointment_time 
      FROM bookings 
      WHERE status != 'cancelled'
    `;
    let params: any[] = [];
    
    if (date) {
      query += ' AND appointment_date = ?';
      params.push(date);
    }
    
    query += ' ORDER BY appointment_date, appointment_time';
    
    const occupiedSlots = await dbAll(query, params);
    res.json(occupiedSlots);
  } catch (error) {
    console.error('Error fetching occupied slots:', error);
    res.status(500).json({ error: 'Failed to fetch occupied timeslots' });
  }
});

// Get all bookings (for admin)
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const lang = req.query.lang as string || 'ro';
    const serviceName = lang === 'ru' ? 's.name_ru' : 's.name_ro';
    
    const bookings = await dbAll(`
      SELECT b.*, ${serviceName} as service_name, s.duration, s.price
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      ORDER BY b.appointment_date, b.appointment_time
    `);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get bookings for a specific date (admin only)
router.get('/date/:date', verifyAdminToken, async (req, res) => {
  try {
    const { date } = req.params;
    const lang = req.query.lang as string || 'ro';
    const serviceName = lang === 'ru' ? 's.name_ru' : 's.name_ro';
    
    const bookings = await dbAll(`
      SELECT b.*, ${serviceName} as service_name, s.duration
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.appointment_date = ?
      ORDER BY b.appointment_time
    `, [date]);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings for date:', error);
    res.status(500).json({ error: 'Failed to fetch bookings for date' });
  }
});

// Create a new booking with security checks
router.post('/', 
  bookingCooldownMiddleware,
  antiTrollingMiddleware,
  bookingValidation,
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Invalid input data',
          details: errors.array()
        });
      }

      const {
        customer_name,
        customer_phone,
        customer_email,
        service_id,
        appointment_date,
        appointment_time,
        notes
      } = req.body;

      const sessionId = req.sessionId;
      
      // Track this booking attempt
      await trackBookingAttempt(sessionId);

      // Verify service exists
      const service = await dbGet('SELECT * FROM services WHERE id = ?', [service_id]);
      if (!service) {
        return res.status(400).json({ error: 'Invalid service selected' });
      }

      // Check if the time slot is available
      const existingBooking = await dbGet(`
        SELECT id FROM bookings 
        WHERE appointment_date = ? AND appointment_time = ? AND status != 'cancelled'
      `, [appointment_date, appointment_time]);

      if (existingBooking) {
        return res.status(409).json({ error: 'Time slot is already booked' });
      }

      // Prevent booking in the past
      const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
      const now = new Date();
      if (appointmentDateTime <= now) {
        return res.status(400).json({ error: 'Cannot book appointments in the past' });
      }

      // Prevent booking too far in advance (6 months)
      const maxAdvanceDate = new Date();
      maxAdvanceDate.setMonth(maxAdvanceDate.getMonth() + 6);
      if (appointmentDateTime > maxAdvanceDate) {
        return res.status(400).json({ error: 'Cannot book more than 6 months in advance' });
      }

      // Create the booking
      const result = await dbRun(`
        INSERT INTO bookings (
          customer_name, customer_phone, customer_email, 
          service_id, appointment_date, appointment_time, notes,
          session_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [customer_name, customer_phone, customer_email, service_id, appointment_date, appointment_time, notes, sessionId]);

      // Log successful booking
      await dbRun(`
        INSERT INTO security_logs (event_type, session_id, ip_address, user_agent, details, severity)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['BOOKING_CREATED', sessionId, req.ip, req.get('User-Agent'), 
          `Service: ${service_id}, Date: ${appointment_date} ${appointment_time}`, 'INFO']);

      const lang = req.query.lang as string || 'ro';
      const serviceName = lang === 'ru' ? 's.name_ru' : 's.name_ro';
      
      const newBooking = await dbGet(`
        SELECT b.*, ${serviceName} as service_name, s.duration, s.price
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.id = ?
      `, [result.lastID]);

      // Send email confirmation if email is provided
      if (customer_email && customer_email.trim()) {
        try {
          const emailResult = await sendBookingConfirmation(newBooking, newBooking.service_name);
          console.log('Email send result:', emailResult);
          
          // Log email attempt
          await dbRun(`
            INSERT INTO security_logs (event_type, session_id, ip_address, user_agent, details, severity)
            VALUES (?, ?, ?, ?, ?, ?)
          `, ['EMAIL_SENT', sessionId, req.ip, req.get('User-Agent'), 
              `Confirmation email ${emailResult.success ? 'sent' : 'failed'} to ${customer_email}`, 
              emailResult.success ? 'INFO' : 'WARN']);
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the booking if email fails
        }
      }

      res.status(201).json({
        ...newBooking,
        message: 'Booking created successfully'
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  }
);

// Update booking status (admin only)
router.patch('/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await dbRun('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const lang = req.query.lang as string || 'ro';
    const serviceName = lang === 'ru' ? 's.name_ru' : 's.name_ro';
    
    const updatedBooking = await dbGet(`
      SELECT b.*, ${serviceName} as service_name, s.duration, s.price
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ?
    `, [id]);

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Delete a booking (admin only)
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await dbRun('DELETE FROM bookings WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

export default router;