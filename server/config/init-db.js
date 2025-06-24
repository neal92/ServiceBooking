const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initDB() {
  try {
    // Connect to MySQL without selecting a database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      multipleStatements: true
    });

    console.log('Connected to MySQL server');    // Read the SQL file content
    const sqlFilePath = path.join(__dirname, 'database.sql');
    const sqlScript = await fs.readFile(sqlFilePath, 'utf8');

    // Execute the SQL script
    console.log('Initializing database schema...');
    await connection.query(sqlScript);
    console.log('Database schema initialized successfully');

    // Close the connection
    await connection.end();
    console.log('Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the function
initDB();
