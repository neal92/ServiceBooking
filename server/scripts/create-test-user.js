const bcrypt = require('bcrypt');
const db = require('../config/db');

async function insertTestUser() {
  try {
    console.log(' Génération du hash pour le mot de passe...');
    
    // Générer le hash bcrypt pour "password123"
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('✅ Hash généré:', hashedPassword);
    console.log('🔍 Format du hash:', hashedPassword.substring(0, 7));
    console.log('📏 Longueur:', hashedPassword.length);
    
    // Test du hash généré
    const testVerification = await bcrypt.compare(password, hashedPassword);
    console.log('🧪 Test de vérification:', testVerification ? 'RÉUSSI' : 'ÉCHEC');
    
    if (!testVerification) {
      throw new Error('Le hash généré ne fonctionne pas correctement');
    }
    
    console.log('Insertion de l\'utilisateur test...');
    
    // Insérer l'utilisateur test
    const [result] = await db.query(`
      INSERT INTO users (
        firstName, 
        lastName, 
        email, 
        password, 
        pseudo, 
        role, 
        phone, 
        avatar,
        createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      'Test',
      'User',
      'test@test.com',
      hashedPassword,
      'testuser',
      'user',
      '+33123456789',
      null
    ]);
    
    console.log('✅ Utilisateur test créé avec ID:', result.insertId);
    
    // Vérifier l'utilisateur créé
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', ['test@test.com']);
    const user = users[0];
    
    if (user) {
      console.log('\\n👤 Utilisateur créé:');
      console.log('- ID:', user.id);
      console.log('- Email:', user.email);
      console.log('- Nom:', user.firstName, user.lastName);
      console.log('- Role:', user.role);
      console.log('- Hash password (début):', user.password.substring(0, 20) + '...');
      
      // Test final de connexion
      console.log('\\n🔐 Test final de vérification du mot de passe...');
      const finalTest = await bcrypt.compare('password123', user.password);
      console.log('🎯 Vérification finale:', finalTest ? '✅ RÉUSSI' : '❌ ÉCHEC');
      
      console.log('\\n🎉 Utilisateur de test prêt à utiliser:');
      console.log('📧 Email: test@test.com');
      console.log('🔑 Mot de passe: password123');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
}

// Exécuter le script
insertTestUser();
