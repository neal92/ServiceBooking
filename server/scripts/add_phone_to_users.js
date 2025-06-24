const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;
  try {
    // Établir la connexion
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'servicebooking',
    });
    
    console.log('Connexion à la base de données établie');
    
    // Lire le fichier SQL
    const sqlFilePath = path.join(__dirname, '..', 'migrations', '04_add_phone_to_users.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Exécuter les commandes SQL
    console.log('Début de la migration: ajout de la colonne phone à la table users');
    await connection.query(sqlContent);
    
    console.log('Migration terminée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la migration:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connexion à la base de données fermée');
    }
  }
}

runMigration();
