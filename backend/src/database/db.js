const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const dbQuery = async (text, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
};

const dbGet = async (text, params = []) => {
  const rows = await dbQuery(text, params);
  return rows[0] || null;
};

const dbAll = async (text, params = []) => {
  return await dbQuery(text, params);
};

const dbRun = async (text, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return {
      lastID: result.rows[0]?.id || undefined,
      changes: result.rowCount || 0
    };
  } finally {
    client.release();
  }
};

const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_ro VARCHAR(255),
        name_ru VARCHAR(255),
        duration INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        description_ro TEXT,
        description_ru TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        customer_email VARCHAR(255),
        service_id INTEGER NOT NULL REFERENCES services(id),
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status VARCHAR(50) DEFAULT 'confirmed',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        failed_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP NULL,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        booking_attempts INTEGER DEFAULT 0,
        last_booking_attempt TIMESTAMP NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS security_logs (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255),
        ip_address INET,
        action VARCHAR(100) NOT NULL,
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const existingServices = await client.query('SELECT COUNT(*) as count FROM services');
    if (existingServices.rows[0].count == 0) {
      await client.query(`INSERT INTO services (name, name_ro, name_ru, duration, price, description, description_ro, description_ru) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8),
        ($9, $10, $11, $12, $13, $14, $15, $16),
        ($17, $18, $19, $20, $21, $22, $23, $24),
        ($25, $26, $27, $28, $29, $30, $31, $32),
        ($33, $34, $35, $36, $37, $38, $39, $40)
      `, [
        'Basic Haircut', 'Tunsoare de bază', 'Базовая стрижка', 30, 25.00, 'Classic haircut and styling', 'Tunsoare clasică și stilizare', 'Классическая стрижка и укладка',
        'Beard Trim', 'Aranjarea bărbii', 'Стрижка бороды', 15, 15.00, 'Professional beard trimming and shaping', 'Aranjarea profesională a bărbii', 'Профессиональная стрижка и формирование бороды',
        'Haircut + Beard', 'Tunsoare + Barbă', 'Стрижка + Борода', 45, 35.00, 'Complete grooming package', 'Pachet complet de îngrijire', 'Полный пакет ухода',
        'Hot Towel Shave', 'Bărbierit cu prosop cald', 'Бритье горячим полотенцем', 30, 30.00, 'Traditional hot towel shave', 'Bărbierit tradițional cu prosop cald', 'Традиционное бритье горячим полотенцем',
        'Kids Cut', 'Tunsoare copii', 'Детская стрижка', 20, 20.00, 'Haircut for children under 12', 'Tunsoare pentru copii sub 12 ani', 'Стрижка для детей до 12 лет'
      ]);
    }

    const existingAdmin = await client.query('SELECT COUNT(*) as count FROM admin_users');
    if (existingAdmin.rows[0].count == 0) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
      await client.query(
        'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)',
        [process.env.ADMIN_USERNAME || 'admin', hashedPassword]
      );
    }

    console.log('✅ PostgreSQL database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  dbQuery,
  dbGet,
  dbAll,
  dbRun,
  initializeDatabase,
  pool
};