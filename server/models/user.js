const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  // Find user by email
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
  }  // Find user by ID  
  static async findById(id, includePassword = false) {
    try {
      console.log('Finding user by ID:', id, includePassword ? '(including password)' : '');
      const columns = includePassword 
        ? 'id, email, firstName, lastName, role, password, avatar, isPresetAvatar, created_at' 
        : 'id, email, firstName, lastName, role, avatar, isPresetAvatar, created_at';
      
      const [rows] = await db.query(
        `SELECT ${columns} FROM users WHERE id = ?`, 
        [id]
      );
      console.log('Found user:', rows[0] ? {
        ...rows[0],
        password: rows[0].password ? '[PRESENT]' : '[NOT PRESENT]',
        avatar: rows[0].avatar ? '[PRESENT]' : '[NOT PRESENT]'
      } : 'None');
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
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      console.log(`Inserting new user into database: ${userData.email}`);
      const [result] = await db.query(
        'INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [userData.firstName, userData.lastName, userData.email, hashedPassword, userData.role || 'user']
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
  }  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      console.log('Verifying password');
      
      // Vérifier que les arguments sont valides pour éviter l'erreur "data and hash arguments required"
      if (!plainPassword || typeof plainPassword !== 'string') {
        console.error('Invalid plain password provided:', plainPassword);
        return false;
      }
      
      if (!hashedPassword || typeof hashedPassword !== 'string') {
        console.error('Invalid hashed password provided');
        return false;
      }
      
      // Longueur minimale pour un hash bcrypt valide
      const MIN_BCRYPT_LENGTH = 60;
      if (hashedPassword.length < MIN_BCRYPT_LENGTH) {
        console.error(`Hashed password is too short (${hashedPassword.length} chars). Minimum required: ${MIN_BCRYPT_LENGTH}`);
        return false;
      }
      
      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      console.log(`Password verification result: ${isValid ? 'valid' : 'invalid'}`);
      return isValid;
    } catch (error) {
      console.error('Error verifying password:', error);
      if (error.message && error.message.includes('data and hash arguments required')) {
        console.error('Invalid arguments for bcrypt.compare - plainPassword or hashedPassword might be undefined or null');
      }
      return false; // Retourner false au lieu de propager l'erreur pour une meilleure expérience utilisateur
    }
  }
  // Update user
  static async update(id, userData) {
    try {
      console.log('Updating user data:', { id, ...userData });
      let query = 'UPDATE users SET ';
      const values = [];
      const fields = [];

      if (userData.firstName !== undefined) {
        fields.push('firstName = ?');
        values.push(userData.firstName);
      }
      if (userData.lastName !== undefined) {
        fields.push('lastName = ?');
        values.push(userData.lastName);
      }
      if (userData.email !== undefined) {
        fields.push('email = ?');
        values.push(userData.email);
      }
      if (userData.avatar !== undefined) {
        fields.push('avatar = ?');
        values.push(userData.avatar);
      }
      if (userData.isPresetAvatar !== undefined) {
        fields.push('isPresetAvatar = ?');
        values.push(userData.isPresetAvatar);
      }

      if (fields.length === 0) {
        console.log('No fields to update');
        return false;
      }

      query += fields.join(', ') + ' WHERE id = ?';
      values.push(id);

      console.log('Update query:', query);
      console.log('Update values:', values);

      const [result] = await db.query(query, values);
      console.log('Update result:', {
        affectedRows: result.affectedRows,
        changedRows: result.changedRows
      });
      
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
