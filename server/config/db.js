const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'servicebooking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get a Promise-based interface for the pool
const promisePool = pool.promise();

module.exports = promisePool;
