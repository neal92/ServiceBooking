// Test script pour la route API des utilisateurs
const axios = require('axios');

// Base URL pour l'API
const API_URL = 'http://localhost:5000/api';

// Fonction pour obtenir un token JWT (avec des identifiants admin)
async function getAdminToken() {
  try {
    console.log('🔐 Tentative de connexion admin...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    console.log('✅ Connexion admin réussie');
    return response.data.token;
  } catch (error) {
    console.error('❌ Erreur lors de la connexion admin:', error.response?.data?.message || error.message);
    return null;
  }
}

// Fonction pour obtenir un token d'utilisateur normal
async function getUserToken() {
  try {
    console.log('🔐 Tentative de connexion utilisateur...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'user@example.com',
      password: 'password123'
    });
    console.log('✅ Connexion utilisateur réussie');
    return response.data.token;
  } catch (error) {
    console.error('❌ Erreur lors de la connexion utilisateur:', error.response?.data?.message || error.message);
    return null;
  }
}

// Fonction pour tester la récupération de tous les utilisateurs
async function testGetAllUsers(token, userType) {
  try {
    console.log(`\n📋 Test récupération des utilisateurs en tant que ${userType}...`);
    const response = await axios.get(`${API_URL}/auth/users`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Succès! Réponse reçue:');
    console.log(`📊 Nombre d'utilisateurs: ${response.data.total}`);
    console.log('👥 Utilisateurs:');
    
    response.data.users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Rôle: ${user.role}`);
    });
    
    return response.data;
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération des utilisateurs (${userType}):`, 
      error.response?.status, 
      error.response?.data?.message || error.message
    );
    return null;
  }
}

// Fonction principale pour exécuter les tests
async function runTests() {
  console.log('🚀 === TEST DE LA ROUTE API /auth/users ===\n');
  
  // Test 1: Avec un token admin
  console.log('📝 TEST 1: Accès admin');
  const adminToken = await getAdminToken();
  if (adminToken) {
    await testGetAllUsers(adminToken, 'admin');
  }
  
  // Test 2: Avec un token utilisateur normal (devrait échouer)
  console.log('\n📝 TEST 2: Accès utilisateur normal (devrait être refusé)');
  const userToken = await getUserToken();
  if (userToken) {
    await testGetAllUsers(userToken, 'utilisateur');
  }
  
  // Test 3: Sans token (devrait échouer)
  console.log('\n📝 TEST 3: Accès sans authentification (devrait être refusé)');
  await testGetAllUsers(null, 'anonyme');
  
  console.log('\n🏁 Tests terminés!');
}

// Exécuter les tests
runTests().catch(console.error);
