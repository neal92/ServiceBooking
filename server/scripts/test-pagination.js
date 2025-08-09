// Test script pour la pagination des utilisateurs
const axios = require('axios');

// Base URL pour l'API
const API_URL = 'http://localhost:5000/api';

// Fonction pour obtenir un token JWT admin
async function getAdminToken() {
  try {
    console.log('🔐 Connexion admin...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    console.log('✅ Connexion admin réussie');
    return response.data.token;
  } catch (error) {
    console.error('❌ Erreur connexion admin:', error.response?.data?.message || error.message);
    return null;
  }
}

// Fonction pour tester la pagination
async function testPagination(token) {
  try {
    console.log('\n📄 === TEST PAGINATION DES UTILISATEURS ===\n');

    // Test 1: Première page (5 premiers utilisateurs)
    console.log('📝 TEST 1: Première page (5 utilisateurs)');
    const page1Response = await axios.get(`${API_URL}/auth/users/paginated?page=1&limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Réponse page 1:');
    console.log(`👥 Utilisateurs: ${page1Response.data.users.length}`);
    console.log(`📊 Total: ${page1Response.data.pagination.total}`);
    console.log(`📄 Page actuelle: ${page1Response.data.pagination.currentPage}/${page1Response.data.pagination.totalPages}`);
    console.log(`🔄 Y a-t-il plus d'utilisateurs?: ${page1Response.data.pagination.hasMore ? 'OUI' : 'NON'}`);
    
    // Afficher les utilisateurs de la première page
    page1Response.data.users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });

    // Test 2: Deuxième page si il y a plus d'utilisateurs
    if (page1Response.data.pagination.hasMore) {
      console.log('\n📝 TEST 2: Deuxième page (5 utilisateurs suivants)');
      const page2Response = await axios.get(`${API_URL}/auth/users/paginated?page=2&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Réponse page 2:');
      console.log(`👥 Utilisateurs: ${page2Response.data.users.length}`);
      console.log(`📄 Page actuelle: ${page2Response.data.pagination.currentPage}/${page2Response.data.pagination.totalPages}`);
      console.log(`🔄 Y a-t-il plus d'utilisateurs?: ${page2Response.data.pagination.hasMore ? 'OUI' : 'NON'}`);
      
      // Afficher les utilisateurs de la deuxième page
      page2Response.data.users.forEach((user, index) => {
        console.log(`  ${index + 6}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
      });
    } else {
      console.log('\n📝 TEST 2: Pas de deuxième page (moins de 6 utilisateurs au total)');
    }

    // Test 3: Limite personnalisée (3 utilisateurs par page)
    console.log('\n📝 TEST 3: Limite personnalisée (3 utilisateurs par page)');
    const customLimitResponse = await axios.get(`${API_URL}/auth/users/paginated?page=1&limit=3`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Réponse avec limite de 3:');
    console.log(`👥 Utilisateurs: ${customLimitResponse.data.users.length}`);
    console.log(`📄 Pages totales: ${customLimitResponse.data.pagination.totalPages}`);
    console.log(`🔄 Y a-t-il plus d'utilisateurs?: ${customLimitResponse.data.pagination.hasMore ? 'OUI' : 'NON'}`);

    return page1Response.data;
  } catch (error) {
    console.error('❌ Erreur lors du test de pagination:', error.response?.status, error.response?.data?.message || error.message);
    return null;
  }
}

// Fonction pour comparer avec la route normale (tous les utilisateurs)
async function compareWithFullList(token) {
  try {
    console.log('\n🔍 === COMPARAISON AVEC LA LISTE COMPLÈTE ===\n');
    
    const fullListResponse = await axios.get(`${API_URL}/auth/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`📋 Route normale (/users): ${fullListResponse.data.users.length} utilisateurs`);
    
    const paginatedResponse = await axios.get(`${API_URL}/auth/users/paginated?page=1&limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`📄 Route paginée (/users/paginated): ${paginatedResponse.data.users.length} utilisateurs (page 1)`);
    console.log(`📊 Total selon pagination: ${paginatedResponse.data.pagination.total} utilisateurs`);
    
    if (fullListResponse.data.users.length === paginatedResponse.data.pagination.total) {
      console.log('✅ Les totaux correspondent!');
    } else {
      console.log('❌ Les totaux ne correspondent pas!');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la comparaison:', error.response?.data?.message || error.message);
  }
}

// Fonction principale
async function runTests() {
  console.log('🚀 === TEST DE LA PAGINATION DES UTILISATEURS ===');
  
  const adminToken = await getAdminToken();
  if (!adminToken) {
    console.log('❌ Impossible de continuer sans token admin');
    return;
  }
  
  await testPagination(adminToken);
  await compareWithFullList(adminToken);
  
  console.log('\n🏁 Tests terminés!');
  console.log('\n💡 Pour utiliser la pagination dans votre frontend:');
  console.log('   - Première page: GET /api/auth/users/paginated?page=1&limit=5');
  console.log('   - Page suivante: GET /api/auth/users/paginated?page=2&limit=5');
  console.log('   - Vérifiez hasMore pour afficher le bouton "Voir plus"');
}

// Exécuter les tests
runTests().catch(console.error);
