const db = require('../config/db');

async function addAvatarMetadataColumns() {
  try {
    console.log('🔧 Début de la migration: Ajout des colonnes de métadonnées d\'avatar...');
    
    // Vérifier si les colonnes existent déjà
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME IN ('avatarColor', 'avatarInitials')
    `);
    
    console.log('📊 Colonnes existantes:', columns.map(col => col.COLUMN_NAME));
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    if (!existingColumns.includes('avatarColor')) {
      console.log('➕ Ajout de la colonne avatarColor...');
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN avatarColor VARCHAR(7) NULL 
        COMMENT 'Couleur de l\'avatar personnalisé (format hex, ex: #3b82f6)'
      `);
      console.log('✅ Colonne avatarColor ajoutée avec succès');
    } else {
      console.log('ℹ️ La colonne avatarColor existe déjà');
    }
    
    if (!existingColumns.includes('avatarInitials')) {
      console.log('➕ Ajout de la colonne avatarInitials...');
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN avatarInitials VARCHAR(3) NULL 
        COMMENT 'Initiales de l\'avatar personnalisé (ex: AB)'
      `);
      console.log('✅ Colonne avatarInitials ajoutée avec succès');
    } else {
      console.log('ℹ️ La colonne avatarInitials existe déjà');
    }
    
    // Afficher la structure finale de la table
    console.log('📋 Structure finale de la table users:');
    const [tableStructure] = await db.query('DESCRIBE users');
    tableStructure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    console.log('🎉 Migration terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
}

if (require.main === module) {
  addAvatarMetadataColumns()
    .then(() => {
      console.log('✨ Migration exécutée avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur de migration:', error);
      process.exit(1);
    });
}

module.exports = addAvatarMetadataColumns;
