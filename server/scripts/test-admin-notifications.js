const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testNotificationsAdmin() {
  try {
    console.log('🔔 === TEST NOTIFICATIONS ADMIN ===\n');
    
    // 1. Connexion admin
    console.log('1. Connexion admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'Coppelis2024'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion admin réussie');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // 2. Test simple de récupération des notifications
    console.log('\n2. Test récupération notifications...');
    try {
      const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, { headers });
      console.log('✅ Notifications récupérées avec succès');
      console.log('Nombre:', notificationsResponse.data.notifications.length);
      console.log('Non lues:', notificationsResponse.data.unreadCount);
    } catch (error) {
      console.error('❌ Erreur notifications:', error.response?.data || error.message);
    }
    
    // 3. Créer un service pour générer des notifications
    console.log('\n3. Création d\'un service...');
    try {
      const serviceData = {
        name: `Test Admin Service ${Date.now()}`,
        description: 'Service créé par admin pour tester les notifications',
        price: 50,
        duration: 60,
        categoryId: 21
      };
      
      const createResponse = await axios.post(`${BASE_URL}/services`, serviceData, { headers });
      console.log('✅ Service créé:', createResponse.data.message);
      console.log('ID service:', createResponse.data.serviceId);
      
      // Attendre un peu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérifier les notifications
      const finalNotifications = await axios.get(`${BASE_URL}/notifications`, { headers });
      console.log('\n📊 Notifications après création:');
      console.log('Total:', finalNotifications.data.notifications.length);
      console.log('Non lues:', finalNotifications.data.unreadCount);
      
      if (finalNotifications.data.notifications.length > 0) {
        console.log('\n📋 Dernières notifications:');
        finalNotifications.data.notifications.slice(0, 3).forEach((notif, i) => {
          console.log(`${i+1}. ${notif.title}: ${notif.message}`);
        });
      }
      
    } catch (serviceError) {
      console.error('❌ Erreur création service:', serviceError.response?.data || serviceError.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.response?.data || error.message);
  }
}

testNotificationsAdmin();
