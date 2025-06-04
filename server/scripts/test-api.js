// Script pour tester les endpoints de l'API
const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

// Fonction pour tester un endpoint
async function testEndpoint(endpoint) {
  try {
    console.log(`\nTest de l'endpoint: ${endpoint}`);
    const response = await axios.get(`${API_URL}${endpoint}`);
    console.log('Statut:', response.status);
    console.log('Données:', JSON.stringify(response.data, null, 2).substring(0, 500) + (JSON.stringify(response.data).length > 500 ? '...' : ''));
    return true;
  } catch (error) {
    console.error('Erreur:', error.message);
    if (error.response) {
      console.error('Statut:', error.response.status);
      console.error('Réponse:', error.response.data);
    }
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('=== TEST DES ENDPOINTS API ===');
  
  console.log('\n=== CATÉGORIES ===');
  await testEndpoint('/categories');
  
  console.log('\n=== PRESTATIONS ===');
  await testEndpoint('/services');
  
  console.log('\n=== RENDEZ-VOUS ===');
  await testEndpoint('/appointments');
}

// Exécution du script
main().catch(err => {
  console.error('Erreur non gérée:', err);
  process.exit(1);
}).finally(() => {
  console.log('\nTests terminés');
});
