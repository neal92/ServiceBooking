const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test d'upload d'image pour les services et catégories
async function testImageUpload() {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🧪 Test d\'upload d\'images pour services et catégories');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Créer une catégorie avec image
    console.log('\n📁 Test 1: Création de catégorie avec image');
    
    const categoryData = new FormData();
    categoryData.append('name', 'Test Category');
    categoryData.append('description', 'Catégorie de test avec image');
    categoryData.append('color', 'purple');
    
    // Si vous avez une image de test, décommentez ces lignes :
    // const imagePath = path.join(__dirname, '..', 'public', 'images', 'test-image.jpg');
    // if (fs.existsSync(imagePath)) {
    //   categoryData.append('image', fs.createReadStream(imagePath));
    // }
    
    const categoryResponse = await axios.post(`${baseURL}/categories`, categoryData, {
      headers: {
        ...categoryData.getHeaders()
      }
    });
    
    console.log('✅ Catégorie créée:', categoryResponse.data);
    const categoryId = categoryResponse.data.categoryId;
    
    // Test 2: Créer un service avec image
    console.log('\n🛠️  Test 2: Création de service avec image');
    
    const serviceData = new FormData();
    serviceData.append('name', 'Test Service');
    serviceData.append('description', 'Service de test avec image');
    serviceData.append('price', '50.00');
    serviceData.append('duration', '60');
    serviceData.append('categoryId', categoryId);
    
    // Si vous avez une image de test, décommentez ces lignes :
    // if (fs.existsSync(imagePath)) {
    //   serviceData.append('image', fs.createReadStream(imagePath));
    // }
    
    const serviceResponse = await axios.post(`${baseURL}/services`, serviceData, {
      headers: {
        ...serviceData.getHeaders()
      }
    });
    
    console.log('✅ Service créé:', serviceResponse.data);
    
    // Test 3: Récupérer les données créées
    console.log('\n📋 Test 3: Vérification des données créées');
    
    const categoriesResponse = await axios.get(`${baseURL}/categories`);
    const servicesResponse = await axios.get(`${baseURL}/services`);
    
    console.log('📁 Catégories:', categoriesResponse.data.length);
    console.log('🛠️  Services:', servicesResponse.data.length);
    
    // Afficher la dernière catégorie créée
    const lastCategory = categoriesResponse.data.find(cat => cat.id === categoryId);
    if (lastCategory) {
      console.log('📁 Dernière catégorie:', {
        name: lastCategory.name,
        image: lastCategory.image || 'Aucune image'
      });
    }
    
    console.log('\n✅ Tests terminés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
}

// Instructions pour utiliser ce script
console.log('📝 Instructions:');
console.log('1. Assurez-vous que le serveur est démarré (npm run dev dans /server)');
console.log('2. Pour tester avec de vraies images, placez une image test-image.jpg dans server/public/images/');
console.log('3. Lancez ce script avec: node scripts/test-image-upload.js');
console.log('');

// Vérifier si le serveur est disponible avant de lancer les tests
async function checkServer() {
  try {
    await axios.get('http://localhost:5000');
    console.log('✅ Serveur détecté, lancement des tests...\n');
    await testImageUpload();
  } catch (error) {
    console.log('❌ Serveur non disponible. Démarrez le serveur avec "npm run dev" dans le dossier /server');
  }
}

checkServer();
