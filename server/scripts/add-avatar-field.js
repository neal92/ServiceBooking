const db = require('../config/db');

async function addAvatarField() {
  try {
    // Check if avatar column exists
    const [avatarColumns] = await db.query('SHOW COLUMNS FROM users LIKE ?', ['avatar']);
    
    if (avatarColumns.length === 0) {
      // Add avatar column if it doesn't exist
      console.log('Adding avatar column to users table...');
      await db.query('ALTER TABLE users ADD COLUMN avatar VARCHAR(255)');
      console.log('Avatar column added successfully');
    } else {
      console.log('Avatar column already exists');
    }
    
    // Check if isPresetAvatar column exists
    const [presetColumns] = await db.query('SHOW COLUMNS FROM users LIKE ?', ['isPresetAvatar']);
    
    if (presetColumns.length === 0) {
      // Add isPresetAvatar column if it doesn't exist
      console.log('Adding isPresetAvatar column to users table...');
      await db.query('ALTER TABLE users ADD COLUMN isPresetAvatar BOOLEAN DEFAULT FALSE');
      console.log('isPresetAvatar column added successfully');
    } else {
      console.log('isPresetAvatar column already exists');
    }
  } catch (error) {
    console.error('Error adding avatar field:', error);
  } finally {
    process.exit();
  }
}

addAvatarField();
