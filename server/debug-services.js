const db = require('./config/db');

async function checkServices() {
  try {
    console.log('=== VÉRIFICATION DES SERVICES ===\n');
    
    // Récupérer les derniers services
    const [services] = await db.query('SELECT * FROM services ORDER BY id DESC LIMIT 3');
    
    console.log('Derniers services créés:');
    services.forEach(service => {
      console.log(`- ID: ${service.id}`);
      console.log(`  Nom: ${service.name}`);
      console.log(`  Image: ${service.image || 'Aucune'}`);
      console.log(`  Prix: ${service.price}€`);
      console.log('---');
    });
    
    // Vérifier les fichiers dans le dossier images
    const fs = require('fs');
    const path = require('path');
    const imagesDir = path.join(__dirname, 'public', 'images', 'services');
    
    console.log(`\n=== FICHIERS DANS ${imagesDir} ===`);
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);
      console.log(`Nombre de fichiers: ${files.length}`);
      files.forEach(file => {
        const stats = fs.statSync(path.join(imagesDir, file));
        console.log(`- ${file} (${Math.round(stats.size / 1024)}KB)`);
      });
    } else {
      console.log('Le dossier n\'existe pas!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

checkServices();
