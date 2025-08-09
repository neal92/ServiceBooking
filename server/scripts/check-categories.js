const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function checkCategories() {
  try {
    console.log('🔍 === VÉRIFICATION DES CATÉGORIES ===\n');
    
    // 1. Connexion
    console.log('1. Connexion...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'pl@gmail.com',
      password: 'Coppelis2024'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // 2. Récupérer les catégories
    console.log('\n2. Récupération des catégories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`, { headers });
    
    console.log('✅ Catégories trouvées:');
    categoriesResponse.data.forEach(category => {
      console.log(`   - ID: ${category.id}, Nom: ${category.name}`);
    });
    
    return categoriesResponse.data;
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return [];
  }
}

// Lancer la vérification
checkCategories();
