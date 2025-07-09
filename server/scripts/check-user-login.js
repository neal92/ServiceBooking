const db = require('../config/db');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function checkUserLogin() {
  try {
    // Vérifier la connexion à la base de données
    console.log('Vérification de la connexion à la base de données...');
    await db.execute('SELECT 1');
    console.log('✅ Connexion à la base de données réussie');

    // Demander l'email pour la recherche
    rl.question('Entrez l\'email de l\'utilisateur à vérifier: ', async (email) => {
      const cleanEmail = email.trim();
      console.log(`Recherche de l'utilisateur avec l'email: ${cleanEmail}`);
      
      try {
        // Chercher l'utilisateur dans la base de données
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
        
        if (users.length === 0) {
          console.log('❌ Aucun utilisateur trouvé avec cet email');
          rl.close();
          return;
        }
        
        const user = users[0];
        console.log('✅ Utilisateur trouvé:');
        console.log(`  - ID: ${user.id}`);
        console.log(`  - Nom: ${user.firstName} ${user.lastName}`);
        console.log(`  - Email: ${user.email}`);
        console.log(`  - Pseudo: ${user.pseudo || 'Non défini'}`);
        console.log(`  - Rôle: ${user.role}`);
        console.log(`  - Hash du mot de passe: ${user.password ? user.password.substring(0, 20) + '...' : 'Non défini'}`);
        
        // Vérifier le format du hash du mot de passe
        if (user.password) {
          if (user.password.startsWith('$2')) {
            console.log('✅ Le format du hash semble être valide (bcrypt)');
          } else {
            console.log('⚠️ Le format du hash ne semble pas être un hash bcrypt valide');
          }
          
          // Demander le mot de passe pour test
          rl.question('Entrez le mot de passe à tester: ', async (password) => {
            try {
              console.log('Vérification du mot de passe...');
              const isValid = await bcrypt.compare(password, user.password);
              
              if (isValid) {
                console.log('✅ Le mot de passe est correct!');
              } else {
                console.log('❌ Le mot de passe est incorrect');
              }
              rl.close();
            } catch (error) {
              console.error('Erreur lors de la vérification du mot de passe:', error);
              rl.close();
            }
          });
        } else {
          console.log('❌ L\'utilisateur n\'a pas de mot de passe défini');
          rl.close();
        }
      } catch (error) {
        console.error('Erreur lors de la recherche de l\'utilisateur:', error);
        rl.close();
      }
    });
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    rl.close();
  }
}

checkUserLogin();
