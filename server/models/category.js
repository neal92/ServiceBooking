const db = require('../config/db');

const Category = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM categories');
    return rows;
  },
  
  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
  },
  
  create: async (categoryData) => {
    const [result] = await db.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [categoryData.name, categoryData.description]
    );
    return result.insertId;
  },
  
  update: async (id, categoryData) => {
    const [result] = await db.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [categoryData.name, categoryData.description, id]
    );
    return result.affectedRows > 0;
  },
  
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Category;
