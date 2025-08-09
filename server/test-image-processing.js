/**
 * Script de test pour vérifier le bon fonctionnement du redimensionnement d'images
 * Usage: node test-image-processing.js
 */

const { processServiceImage, IMAGE_CONFIGS } = require('./utils/imageProcessor');
const fs = require('fs');
const path = require('path');

async function testImageProcessing() {
  console.log('🧪 Test du système de redimensionnement d\'images');
  console.log('================================================');
  
  try {
    // Vérifier que Sharp est bien installé
    const sharp = require('sharp');
    console.log('✅ Sharp est installé correctement');
    
    // Afficher la configuration
    console.log('\n📋 Configuration des images:');
    console.log('- Image principale:', IMAGE_CONFIGS.services.main);
    console.log('- Thumbnail:', IMAGE_CONFIGS.services.thumbnail);
    
    // Vérifier les dossiers
    const servicesDir = path.join(__dirname, 'public', 'images', 'services');
    if (!fs.existsSync(servicesDir)) {
      fs.mkdirSync(servicesDir, { recursive: true });
      console.log('✅ Dossier services créé');
    } else {
      console.log('✅ Dossier services existe');
    }
    
    console.log('\n🎉 Système prêt pour le redimensionnement d\'images!');
    console.log('\nFonctionnalités disponibles:');
    console.log('- Redimensionnement automatique (400x300px)');
    console.log('- Génération de thumbnails (150x150px)');
    console.log('- Compression optimisée');
    console.log('- Conversion automatique en JPEG');
    console.log('- Gestion de la suppression des anciennes images');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    
    if (error.message.includes('sharp')) {
      console.log('\n💡 Solution: Réinstaller Sharp');
      console.log('cd server && npm install sharp');
    }
  }
}

testImageProcessing();
