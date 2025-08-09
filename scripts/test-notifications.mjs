import db from '../server/config/db.js';

async function testNotificationDatabase() {
  try {
    console.log('=== Test de connexion à la base de données ===');
    
    // Test de connexion
    const connectionTest = await db.execute('SELECT 1 as test');
    console.log('✓ Connexion DB réussie');
    
    // Test de la table notifications
    console.log('\n=== Vérification table notifications ===');
    const tableStructure = await db.execute('DESCRIBE notifications');
    console.log('Structure table notifications:');
    tableStructure[0].forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default}`);
    });
    
    // Test de comptage des notifications
    console.log('\n=== Comptage des notifications ===');
    const countResult = await db.execute('SELECT COUNT(*) as total FROM notifications');
    console.log('Total notifications:', countResult[0][0].total);
    
    // Test de récupération avec user_id
    console.log('\n=== Test getUserNotifications ===');
    const userId = 1; // User admin
    
    console.log('Requête: SELECT * FROM notifications WHERE user_id = ?', userId);
    const simpleQuery = await db.execute('SELECT * FROM notifications WHERE user_id = ?', [userId]);
    console.log('Résultats simple:', simpleQuery[0].length, 'notifications trouvées');
    
    if (simpleQuery[0].length > 0) {
      console.log('Première notification:', simpleQuery[0][0]);
    }
    
    // Test de la requête avec JOIN (comme dans le controller)
    console.log('\n=== Test requête avec JOIN ===');
    const joinQuery = `
      SELECT 
        n.*,
        u.nom as created_by_name,
        u.prenom as created_by_prenom,
        u.email as created_by_email
      FROM notifications n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
    `;
    
    console.log('Exécution requête JOIN...');
    const joinResult = await db.execute(joinQuery, [userId]);
    console.log('Résultats JOIN:', joinResult[0].length, 'notifications trouvées');
    
    if (joinResult[0].length > 0) {
      console.log('Première notification avec JOIN:');
      const notif = joinResult[0][0];
      Object.keys(notif).forEach(key => {
        console.log(`  ${key}: ${notif[key]}`);
      });
    }
    
    // Test des users
    console.log('\n=== Test table users ===');
    const users = await db.execute('SELECT id, email, nom, prenom FROM users LIMIT 3');
    console.log('Users:');
    users[0].forEach(user => {
      console.log(`  ID ${user.id}: ${user.email} (${user.nom} ${user.prenom})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Code:', error.code);
    console.error('SQL State:', error.sqlState);
    console.error('SQL Message:', error.sqlMessage);
    console.error('Stack:', error.stack);
  } finally {
    console.log('\n=== Fin des tests ===');
    process.exit(0);
  }
}

testNotificationDatabase();
