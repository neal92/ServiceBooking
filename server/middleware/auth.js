const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get JWT secret from environment variable or use a default (for development only)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

console.log('Auth middleware loaded. JWT_SECRET is', JWT_SECRET ? 'configured' : 'NOT configured');
console.log('JWT_SECRET first 5 chars:', JWT_SECRET.substring(0, 5) + '...');

exports.authenticate = (req, res, next) => {
  console.log('Authentication middleware called');
  
  // Get token from header (plus robuste)
  const authHeader = req.header('Authorization') || req.headers['authorization']; // Essayer deux façons d'accéder aux headers
  console.log('Authorization header:', authHeader);
  
  // Format attendu: "Bearer TOKEN" - analyse plus robuste
  const token = authHeader && authHeader.split(' ').length > 1 ? authHeader.split(' ')[1] : authHeader;
  
  if (!token) {
    console.log('Authentication failed: No token provided');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  try {
    console.log('Verifying JWT token');
    // Dump first few characters of token for debugging
    console.log('Token (first 15 chars):', token.substring(0, 15) + '...');
    console.log('JWT_SECRET first 5 chars used for verification:', JWT_SECRET.substring(0, 5) + '...');
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verification successful, decoded payload:', JSON.stringify(decoded, null, 2));
    console.log('User ID from token:', decoded.id || 'not present');
    console.log('User email from token:', decoded.email || 'not present');
    console.log('Token issuing time:', decoded.iat ? new Date(decoded.iat * 1000).toISOString() : 'not present');
    console.log('Token expiry time:', decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'not present');
    
    // Si l'ID est manquant dans le token, renvoyer une erreur
    if (!decoded.id) {
      console.error('Token missing required field: id');
      return res.status(401).json({ 
        message: 'Invalid token format: missing user ID.', 
        code: 'INVALID_TOKEN_FORMAT' 
      });
    }
    
    req.user = decoded; // Add user info to request
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    console.error('Error name:', error.name);
    console.error('Full error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      console.error('Invalid token signature. Check JWT_SECRET configuration.');
      res.status(401).json({ 
        message: 'Invalid token signature. Please log in again.', 
        code: 'INVALID_TOKEN',
        details: error.message 
      });
    } else if (error.name === 'TokenExpiredError') {
      console.error('Token has expired');
      res.status(401).json({ 
        message: 'Your session has expired. Please log in again.', 
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt
      });
    } else {
      res.status(401).json({ 
        message: 'Authentication failed.', 
        code: 'AUTH_FAILED',
        details: error.message 
      });
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
