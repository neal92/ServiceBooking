const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

// Get JWT secret from environment variable or use a default (for development only)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRATION = '24h';

// Register a new user
exports.register = async (req, res) => {
  console.log('Attempting to register new user');
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors during registration:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    console.log(`Registration attempt for email: ${email}`);

    // Check if user already exists
    console.log('Checking if user already exists');
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log(`Registration failed: User already exists with email ${email}`);
      return res.status(400).json({ message: 'Cette adresse email est déjà utilisée.' });
    }

    // Create user
    console.log('Creating new user');
    const { userId } = await User.create({ name, email, password });
    console.log(`User created with ID: ${userId}`);

    // Generate JWT
    console.log('Generating JWT token');
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

    // Return user info (without password) and token
    const user = await User.findById(userId);
    console.log('User registered successfully');
    
    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error details:', error);
    // Log more specific information based on error type
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('Registration failed: Duplicate email entry');
      return res.status(400).json({ message: 'Cette adresse email est déjà utilisée.' });
    } else if (error.sqlMessage) {
      console.error('SQL error during registration:', error.sqlMessage);
    } else {
      console.error('Unexpected error during registration:', error.message);
    }
    res.status(500).json({ message: 'Erreur lors de l\'inscription. Veuillez réessayer.' });
  }
};

// Login user
exports.login = async (req, res) => {
  console.log('Login attempt received');
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors during login:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    // Find user by email
    console.log('Looking up user by email');
    const user = await User.findByEmail(email);
    if (!user) {
      console.log(`Login failed: No user found with email ${email}`);
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Verify password
    console.log('Verifying password');
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for user ${email}`);
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Generate JWT
    console.log('Generating JWT token');
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

    // Return user info (without password) and token
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    console.log(`User ${email} logged in successfully`);
    res.json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error details:', error);
    // Log more specific information
    if (error.sqlMessage) {
      console.error('SQL error during login:', error.sqlMessage);
    } else {
      console.error('Unexpected error during login:', error.message);
    }
    res.status(500).json({ message: 'Erreur lors de la connexion. Veuillez réessayer.' });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error fetching user data' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Check if email exists and belongs to another user
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== req.user.userId) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const success = await User.update(req.user.userId, { name, email });
    
    if (!success) {
      return res.status(404).json({ message: 'User not found or no changes made' });
    }

    const updatedUser = await User.findById(req.user.userId);
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user
    const user = await User.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await User.verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Change password
    await User.changePassword(req.user.userId, newPassword);
    
    res.json({ message: 'Password changed successfully' });  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarFile = req.files.avatar;
    const fileExtension = avatarFile.name.split('.').pop();
    const fileName = `avatar-${req.user.userId}-${Date.now()}.${fileExtension}`;
    const uploadPath = path.join(__dirname, '..', 'public', 'uploads', fileName);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Move the file
    await avatarFile.mv(uploadPath);

    // Update user's avatar in database
    await User.update(req.user.userId, { avatar: `/uploads/${fileName}` });

    res.json({ 
      message: 'Avatar uploaded successfully',
      avatarUrl: `/uploads/${fileName}`
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Server error uploading avatar' });
  }
};
