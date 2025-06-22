const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get JWT secret from environment variable or use a default (for development only)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

console.log('Auth middleware loaded. JWT_SECRET is', JWT_SECRET ? 'configured' : 'NOT configured');

exports.authenticate = (req, res, next) => {
  console.log('Authentication middleware called');
  
  // Get token from header
  const authHeader = req.header('Authorization');
  console.log('Authorization header:', authHeader ? 'present' : 'not present');
  
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    console.log('Authentication failed: No token provided');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  try {
    console.log('Verifying JWT token');
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verification successful:', decoded);
    console.log('User ID from token:', decoded.userId);
    console.log('User email from token:', decoded.email || 'not present');
    req.user = decoded; // Add user info to request
    next();  } catch (error) {
    console.error('Authentication error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      console.error('Invalid token signature. Check JWT_SECRET configuration.');
      res.status(401).json({ message: 'Invalid token.', code: 'INVALID_TOKEN' });
    } else if (error.name === 'TokenExpiredError') {
      console.error('Token has expired');
      res.status(401).json({ message: 'Token has expired.', code: 'TOKEN_EXPIRED' });
    } else {
      res.status(401).json({ message: 'Authentication failed.', code: 'AUTH_FAILED' });
    }
  }
};

// Optional middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};
