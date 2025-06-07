const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
require('dotenv').config();

// Log environment variables (without sensitive data)
console.log('Environment variables loaded:');
console.log('- PORT:', process.env.PORT || '5000 (default)');
console.log('- DB_HOST:', process.env.DB_HOST || 'localhost (default)');
console.log('- DB_USER:', process.env.DB_USER || 'root (default)');
console.log('- DB_NAME:', process.env.DB_NAME || 'servicebooking (default)');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'configured' : 'NOT CONFIGURED (IMPORTANT)');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use('/uploads', express.static('public/uploads'));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
const appointmentsRoutes = require('./routes/appointments');
const servicesRoutes = require('./routes/services');
const categoriesRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');

console.log('Setting up API routes');
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/auth', authRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('ServiceBooking API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Une erreur est survenue sur le serveur.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`========================================`);
});
