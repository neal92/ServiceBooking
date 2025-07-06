/**
 * Script de vérification de la fonctionnalité après modification
 */
console.log("Vérification après modification du modèle User");

// Import explicite du modèle
const User = require("../models/user");

// Vérifier les méthodes
console.log(
  "Méthode findByEmail existe:",
  typeof User.findByEmail === "function"
);
console.log(
  "Méthode findByPseudo existe:",
  typeof User.findByPseudo === "function"
);

// Tester la méthode findByPseudo
async function testFindByPseudo() {
  try {
    console.log("Test de la méthode findByPseudo...");

    // Créer un pseudo de test unique
    const testPseudo = `test_${Date.now()}`;
    let result = await User.findByPseudo(testPseudo);
    console.log(
      `Recherche pour '${testPseudo}' - Résultat:`,
      result ? "Trouvé (inattendu)" : "Non trouvé (attendu)"
    );

    // Tester avec un pseudo qui pourrait exister
    result = await User.findByPseudo("admin");
    console.log(
      `Recherche pour 'admin' - Résultat:`,
      result ? "Trouvé" : "Non trouvé"
    );

    console.log("Test terminé");
  } catch (error) {
    console.error("Erreur pendant le test:", error);
  }
}

// Exécuter le test
testFindByPseudo();
