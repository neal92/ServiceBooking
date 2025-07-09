const db = require('../config/db');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function resetUserPassword() {
  try {
    console.log('=== Réinitialisation du mot de passe utilisateur ===');
    
    rl.question('Entrez l\'email de l\'utilisateur: ', async (email) => {
      const trimmedEmail = email.trim();
      console.log(`Recherche de l'utilisateur avec email: ${trimmedEmail}`);
      
      try {
        // Vérifier si l'utilisateur existe
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [trimmedEmail]);
        
        if (users.length === 0) {
          console.log('❌ Utilisateur non trouvé avec cet email.');
          rl.close();
          return;
        }
        
        const user = users[0];
        console.log(`Utilisateur trouvé: ${user.firstName} ${user.lastName} (ID: ${user.id})`);
        console.log(`Mot de passe actuel (hash): ${user.password ? user.password.substring(0, 10) + '...' : 'Non disponible'}`);
        
        // Demander le nouveau mot de passe
        rl.question('Entrez le nouveau mot de passe: ', async (newPassword) => {
          if (!newPassword || newPassword.length < 6) {
            console.log('❌ Mot de passe trop court (minimum 6 caractères).');
            rl.close();
            return;
          }
          
          try {
            console.log('Génération du hash pour le nouveau mot de passe...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            console.log(`Hash généré: ${hashedPassword.substring(0, 20)}...`);
            
            // Mettre à jour le mot de passe
            console.log('Mise à jour du mot de passe dans la base de données...');
            const [result] = await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
            
            if (result.affectedRows > 0) {
              console.log(`✅ Mot de passe mis à jour avec succès pour ${user.email}!`);
              
              // Vérifier que le nouveau mot de passe fonctionne
              console.log('\nVérification du nouveau mot de passe...');
              const [updatedUser] = await db.query('SELECT password FROM users WHERE id = ?', [user.id]);
              
              if (updatedUser.length > 0) {
                const isValid = await bcrypt.compare(newPassword, updatedUser[0].password);
                console.log(`Résultat de la vérification: ${isValid ? '✅ VALIDE' : '❌ INVALIDE'}`);
                
                if (isValid) {
                  console.log('\n===================================================');
                  console.log(`✅ SUCCÈS: Le mot de passe pour ${user.email} a été réinitialisé.`);
                  console.log(`Nouveau mot de passe: ${newPassword}`);
                  console.log('===================================================');
                } else {
                  console.log('⚠️ ATTENTION: La vérification du nouveau mot de passe a échoué!');
                }
              }
            } else {
              console.log('❌ Échec de la mise à jour du mot de passe.');
            }
            
            rl.close();
          } catch (error) {
            console.error('Erreur lors de la mise à jour du mot de passe:', error);
            rl.close();
          }
        });
      } catch (error) {
        console.error('Erreur lors de la recherche de l\'utilisateur:', error);
        rl.close();
      }
    });
  } catch (error) {
    console.error('Erreur générale:', error);
    rl.close();
  }
}

resetUserPassword();
