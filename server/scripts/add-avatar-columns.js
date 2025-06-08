const db = require('../config/db');

async function addAvatarColumns() {
  try {
    console.log('Vérification de l\'existence des colonnes avatar et isPresetAvatar...');
    
    // Vérification si les colonnes existent déjà
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME='users' AND TABLE_SCHEMA=DATABASE()
    `);
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    
    // Ajout de la colonne avatar si elle n'existe pas
    if (!columnNames.includes('avatar')) {
      console.log('Ajout de la colonne avatar...');
      await db.query(`
        ALTER TABLE users
        ADD COLUMN avatar VARCHAR(255) DEFAULT NULL
      `);
      console.log('Colonne avatar ajoutée avec succès');
    } else {
      console.log('La colonne avatar existe déjà');
    }
    
    // Ajout de la colonne isPresetAvatar si elle n'existe pas
    if (!columnNames.includes('isPresetAvatar')) {
      console.log('Ajout de la colonne isPresetAvatar...');
      await db.query(`
        ALTER TABLE users
        ADD COLUMN isPresetAvatar BOOLEAN DEFAULT FALSE
      `);
      console.log('Colonne isPresetAvatar ajoutée avec succès');
    } else {
      console.log('La colonne isPresetAvatar existe déjà');
    }
    
    console.log('Migration terminée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    process.exit(1);
  }
}

addAvatarColumns();
