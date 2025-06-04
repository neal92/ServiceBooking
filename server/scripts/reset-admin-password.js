// Script pour réinitialiser le mot de passe de l'administrateur
const db = require('../config/db');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

async function resetAdminPassword() {
  try {
    console.log('Connecting to database...');
    
    // Nouveau mot de passe pour l'administrateur (admin123)
    const newPassword = 'admin123';
    
    // Hashing du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Mise à jour du mot de passe de l'administrateur
    const [result] = await db.query(
      "UPDATE users SET password = ? WHERE email = 'admin@example.com'",
      [hashedPassword]
    );
    
    let message;
    
    if (result.affectedRows > 0) {
      message = 'Mot de passe administrateur réinitialisé avec succès.\nEmail: admin@example.com\nMot de passe: admin123';
      console.log(message);
    } else {
      message = 'Aucun utilisateur administrateur trouvé avec l\'email admin@example.com';
      console.log(message);
    }
    
    // Écrire un message de résultat dans un fichier
    const resultPath = path.join(__dirname, 'reset-result.txt');
    fs.writeFileSync(resultPath, message);
    console.log(`Résultat écrit dans ${resultPath}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', err);
    
    // Écrire l'erreur dans un fichier
    const errorPath = path.join(__dirname, 'reset-error.txt');
    fs.writeFileSync(errorPath, err.toString());
    console.log(`Erreur écrite dans ${errorPath}`);
    
    process.exit(1);
  }
}

resetAdminPassword();
