const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testNotifications() {
  try {
    console.log('🔐 Test de connexion admin...');
    
    // Se connecter en tant qu'admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    
    console.log('✅ Connexion réussie');
    console.log('👤 User ID:', userId);
    console.log('🎫 Token:', token.substring(0, 20) + '...');

    // Tester la récupération des notifications avec debug détaillé
    console.log('\n📧 Test de récupération des notifications...');
    
    const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Statut de la réponse:', notificationsResponse.status);
    console.log('📊 Nombre de notifications:', notificationsResponse.data.length);
    
    if (notificationsResponse.data.length > 0) {
      console.log('\n📝 Premières notifications:');
      notificationsResponse.data.slice(0, 3).forEach((notif, index) => {
        console.log(`${index + 1}. Type: ${notif.type} | Titre: ${notif.title} | Lu: ${notif.is_read ? 'Oui' : 'Non'}`);
      });
    } else {
      console.log('❌ Aucune notification trouvée');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('📊 Statut:', error.response.status);
      console.error('📄 Données:', error.response.data);
    }
  }
}

testNotifications();
