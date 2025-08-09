const Service = require('../models/service');
const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { processServiceImage, deleteServiceImages } = require('../utils/imageProcessor');

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
      
      // Validate file size (max 10MB avant redimensionnement)
      if (imageFile.size > 10 * 1024 * 1024) {
        return res.status(400).json({ 
          message: 'File size too large. Maximum size is 10MB.' 
        });
      }
      
      // Créer d'abord le service pour avoir un ID
      const serviceId = await Service.create({ 
        name, 
        description, 
        price, 
        duration, 
        categoryId,
        image: null // Temporairement null
      });
      
      try {
        // Traiter l'image avec redimensionnement
        const uploadDir = path.join(__dirname, '..', 'public', 'images', 'services');
        const imageResult = await processServiceImage(imageFile, serviceId, uploadDir);
        
        if (imageResult.success) {
          // Mettre à jour le service avec le nom de l'image
          const updateResult = await Service.update(serviceId, { image: imageResult.mainImage });
          
          // Vérifier que la mise à jour a bien fonctionné
          const updatedService = await Service.getById(serviceId);
          
          const responseData = { 
            message: 'Service created successfully with image', 
            serviceId,
            imageInfo: {
              filename: imageResult.mainImage,
              originalSize: imageFile.size,
              processedSize: imageResult.processedImages.main.size,
              compressionRatio: ((1 - imageResult.processedImages.main.size / imageFile.size) * 100).toFixed(1) + '%'
            }
          };
          
          return res.status(201).json(responseData);
        }
      } catch (imageError) {
        console.error('Erreur traitement image:', imageError);
        // Supprimer le service si l'image a échoué
        await Service.delete(serviceId);
        return res.status(500).json({ 
          message: 'Error processing image: ' + imageError.message 
        });
      }
    } else {
      // Pas d'image, création normale
      const serviceId = await Service.create({ 
        name, 
        description, 
        price, 
        duration, 
        categoryId,
        image: imageName
      });
      
      const responseData = { 
        message: 'Service created successfully', 
        serviceId 
      };
      
      return res.status(201).json(responseData);
    }
  } catch (error) {
    console.error('💥 === ERREUR LORS DE LA CRÉATION ===');
    console.error('❌ Erreur complète:', error);
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
      
      // Validate file size (max 10MB avant redimensionnement)
      if (imageFile.size > 10 * 1024 * 1024) {
        return res.status(400).json({ 
          message: 'File size too large. Maximum size is 10MB.' 
        });
      }
      
      // Get current service to delete old images
      const currentService = await Service.getById(id);
      if (!currentService) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      // Supprimer les anciennes images si elles existent
      if (currentService.image) {
        const uploadDir = path.join(__dirname, '..', 'public', 'images', 'services');
        deleteServiceImages(currentService.image, uploadDir);
      }
      
      try {
        // Traiter la nouvelle image avec redimensionnement
        const uploadDir = path.join(__dirname, '..', 'public', 'images', 'services');
        const imageResult = await processServiceImage(imageFile, id, uploadDir);
        
        if (imageResult.success) {
          imageName = imageResult.mainImage;
          
          console.log(`Image mise à jour pour le service ${id}:`, {
            original: `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`,
            processed: `${(imageResult.processedImages.main.size / 1024 / 1024).toFixed(2)}MB`,
            dimensions: imageResult.processedImages.main.dimensions
          });
        }
      } catch (imageError) {
        console.error('Erreur traitement image:', imageError);
        return res.status(500).json({ 
          message: 'Error processing image: ' + imageError.message 
        });
      }
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
    
    const response = { message: 'Service updated successfully' };
    
    // Ajouter les infos d'image si une nouvelle a été uploadée
    if (imageName) {
      response.imageUpdated = true;
      response.newImage = imageName;
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Server error while updating service' });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer le service pour supprimer ses images
    const service = await Service.getById(id);
    if (service && service.image) {
      const uploadDir = path.join(__dirname, '..', 'public', 'images', 'services');
      deleteServiceImages(service.image, uploadDir);
    }
    
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

// Get service thumbnail
exports.getServiceThumbnail = async (req, res) => {
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
    
    // Generate thumbnail path from main image name
    const baseName = service.image.replace('_main.', '_thumb.');
    const thumbnailPath = path.join(__dirname, '..', 'public', 'images', 'services', baseName);
    
    // Check if thumbnail exists, fallback to main image
    const imagePath = fs.existsSync(thumbnailPath) ? thumbnailPath : 
                     path.join(__dirname, '..', 'public', 'images', 'services', service.image);
    
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: 'Image file not found on server' });
    }
    
    // Set headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Send thumbnail
    res.sendFile(imagePath);
    
  } catch (error) {
    console.error('Error fetching service thumbnail:', error);
    res.status(500).json({ message: 'Server error while fetching service thumbnail' });
  }
};
