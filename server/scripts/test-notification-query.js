const db = require('../config/db');

async function testNotificationQuery() {
  try {
    console.log('🔍 === TEST REQUÊTE NOTIFICATIONS ===\n');

    // Test 1: Vérifier la connexion à la base
    console.log('1. Test connexion base de données...');
    const [testConnection] = await db.execute('SELECT 1 as test');
    console.log('✅ Connexion DB réussie:', testConnection[0].test);

    // Test 2: Vérifier que la table notifications existe
    console.log('\n2. Test existence table notifications...');
    const [tableExists] = await db.execute("SHOW TABLES LIKE 'notifications'");
    console.log('✅ Table notifications existe:', tableExists.length > 0);

    // Test 3: Compter les notifications
    console.log('\n3. Compter toutes les notifications...');
    const [countAll] = await db.execute('SELECT COUNT(*) as total FROM notifications');
    console.log('✅ Nombre total de notifications:', countAll[0].total);

    // Test 4: Tester la requête exacte du contrôleur
    console.log('\n4. Test requête du contrôleur...');
    
    // Simpler un userId (14 = pl@gmail.com d'après le token du debug)
    const userId = 14;
    
    const query = `
      SELECT 
        n.*,
        u.firstName,
        u.lastName,
        u.avatar
      FROM notifications n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC 
      LIMIT 20 OFFSET 0
    `;
    
    console.log('Requête SQL:', query);
    console.log('Paramètre userId:', userId);
    
    const [notifications] = await db.execute(query, [userId]);
    console.log('✅ Requête réussie!');
    console.log('Nombre de notifications pour user_id', userId, ':', notifications.length);
    
    if (notifications.length > 0) {
      console.log('\n📋 Première notification:');
      console.log(JSON.stringify(notifications[0], null, 2));
    }

    // Test 5: Compter les notifications non lues
    console.log('\n5. Test count notifications non lues...');
    const [unreadCount] = await db.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    console.log('✅ Notifications non lues:', unreadCount[0].count);

    // Test 6: Voir toutes les notifications sans filtre user_id
    console.log('\n6. Voir toutes les notifications (sans filtre)...');
    const [allNotifs] = await db.execute('SELECT * FROM notifications LIMIT 5');
    console.log('✅ Notifications dans la base:', allNotifs.length);
    
    if (allNotifs.length > 0) {
      console.log('Exemple de notification:');
      console.log(JSON.stringify(allNotifs[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('Stack:', error.stack);
  }
}

testNotificationQuery();
