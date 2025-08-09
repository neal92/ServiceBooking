const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const pseudoController = require("../controllers/pseudoController");
const { authenticate } = require("../middleware/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - email
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *           description: Prénom de l'utilisateur
 *         lastName:
 *           type: string
 *           description: Nom de famille (optionnel)
 *         email:
 *           type: string
 *           format: email
 *           description: Adresse email
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Mot de passe (minimum 6 caractères)
 *         pseudo:
 *           type: string
 *           description: Pseudo (optionnel)
 *         phone:
 *           type: string
 *           description: Numéro de téléphone (optionnel)
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Adresse email
 *         password:
 *           type: string
 *           description: Mot de passe
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: Token JWT d'authentification
 *         user:
 *           $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Créer un nouveau compte utilisateur
 *     description: Inscription d'un nouvel utilisateur dans le système
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Données invalides ou email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 */
// Register route
router.post(
  "/register",
  [
    body("firstName").notEmpty().withMessage("Le prénom est requis"),
    body("lastName").optional(), // Le nom de famille est optionnel maintenant
    body("email").isEmail().withMessage("Une adresse email valide est requise"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Le mot de passe doit comporter au moins 6 caractères"),
    body("pseudo")
      .optional()
      .custom((value) => {
        if (value && value.trim().length < 3) {
          throw new Error("Le pseudo doit contenir au moins 3 caractères");
        }
        return true;
      }),
    body("phone")
      .optional()
      .isMobilePhone(["fr-FR", "any"])
      .withMessage("Le numéro de téléphone doit être valide"),
    body("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage("Rôle non valide"),
  ],
  authController.register
);

// Login route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.login
);

// Get current user (protected route)
router.get("/me", authenticate, authController.getCurrentUser);

// Update user profile (protected route)
router.put(
  "/profile",
  authenticate,
  [
    body("firstName")
      .optional({ checkFalsy: false })
      .isLength({ min: 1, max: 50 })
      .withMessage("Le prénom doit contenir entre 1 et 50 caractères"),
    body("lastName")
      .optional({ checkFalsy: false })
      .isLength({ min: 1, max: 50 })
      .withMessage("Le nom doit contenir entre 1 et 50 caractères"),
    body("email")
      .optional({ checkFalsy: false })
      .isEmail()
      .withMessage("Une adresse email valide est requise"),
    body("phone")
      .optional({ nullable: true, checkFalsy: true })
      .isMobilePhone(["fr-FR", "any"])
      .withMessage("Le numéro de téléphone doit être valide"),
    body("pseudo")
      .optional({ nullable: true, checkFalsy: true })
      .isLength({ min: 3, max: 20 })
      .withMessage("Le pseudo doit contenir entre 3 et 20 caractères")
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage("Le pseudo ne peut contenir que des lettres, chiffres, points, tirets et underscores"),
  ],
  authController.updateProfile
);

// Change password (protected route)
router.post(
  "/change-password",
  authenticate,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Le mot de passe actuel est requis"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage(
        "Le nouveau mot de passe doit comporter au moins 6 caractères"
      ),
  ],
  authController.changePassword
);

// Change password (protected route)
router.put(
  "/password",
  authenticate,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ],
  authController.changePassword
);

// Upload avatar (protected route)
router.post("/avatar", authenticate, authController.uploadAvatar);

// Vérifier la disponibilité du pseudo (route publique)
router.get("/check-pseudo", pseudoController.checkPseudoAvailability);

// Vérifier la disponibilité de l'email (route publique)
const emailController = require("../controllers/emailController");
router.get("/check-email", emailController.checkEmailAvailability);

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs (Admin uniquement)
 *     description: Récupère la liste complète des utilisateurs. Accessible uniquement aux administrateurs.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message de succès
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       email:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       role:
 *                         type: string
 *                       pseudo:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       avatar:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *                   description: Nombre total d'utilisateurs
 *       403:
 *         description: Accès refusé - Droits d'administrateur requis
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
// Get all users (Admin only)
router.get("/users", authenticate, authController.getAllUsers);

/**
 * @swagger
 * /auth/users/paginated:
 *   get:
 *     summary: Récupérer les utilisateurs avec pagination (Admin uniquement)
 *     description: Récupère une liste paginée des utilisateurs. Par défaut, affiche 5 utilisateurs par page.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de la page (commence à 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 5
 *         description: Nombre d'utilisateurs par page (max 50)
 *     responses:
 *       200:
 *         description: Liste paginée des utilisateurs récupérée avec succès
 *       403:
 *         description: Accès refusé - Droits d'administrateur requis
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
// Get users with pagination (Admin only) - 5 users by default with "load more" functionality
router.get("/users/paginated", authenticate, authController.getUsersWithPagination);

module.exports = router;
