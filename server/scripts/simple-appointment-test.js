// Simple script to fetch all appointments
const http = require('http');

console.log('Starting appointment test...');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/appointments',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

// Log the complete options
console.log('Request options:', options);

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      if (data) {
        const appointments = JSON.parse(data);
        console.log(`Retrieved ${appointments.length} appointments`);
        console.log(JSON.stringify(appointments, null, 2));
      } else {
        console.log('No data received');
      }
    } catch (error) {
      console.error('Error parsing data:', error);
      console.log('Raw data received:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error making request:', error.message);
});

req.end();

console.log('Request sent, waiting for response...');
