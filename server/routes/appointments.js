const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// GET all appointments (pour admin)
router.get('/', appointmentController.getAllAppointments);

// GET appointments by client email
router.get('/client', appointmentController.getClientAppointments);

// GET appointment by id
router.get('/:id', appointmentController.getAppointmentById);

// POST create new appointment
router.post('/', appointmentController.createAppointment);

// POST create appointment by admin (already confirmed)
router.post('/admin', appointmentController.createAppointmentByAdmin);

// PUT update appointment
router.put('/:id', appointmentController.updateAppointment);

// PATCH update appointment status
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

// DELETE appointment
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
