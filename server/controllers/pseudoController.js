const db = require("../config/db");

/**
 * Vérifie si un pseudo est disponible et suggère des alternatives si nécessaire
 */
exports.checkPseudoAvailability = async (req, res) => {
  try {
    const { pseudo } = req.query;

    if (!pseudo || pseudo.trim() === "") {
      return res.status(400).json({
        available: false,
        message: "Le pseudo est requis",
      });
    }

    const normalizedPseudo = pseudo.toLowerCase().trim();

    // Vérifier si le pseudo existe déjà
    const [rows] = await db.query("SELECT * FROM users WHERE pseudo = ?", [
      normalizedPseudo,
    ]);

    if (rows.length === 0) {
      // Le pseudo est disponible
      return res.json({
        available: true,
        message: "Pseudo disponible",
      });
    } else {
      // Le pseudo n'est pas disponible, générer des suggestions
      const suggestions = await generatePseudoSuggestions(normalizedPseudo);

      return res.json({
        available: false,
        message: "Ce pseudo est déjà utilisé",
        suggestions,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du pseudo:", error);
    res.status(500).json({
      available: false,
      message: "Erreur lors de la vérification du pseudo",
    });
  }
};

/**
 * Génère des suggestions de pseudos similaires
 * @param {string} basePseudo - Le pseudo de base pour lequel générer des alternatives
 * @return {Promise<Array<string>>} - Liste des suggestions de pseudos disponibles
 */
async function generatePseudoSuggestions(basePseudo) {
  const suggestions = [];
  const MAX_SUGGESTIONS = 5;
  const MAX_ATTEMPTS = 20;

  try {
    // Stratégie 1: Ajouter des nombres à la fin (utilisation courante)
    const numberSuggestions = await generateNumberSuggestions(basePseudo);
    suggestions.push(...numberSuggestions);

    // Si nous n'avons pas assez de suggestions, essayer d'autres stratégies
    if (suggestions.length < MAX_SUGGESTIONS) {
      // Stratégie 2: Ajouter des underscores
      const underscoreSuggestions = await generateUnderscoreSuggestions(
        basePseudo
      );
      suggestions.push(...underscoreSuggestions);
    }

    // Stratégie 3: Alternatives personnalisées si nécessaire
    if (suggestions.length < MAX_SUGGESTIONS) {
      const alternativeSuggestions = await generateAlternativeSuggestions(
        basePseudo
      );
      suggestions.push(...alternativeSuggestions);
    }

    // Limiter le nombre de suggestions retournées
    return suggestions.slice(0, MAX_SUGGESTIONS);
  } catch (error) {
    console.error(
      "Erreur lors de la génération des suggestions de pseudo:",
      error
    );
    return suggestions.slice(0, MAX_SUGGESTIONS);
  }
}

/**
 * Générer des suggestions de pseudo en ajoutant des nombres
 */
async function generateNumberSuggestions(basePseudo) {
  const suggestions = [];
  const MAX_NUMBER_SUGGESTIONS = 3;

  try {
    // Essayer d'ajouter des nombres de 1 à MAX_NUMBER_SUGGESTIONS
    for (let i = 1; i <= MAX_NUMBER_SUGGESTIONS + 2; i++) {
      const suggestion = `${basePseudo}${i}`;
      const [rows] = await db.query("SELECT * FROM users WHERE pseudo = ?", [
        suggestion,
      ]);

      if (rows.length === 0) {
        suggestions.push(suggestion);
        if (suggestions.length >= MAX_NUMBER_SUGGESTIONS) break;
      }
    }

    return suggestions;
  } catch (error) {
    console.error(
      "Erreur lors de la génération des suggestions avec nombres:",
      error
    );
    return suggestions;
  }
}

/**
 * Générer des suggestions de pseudo en ajoutant des underscores
 */
async function generateUnderscoreSuggestions(basePseudo) {
  const suggestions = [];
  const MAX_UNDERSCORE_SUGGESTIONS = 2;

  try {
    const variations = [`_${basePseudo}`, `${basePseudo}_`, `_${basePseudo}_`];

    for (const variation of variations) {
      const [rows] = await db.query("SELECT * FROM users WHERE pseudo = ?", [
        variation,
      ]);

      if (rows.length === 0) {
        suggestions.push(variation);
        if (suggestions.length >= MAX_UNDERSCORE_SUGGESTIONS) break;
      }
    }

    return suggestions;
  } catch (error) {
    console.error(
      "Erreur lors de la génération des suggestions avec underscore:",
      error
    );
    return suggestions;
  }
}

/**
 * Générer des suggestions alternatives de pseudo
 */
async function generateAlternativeSuggestions(basePseudo) {
  const suggestions = [];
  const MAX_ALTERNATIVE_SUGGESTIONS = 2;

  try {
    // Combiner avec des mots courants
    const suffixes = ["user", "officiel", "pro", "original"];

    for (const suffix of suffixes) {
      const suggestion = `${basePseudo}.${suffix}`;
      const [rows] = await db.query("SELECT * FROM users WHERE pseudo = ?", [
        suggestion,
      ]);

      if (rows.length === 0) {
        suggestions.push(suggestion);
        if (suggestions.length >= MAX_ALTERNATIVE_SUGGESTIONS) break;
      }
    }

    return suggestions;
  } catch (error) {
    console.error(
      "Erreur lors de la génération des suggestions alternatives:",
      error
    );
    return suggestions;
  }
}
