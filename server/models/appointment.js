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
  
  getByUserId: async (userId) => {
    const [rows] = await db.query(`
      SELECT a.*, s.name as serviceName, s.price, s.duration
      FROM appointments a
      LEFT JOIN services s ON a.serviceId = s.id
      WHERE a.userId = ?
      ORDER BY a.date DESC, a.time DESC
    `, [userId]);
    return rows;
  },
  
  getCompletedCountByUserId: async (userId) => {
    const [rows] = await db.query(`
      SELECT COUNT(*) as completedCount
      FROM appointments
      WHERE userId = ? AND status = 'completed'
    `, [userId]);
    return rows[0].completedCount;
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
    // Format the date to YYYY-MM-DD format for MySQL
    let formattedDate = appointmentData.date;
    if (formattedDate && formattedDate.includes('T')) {
      // Extract just the date part from ISO date string
      formattedDate = appointmentData.date.split('T')[0];
      console.log(`Formatted date for database: ${formattedDate}`);
    }

    const [result] = await db.query(
      'INSERT INTO appointments (clientName, clientEmail, clientPhone, serviceId, date, time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        appointmentData.clientName,
        appointmentData.clientEmail,
        appointmentData.clientPhone,
        appointmentData.serviceId,
        formattedDate,  // Using the formatted date
        appointmentData.time,
        appointmentData.status || 'pending',
        appointmentData.notes || ''
      ]
    );
    return result.insertId;
  },
    update: async (id, appointmentData) => {
    // Format the date to YYYY-MM-DD format for MySQL
    let formattedDate = appointmentData.date;
    if (formattedDate && formattedDate.includes('T')) {
      // Extract just the date part from ISO date string
      formattedDate = appointmentData.date.split('T')[0];
      console.log(`Formatted date for database update: ${formattedDate}`);
    }

    const [result] = await db.query(
      'UPDATE appointments SET clientName = ?, clientEmail = ?, clientPhone = ?, serviceId = ?, date = ?, time = ?, status = ?, notes = ? WHERE id = ?',
      [
        appointmentData.clientName,
        appointmentData.clientEmail,
        appointmentData.clientPhone,
        appointmentData.serviceId,
        formattedDate,  // Using the formatted date
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
  
  getByDateTime: async (date, time) => {
    // Format the date to YYYY-MM-DD format for MySQL if needed
    let formattedDate = date;
    if (formattedDate && formattedDate.includes('T')) {
      // Extract just the date part from ISO date string
      formattedDate = date.split('T')[0];
    }
    
    console.log(`Checking for appointments on date: ${formattedDate}, time: ${time}`);
    
    const [rows] = await db.query(`
      SELECT a.*, s.name as serviceName, s.price, s.duration
      FROM appointments a
      LEFT JOIN services s ON a.serviceId = s.id
      WHERE a.date = ? AND a.time = ?
    `, [formattedDate, time]);
    
    return rows;
  },
  
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM appointments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Appointment;
