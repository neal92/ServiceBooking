const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// GET all services
router.get('/', serviceController.getAllServices);

// GET all services with image URLs (for mobile app)
router.get('/mobile/list', serviceController.getServicesForMobile);

// GET service by id
router.get('/:id', serviceController.getServiceById);

// GET service image
router.get('/:id/image', serviceController.getServiceImage);

// GET services by category
router.get('/category/:categoryId', serviceController.getServicesByCategory);

// POST create new service
router.post('/', serviceController.createService);

// PUT update service
router.put('/:id', serviceController.updateService);

// DELETE service
router.delete('/:id', serviceController.deleteService);

module.exports = router;
