const db = require('../config/db');
const notificationController = require('../controllers/notificationController');

async function testNotificationCreation() {
  try {
    console.log('🧪 Test de création de notifications...\n');
    
    // 1. Vérifier les utilisateurs
    console.log('1. Récupération des utilisateurs...');
    const [users] = await db.execute('SELECT id, email FROM users LIMIT 5');
    console.log(`Utilisateurs trouvés: ${users.length}`);
    users.forEach(user => console.log(`   - ID: ${user.id}, Email: ${user.email}`));
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    // 2. Test direct de createNotification
    console.log('\n2. Test création notification directe...');
    const testNotification = {
      user_id: users[0].id,
      type: 'service',
      title: 'Test Notification',
      message: 'Ceci est un test de notification',
      related_id: 1,
      related_type: 'service',
      created_by: users[0].id
    };
    
    const result = await notificationController.createNotification(testNotification);
    console.log('✅ Notification créée:', result);
    
    // 3. Vérifier dans la DB
    console.log('\n3. Vérification dans la base...');
    const [checkResult] = await db.execute('SELECT COUNT(*) as count FROM notifications');
    console.log('Notifications en base:', checkResult[0].count);
    
    // 4. Test createServiceNotificationForAll
    console.log('\n4. Test createServiceNotificationForAll...');
    const serviceData = { id: 999, name: 'Service Test Notification' };
    const notifications = await notificationController.createServiceNotificationForAll(
      serviceData, 
      'created', 
      users[0].id
    );
    
    console.log('✅ Notifications de service créées:', notifications.length);
    
    // 5. Vérification finale
    console.log('\n5. Vérification finale...');
    const [finalCount] = await db.execute('SELECT COUNT(*) as count FROM notifications');
    console.log('Total notifications en base:', finalCount[0].count);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testNotificationCreation();
