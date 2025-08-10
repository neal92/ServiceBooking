const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initDB() {
  try {
    // 1. Connexion sans base pour créer la base
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'SV63xo!+25',
      multipleStatements: true
    });
    console.log('Connected to MySQL server');
    // Crée la base si elle n'existe pas
    await connection.query('CREATE DATABASE IF NOT EXISTS servicebooking;');
    await connection.end();
    console.log('Database created (if not exists) and connection closed.');

    // 2. Connexion avec la base sélectionnée
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'SV63xo!+25',
      database: 'servicebooking',
      multipleStatements: true
    });
    console.log('Connected to servicebooking database');
    const sqlFilePath = path.join(__dirname, 'database.sql');
    const sqlScript = await fs.readFile(sqlFilePath, 'utf8');

    // Retire la création et sélection de la base du script SQL
    const cleanedScript = sqlScript.replace(/CREATE DATABASE IF NOT EXISTS servicebooking;[\s\S]*?USE servicebooking;/i, '');

    // Exécute le reste du script
    console.log('Initializing database schema...');
    await dbConnection.query(cleanedScript);
    console.log('Database schema initialized successfully');
    await dbConnection.end();
    console.log('Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the function
initDB();
