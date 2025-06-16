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

// Get appointments for a specific client by email
exports.getClientAppointments = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }
    
    const appointments = await Appointment.getByClientEmail(email);
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching client appointments:', error);
    res.status(500).json({ message: 'Server error while fetching client appointments' });
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
      notes,
      createdBy 
    } = req.body;
    
    console.log('Creating appointment with data:', { 
      clientName, clientEmail, clientPhone, serviceId, date, time, createdBy, notes 
    });
    
    // Validation
    if (!clientName || !clientEmail || !serviceId || !date || !time) {
      return res.status(400).json({ 
        message: 'Client name, email, service ID, date and time are required' 
      });
    }
      // Validate date is not in the past
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const appointmentDate = new Date(date);
    
    console.log('Validation de date côté serveur:', {
      date,
      appointmentDate,
      today,
      isInPast: appointmentDate < today
    });
    
    // Comparer uniquement les dates (ignorer les heures)
    const todayISO = today.toISOString().split('T')[0];
    const appointmentISO = appointmentDate.toISOString().split('T')[0];
    
    if (appointmentISO < todayISO) {
      return res.status(400).json({ 
        message: 'Impossible de prendre un rendez-vous à une date passée' 
      });
    }
    
    // If date is today, check that time is not in the past
    if (appointmentDate.toDateString() === today.toDateString()) {
      const [hours, minutes] = time.split(':').map(Number);
      const appointmentTime = hours * 60 + minutes;
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      if (appointmentTime < currentTime) {
        return res.status(400).json({ 
          message: 'Impossible de prendre un rendez-vous à une heure passée' 
        });
      }
    }
    
    // Check if there's already an appointment at this date and time
    const existingAppointments = await Appointment.getByDateTime(date, time);
    if (existingAppointments && existingAppointments.length > 0) {
      return res.status(400).json({
        message: 'Un rendez-vous existe déjà à cette date et heure'
      });
    }
      try {
      let appointmentId;
      
      // Déterminer si c'est un admin qui crée le rendez-vous
      if (createdBy === 'admin') {
        // Création par admin - statut automatiquement confirmé
        appointmentId = await Appointment.createByAdmin({ 
          clientName, 
          clientEmail, 
          clientPhone, 
          serviceId, 
          date, 
          time, 
          notes: notes || ''
        });
      } else {
        // Création par client - statut pending par défaut
        appointmentId = await Appointment.create({ 
          clientName, 
          clientEmail, 
          clientPhone, 
          serviceId, 
          date, 
          time, 
          status: 'pending',
          notes: notes || '',
          createdBy: 'client'
        });
      }
      
      res.status(201).json({ 
        message: 'Appointment created successfully', 
        appointmentId 
      });
    } catch (dbError) {
      console.error('Database error creating appointment:', dbError);
      // Send more detailed error to client for debugging
      res.status(500).json({ 
        message: 'Database error while creating appointment', 
        error: dbError.message,
        code: dbError.code
      });
    }
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error while creating appointment' });
  }
};

// Create appointment by admin (automatically confirmed)
exports.createAppointmentByAdmin = async (req, res) => {
  try {
    const { 
      clientName, 
      clientEmail, 
      clientPhone, 
      serviceId, 
      date, 
      time,
      notes 
    } = req.body;
    
    console.log('Admin creating appointment with data:', { 
      clientName, clientEmail, clientPhone, serviceId, date, time, notes 
    });
    
    // Validation
    if (!clientName || !clientEmail || !serviceId || !date || !time) {
      return res.status(400).json({ 
        message: 'Client name, email, service ID, date and time are required' 
      });
    }
    
    const appointmentData = {
      clientName,
      clientEmail,
      clientPhone,
      serviceId,
      date,
      time, 
      notes
    };
    
    const appointmentId = await Appointment.createByAdmin(appointmentData);
    res.status(201).json({ id: appointmentId, message: 'Appointment created successfully' });
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
