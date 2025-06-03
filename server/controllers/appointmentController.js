const Appointment = require('../models/appointment');

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.getAll();
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.getById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: 'Server error while fetching appointment' });
  }
};

// Create new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { 
      clientName, 
      clientEmail, 
      clientPhone, 
      serviceId, 
      date, 
      time, 
      status,
      notes 
    } = req.body;
    
    // Validation
    if (!clientName || !clientEmail || !serviceId || !date || !time) {
      return res.status(400).json({ 
        message: 'Client name, email, service ID, date and time are required' 
      });
    }
    
    const appointmentId = await Appointment.create({ 
      clientName, 
      clientEmail, 
      clientPhone, 
      serviceId, 
      date, 
      time, 
      status: status || 'pending',
      notes: notes || ''
    });
    
    res.status(201).json({ 
      message: 'Appointment created successfully', 
      appointmentId 
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error while creating appointment' });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      clientName, 
      clientEmail, 
      clientPhone, 
      serviceId, 
      date, 
      time, 
      status,
      notes 
    } = req.body;
    
    // Validation
    if (!clientName || !clientEmail || !serviceId || !date || !time) {
      return res.status(400).json({ 
        message: 'Client name, email, service ID, date and time are required' 
      });
    }
    
    const success = await Appointment.update(id, { 
      clientName, 
      clientEmail, 
      clientPhone, 
      serviceId, 
      date, 
      time, 
      status,
      notes 
    });
    
    if (!success) {
      return res.status(404).json({ message: 'Appointment not found or no changes made' });
    }
    
    res.status(200).json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error while updating appointment' });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const success = await Appointment.updateStatus(id, status);
    
    if (!success) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.status(200).json({ message: 'Appointment status updated successfully' });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Server error while updating appointment status' });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Appointment.delete(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error while deleting appointment' });
  }
};
