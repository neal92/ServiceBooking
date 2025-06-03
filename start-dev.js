// Simple script to run both the server and client in development mode
const { exec } = require('child_process');
const path = require('path');

// Start the server
const server = exec('npm run dev', { cwd: path.join(__dirname, 'server') });

server.stdout.on('data', (data) => {
  console.log(`[SERVER] ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`[SERVER ERROR] ${data}`);
});

// Start the client after a short delay to ensure the server is up
setTimeout(() => {
  const client = exec('npm run dev', { cwd: __dirname });

  client.stdout.on('data', (data) => {
    console.log(`[CLIENT] ${data}`);
  });

  client.stderr.on('data', (data) => {
    console.error(`[CLIENT ERROR] ${data}`);
  });
}, 2000);

console.log('Starting development environment...');
console.log('Press Ctrl+C to stop all processes');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  process.exit();
});
