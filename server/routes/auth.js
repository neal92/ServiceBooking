const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const pseudoController = require("../controllers/pseudoController");
const { authenticate } = require("../middleware/auth");

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

// Update profile (protected route)
router.put(
  "/profile",
  authenticate,
  [
    body("firstName")
      .optional()
      .notEmpty()
      .withMessage("First name cannot be empty if provided"),
    body("lastName")
      .optional()
      .notEmpty()
      .withMessage("Last name cannot be empty if provided"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Valid email is required if provided"),
  ],
  authController.updateProfile
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

module.exports = router;
