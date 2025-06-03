const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const appointmentsRoutes = require('./routes/appointments');
const servicesRoutes = require('./routes/services');
const categoriesRoutes = require('./routes/categories');

app.use('/api/appointments', appointmentsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/categories', categoriesRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('ServiceBooking API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
