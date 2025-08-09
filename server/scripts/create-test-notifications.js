const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Script pour créer des notifications de test
async function createTestNotifications() {
  try {
    console.log('🔔 === CRÉATION DE NOTIFICATIONS DE TEST ===\n');
    
    // 1. Essayer de se connecter avec un utilisateur existant ou en créer un
    console.log('1. Connexion...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'pl@gmail.com',
      password: 'Coppelis2024'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // 2. Créer quelques services pour générer des notifications
    console.log('\n2. Création de services de test...');
    
    const testServices = [
      {
        name: 'Service Test Notification 1',
        description: 'Premier service de test pour notifications',
        price: 50,
        duration: 60,
        categoryId: 21 // Catégorie "Femmee"
      },
      {
        name: 'Service Test Notification 2',
        description: 'Deuxième service de test',
        price: 75,
        duration: 90,
        categoryId: 22 // Catégorie "Homme"
      }
    ];
    
    for (const service of testServices) {
      const response = await axios.post(`${BASE_URL}/services`, service, { headers });
      console.log(`✅ Service créé: ${service.name} (ID: ${response.data.serviceId})`);
    }
    
    console.log('\n3. Attente des notifications...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. Vérifier les notifications créées
    const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, { headers });
    
    console.log('\n✅ Notifications créées:');
    console.log(`   - Total: ${notificationsResponse.data.notifications.length}`);
    console.log(`   - Non lues: ${notificationsResponse.data.unreadCount}`);
    
    if (notificationsResponse.data.notifications.length > 0) {
      console.log('\n📋 Détail des notifications:');
      notificationsResponse.data.notifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.title} - ${notif.message}`);
      });
    }
    
    console.log('\n🎉 === NOTIFICATIONS DE TEST CRÉÉES ===');
    console.log('Vous pouvez maintenant tester l\'interface frontend !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

// Lancer le script
createTestNotifications();
