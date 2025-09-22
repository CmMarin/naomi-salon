const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Convert SQLite-style '?' placeholders to Postgres $1, $2, ...
function convertPlaceholders(sql, params = []) {
  let index = 0;
  const text = sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
  return { text, params };
}

// Translate common SQLite-specific expressions to Postgres
function translateSql(sql) {
  return sql
    .replace(/datetime\(\s*'now'\s*,\s*'\+1 hour'\s*\)/gi, "CURRENT_TIMESTAMP + INTERVAL '1 hour'");
}

async function dbQuery(text, params = []) {
  const client = await pool.connect();
  try {
    const translated = translateSql(text);
    const { text: pgText, params: pgParams } = convertPlaceholders(translated, params);
    const result = await client.query(pgText, pgParams);
    return result.rows;
  } finally {
    client.release();
  }
}

async function dbGet(text, params = []) {
  const rows = await dbQuery(text, params);
  return rows[0] || null;
}

async function dbAll(text, params = []) {
  return await dbQuery(text, params);
}

async function dbRun(text, params = []) {
  const client = await pool.connect();
  try {
    let translated = translateSql(text);
    // If it's an INSERT and no RETURNING clause, append RETURNING id to capture lastID
    const isInsert = /^\s*insert\s+/i.test(translated);
    const hasReturning = /\breturning\b/i.test(translated);
    if (isInsert && !hasReturning) {
      translated = `${translated} RETURNING id`;
    }
    const { text: pgText, params: pgParams } = convertPlaceholders(translated, params);
    const result = await client.query(pgText, pgParams);
    return {
      lastID: result.rows && result.rows[0] && result.rows[0].id !== undefined ? result.rows[0].id : undefined,
      changes: result.rowCount || 0,
    };
  } finally {
    client.release();
  }
}

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Services table with i18n columns
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

    // Bookings table (includes session_id for security tracking)
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
        session_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Admin users
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

    // User sessions align with middleware usage (id is the sessionId string)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(255) PRIMARY KEY,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_booking_attempt TIMESTAMP NULL,
        booking_count INTEGER DEFAULT 0,
        is_suspicious INTEGER DEFAULT 0,
        blocked_until TIMESTAMP NULL
      )
    `);

    // Security logs (details stored as text)
    await client.query(`
      CREATE TABLE IF NOT EXISTS security_logs (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        session_id VARCHAR(255),
        ip_address TEXT,
        user_agent TEXT,
        details TEXT,
        severity VARCHAR(10) DEFAULT 'INFO',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed services if empty
    const existingServices = await client.query('SELECT COUNT(*)::int as count FROM services');
    if ((existingServices.rows[0].count || 0) === 0) {
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

    // Seed admin if empty
    const existingAdmin = await client.query('SELECT COUNT(*)::int as count FROM admin_users');
    if ((existingAdmin.rows[0].count || 0) === 0) {
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
}

module.exports = {
  dbQuery,
  dbGet,
  dbAll,
  dbRun,
  initializeDatabase,
  pool,
};
