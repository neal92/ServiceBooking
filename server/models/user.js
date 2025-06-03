const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {  // Find user by email
  static async findByEmail(email) {
    try {
      console.log(`Looking up user by email: ${email}`);
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length > 0) {
        console.log(`User found with email: ${email}`);
        return rows[0];
      } else {
        console.log(`No user found with email: ${email}`);
        return null;
      }
    } catch (error) {
      console.error('Error finding user by email:', error);
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.error('Users table does not exist in database');
      } else if (error.sqlMessage) {
        console.error('SQL error message:', error.sqlMessage);
      }
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const [rows] = await db.query('SELECT id, email, name, role, created_at FROM users WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }
  // Create a new user
  static async create(userData) {
    try {
      console.log(`Hashing password for user: ${userData.email}`);
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      console.log(`Inserting new user into database: ${userData.email}`);
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [userData.name, userData.email, hashedPassword, userData.role || 'user']
      );

      console.log(`User created with ID: ${result.insertId}`);
      return { userId: result.insertId };
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        console.error('Duplicate email entry found in database');
      } else if (error.code === 'ER_NO_SUCH_TABLE') {
        console.error('Users table does not exist in database');
      } else if (error.sqlMessage) {
        console.error('SQL error message:', error.sqlMessage);
      }
      throw error;
    }
  }
  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      console.log('Verifying password');
      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      console.log(`Password verification result: ${isValid ? 'valid' : 'invalid'}`);
      return isValid;
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  // Update user
  static async update(id, userData) {
    try {
      // Don't update password here, use a separate method for that
      const [result] = await db.query(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [userData.name, userData.email, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Change password
  static async changePassword(id, newPassword) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      const [result] = await db.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}

module.exports = User;
