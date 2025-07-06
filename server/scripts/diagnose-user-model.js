/**
 * Script de diagnostic pour vérifier le modèle User et sa méthode findByPseudo
 */

try {
  console.log("Début du diagnostic du modèle User...");

  // Importer le modèle User
  const User = require("../models/user");

  // Vérifier que le modèle est chargé correctement
  console.log("Type de User:", typeof User);

  // Vérifier les méthodes disponibles
  console.log(
    "Méthodes disponibles sur User:",
    Object.getOwnPropertyNames(User)
  );
  console.log(
    "Méthode findByPseudo existe:",
    typeof User.findByPseudo === "function"
  );

  // Examiner la définition de la méthode findByPseudo si elle existe
  if (typeof User.findByPseudo === "function") {
    console.log(
      "Définition de findByPseudo:",
      User.findByPseudo.toString().substring(0, 150) + "..."
    );
  }

  // Vérifier si d'autres méthodes similaires fonctionnent
  console.log(
    "Méthode findByEmail existe:",
    typeof User.findByEmail === "function"
  );

  // Si le diagnostic de base est bon, essayer d'appeler la méthode
  const testFindByPseudo = async () => {
    try {
      const result = await User.findByPseudo("admin");
      console.log(
        'Résultat de findByPseudo("admin"):',
        result ? "Trouvé" : "Non trouvé"
      );
    } catch (err) {
      console.error("Erreur lors de l'appel de findByPseudo:", err);
    }
  };

  // Exécuter le test
  testFindByPseudo();

  console.log("Fin du diagnostic.");
} catch (error) {
  console.error("Erreur globale lors du diagnostic:", error);
}
