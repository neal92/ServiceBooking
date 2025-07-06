/**
 * Script très simple pour vérifier l'importation du modèle User
 */

console.log("Démarrage du test d'importation...");

try {
  console.log("1. Importation du modèle User...");
  const User = require("../models/user");

  console.log("2. Type de User:", typeof User);

  console.log("3. Methods sur User:");
  const methods = Object.getOwnPropertyNames(User);
  methods.forEach((method) => {
    console.log(`   - ${method}: ${typeof User[method]}`);
  });

  console.log(
    "4. findByPseudo exists:",
    typeof User.findByPseudo === "function"
  );

  console.log("Test d'importation terminé avec succès.");
} catch (error) {
  console.error("Erreur lors de l'importation:", error);
}
