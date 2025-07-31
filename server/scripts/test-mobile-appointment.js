// Script pour tester la création d'un rendez-vous depuis une app mobile
const http = require('http');

console.log('Test de création de rendez-vous mobile...');

// Données du rendez-vous à créer (comme si c'était depuis l'app mobile)
const appointmentData = {
  clientName: 'Test Mobile',
  clientEmail: 'test-mobile@example.com',
  clientPhone: '0798765432',
  serviceId: 36, // Service existant
  date: '2025-08-01',
  time: '15:30:00',
  notes: 'Rendez-vous créé depuis app mobile',
  createdBy: 'client'
};

const postData = JSON.stringify(appointmentData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/appointments',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Création du rendez-vous...', appointmentData);

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Réponse de création:', response);
      
      if (res.statusCode === 201) {
        console.log('✅ Rendez-vous créé avec succès!');
        
        // Maintenant, testons la récupération
        setTimeout(() => {
          console.log('\n--- Test de récupération ---');
          testRetrieveAppointments();
        }, 1000);
      } else {
        console.log('❌ Erreur lors de la création:', response);
      }
    } catch (error) {
      console.error('Erreur de parsing:', error);
      console.log('Raw data:', data);
    }
  });
});

req.on('error', (err) => {
  console.error('Erreur de requête:', err.message);
});

req.write(postData);
req.end();

function testRetrieveAppointments() {
  // Test 1: Récupération de tous les rendez-vous
  const allOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/appointments',
    method: 'GET'
  };
  
  const allReq = http.request(allOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const appointments = JSON.parse(data);
        console.log(`Tous les rendez-vous (${appointments.length}):`);
        appointments.forEach(apt => {
          console.log(`- ID: ${apt.id}, Client: ${apt.clientName}, Email: ${apt.clientEmail}, Date: ${apt.date}, Status: ${apt.status}`);
        });
        
        // Test 2: Récupération par email
        setTimeout(() => {
          testRetrieveByEmail();
        }, 500);
      } catch (error) {
        console.error('Erreur parsing all appointments:', error);
      }
    });
  });
  
  allReq.on('error', (err) => {
    console.error('Erreur récupération tous:', err.message);
  });
  
  allReq.end();
}

function testRetrieveByEmail() {
  const emailOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/appointments/client?email=test-mobile@example.com',
    method: 'GET'
  };
  
  const emailReq = http.request(emailOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const appointments = JSON.parse(data);
        console.log(`\nRendez-vous pour test-mobile@example.com (${appointments.length}):`);
        appointments.forEach(apt => {
          console.log(`- ID: ${apt.id}, Client: ${apt.clientName}, Date: ${apt.date}, Status: ${apt.status}`);
        });
        
        if (appointments.length > 0) {
          console.log('\n✅ SUCCESS: Le rendez-vous mobile est visible via l\'API web!');
        } else {
          console.log('\n❌ PROBLÈME: Le rendez-vous mobile n\'est pas visible via l\'API web');
        }
      } catch (error) {
        console.error('Erreur parsing by email:', error);
      }
    });
  });
  
  emailReq.on('error', (err) => {
    console.error('Erreur récupération par email:', err.message);
  });
  
  emailReq.end();
}
