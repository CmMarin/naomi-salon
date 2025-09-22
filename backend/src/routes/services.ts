import express from 'express';
import { dbAll } from '../database/postgres';

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const language = req.query.lang as string || 'ro'; // Default to Romanian
    const services = await dbAll('SELECT * FROM services ORDER BY name');
    
    // Transform services to include translated names and descriptions
    const translatedServices = services.map((service: any) => ({
      id: service.id,
      name: language === 'ru' 
        ? (service.name_ru || service.name) 
        : (service.name_ro || service.name),
      description: language === 'ru' 
        ? (service.description_ru || service.description) 
        : (service.description_ro || service.description),
      duration: service.duration,
      price: service.price,
      created_at: service.created_at
    }));
    
    res.json(translatedServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

export default router;