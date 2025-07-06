const User = require("../models/user");

async function testFindByPseudo() {
  try {
    console.log("Démarrage du test de User.findByPseudo...");

    // Test avec un pseudo qui devrait exister (à adapter selon votre base de données)
    const pseudoToTest = "admin"; // Remplacez par un pseudo existant dans votre base
    console.log(`Recherche d'un utilisateur avec le pseudo: ${pseudoToTest}`);

    const user = await User.findByPseudo(pseudoToTest);
    console.log(
      "Résultat de la recherche:",
      user ? "Utilisateur trouvé" : "Utilisateur non trouvé"
    );
    if (user) {
      console.log(`ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    }

    // Test avec un pseudo qui ne devrait pas exister
    const nonExistentPseudo = "pseudo_inexistant_" + Date.now();
    console.log(
      `Recherche d'un utilisateur avec le pseudo inexistant: ${nonExistentPseudo}`
    );

    const nonExistentUser = await User.findByPseudo(nonExistentPseudo);
    console.log(
      "Résultat de la recherche:",
      nonExistentUser
        ? "Utilisateur trouvé (inattendu)"
        : "Utilisateur non trouvé (attendu)"
    );

    console.log("Test terminé avec succès!");
  } catch (error) {
    console.error("Erreur lors du test:", error);
  }
}

// Exécuter le test
testFindByPseudo();
