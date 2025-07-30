const db = require('../config/db');

const Category = {  getAll: async () => {
    const [rows] = await db.query(`
      SELECT c.*, COUNT(s.id) as servicesCount
      FROM categories c
      LEFT JOIN services s ON c.id = s.categoryId
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    return rows;
  },
  
  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (categoryData) => {
    const [result] = await db.query(
      'INSERT INTO categories (name, description, color, image) VALUES (?, ?, ?, ?)',
      [
        categoryData.name, 
        categoryData.description, 
        categoryData.color || 'blue',
        categoryData.image
      ]
    );
    return result.insertId;
  },
  
  update: async (id, categoryData) => {
    // Build dynamic query based on provided fields
    const fields = [];
    const values = [];
    
    if (categoryData.name !== undefined) {
      fields.push('name = ?');
      values.push(categoryData.name);
    }
    if (categoryData.description !== undefined) {
      fields.push('description = ?');
      values.push(categoryData.description);
    }
    if (categoryData.color !== undefined) {
      fields.push('color = ?');
      values.push(categoryData.color || 'blue');
    }
    if (categoryData.image !== undefined) {
      fields.push('image = ?');
      values.push(categoryData.image);
    }
    
    if (fields.length === 0) {
      return false; // No fields to update
    }
    
    values.push(id); // Add ID for WHERE clause
    
    const [result] = await db.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Category;
