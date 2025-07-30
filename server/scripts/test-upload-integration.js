#!/usr/bin/env node

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';

console.log('🧪 Test des fonctionnalités d\'upload d\'images');
console.log('='*50);

async function testServer() {
  try {
    const response = await axios.get('http://localhost:5000');
    console.log('✅ Serveur accessible');
    return true;
  } catch (error) {
    console.log('❌ Serveur non accessible. Assurez-vous qu\'il est démarré.');
    return false;
  }
}

async function testServiceCreation() {
  console.log('\n📋 Test 1: Création de service sans image');
  
  try {
    const formData = new FormData();
    formData.append('name', 'Service Test');
    formData.append('description', 'Service de test pour validation');
    formData.append('price', '25.00');
    formData.append('duration', '30');
    formData.append('categoryId', '1');
    
    const response = await axios.post(`${API_BASE}/services`, formData, {
      headers: formData.getHeaders()
    });
    
    console.log('✅ Service créé avec succès:', response.data);
    return response.data.serviceId;
  } catch (error) {
    console.log('❌ Erreur lors de la création du service:', error.response?.data || error.message);
    return null;
  }
}

async function testCategoryCreation() {
  console.log('\n📁 Test 2: Création de catégorie sans image');
  
  try {
    const formData = new FormData();
    formData.append('name', 'Catégorie Test');
    formData.append('description', 'Catégorie de test pour validation');
    formData.append('color', 'purple');
    
    const response = await axios.post(`${API_BASE}/categories`, formData, {
      headers: formData.getHeaders()
    });
    
    console.log('✅ Catégorie créée avec succès:', response.data);
    return response.data.categoryId;
  } catch (error) {
    console.log('❌ Erreur lors de la création de la catégorie:', error.response?.data || error.message);
    return null;
  }
}

async function testServiceWithImage() {
  console.log('\n🖼️  Test 3: Création de service avec image (si disponible)');
  
  // Chercher une image de test
  const possibleImages = [
    path.join(__dirname, '..', 'public', 'images', 'test.jpg'),
    path.join(__dirname, '..', 'public', 'images', 'test.png'),
    path.join(__dirname, '..', 'public', 'avatars', 'avatar1.svg')
  ];
  
  let testImagePath = null;
  for (const imagePath of possibleImages) {
    if (fs.existsSync(imagePath)) {
      testImagePath = imagePath;
      break;
    }
  }
  
  if (!testImagePath) {
    console.log('⚠️  Aucune image de test trouvée. Création sans image.');
    return await testServiceCreation();
  }
  
  try {
    const formData = new FormData();
    formData.append('name', 'Service avec Image');
    formData.append('description', 'Service de test avec upload d\'image');
    formData.append('price', '45.00');
    formData.append('duration', '60');
    formData.append('categoryId', '1');
    formData.append('image', fs.createReadStream(testImagePath));
    
    const response = await axios.post(`${API_BASE}/services`, formData, {
      headers: formData.getHeaders()
    });
    
    console.log('✅ Service avec image créé avec succès:', response.data);
    return response.data.serviceId;
  } catch (error) {
    console.log('❌ Erreur lors de la création du service avec image:', error.response?.data || error.message);
    return null;
  }
}

async function testDataRetrieval() {
  console.log('\n📊 Test 4: Récupération des données créées');
  
  try {
    const [servicesResponse, categoriesResponse] = await Promise.all([
      axios.get(`${API_BASE}/services`),
      axios.get(`${API_BASE}/categories`)
    ]);
    
    console.log(`✅ Services récupérés: ${servicesResponse.data.length}`);
    console.log(`✅ Catégories récupérées: ${categoriesResponse.data.length}`);
    
    // Afficher les services avec images
    const servicesWithImages = servicesResponse.data.filter(s => s.image);
    console.log(`🖼️  Services avec images: ${servicesWithImages.length}`);
    
    servicesWithImages.forEach(service => {
      console.log(`   - ${service.name}: /images/services/${service.image}`);
    });
    
    return true;
  } catch (error) {
    console.log('❌ Erreur lors de la récupération des données:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  const serverOk = await testServer();
  if (!serverOk) return;
  
  await testServiceCreation();
  await testCategoryCreation();
  await testServiceWithImage();
  await testDataRetrieval();
  
  console.log('\n🎉 Tests terminés !');
  console.log('\n💡 Pour tester avec de vraies images:');
  console.log('   1. Placez une image dans server/public/images/ nommée test.jpg ou test.png');
  console.log('   2. Relancez ce script');
  console.log('\n🌐 Vérifiez dans votre interface admin que les nouveaux services et catégories apparaissent correctement avec leurs images.');
}

runTests().catch(console.error);
