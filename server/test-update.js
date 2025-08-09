const db = require('./config/db');

async function testUpdate() {
  try {
    console.log('=== TEST DE MISE À JOUR ===\n');
    
    // Tester la mise à jour du service 58 avec une image factice
    const serviceId = 58;
    const imageName = 'service_1753881236759_y8p4kpj5jv_main.jpg';
    
    console.log(`Tentative de mise à jour du service ${serviceId} avec l'image: ${imageName}`);
    
    const [result] = await db.query(
      'UPDATE services SET image = ? WHERE id = ?',
      [imageName, serviceId]
    );
    
    console.log('Résultat de la mise à jour:', result);
    console.log(`Lignes affectées: ${result.affectedRows}`);
    
    // Vérifier le résultat
    const [services] = await db.query('SELECT * FROM services WHERE id = ?', [serviceId]);
    console.log('Service après mise à jour:', services[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

testUpdate();
