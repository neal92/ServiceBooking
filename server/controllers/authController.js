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

    const { firstName, lastName, email, password } = req.body;
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
    const { userId } = await User.create({ firstName, lastName, email, password });
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
    }    // Generate JWT
    console.log('Generating JWT token');
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });// Return user info (without password) and token
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isPresetAvatar: user.isPresetAvatar
    };

    console.log(`User ${email} logged in successfully`);
    res.json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error details:', error);
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
    const { firstName, lastName, email, avatar, isPresetAvatar } = req.body;
    console.log('Updating profile with data:', { firstName, lastName, email, avatar, isPresetAvatar });
    
    // Check if email exists and belongs to another user
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== req.user.userId) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const success = await User.update(req.user.userId, { firstName, lastName, email, avatar, isPresetAvatar });
    
    if (!success) {
      return res.status(404).json({ message: 'User not found or no changes made' });
    }

    const updatedUser = await User.findById(req.user.userId);
    console.log('Profile updated successfully:', { id: updatedUser.id, avatar: updatedUser.avatar ? 'exists' : 'null' });
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    console.log('Attempting to change password');
    console.log('User info from token:', req.user);
    const { currentPassword, newPassword } = req.body;
      // Find user - first try by email if available
    let user;
    if (req.user.email) {
      console.log('Finding user by email:', req.user.email);
      user = await User.findByEmail(req.user.email);
    }
    
    // If user not found by email or email not in token, try by ID
    if (!user) {
      console.log('Finding user by ID:', req.user.userId);
      // Inclure le mot de passe pour la vérification
      user = await User.findById(req.user.userId, true);
    }
    
    if (!user) {
      console.log('User not found for password change. Token info:', req.user);
      return res.status(404).json({ message: 'User not found' });
    }
      console.log('User found:', { id: user.id, email: user.email, hasPassword: !!user.password });

    // Vérifier que le mot de passe est bien présent dans l'objet utilisateur
    if (!user.password) {
      console.error('User record found but password field is missing');
      return res.status(500).json({ message: 'Erreur serveur: informations utilisateur incomplètes' });
    }    // Verify current password
    const isPasswordValid = await User.verifyPassword(currentPassword, user.password);
    console.log('Password verification result:', isPasswordValid ? 'valid' : 'invalid');
    
    if (!isPasswordValid) {
      console.log('User provided incorrect current password');
      return res.status(401).json({ message: 'Current password is incorrect', code: 'INVALID_CURRENT_PASSWORD' });
    }

    // Change password
    await User.changePassword(user.id, newPassword);
    console.log('Password changed successfully for user:', user.id);
    
    res.json({ message: 'Password changed successfully' });  } catch (error) {
    console.error('Change password error:', error);
    
    // Gérer les différents types d'erreurs possibles
    if (error.message && error.message.includes('data and hash arguments required')) {
      return res.status(400).json({ 
        message: 'Données de mot de passe invalides', 
        code: 'INVALID_PASSWORD_DATA'
      });
    } else if (error.code === 'ER_BAD_NULL_ERROR') {
      return res.status(400).json({ 
        message: 'Mot de passe manquant', 
        code: 'MISSING_PASSWORD_DATA'
      });
    } else {
      return res.status(500).json({ 
        message: 'Server error changing password', 
        code: 'SERVER_ERROR'
      });
    }
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  console.log('uploadAvatar - Début de la requête');
  try {
    if (!req.files || !req.files.avatar) {
      console.error('uploadAvatar - Aucun fichier trouvé dans la requête');
      return res.status(400).json({ message: 'No file uploaded' });
    }    const avatarFile = req.files.avatar;
    // Vérifier que req.body existe
    const isPredefined = req.body && req.body.isPredefined === 'true';
    
    console.log('uploadAvatar - Fichier reçu:', {
      name: avatarFile.name,
      type: avatarFile.mimetype,
      size: avatarFile.size,
      isPredefined: isPredefined
    });
    
    let fileName;
    let uploadPath;
    
    // Si c'est un avatar prédéfini, pas besoin de sauvegarder le fichier
    if (isPredefined) {
      fileName = avatarFile.name;
      console.log('uploadAvatar - Utilisation de l\'avatar prédéfini:', fileName);
    } else {
      // Pour les avatars personnalisés
      fileName = `avatar-${req.user.userId}-${Date.now()}.${avatarFile.name.split('.').pop()}`;
      console.log('uploadAvatar - Nom de fichier généré:', fileName);
      
      // Créer le répertoire uploads s'il n'existe pas
      const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        console.log('uploadAvatar - Création du répertoire uploads:', uploadsDir);
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Sauvegarder le fichier uniquement si ce n'est pas un avatar prédéfini
      uploadPath = path.join(__dirname, '..', 'public', 'uploads', fileName);
      console.log('uploadAvatar - Déplacement du fichier vers:', uploadPath);
      try {
        await avatarFile.mv(uploadPath);
        console.log('uploadAvatar - Fichier déplacé avec succès');
      } catch (err) {
        console.error('uploadAvatar - Erreur lors du déplacement du fichier:', err);
        throw err;
      }
    }// Update user's avatar in database    console.log('uploadAvatar - Mise à jour de l\'avatar dans la base de données');
    let avatarUrl;
    
    if (isPredefined) {
      // Pour les avatars prédéfinis, utiliser directement le chemin
      avatarUrl = `/avatars/${fileName}`;
      console.log('uploadAvatar - Utilisation de l\'avatar prédéfini:', avatarUrl);
    } else {
      // Pour les avatars personnalisés
      avatarUrl = `/uploads/${fileName}`;
      console.log('uploadAvatar - Utilisation de l\'avatar personnalisé:', avatarUrl);
    }    try {
      await User.update(req.user.userId, { 
        avatar: avatarUrl,
        isPresetAvatar: isPredefined
      });
      console.log('uploadAvatar - Base de données mise à jour avec succès');
    } catch (err) {
      console.error('uploadAvatar - Erreur lors de la mise à jour de la base de données:', err);
      throw err;
    }

    const response = { 
      message: 'Avatar uploaded successfully',
      avatarUrl
    };
    console.log('uploadAvatar - Réponse envoyée:', response);
    res.json(response);
  } catch (error) {
    console.error('uploadAvatar - Erreur:', error);
    res.status(500).json({ message: 'Server error uploading avatar' });
  }
};
