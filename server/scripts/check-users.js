const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
  try {
    console.log('Tentative de connexion avec:');
    console.log('Host:', process.env.DB_HOST || 'localhost');
    console.log('User:', process.env.DB_USER || 'root');
    console.log('Password:', process.env.DB_PASSWORD ? '[PROVIDED]' : '[EMPTY]');
    console.log('Database:', process.env.DB_NAME || 'servicebooking');
    
    // Connexion à la base de données
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'servicebooking'
    });

    console.log('Connecté à la base de données. Récupération des utilisateurs...');

    // Récupération des utilisateurs (affichage sécurisé sans montrer les mots de passe complets)
    const [users] = await connection.query(`
      SELECT id, name, email, CONCAT(LEFT(password, 10), '...') as password_preview, role, created_at
      FROM users
    `);
    
    console.log('\n--- LISTE DES UTILISATEURS ---');
    console.table(users);

    // Si vous voulez voir le mot de passe d'un utilisateur spécifique (généralement admin@example.com)
    console.log('\n--- INFORMATION DE CONNEXION ADMIN ---');
    const [adminUser] = await connection.query(`
      SELECT email, password 
      FROM users 
      WHERE email = 'admin@example.com'
    `);
    
    if (adminUser.length > 0) {
      console.log(`
      Email: ${adminUser[0].email}
      Mot de passe haché (pour info): ${adminUser[0].password}
      Mot de passe en clair: admin123
      `);
    } else {
      console.log('Utilisateur admin non trouvé');
    }

    // Fermeture de la connexion
    await connection.end();
    console.log('\nConnexion fermée.');
  } catch (error) {
    console.error('Erreur lors de la vérification des utilisateurs:', error);
  }
}

// Exécution de la fonction
checkUsers();
