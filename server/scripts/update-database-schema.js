const db = require('../config/db');

async function updateDatabaseSchema() {
  try {
    console.log('Starting database schema update...');
    
    // Check if name column exists
    const [nameColumnCheck] = await db.query(`
      SELECT COUNT(*) as exists_count 
      FROM information_schema.COLUMNS 
      WHERE 
        TABLE_SCHEMA = DATABASE() AND 
        TABLE_NAME = 'users' AND 
        COLUMN_NAME = 'name'
    `);
    
    const nameColumnExists = nameColumnCheck[0].exists_count > 0;
    
    // Check if firstName and lastName columns exist
    const [firstNameColumnCheck] = await db.query(`
      SELECT COUNT(*) as exists_count 
      FROM information_schema.COLUMNS 
      WHERE 
        TABLE_SCHEMA = DATABASE() AND 
        TABLE_NAME = 'users' AND 
        COLUMN_NAME = 'firstName'
    `);
    
    const firstNameColumnExists = firstNameColumnCheck[0].exists_count > 0;
    
    console.log(`name column exists: ${nameColumnExists}`);
    console.log(`firstName column exists: ${firstNameColumnExists}`);
    
    if (nameColumnExists && !firstNameColumnExists) {
      console.log('Migrating from name to firstName/lastName...');
      
      // Add firstName and lastName columns
      await db.query(`
        ALTER TABLE users
        ADD COLUMN firstName VARCHAR(50) AFTER name,
        ADD COLUMN lastName VARCHAR(50) AFTER firstName
      `);
      
      // Copy existing name into firstName/lastName
      await db.query(`
        UPDATE users SET 
        firstName = SUBSTRING_INDEX(name, ' ', 1),
        lastName = CASE 
          WHEN LOCATE(' ', name) > 0 
          THEN TRIM(SUBSTRING(name, LOCATE(' ', name))) 
          ELSE '' 
        END
      `);
      
      // Drop name column
      await db.query('ALTER TABLE users DROP COLUMN name');
      
      console.log('Migration completed successfully!');
    } else if (!nameColumnExists && firstNameColumnExists) {
      console.log('Database schema is already updated with firstName/lastName columns.');
    } else if (nameColumnExists && firstNameColumnExists) {
      console.log('Database has both name and firstName/lastName columns. Cleaning up...');
      
      // Drop name column if it's unnecessary
      await db.query('ALTER TABLE users DROP COLUMN name');
      console.log('Removed redundant name column.');
    } else {
      console.log('Database schema does not appear to have a proper users table structure.');
    }
    
    // Check the final structure
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE 
        TABLE_SCHEMA = DATABASE() AND 
        TABLE_NAME = 'users'
    `);
    
    console.log('Current users table columns:');
    columns.forEach(col => console.log(` - ${col.COLUMN_NAME}`));
    
    console.log('Database schema update completed.');
    
  } catch (error) {
    console.error('Error updating database schema:', error);
  } finally {
    process.exit(0);
  }
}

updateDatabaseSchema();
