const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const User = require("../models/user");

/**
 * Controller pour gérer l'inscription des utilisateurs
 */
exports.register = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      pseudo,
      role = "user",
      phone,
    } = req.body;

    // Log pour débogage
    console.log("Données d'inscription reçues:", {
      firstName,
      lastName,
      email,
      pseudoProvided: !!pseudo,
      role,
      phone: !!phone,
    });

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    // Vérifier si le pseudo est unique (si fourni)
    if (pseudo) {
      try {
        const existingPseudo = await User.findByPseudo(pseudo);
        if (existingPseudo) {
          return res
            .status(400)
            .json({ message: "Ce pseudo est déjà utilisé." });
        }
      } catch (err) {
        console.error("Erreur lors de la vérification du pseudo:", err);
        return res
          .status(500)
          .json({ message: "Erreur lors de la vérification du pseudo." });
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = await User.create({
      firstName,
      lastName: lastName || "",
      email,
      password: hashedPassword,
      pseudo: pseudo || null,
      role,
      phone: phone || null,
    });

    console.log("Utilisateur créé avec succès:", {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Vérifier si l'utilisateur a été correctement créé
    if (!newUser || !newUser.id) {
      console.error("Erreur: Utilisateur créé sans ID");
      return res
        .status(500)
        .json({ message: "Erreur lors de la création de l'utilisateur." });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // S'assurer que toutes les données nécessaires sont présentes
    const userResponse = {
      id: newUser.id,
      firstName: newUser.firstName || firstName,
      lastName: newUser.lastName || lastName || "",
      email: newUser.email || email,
      pseudo: newUser.pseudo || pseudo || "",
      role: newUser.role || role,
      phone: newUser.phone || phone || "",
      avatar: newUser.avatar || null,
    };

    console.log("Réponse d'inscription:", {
      userIncluded: !!userResponse,
      tokenIncluded: !!token,
    });

    // Répondre avec les infos de l'utilisateur et le token
    res.status(201).json({
      message: "Utilisateur enregistré avec succès.",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res
      .status(500)
      .json({ message: "Une erreur est survenue lors de l'inscription." });
  }
};

/**
 * Controller pour gérer la connexion des utilisateurs
 */
exports.login = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Trouver l'utilisateur par email
    const user = await User.findByEmail(email);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Répondre avec les infos de l'utilisateur et le token
    res.json({
      message: "Connexion réussie.",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        pseudo: user.pseudo,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res
      .status(500)
      .json({ message: "Une erreur est survenue lors de la connexion." });
  }
};

/**
 * Controller pour récupérer les informations de l'utilisateur connecté
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // L'utilisateur est déjà attaché à la requête par le middleware d'authentification
    const userId = req.user.id;

    // Récupérer les détails complets de l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        pseudo: user.pseudo,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la récupération des données utilisateur.",
    });
  }
};

/**
 * Controller pour mettre à jour le profil de l'utilisateur
 */
exports.updateProfile = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { firstName, lastName, email, phone, pseudo, avatar } = req.body;

    // Vérifier si l'email existe déjà pour un autre utilisateur
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res
          .status(400)
          .json({ message: "Cet email est déjà utilisé par un autre compte." });
      }
    }

    // Vérifier si le pseudo existe déjà pour un autre utilisateur
    if (pseudo) {
      const existingPseudo = await User.findByPseudo(pseudo);
      if (existingPseudo && existingPseudo.id !== userId) {
        return res
          .status(400)
          .json({ message: "Ce pseudo est déjà utilisé par un autre compte." });
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await User.update(userId, {
      firstName,
      lastName,
      email,
      phone,
      pseudo,
      avatar,
    });

    res.json({
      message: "Profil mis à jour avec succès.",
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        pseudo: updatedUser.pseudo,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la mise à jour du profil.",
    });
  }
};

/**
 * Controller pour modifier le mot de passe
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Récupérer l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Le mot de passe actuel est incorrect." });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await User.updatePassword(userId, hashedPassword);

    res.json({ message: "Mot de passe modifié avec succès." });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors du changement de mot de passe.",
    });
  }
};

/**
 * Controller pour télécharger et mettre à jour l'avatar de l'utilisateur
 */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ message: "Aucun fichier téléchargé." });
    }

    const { avatar } = req.files;
    const userId = req.user.id;

    // Vérifier le type de fichier
    if (!avatar.mimetype.startsWith("image/")) {
      return res
        .status(400)
        .json({ message: "Seules les images sont autorisées." });
    }

    // Générer un nom de fichier unique
    const filename = `avatar_${userId}_${Date.now()}${require("path").extname(
      avatar.name
    )}`;
    const uploadPath = require("path").join(
      __dirname,
      "../public/uploads/",
      filename
    );

    // Déplacer le fichier téléchargé vers le dossier de destination
    await avatar.mv(uploadPath);

    // Mettre à jour l'avatar de l'utilisateur dans la base de données
    const avatarUrl = `/uploads/${filename}`;
    await User.update(userId, { avatar: avatarUrl, isPresetAvatar: false });

    res.json({
      message: "Avatar téléchargé avec succès.",
      avatar: avatarUrl,
    });
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'avatar:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors du téléchargement de l'avatar.",
    });
  }
};
