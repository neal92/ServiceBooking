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
      email: rawEmail,
      password,
      pseudo: rawPseudo,
      role = "user",
      phone,
    } = req.body;
    
    // Nettoyer l'email et le pseudo (supprimer les espaces avant et après)
    const email = rawEmail.trim();
    const pseudo = rawPseudo ? rawPseudo.trim() : rawPseudo;

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
        console.log(`Vérification de l'unicité du pseudo: ${pseudo}`);
        const existingPseudo = await User.findByPseudo(pseudo);
        if (existingPseudo) {
          console.log(`Le pseudo ${pseudo} est déjà utilisé`);
          return res
            .status(400)
            .json({ message: "Ce pseudo est déjà utilisé." });
        }
        console.log(`Le pseudo ${pseudo} est disponible`);
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
    // NOTE: Assurez-vous que l'ID utilisateur est inclus sous la clé 'id'
    // car le middleware auth.js vérifie decoded.id
    const tokenPayload = { 
      id: newUser.id, 
      email: newUser.email, 
      role: newUser.role 
    };
    console.log('Création du token d\'enregistrement avec payload:', tokenPayload);
    
    // Utiliser la même clé secrète que dans le middleware d'authentification
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    console.log('JWT_SECRET pour inscription (first 5 chars):', JWT_SECRET.substring(0, 5) + '...');
    
    const token = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    console.log('Token JWT d\'enregistrement généré avec succès');
    
    // Vérifier que le token est valide
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token d\'enregistrement vérifié avec succès. Contenu:', { id: decoded.id, email: decoded.email, role: decoded.role });
    } catch (e) {
      console.error('Erreur lors de la vérification du token d\'enregistrement:', e);
    }

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

    const { email: rawEmail, password } = req.body;
    
    // Nettoyer l'email (supprimer les espaces avant et après)
    const email = rawEmail.trim();
    
    console.log(`Tentative de connexion avec email: ${email}`);

    // Trouver l'utilisateur par email
    const user = await User.findByEmail(email);
    if (!user) {
      console.log(`Aucun utilisateur trouvé avec l'email: ${email}`);
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect." });
    }
    
    console.log(`Utilisateur trouvé: ID=${user.id}, Email=${user.email}`);

    // Vérifier le mot de passe
    console.log('====== Vérification détaillée du mot de passe ======');
    console.log(`Mot de passe fourni: "${password}" (longueur: ${password ? password.length : 0} caractères)`);
    console.log(`Mot de passe stocké en BDD: ${user.password ? user.password.substring(0, 10) + '...' : 'Non disponible'}`);
    console.log(`Format du hash: ${user.password ? user.password.substring(0, 7) : 'N/A'}`);
    console.log(`Longueur du hash: ${user.password ? user.password.length : 0} caractères`);
    console.log(`Est au format bcrypt ($2a, $2b ou $2y): ${user.password ? /^\$2[aby]\$/.test(user.password) : 'N/A'}`);
    
    // Tester si le hash est valide avant de faire la comparaison
    if (!user.password || user.password.length < 60 || !/^\$2[aby]\$/.test(user.password)) {
      console.error('ERREUR: Le hash stocké ne semble pas être un hash bcrypt valide');
      return res
        .status(401)
        .json({ message: "Erreur d'authentification. Contactez l'administrateur." });
    }
    
    try {
      console.log('Appel de bcrypt.compare avec les paramètres:');
      console.log('- password:', password ? `"${password}"` : 'Non fourni');
      console.log('- hash (début):', user.password.substring(0, 10) + '...');
      
      const startTime = Date.now();
      const isPasswordValid = await bcrypt.compare(password, user.password);
      const duration = Date.now() - startTime;
      
      console.log(`Résultat de bcrypt.compare: ${isPasswordValid ? 'TRUE (Valide)' : 'FALSE (Invalide)'}`);
      console.log(`Durée de la vérification: ${duration}ms`);
      
      if (!isPasswordValid) {
        console.log('Mot de passe invalide, accès refusé');
        
        // Pour le débogage, vérifier si le mot de passe correspond au hash
        console.log('⚠️ Pour le débogage uniquement:');
        const testHash = await bcrypt.hash(password, 10);
        console.log('Hash généré avec le mot de passe fourni:', testHash);
        console.log('Les hash sont-ils similaires?', testHash.substring(0, 7) === user.password.substring(0, 7) ? 'Format identique' : 'Format différent');
        
        return res
          .status(401)
          .json({ message: "Email ou mot de passe incorrect." });
      }
      
      console.log('✅ Mot de passe valide, accès autorisé');
    } catch (error) {
      console.error('ERREUR lors de la comparaison bcrypt:', error);
      return res
        .status(500)
        .json({ message: "Erreur lors de la vérification des identifiants." });
    }

    // Générer un token JWT
    // NOTE: Assurez-vous que l'ID utilisateur est inclus sous la clé 'id'
    // car le middleware auth.js vérifie decoded.id
    const tokenPayload = { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    };
    console.log('Création du token avec payload:', tokenPayload);
    
    // Utiliser la même clé secrète que dans le middleware d'authentification
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    console.log('JWT_SECRET pour login (first 5 chars):', JWT_SECRET.substring(0, 5) + '...');
    
    const token = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    console.log('Token JWT généré avec succès');
    
    // Vérifier que le token est valide
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token vérifié avec succès. Contenu:', { id: decoded.id, email: decoded.email, role: decoded.role });
    } catch (e) {
      console.error('Erreur lors de la vérification du token:', e);
    }

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
    const { firstName, lastName, email, pseudo, avatar } = req.body;

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
      avatarUrl: avatarUrl,
    });
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'avatar:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors du téléchargement de l'avatar.",
    });
  }
};
