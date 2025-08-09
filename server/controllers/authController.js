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
    console.log(`Est au format bcrypt ($2a, $2b ou $2y): ${user.password ? /^\$2[aby]\$\d+\$/.test(user.password) : 'N/A'}`);
    
    // Tester si le hash est valide avant de faire la comparaison
    if (!user.password || user.password.length < 60 || !/^\$2[aby]\$\d+\$/.test(user.password)) {
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
    console.log("📝 Début updateProfile - Données reçues:", req.body);
    
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Erreurs de validation:", errors.array());
      
      // Créer un message d'erreur plus informatif
      const errorMessages = errors.array().map(error => `${error.param}: ${error.msg}`);
      return res.status(400).json({ 
        message: "Erreurs de validation: " + errorMessages.join(", "),
        errors: errors.array() 
      });
    }

    const userId = req.user.id;
    const { firstName, lastName, email, pseudo, avatar } = req.body;
    
    console.log("🔍 Données extraites:", {
      userId,
      firstName: firstName ? `"${firstName}"` : 'null',
      lastName: lastName ? `"${lastName}"` : 'null', 
      email: email ? `"${email}"` : 'null',
      pseudo: pseudo ? `"${pseudo}"` : 'null',
      avatar: avatar ? 'présent' : 'absent'
    });

    // Valider les champs requis
    if (!firstName || firstName.trim() === '') {
      return res.status(400).json({ 
        message: "Le prénom est requis et ne peut pas être vide" 
      });
    }

    if (!lastName || lastName.trim() === '') {
      return res.status(400).json({ 
        message: "Le nom est requis et ne peut pas être vide" 
      });
    }

    if (!email || email.trim() === '') {
      return res.status(400).json({ 
        message: "L'email est requis et ne peut pas être vide" 
      });
    }

    // Vérifier si l'email existe déjà pour un autre utilisateur
    console.log("🔍 Vérification de l'email:", email);
    const existingUser = await User.findByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      console.log("❌ Email déjà utilisé par un autre utilisateur");
      return res
        .status(400)
        .json({ message: "Cet email est déjà utilisé par un autre compte." });
    }
    console.log("✅ Email disponible");

    // Vérifier si le pseudo existe déjà pour un autre utilisateur (seulement si fourni)
    if (pseudo && pseudo.trim() !== '') {
      const trimmedPseudo = pseudo.trim();
      console.log("🔍 Vérification du pseudo:", `"${trimmedPseudo}"`);
      
      try {
        const existingPseudo = await User.findByPseudo(trimmedPseudo);
        console.log("📊 Résultat recherche pseudo:", existingPseudo ? `Trouvé: ${existingPseudo.id}` : 'Disponible');
        
        if (existingPseudo && existingPseudo.id !== userId) {
          console.log("❌ Pseudo déjà utilisé par un autre utilisateur:", existingPseudo.id);
          return res
            .status(400)
            .json({ message: "Ce pseudo est déjà utilisé par un autre compte." });
        }
        console.log("✅ Pseudo disponible");
      } catch (error) {
        console.error("❌ Erreur lors de la vérification du pseudo:", error);
        return res.status(500).json({ message: "Erreur lors de la vérification du pseudo." });
      }
    }

    console.log("📝 Mise à jour de l'utilisateur en cours...");
    
    // Mettre à jour l'utilisateur
    const updatedUser = await User.update(userId, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      pseudo: pseudo && pseudo.trim() !== '' ? pseudo.trim() : null,
      avatar,
    });
    
    if (!updatedUser) {
      console.log("❌ Échec de la mise à jour");
      return res.status(500).json({
        message: "Échec de la mise à jour du profil."
      });
    }
    
    console.log("✅ Utilisateur mis à jour avec succès:", {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      pseudo: updatedUser.pseudo
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
    console.error("❌ Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la mise à jour du profil.",
      error: error.message
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

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(userId, true); // includePassword = true
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Vérifier que le mot de passe existe dans la base de données
    if (!user.password) {
      console.error("Mot de passe manquant pour l'utilisateur:", userId);
      return res.status(500).json({ message: "Erreur de configuration du compte." });
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

    // Mettre à jour le mot de passe (la méthode changePassword se charge du hachage)
    await User.changePassword(userId, newPassword);

    res.json({ message: "Mot de passe modifié avec succès." });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors du changement de mot de passe.",
    });
  }
};

/**
 * Controller pour récupérer tous les utilisateurs (Admin uniquement)
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Vérifier que l'utilisateur connecté est un administrateur
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: "Accès refusé. Droits d'administrateur requis." 
      });
    }

    // Récupérer tous les utilisateurs sans les mots de passe
    const users = await User.getAll();
    
    console.log(`Admin ${req.user.email} a récupéré la liste de ${users.length} utilisateur(s)`);

    res.json({
      message: "Liste des utilisateurs récupérée avec succès.",
      users: users,
      total: users.length
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des utilisateurs.",
    });
  }
};

/**
 * Controller pour récupérer les utilisateurs avec pagination (Admin uniquement)
 */
exports.getUsersWithPagination = async (req, res) => {
  try {
    // Vérifier que l'utilisateur connecté est un administrateur
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: "Accès refusé. Droits d'administrateur requis." 
      });
    }

    // Récupérer les paramètres de pagination depuis la query string
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // Récupérer les utilisateurs avec pagination
    const result = await User.getAllWithPagination(limit, offset);
    
    console.log(`Admin ${req.user.email} a récupéré ${result.users.length} utilisateur(s) (page ${page}/${result.totalPages})`);

    res.json({
      message: "Liste des utilisateurs récupérée avec succès.",
      users: result.users,
      pagination: {
        total: result.total,
        hasMore: result.hasMore,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        limit: limit
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs avec pagination:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des utilisateurs.",
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

    // Extraire les métadonnées SVG si c'est un fichier SVG
    let avatarColor = null;
    let avatarInitials = null;

    if (avatar.mimetype === "image/svg+xml" || filename.endsWith('.svg')) {
      try {
        const fs = require('fs');
        const svgContent = fs.readFileSync(uploadPath, 'utf8');
        
        // Extraire la couleur des métadonnées
        const colorMatch = svgContent.match(/<metadata>\s*<color>(.*?)<\/color>/s);
        if (colorMatch) {
          avatarColor = colorMatch[1].trim();
          console.log('Couleur extraite du SVG:', avatarColor);
        }
        
        // Extraire les initiales des métadonnées
        const initialsMatch = svgContent.match(/<initials>(.*?)<\/initials>/s);
        if (initialsMatch) {
          avatarInitials = initialsMatch[1].trim();
          console.log('Initiales extraites du SVG:', avatarInitials);
        }

        // Si pas de métadonnées, essayer d'extraire depuis le contenu
        if (!avatarInitials) {
          const textMatch = svgContent.match(/<text[^>]*>([^<]+)<\/text>/);
          if (textMatch) {
            avatarInitials = textMatch[1].trim();
          }
        }

        if (!avatarColor) {
          const fillMatch = svgContent.match(/fill="([^"]+)"/);
          if (fillMatch && fillMatch[1] !== "white") {
            avatarColor = fillMatch[1];
          }
        }

      } catch (svgError) {
        console.error("Erreur lors de l'extraction des métadonnées SVG:", svgError);
      }
    }

    // Mettre à jour l'avatar de l'utilisateur dans la base de données avec les métadonnées
    const avatarUrl = `/uploads/${filename}`;
    const updateData = { 
      avatar: avatarUrl, 
      isPresetAvatar: false,
      avatarColor: avatarColor,
      avatarInitials: avatarInitials
    };
    
    await User.update(userId, updateData);

    console.log('Avatar mis à jour avec métadonnées:', {
      userId,
      avatarUrl,
      avatarColor,
      avatarInitials
    });

    res.json({
      message: "Avatar téléchargé avec succès.",
      avatarUrl: avatarUrl,
      avatarColor: avatarColor,
      avatarInitials: avatarInitials
    });
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'avatar:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors du téléchargement de l'avatar.",
    });
  }
};
