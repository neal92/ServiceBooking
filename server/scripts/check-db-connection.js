// Script pour vérifier la connexion à la base de données et la structure de la table users
const db = require('../config/db');

async function checkDatabaseConnection() {
  try {
    console.log('Tentative de connexion à la base de données...');
    const [result] = await db.query('SELECT 1 + 1 AS solution');
    console.log('Connexion à la base de données réussie!');
    console.log('Résultat test:', result[0].solution);
    return true;
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    return false;
  }
}

async function checkUsersTable() {
  try {
    console.log('\nVérification de la structure de la table users...');
    const [tables] = await db.query('SHOW TABLES LIKE "users"');
    
    if (tables.length === 0) {
      console.error('La table users n\'existe pas!');
      return false;
    }
    
    console.log('La table users existe.');
    const [columns] = await db.query('DESCRIBE users');
    console.log('Structure de la table users:');
    columns.forEach(col => {
      console.log(`${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });
    
    console.log('\nVérification du nombre d\'utilisateurs...');
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    console.log(`Nombre d'utilisateurs dans la table: ${users[0].count}`);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification de la table users:', error);
    return false;
  }
}

async function main() {
  if (await checkDatabaseConnection()) {
    await checkUsersTable();
  }
  
  // Fermer la connexion
  process.exit();
}

main();
