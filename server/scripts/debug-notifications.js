const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function debugNotifications() {
  try {
    console.log('🔍 === DEBUG NOTIFICATIONS ===\n');
    
    // 1. Connexion
    console.log('1. Connexion avec pl@gmail.com...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'pl@gmail.com',
      password: 'Coppelis2024'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');
    console.log('Token:', token.substring(0, 20) + '...');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // 2. Vérifier les notifications existantes
    console.log('\n2. Vérification des notifications...');
    try {
      const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, { headers });
      console.log('✅ Récupération des notifications réussie');
      console.log('Nombre de notifications:', notificationsResponse.data.notifications.length);
      console.log('Notifications non lues:', notificationsResponse.data.unreadCount);
      
      if (notificationsResponse.data.notifications.length > 0) {
        console.log('\n📋 Détail des 5 dernières notifications:');
        notificationsResponse.data.notifications.slice(0, 5).forEach((notif, index) => {
          console.log(`   ${index + 1}. [${notif.type}] ${notif.title}`);
          console.log(`      Message: ${notif.message}`);
          console.log(`      Lu: ${notif.is_read ? 'Oui' : 'Non'}`);
          console.log(`      Créé le: ${notif.created_at}`);
          console.log('      ---');
        });
      } else {
        console.log('❌ Aucune notification trouvée');
      }
    } catch (notifError) {
      console.error('❌ Erreur lors de la récupération des notifications:');
      console.error('Status:', notifError.response?.status);
      console.error('Message:', notifError.response?.data?.message || notifError.message);
      console.error('Headers de réponse:', notifError.response?.headers);
    }
    
    // 3. Vérifier les services récents
    console.log('\n3. Vérification des services récents...');
    try {
      const servicesResponse = await axios.get(`${BASE_URL}/services`, { headers });
      console.log('✅ Récupération des services réussie');
      console.log('Nombre de services:', servicesResponse.data.length);
      
      if (servicesResponse.data.length > 0) {
        console.log('\n🛠️ Les 3 services les plus récents:');
        const recentServices = servicesResponse.data
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 3);
          
        recentServices.forEach((service, index) => {
          console.log(`   ${index + 1}. ${service.name} (ID: ${service.id})`);
          console.log(`      Créé le: ${service.createdAt || 'Date inconnue'}`);
        });
      }
    } catch (serviceError) {
      console.error('❌ Erreur lors de la récupération des services:', serviceError.message);
    }
    
    // 4. Vérifier tous les utilisateurs (pour voir si les notifications sont créées pour d'autres)
    console.log('\n4. Test de création manuelle de notification...');
    try {
      const testService = {
        name: 'Service Test Debug Notification',
        description: 'Test pour vérifier les notifications',
        price: 25,
        duration: 30,
        categoryId: 21
      };
      
      const createResponse = await axios.post(`${BASE_URL}/services`, testService, { headers });
      console.log('✅ Service de test créé:', createResponse.data.message);
      console.log('ID du service:', createResponse.data.serviceId);
      
      // Attendre un peu
      console.log('\n⏳ Attente de 2 secondes...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Vérifier à nouveau les notifications
      const finalNotifications = await axios.get(`${BASE_URL}/notifications`, { headers });
      console.log('\n📊 Après création du service:');
      console.log('Nombre de notifications:', finalNotifications.data.notifications.length);
      console.log('Notifications non lues:', finalNotifications.data.unreadCount);
      
    } catch (createError) {
      console.error('❌ Erreur lors de la création du service de test:', createError.response?.data || createError.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.response?.data || error.message);
  }
}

// Lancer le debug
debugNotifications();
