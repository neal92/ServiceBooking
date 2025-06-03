const db = require('../config/db');

const Service = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT s.*, c.name as categoryName 
      FROM services s
      LEFT JOIN categories c ON s.categoryId = c.id
    `);
    return rows;
  },
  
  getById: async (id) => {
    const [rows] = await db.query(`
      SELECT s.*, c.name as categoryName 
      FROM services s
      LEFT JOIN categories c ON s.categoryId = c.id
      WHERE s.id = ?
    `, [id]);
    return rows[0];
  },
  
  getByCategory: async (categoryId) => {
    const [rows] = await db.query(
      'SELECT * FROM services WHERE categoryId = ?',
      [categoryId]
    );
    return rows;
  },
  
  create: async (serviceData) => {
    const [result] = await db.query(
      'INSERT INTO services (name, description, price, duration, categoryId) VALUES (?, ?, ?, ?, ?)',
      [
        serviceData.name,
        serviceData.description,
        serviceData.price,
        serviceData.duration,
        serviceData.categoryId
      ]
    );
    return result.insertId;
  },
  
  update: async (id, serviceData) => {
    const [result] = await db.query(
      'UPDATE services SET name = ?, description = ?, price = ?, duration = ?, categoryId = ? WHERE id = ?',
      [
        serviceData.name,
        serviceData.description,
        serviceData.price,
        serviceData.duration,
        serviceData.categoryId,
        id
      ]
    );
    return result.affectedRows > 0;
  },
  
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM services WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Service;
