import { dbRun, dbAll } from './database';

const addSessionColumn = async () => {
  try {
    // Check if column exists first
    const columns = await dbAll("PRAGMA table_info(bookings)");
    const hasSessionId = columns.some((col: any) => col.name === 'session_id');
    
    if (!hasSessionId) {
      await dbRun('ALTER TABLE bookings ADD COLUMN session_id TEXT');
      console.log('✅ Added session_id column to bookings table');
    } else {
      console.log('✅ session_id column already exists');
    }
  } catch (error) {
    console.error('❌ Error adding session_id column:', error);
  }
};

addSessionColumn();