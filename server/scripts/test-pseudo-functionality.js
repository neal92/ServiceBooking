/**
 * Script simplifié pour tester la méthode findByPseudo
 * Ce script isole uniquement la fonctionnalité qui pose problème
 */
require("dotenv").config();
const User = require("../models/user");

async function testPseudoFunctionality() {
  try {
    console.log("=== DÉBUT DU TEST DE PSEUDO ===");

    // Créer un pseudo unique pour le test
    const uniquePseudo = "testuser_" + Math.floor(Math.random() * 10000);
    console.log(`Pseudo de test: ${uniquePseudo}`);

    // 1. D'abord vérifier que le pseudo n'existe pas
    console.log("1. Vérification que le pseudo n'existe pas...");
    const existingUser = await User.findByPseudo(uniquePseudo);
    console.log(
      "Résultat:",
      existingUser ? "Trouvé (inattendu)" : "Non trouvé (attendu)"
    );

    // 2. Créer un utilisateur avec ce pseudo
    console.log("2. Création d'un nouvel utilisateur avec ce pseudo...");
    const newUser = await User.create({
      firstName: "Test",
      lastName: "User",
      email: `test_${uniquePseudo}@example.com`,
      password: "Password123!",
      pseudo: uniquePseudo,
      role: "user",
    });
    console.log("Utilisateur créé avec ID:", newUser.id);

    // 3. Vérifier que le pseudo existe maintenant
    console.log("3. Vérification que le pseudo existe maintenant...");
    const foundUser = await User.findByPseudo(uniquePseudo);
    console.log(
      "Résultat:",
      foundUser ? "Trouvé (attendu)" : "Non trouvé (inattendu)"
    );
    if (foundUser) {
      console.log("ID:", foundUser.id);
      console.log("Email:", foundUser.email);
      console.log("Pseudo:", foundUser.pseudo);
    }

    console.log("=== TEST TERMINÉ AVEC SUCCÈS ===");
  } catch (error) {
    console.error("ERREUR lors du test:", error);
    console.log("Message:", error.message);
    console.log("Stack:", error.stack);
  }
}

// Exécuter le test
testPseudoFunctionality();
