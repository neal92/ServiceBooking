const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test du système de notifications
async function testNotifications() {
  try {
    console.log('🔔 === TEST DU SYSTÈME DE NOTIFICATIONS ===\n');
    
    // 1. Connexion (pour avoir un token)
    console.log('1. Connexion...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com', // Essayons avec cet email
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // 2. Créer un service pour générer des notifications
    console.log('\n2. Création d\'un service...');
    const serviceResponse = await axios.post(`${BASE_URL}/services`, {
      name: 'Service Test Notification',
      description: 'Service de test pour les notifications',
      price: 50,
      duration: 60,
      categoryId: 1
    }, { headers });
    
    console.log('✅ Service créé:', serviceResponse.data.message);
    const serviceId = serviceResponse.data.serviceId;
    
    // 3. Attendre un peu pour que les notifications se créent
    console.log('\n3. Attente des notifications...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Récupérer les notifications
    console.log('\n4. Récupération des notifications...');
    const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, { headers });
    
    console.log('✅ Notifications récupérées:');
    console.log(`   - Total: ${notificationsResponse.data.notifications.length}`);
    console.log(`   - Non lues: ${notificationsResponse.data.unreadCount}`);
    
    if (notificationsResponse.data.notifications.length > 0) {
      const lastNotification = notificationsResponse.data.notifications[0];
      console.log('   - Dernière notification:');
      console.log(`     Type: ${lastNotification.type}`);
      console.log(`     Titre: ${lastNotification.title}`);
      console.log(`     Message: ${lastNotification.message}`);
    }
    
    // 5. Mettre à jour le service
    console.log('\n5. Mise à jour du service...');
    await axios.put(`${BASE_URL}/services/${serviceId}`, {
      name: 'Service Test Notification MODIFIÉ',
      description: 'Service de test modifié',
      price: 75,
      duration: 90,
      categoryId: 1
    }, { headers });
    
    console.log('✅ Service modifié');
    
    // 6. Supprimer le service
    console.log('\n6. Suppression du service...');
    await axios.delete(`${BASE_URL}/services/${serviceId}`, { headers });
    
    console.log('✅ Service supprimé');
    
    // 7. Vérifier les nouvelles notifications
    console.log('\n7. Vérification des nouvelles notifications...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const finalNotifications = await axios.get(`${BASE_URL}/notifications`, { headers });
    console.log('✅ Notifications finales:');
    console.log(`   - Total: ${finalNotifications.data.notifications.length}`);
    console.log(`   - Non lues: ${finalNotifications.data.unreadCount}`);
    
    console.log('\n🎉 === TEST TERMINÉ AVEC SUCCÈS ===');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
}

// Lancer le test
testNotifications();
