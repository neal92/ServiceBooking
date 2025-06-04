// Test script for appointments API
const axios = require('axios');

// Base URL for API
const API_URL = 'http://localhost:5000/api';

// Function to get JWT token (adjust credentials as needed)
async function getToken() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    return response.data.token;
  } catch (error) {
    console.error('Error getting token:', error.message);
    return null;
  }
}

// Function to get all appointments
async function getAllAppointments(token) {
  try {
    const response = await axios.get(`${API_URL}/appointments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', error.message);
    return [];
  }
}

// Main function to run the tests
async function runTests() {
  console.log('Testing Appointments API...');
  
  // Get token
  const token = await getToken();
  if (!token) {
    console.error('Authentication failed. Cannot proceed with tests.');
    return;
  }
  
  console.log('Authentication successful. Testing appointments endpoint...');
  
  // Test get all appointments
  const appointments = await getAllAppointments(token);
  console.log(`Found ${appointments.length} appointment(s):`);
  
  // Print detailed information about each appointment
  appointments.forEach((appointment, index) => {
    console.log(`\nAppointment ${index + 1}:`);
    console.log(JSON.stringify(appointment, null, 2));
  });
}

// Run the tests
runTests().catch(console.error);
