const db = require('../config/db');

async function testNotificationsQuery() {
  try {
    console.log('🔍 === TEST DIRECT DE LA BASE DE DONNÉES ===\n');
    
    // Test 1: Compter toutes les notifications
    console.log('1. Compter toutes les notifications...');
    const [countResult] = await db.execute('SELECT COUNT(*) as total FROM notifications');
    console.log('Total notifications:', countResult[0].total);
    
    if (countResult[0].total > 0) {
      // Test 2: Récupérer toutes les notifications
      console.log('\n2. Récupérer toutes les notifications...');
      const [allNotifications] = await db.execute('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5');
      console.log('Notifications trouvées:', allNotifications.length);
      
      allNotifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ID: ${notif.id} | User: ${notif.user_id} | Type: ${notif.type}`);
        console.log(`      Titre: ${notif.title}`);
        console.log(`      Message: ${notif.message}`);
      });
      
      // Test 3: Tester la requête avec JOIN
      console.log('\n3. Test de la requête avec JOIN...');
      const testUserId = allNotifications[0].user_id; // Utiliser un user_id existant
      console.log('Test avec user_id:', testUserId);
      
      const query = `
        SELECT 
          n.*,
          u.firstName,
          u.lastName,
          u.avatar
        FROM notifications n
        LEFT JOIN users u ON n.created_by = u.id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC LIMIT 10
      `;
      
      const [joinResult] = await db.execute(query, [testUserId]);
      console.log('Résultat JOIN:', joinResult.length, 'notifications');
      
      if (joinResult.length > 0) {
        console.log('✅ La requête JOIN fonctionne !');
        joinResult.forEach((notif, index) => {
          console.log(`   ${index + 1}. ${notif.title} | Créé par: ${notif.firstName || 'Unknown'} ${notif.lastName || ''}`);
        });
      }
      
      // Test 4: Compter les non lues
      console.log('\n4. Test comptage des non lues...');
      const [unreadResult] = await db.execute(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
        [testUserId]
      );
      console.log('Notifications non lues pour user', testUserId, ':', unreadResult[0].count);
      
    } else {
      console.log('❌ Aucune notification trouvée dans la base de données');
      
      // Vérifier si des services ont été créés récemment
      console.log('\n📋 Vérification des services récents...');
      const [recentServices] = await db.execute(
        'SELECT id, name, createdAt FROM services ORDER BY createdAt DESC LIMIT 3'
      );
      
      if (recentServices.length > 0) {
        console.log('Services récents trouvés:');
        recentServices.forEach(service => {
          console.log(`   - ${service.name} (ID: ${service.id}) créé le ${service.createdAt}`);
        });
        console.log('❓ Les services existent mais pas les notifications - problème dans le contrôleur');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

// Lancer le test
testNotificationsQuery();
