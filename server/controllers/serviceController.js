const Service = require('../models/service');
const path = require('path');
const fs = require('fs');

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

// Get all services with full image URLs for mobile app
exports.getServicesForMobile = async (req, res) => {
  try {
    const services = await Service.getAll();
    
    // Add full image URLs to services
    const servicesWithImageUrls = services.map(service => {
      let imageUrl = null;
      if (service.image) {
        // Build full URL for the image
        const protocol = req.protocol;
        const host = req.get('host');
        imageUrl = `${protocol}://${host}/api/services/${service.id}/image`;
      }
      
      return {
        ...service,
        imageUrl: imageUrl
      };
    });
    
    res.status(200).json(servicesWithImageUrls);
  } catch (error) {
    console.error('Error fetching services for mobile:', error);
    res.status(500).json({ message: 'Server error while fetching services for mobile' });
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
    
    let imageName = null;
    
    // Handle image upload if present
    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(imageFile.mimetype)) {
        return res.status(400).json({ 
          message: 'Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.' 
        });
      }
      
      // Validate file size (max 5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        return res.status(400).json({ 
          message: 'File size too large. Maximum size is 5MB.' 
        });
      }
      
      // Generate unique filename
      const fileExtension = path.extname(imageFile.name);
      imageName = `service_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${fileExtension}`;
      
      // Ensure upload directory exists
      const uploadDir = path.join(__dirname, '..', 'public', 'images', 'services');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Save the file
      const uploadPath = path.join(uploadDir, imageName);
      await imageFile.mv(uploadPath);
    }
    
    const serviceId = await Service.create({ 
      name, 
      description, 
      price, 
      duration, 
      categoryId,
      image: imageName
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
    
    let imageName = null;
    
    // Handle image upload if present
    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(imageFile.mimetype)) {
        return res.status(400).json({ 
          message: 'Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.' 
        });
      }
      
      // Validate file size (max 5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        return res.status(400).json({ 
          message: 'File size too large. Maximum size is 5MB.' 
        });
      }
      
      // Get current service to delete old image
      const currentService = await Service.getById(id);
      if (currentService && currentService.image) {
        const oldImagePath = path.join(__dirname, '..', 'public', 'images', 'services', currentService.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Generate unique filename
      const fileExtension = path.extname(imageFile.name);
      imageName = `service_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${fileExtension}`;
      
      // Ensure upload directory exists
      const uploadDir = path.join(__dirname, '..', 'public', 'images', 'services');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Save the file
      const uploadPath = path.join(uploadDir, imageName);
      await imageFile.mv(uploadPath);
    }
    
    const updateData = { 
      name, 
      description, 
      price, 
      duration, 
      categoryId 
    };
    
    // Only add image to update if a new one was uploaded
    if (imageName) {
      updateData.image = imageName;
    }
    
    const success = await Service.update(id, updateData);
    
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

// Get service image
exports.getServiceImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get service from database
    const service = await Service.getById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if service has an image
    if (!service.image) {
      return res.status(404).json({ message: 'No image found for this service' });
    }
    
    // Build image path
    const imagePath = path.join(__dirname, '..', 'public', 'images', 'services', service.image);
    
    // Check if image file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: 'Image file not found on server' });
    }
    
    // Get file extension to determine content type
    const fileExtension = path.extname(service.image).toLowerCase();
    let contentType = 'image/jpeg'; // default
    
    switch (fileExtension) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
    }
    
    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Send image
    res.sendFile(imagePath);
    
  } catch (error) {
    console.error('Error fetching service image:', error);
    res.status(500).json({ message: 'Server error while fetching service image' });
  }
};
