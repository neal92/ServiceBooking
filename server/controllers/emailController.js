const User = require("../models/user");

/**
 * Vérifie si un email est disponible (non utilisé par un autre utilisateur)
 */
exports.checkEmailAvailability = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || email.trim() === "") {
      return res.status(400).json({
        available: false,
        message: "L'email est requis",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Vérifier si l'email existe déjà
    const existingUser = await User.findByEmail(normalizedEmail);

    if (!existingUser) {
      // L'email est disponible
      return res.json({
        available: true,
        message: "Email disponible",
      });
    } else {
      // L'email n'est pas disponible
      return res.json({
        available: false,
        message: "Cette adresse email est déjà utilisée",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email:", error);
    res.status(500).json({
      available: false,
      message: "Erreur lors de la vérification de l'email",
    });
  }
};
