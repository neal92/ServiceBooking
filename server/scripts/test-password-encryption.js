const bcrypt = require('bcrypt');
const db = require('../config/db');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testPasswordEncryption() {
  try {
    console.log('=== Test de l\'encryption et vérification de mot de passe avec bcrypt ===');
    
    // 1. Tester la génération de hash
    rl.question('Entrez un mot de passe à tester: ', async (plainPassword) => {
      console.log(`\n1. Test de génération de hash pour le mot de passe: "${plainPassword}"`);
      
      try {
        // Générer un hash du mot de passe
        console.log('Génération du hash avec bcrypt.hash et salt=10...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        
        console.log('Hash généré:', hashedPassword);
        console.log('Longueur du hash:', hashedPassword.length);
        console.log('Format du hash commence par:', hashedPassword.substring(0, 7));
        
        // 2. Tester la vérification du mot de passe
        console.log('\n2. Test de vérification du mot de passe:');
        
        console.log('2.1 Test avec le mot de passe CORRECT');
        const isValid1 = await bcrypt.compare(plainPassword, hashedPassword);
        console.log(`Résultat (devrait être TRUE): ${isValid1}`);
        
        console.log('\n2.2 Test avec un mot de passe INCORRECT');
        const wrongPassword = plainPassword + '1';
        const isValid2 = await bcrypt.compare(wrongPassword, hashedPassword);
        console.log(`Résultat (devrait être FALSE): ${isValid2}`);
        
        // 3. Tester la vérification avec un utilisateur existant
        console.log('\n3. Test avec un utilisateur existant dans la base de données');
        rl.question('Entrez l\'email d\'un utilisateur existant: ', async (email) => {
          try {
            const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim()]);
            
            if (users.length === 0) {
              console.log('❌ Aucun utilisateur trouvé avec cet email');
              rl.close();
              return;
            }
            
            const user = users[0];
            console.log(`Utilisateur trouvé: ${user.firstName} ${user.lastName} (${user.email})`);
            console.log(`Hash du mot de passe en base: ${user.password ? user.password.substring(0, 10) + '...' : 'Non disponible'}`);
            
            if (!user.password) {
              console.log('❌ Pas de mot de passe stocké pour cet utilisateur');
              rl.close();
              return;
            }
            
            rl.question('Entrez le mot de passe à vérifier pour cet utilisateur: ', async (password) => {
              console.log(`Vérification du mot de passe "${password}" avec le hash en base...`);
              
              try {
                // Inspection détaillée du hash
                console.log('Analyse du hash:');
                console.log('- Longueur:', user.password.length);
                console.log('- Format du début:', user.password.substring(0, 7));
                console.log('- Est au format bcrypt ($2a, $2b ou $2y):', /^\$2[aby]\$/.test(user.password));
                
                // Vérification directe avec bcrypt
                console.log('\nVérification avec bcrypt.compare:');
                const start = Date.now();
                const isValid = await bcrypt.compare(password, user.password);
                const duration = Date.now() - start;
                console.log(`Résultat: ${isValid ? '✅ VALIDE' : '❌ INVALIDE'}`);
                console.log(`Durée de la vérification: ${duration}ms`);
                
                rl.close();
              } catch (error) {
                console.error('Erreur lors de la vérification:', error);
                rl.close();
              }
            });
          } catch (error) {
            console.error('Erreur lors de la recherche de l\'utilisateur:', error);
            rl.close();
          }
        });
      } catch (error) {
        console.error('Erreur lors du test d\'encryption:', error);
        rl.close();
      }
    });
  } catch (error) {
    console.error('Erreur générale:', error);
    rl.close();
  }
}

testPasswordEncryption();
