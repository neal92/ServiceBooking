const Category = require('../models/category');
const path = require('path');
const fs = require('fs');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.getById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Server error while fetching category' });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
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
      imageName = `category_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${fileExtension}`;
      
      // Ensure upload directory exists
      const uploadDir = path.join(__dirname, '..', 'public', 'images', 'categories');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Save the file
      const uploadPath = path.join(uploadDir, imageName);
      await imageFile.mv(uploadPath);
    }
    
    const categoryId = await Category.create({ 
      name, 
      description, 
      color, 
      image: imageName 
    });
    res.status(201).json({ 
      message: 'Category created successfully', 
      categoryId 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error while creating category' });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
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
      
      // Get current category to delete old image
      const currentCategory = await Category.getById(id);
      if (currentCategory && currentCategory.image) {
        const oldImagePath = path.join(__dirname, '..', 'public', 'images', 'categories', currentCategory.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Generate unique filename
      const fileExtension = path.extname(imageFile.name);
      imageName = `category_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${fileExtension}`;
      
      // Ensure upload directory exists
      const uploadDir = path.join(__dirname, '..', 'public', 'images', 'categories');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Save the file
      const uploadPath = path.join(uploadDir, imageName);
      await imageFile.mv(uploadPath);
    }
    
    const updateData = { name, description, color };
    
    // Only add image to update if a new one was uploaded
    if (imageName) {
      updateData.image = imageName;
    }
    
    const success = await Category.update(id, updateData);
    
    if (!success) {
      return res.status(404).json({ message: 'Category not found or no changes made' });
    }
    
    res.status(200).json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error while updating category' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Category.delete(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error while deleting category' });
  }
};
