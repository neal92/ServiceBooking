const db = require('../config/db');

async function addAvatarField() {
  try {
    // Check if avatar column exists
    const [columns] = await db.query('SHOW COLUMNS FROM users LIKE ?', ['avatar']);
    
    if (columns.length === 0) {
      // Add avatar column if it doesn't exist
      console.log('Adding avatar column to users table...');
      await db.query('ALTER TABLE users ADD COLUMN avatar VARCHAR(255)');
      console.log('Avatar column added successfully');
    } else {
      console.log('Avatar column already exists');
    }
  } catch (error) {
    console.error('Error adding avatar field:', error);
  } finally {
    process.exit();
  }
}

addAvatarField();
