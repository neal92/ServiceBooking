const db = require('../config/db');

const Appointment = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT a.*, s.name as serviceName, s.price, s.duration
      FROM appointments a
      LEFT JOIN services s ON a.serviceId = s.id
      ORDER BY a.date DESC, a.time DESC
    `);
    return rows;
  },
  
  getById: async (id) => {
    const [rows] = await db.query(`
      SELECT a.*, s.name as serviceName, s.price, s.duration
      FROM appointments a
      LEFT JOIN services s ON a.serviceId = s.id
      WHERE a.id = ?
    `, [id]);
    return rows[0];
  },
  
  create: async (appointmentData) => {
    const [result] = await db.query(
      'INSERT INTO appointments (clientName, clientEmail, clientPhone, serviceId, date, time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        appointmentData.clientName,
        appointmentData.clientEmail,
        appointmentData.clientPhone,
        appointmentData.serviceId,
        appointmentData.date,
        appointmentData.time,
        appointmentData.status || 'pending',
        appointmentData.notes || ''
      ]
    );
    return result.insertId;
  },
  
  update: async (id, appointmentData) => {
    const [result] = await db.query(
      'UPDATE appointments SET clientName = ?, clientEmail = ?, clientPhone = ?, serviceId = ?, date = ?, time = ?, status = ?, notes = ? WHERE id = ?',
      [
        appointmentData.clientName,
        appointmentData.clientEmail,
        appointmentData.clientPhone,
        appointmentData.serviceId,
        appointmentData.date,
        appointmentData.time,
        appointmentData.status,
        appointmentData.notes,
        id
      ]
    );
    return result.affectedRows > 0;
  },
  
  updateStatus: async (id, status) => {
    const [result] = await db.query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  },
  
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM appointments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Appointment;
