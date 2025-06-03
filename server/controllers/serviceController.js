const Service = require('../models/service');

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.getAll();
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error while fetching services' });
  }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.getById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Server error while fetching service' });
  }
};

// Get services by category
exports.getServicesByCategory = async (req, res) => {
  try {
    const services = await Service.getByCategory(req.params.categoryId);
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services by category:', error);
    res.status(500).json({ message: 'Server error while fetching services by category' });
  }
};

// Create new service
exports.createService = async (req, res) => {
  try {
    const { name, description, price, duration, categoryId } = req.body;
    
    if (!name || !price || !duration || !categoryId) {
      return res.status(400).json({ 
        message: 'Name, price, duration and categoryId are required fields' 
      });
    }
    
    const serviceId = await Service.create({ 
      name, 
      description, 
      price, 
      duration, 
      categoryId 
    });
    
    res.status(201).json({ 
      message: 'Service created successfully', 
      serviceId 
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Server error while creating service' });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, categoryId } = req.body;
    
    if (!name || !price || !duration || !categoryId) {
      return res.status(400).json({ 
        message: 'Name, price, duration and categoryId are required fields' 
      });
    }
    
    const success = await Service.update(id, { 
      name, 
      description, 
      price, 
      duration, 
      categoryId 
    });
    
    if (!success) {
      return res.status(404).json({ message: 'Service not found or no changes made' });
    }
    
    res.status(200).json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Server error while updating service' });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Service.delete(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Server error while deleting service' });
  }
};
