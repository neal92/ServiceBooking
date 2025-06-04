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
      'INSERT INTO categories (name, description, color) VALUES (?, ?, ?)',
      [categoryData.name, categoryData.description, categoryData.color || 'blue']
    );
    return result.insertId;
  },
  
  update: async (id, categoryData) => {
    const [result] = await db.query(
      'UPDATE categories SET name = ?, description = ?, color = ? WHERE id = ?',
      [categoryData.name, categoryData.description, categoryData.color || 'blue', id]
    );
    return result.affectedRows > 0;
  },
  
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Category;
