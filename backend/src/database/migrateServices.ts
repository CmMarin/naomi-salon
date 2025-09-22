import { dbRun, dbAll } from './database';

const migrateServicesToMultiLanguage = async () => {
  try {
    // Check if language columns already exist
    const tableInfo = await dbAll("PRAGMA table_info(services)");
    const hasLanguageColumns = tableInfo.some((col: any) => col.name === 'name_ro');
    
    if (!hasLanguageColumns) {
      // Add language columns
      await dbRun('ALTER TABLE services ADD COLUMN name_ro TEXT');
      await dbRun('ALTER TABLE services ADD COLUMN name_ru TEXT');
      await dbRun('ALTER TABLE services ADD COLUMN description_ro TEXT');
      await dbRun('ALTER TABLE services ADD COLUMN description_ru TEXT');
      
      // Update existing services with Romanian and Russian translations
      const services = await dbAll('SELECT * FROM services');
      
      for (const service of services) {
        let nameRo = '', nameRu = '', descRo = '', descRu = '';
        
        switch (service.name) {
          case 'Basic Haircut':
            nameRo = 'Tunsoare de Bază';
            nameRu = 'Базовая Стрижка';
            descRo = 'Tunsoare clasică și coafură';
            descRu = 'Классическая стрижка и укладка';
            break;
          case 'Beard Trim':
            nameRo = 'Aranjare Barbă';
            nameRu = 'Стрижка Бороды';
            descRo = 'Aranjarea și modelarea profesională a bărbii';
            descRu = 'Профессиональная стрижка и формирование бороды';
            break;
          case 'Haircut + Beard':
            nameRo = 'Tunsoare + Barbă';
            nameRu = 'Стрижка + Борода';
            descRo = 'Pachet complet de îngrijire';
            descRu = 'Полный комплекс ухода';
            break;
          case 'Hot Towel Shave':
            nameRo = 'Bărbierit cu Prosop Cald';
            nameRu = 'Бритье с Горячим Полотенцем';
            descRo = 'Bărbierit tradițional cu prosop cald';
            descRu = 'Традиционное бритье с горячим полотенцем';
            break;
          case 'Kids Cut':
            nameRo = 'Tunsoare Copii';
            nameRu = 'Детская Стрижка';
            descRo = 'Tunsoare pentru copii sub 12 ani';
            descRu = 'Стрижка для детей до 12 лет';
            break;
          default:
            nameRo = service.name;
            nameRu = service.name;
            descRo = service.description;
            descRu = service.description;
        }
        
        await dbRun(
          `UPDATE services SET name_ro = ?, name_ru = ?, description_ro = ?, description_ru = ? WHERE id = ?`,
          [nameRo, nameRu, descRo, descRu, service.id]
        );
      }
    }
    
    console.log('Services migration completed successfully');
  } catch (error) {
    console.error('Services migration failed:', error);
    throw error;
  }
};

if (require.main === module) {
  migrateServicesToMultiLanguage()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { migrateServicesToMultiLanguage };