// Script pour afficher toutes les catégories dans la base de données
const db = require('../config/db');

async function showCategories() {
  try {
    console.log('Connecté à la base de données. Récupération des catégories...');
    const [rows] = await db.query('SELECT * FROM categories');
    
    console.log('\n--- LISTE DES CATÉGORIES ---');
    console.table(rows);
    
    // Fermer la connexion à la base de données
    await db.end();
    console.log('\nAffichage terminé.');
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    process.exit(1);
  }
}

// Exécuter la fonction
showCategories();
