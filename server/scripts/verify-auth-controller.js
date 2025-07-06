/**
 * Script pour vérifier si le module User est correctement importé dans le contrôleur d'authentification
 */

try {
  console.log("Vérification de l'importation de User dans authController...");

  // Importer directement le contrôleur d'authentification
  const authController = require("../controllers/authController");

  // Vérifier que le contrôleur est bien importé
  console.log("Type de authController:", typeof authController);
  console.log(
    "Méthodes disponibles sur authController:",
    Object.keys(authController)
  );

  // Vérifier l'accès à User depuis le scope global
  const User = require("../models/user");
  console.log(
    "User importé directement est une fonction:",
    typeof User === "function"
  );
  console.log(
    "User.findByPseudo existe:",
    typeof User.findByPseudo === "function"
  );

  // Faire un petit test avec une requête simulée
  const mockReq = {
    body: {
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
      pseudo: "testuser" + Date.now(),
      role: "user",
    },
  };

  const mockRes = {
    status: (code) => {
      console.log(`Mock status called with code: ${code}`);
      return {
        json: (data) => {
          console.log(
            "Mock json called with data:",
            JSON.stringify(data, null, 2)
          );
        },
      };
    },
  };

  // Test d'un appel à register
  const testRegister = async () => {
    try {
      console.log("Test d'appel de authController.register...");
      await authController.register(mockReq, mockRes);
      console.log("Appel terminé");
    } catch (err) {
      console.error("Erreur lors du test de register:", err);
    }
  };

  // Exécuter le test
  testRegister();
} catch (error) {
  console.error("Erreur globale lors de la vérification:", error);
}
