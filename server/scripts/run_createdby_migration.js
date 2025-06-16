const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Exécution de la migration pour ajouter createdBy à la table appointments...');
    
    // Lire le fichier SQL
    const sqlFilePath = path.join(__dirname, '../migrations/03_add_createdby_to_appointments.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Exécuter les commandes SQL
    const statements = sql.split(';').filter(statement => statement.trim() !== '');
    
    for (const statement of statements) {
      await db.query(statement);
      console.log('Commande SQL exécutée avec succès.');
    }
    
    console.log('Migration terminée avec succès.');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la migration:', error);
    process.exit(1);
  }
}

runMigration();
