const mysql = require('mysql2');
require('dotenv').config();

// Log database connection parameters (without password)
console.log(`Connecting to database: ${process.env.DB_NAME} on ${process.env.DB_HOST} as ${process.env.DB_USER}`);

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'SV63xo!+25',
  database: process.env.DB_NAME || 'servicebooking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection and log the result
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection refused. Check if MySQL is running and credentials are correct.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Check your database username and password.');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error(`Database '${process.env.DB_NAME}' does not exist.`);
    }
    return;
  }
  
  console.log('Successfully connected to the database.');
  connection.release();
});

// Get a Promise-based interface for the pool
const promisePool = pool.promise();

module.exports = promisePool;
