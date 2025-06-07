/**
 * Script pour ajouter le statut 'in-progress' à l'énumération de statut dans la table appointments
 */
const db = require('../config/db');

async function addInProgressStatus() {
  try {
    console.log('Modification de la table appointments pour ajouter le statut in-progress...');
    
    // Modifier la colonne status pour ajouter 'in-progress' à l'énumération
    await db.query(`
      ALTER TABLE appointments 
      MODIFY COLUMN status ENUM('pending', 'confirmed', 'in-progress', 'cancelled', 'completed') DEFAULT 'pending'
    `);
    
    console.log('Statut in-progress ajouté avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la modification de la table:', error);
    process.exit(1);
  }
}

addInProgressStatus();
