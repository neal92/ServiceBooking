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
      'INSERT INTO services (name, description, price, duration, categoryId, image) VALUES (?, ?, ?, ?, ?, ?)',
      [
        serviceData.name,
        serviceData.description,
        serviceData.price,
        serviceData.duration,
        serviceData.categoryId,
        serviceData.image
      ]
    );
    return result.insertId;
  },
  
  update: async (id, serviceData) => {
    // Build dynamic query based on provided fields
    const fields = [];
    const values = [];
    
    if (serviceData.name !== undefined) {
      fields.push('name = ?');
      values.push(serviceData.name);
    }
    if (serviceData.description !== undefined) {
      fields.push('description = ?');
      values.push(serviceData.description);
    }
    if (serviceData.price !== undefined) {
      fields.push('price = ?');
      values.push(serviceData.price);
    }
    if (serviceData.duration !== undefined) {
      fields.push('duration = ?');
      values.push(serviceData.duration);
    }
    if (serviceData.categoryId !== undefined) {
      fields.push('categoryId = ?');
      values.push(serviceData.categoryId);
    }
    if (serviceData.image !== undefined) {
      fields.push('image = ?');
      values.push(serviceData.image);
    }
    
    if (fields.length === 0) {
      return false; // No fields to update
    }
    
    values.push(id); // Add ID for WHERE clause
    
    const [result] = await db.query(
      `UPDATE services SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM services WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Service;
