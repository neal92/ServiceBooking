import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle, ArrowLeft, Briefcase, User, ChevronRight, ChevronLeft, Mail, Lock, AtSign, Eye, EyeOff, Check, AlertTriangle, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFullMediaUrl } from '../utils/config';
import PageTransition from '../components/layout/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
/* Imports CSS temporairement commentés pour éviter les erreurs
import '../styles/form-styles.css';
import '../styles/auth-styles.css';
import '../styles/register-form.css';
import '../styles/register-images.css';
import '../styles/image-preload.css';
*/

const Register = () => {
  // Récupérer le type d'utilisateur depuis la navigation
  const location = useLocation();
  const navigate = useNavigate();
  const userType = location.state?.userType || 'client';
  const isProfessional = userType === 'professional';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // États pour la gestion des étapes du formulaire
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0); // -1: gauche, 1: droite, 0: initial
  // Messages d'erreur
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [pseudoError, setPseudoError] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  // Gestion des suggestions de pseudo
  const [pseudoSuggestions, setPseudoSuggestions] = useState<string[]>([]);
  const [checkingPseudo, setCheckingPseudo] = useState(false);
  const [pseudoAlreadyExists, setPseudoAlreadyExists] = useState(false);
  const [pseudoValid, setPseudoValid] = useState(false);

  // État pour gérer la vérification d'email
  const [checkingEmail, setCheckingEmail] = useState(false);
  // Référence non utilisée car la validation du pseudo se fait désormais uniquement au clic

  // Référence pour l'animation des dots
  const progressDotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { register, user, loading, error, setError } = useAuth();
  // Configuration des étapes du formulaire
  const steps = [
    { title: "Prénom", description: "Comment souhaitez-vous être appelé ?" },
    { title: "Nom", description: "Votre nom de famille (optionnel)" },
    { title: "Pseudo", description: "Choisissez un identifiant unique" },
    { title: "Email", description: "Votre adresse email" },
    { title: "Mot de passe", description: "Créez un mot de passe sécurisé" }
  ];

  // Log pour vérifier que les étapes sont bien définies
  console.log("Configuration des étapes:", steps);
  console.log(`Nombre d'étapes: ${steps.length}, Étape finale (index): ${steps.length - 1}`);


  // Regex validations
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/; // Au moins 6 caractères, avec 1 lettre et 1 chiffre
  const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s']{2,}$/; // Au moins 2 caractères, lettres et espaces
  const PSEUDO_REGEX = /^[a-z0-9_]{3,20}$/; // Lettres minuscules, chiffres, underscore, 3-20 caractères  // Fonction simplifiée pour construire les URLs d'image correctement
  const getImageUrl = (path: string) => {
    // Utiliser directement getFullMediaUrl pour construire l'URL
    return getFullMediaUrl(path);
  };

  // Utiliser l'image correcte selon le type de compte
  const professionalImage = getImageUrl('/images/slides/professional.jpg');
  const clientImage = getImageUrl('/images/slides/client.jpg');

  // Fallback images en cas d'erreur
  const professionalFallback = getImageUrl('/images/slides/business-meeting.svg');
  const clientFallback = getImageUrl('/images/slides/calendar-planning.svg');

  // URL finale de l'image d'arrière-plan
  const backgroundImage = isProfessional ? professionalImage : clientImage;
  const fallbackImage = isProfessional ? professionalFallback : clientFallback;

  // État pour suivre si l'image principale a été chargée ou non
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  // Précharger les images pour améliorer l'expérience utilisateur
  useEffect(() => {
    const preloadImages = () => {
      const imagesToPreload = [professionalImage, clientImage, professionalFallback, clientFallback];

      imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = () => console.log(`Image préchargée: ${src}`);
        img.onerror = () => console.error(`Échec préchargement: ${src}`);
      });
    };

    preloadImages();
  }, []);

  // Log pour déboguer l'URL de l'image
  console.log('Register page - Background image URL:', backgroundImage);
  console.log('Register page - User type:', isProfessional ? 'professional' : 'client');

  // Variants pour les animations
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? window.innerWidth < 640 ? 300 : 800 : window.innerWidth < 640 ? -300 : -800,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 350, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? window.innerWidth < 640 ? 300 : 800 : window.innerWidth < 640 ? -300 : -800,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring" as const, stiffness: 350, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 }
      }
    })
  };

  // Validation des champs
  const validateFirstName = (value: string) => {
    if (!value || !NAME_REGEX.test(value)) {
      setFirstNameError('Le prénom doit contenir au moins 2 caractères (lettres et espaces)');
      return false;
    }
    setFirstNameError('');
    return true;
  };
  const validateLastName = (value: string) => {
    if (!value) return true; // Optionnel
    if (!NAME_REGEX.test(value)) {
      setLastNameError('Le nom doit contenir au moins 2 caractères (lettres et espaces)');
      return false;
    }
    setLastNameError('');
    return true;
  };
  const validatePseudo = async (value: string) => {
    // Reset les états
    setPseudoSuggestions([]);
    setPseudoAlreadyExists(false);

    // Validation de base
    if (!value) {
      setPseudoError('Le pseudo est obligatoire');
      return false;
    }
    if (!PSEUDO_REGEX.test(value)) {
      setPseudoError('Le pseudo doit contenir entre 3 et 20 caractères (lettres minuscules, chiffres, underscore)');
      return false;
    }

    try {
      // Vérification de la disponibilité via l'API - uniquement lors du clic sur "continuer" maintenant
      console.log("Vérification complète du pseudo avec l'API:", value);
      const authService = await import('../services/auth').then(m => m.default);
      const result = await authService.checkPseudoAvailability(value);

      if (!result.available) {
        setPseudoError('Ce pseudo est déjà utilisé');
        setPseudoAlreadyExists(true);

        // Stocker les suggestions si disponibles
        if (result.suggestions && result.suggestions.length > 0) {
          setPseudoSuggestions(result.suggestions);
        }

        return false;
      }

      setPseudoError('');
      setPseudoValid(true);
      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification du pseudo:", error);
      setCheckingPseudo(false);
      // En cas d'erreur avec l'API, notifier l'utilisateur
      setPseudoError('Erreur lors de la vérification du pseudo. Veuillez réessayer.');
      return false;
    }
  }; const validateEmail = async (value: string) => {
    if (!value) {
      setEmailError('L\'adresse email est obligatoire');
      return false;
    }
    if (!EMAIL_REGEX.test(value)) {
      setEmailError('Veuillez entrer une adresse email valide');
      return false;
    }

    try {
      // Vérification de la disponibilité via l'API
      setCheckingEmail(true);
      const authService = await import('../services/auth').then(m => m.default);
      const result = await authService.checkEmailAvailability(value);
      setCheckingEmail(false);

      if (!result.available) {
        setEmailError('Cette adresse email est déjà utilisée');
        return false;
      }

      setEmailError('');
      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email:", error);
      setCheckingEmail(false);
      // En cas d'erreur avec l'API, on accepte l'email - la validation finale se fera côté serveur
      setEmailError('');
      return true;
    }
  };

  const validatePassword = (value: string) => {
    if (!PASSWORD_REGEX.test(value)) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères, avec au moins une lettre et un chiffre');
      setIsComplete(false);
      return false;
    }
    if (confirmPassword && value !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      setIsComplete(false);
      return false;
    }
    setPasswordError('');

    // Si on est à la dernière étape et que le confirm password est déjà valide, on peut activer le bouton
    if (currentStep === steps.length - 1 && confirmPassword && confirmPassword === value) {
      setIsComplete(true);
    }

    return true;
  };

  const validateConfirmPassword = (value: string) => {
    if (value !== password) {
      setPasswordError('Les mots de passe ne correspondent pas');
      setIsComplete(false);
      return false;
    }
    setPasswordError('');

    // Si on est à la dernière étape et que le password est valide, on peut activer le bouton
    if (currentStep === steps.length - 1 && PASSWORD_REGEX.test(password)) {
      setIsComplete(true);
    }

    return true;
  };

  // Gérer le changement d'étape
  const goToNextStep = async () => {
    let isValid = false;

    // Ne pas procéder si on est en train de vérifier le pseudo ou l'email
    if (checkingPseudo || checkingEmail || loading) {
      return;
    }

    // Afficher l'étape actuelle pour le débogage
    console.log(`Tentative de passage à l'étape suivante. Étape actuelle: ${currentStep}, Total étapes: ${steps.length}`);
    console.log(`Passage de l'étape ${currentStep} à l'étape ${currentStep + 1}`);

    try {
      // Valider l'étape actuelle avant de continuer
      switch (currentStep) {
        case 0:
          isValid = validateFirstName(firstName);
          break;
        case 1:
          isValid = validateLastName(lastName);
          break;
        case 2:
          // C'est ici que la validation complète du pseudo est effectuée
          // uniquement lorsque l'utilisateur clique sur "continuer"
          setCheckingPseudo(true);
          console.log("Vérification de la disponibilité du pseudo après clic sur continuer");
          isValid = await validatePseudo(pseudo);
          setCheckingPseudo(false);
          break;
        case 3:
          // Vérification de l'email (asynchrone)
          console.log("Vérification de la disponibilité de l'email après clic sur continuer");
          isValid = await validateEmail(email);
          break;
        case 4:
          console.log("Validation des mots de passe");
          isValid = validatePassword(password) && validateConfirmPassword(confirmPassword);
          if (isValid) {
            console.log("Mots de passe valides");
          }
          break;
        default:
          isValid = true;
      }
    } catch (error) {
      console.error("Erreur de validation:", error);
      isValid = false;
      setCheckingPseudo(false);
    }

    if (!isValid) return;

    console.log(`Étape actuelle: ${currentStep}, Nombre total d'étapes: ${steps.length}`);

    if (currentStep < steps.length - 1) {
      setDirection(1);
      // Étape spécifique pour le passage de l'étape 4 à l'étape de confirmation (5)
      if (currentStep === 4) {
        console.log("⚠️ Passage spécifique de l'étape 4 à l'étape de confirmation (5)");
      }

      setCurrentStep(c => {
        const nextStep = c + 1;
        console.log(`Passage à l'étape: ${nextStep} (depuis ${c})`);
        return nextStep;
      });

      // Vérification immédiate après la mise à jour de l'état
      setTimeout(() => {
        console.log(`Vérification après setCurrentStep: étape actuelle = ${currentStep}, devrait être passé à ${currentStep + 1}`);
      }, 100);
    } else {
      // On est à la dernière étape, on peut soumettre le formulaire
      console.log("Dernière étape atteinte, soumission du formulaire");
      handleSubmit();
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(c => c - 1);
    }
  };

  // Fonction pour aller à une étape spécifique
  const goToStep = (stepIndex: number) => {
    // Ne permet que de retourner à des étapes déjà visitées
    if (stepIndex < currentStep) {
      setDirection(stepIndex > currentStep ? 1 : -1);
      setCurrentStep(stepIndex);
    }
  };

  // Effet pour animer le point actif après chaque changement d'étape
  useEffect(() => {
    // Animation légère de pulsation pour le point actif
    const activeDot = progressDotRefs.current[currentStep];

    if (activeDot) {
      // Animation de mise en évidence
      const keyframes = [
        { transform: 'scale(1)', boxShadow: '0 0 0 0px rgba(59, 130, 246, 0.5)' },
        { transform: 'scale(1.2)', boxShadow: '0 0 0 5px rgba(59, 130, 246, 0.2)' },
        { transform: 'scale(1)', boxShadow: '0 0 0 0px rgba(59, 130, 246, 0.5)' }
      ];

      const options = {
        duration: 1500,
        iterations: 1,
        easing: 'ease-in-out'
      };

      // Exécuter l'animation après un court délai
      const timer = setTimeout(() => {
        activeDot.animate(keyframes, options);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Effet pour mettre à jour l'état isComplete lorsque nous sommes à la dernière étape
  useEffect(() => {
    console.log(`Effect pour isComplete déclenché: étape ${currentStep}/${steps.length - 1}`);

    // Pour l'étape des mots de passe (maintenant dernière étape)
    if (currentStep === steps.length - 1) {
      console.log("Étape des mots de passe (dernière étape)");
      // Vérifier si les mots de passe sont valides
      const passwordsValid = !!(password && confirmPassword && password === confirmPassword && PASSWORD_REGEX.test(password));
      setIsComplete(passwordsValid);
      console.log(`Les mots de passe sont ${passwordsValid ? 'valides' : 'invalides'}, isComplete: ${passwordsValid}`);

      // Si les mots de passe sont valides, mettre en évidence le bouton de création de compte
      if (passwordsValid) {
        // Attendre un court instant pour l'animation
        setTimeout(() => {
          // Faire défiler la page vers le bouton de création de compte
          const createAccountButton = document.getElementById('create-account-button');
          if (createAccountButton) {
            createAccountButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    }
  }, [currentStep, password, confirmPassword, PASSWORD_REGEX]);

  // Fonction pour soumettre le formulaire
  const handleSubmit = async () => {
    console.log("Fonction handleSubmit appelée - Étape actuelle:", currentStep);

    try {
      // Ne pas réinitialiser l'état de complétion pour permettre le clic du bouton
      // À l'étape finale, on effectue une dernière validation de tous les champs
      console.log("Validation finale du pseudo avant soumission");
      const isValidPseudo = await validatePseudo(pseudo);

      if (!isValidPseudo) {
        console.log("Soumission bloquée: pseudo déjà utilisé ou invalide");
        setError("Le pseudo choisi n'est pas valide ou est déjà utilisé.");
        return; // Bloquer la soumission si le pseudo n'est pas valide
      }

      if (
        validateFirstName(firstName) &&
        validateLastName(lastName) &&
        isValidPseudo && // Cette condition est redondante mais conservée pour clarté
        await validateEmail(email) &&
        validatePassword(password) &&
        validateConfirmPassword(confirmPassword)
      ) {

        // Construction des données utilisateur
        const userData: any = {
          firstName,
          lastName: lastName || firstName, // Le nom est optionnel, utiliser le prénom si non fourni
          email,
          password,
          pseudo: pseudo.toLowerCase().trim(), // Normaliser le pseudo avant envoi
          role: isProfessional ? 'admin' : 'user',
          userType: isProfessional ? 'professional' : 'client'
          // Le champ téléphone n'est pas inclus car la table users n'a pas cette colonne
        };

        try {
          // Afficher un message de chargement
          setError("Création de votre compte en cours...");

          // Log des données d'inscription pour le débogage
          console.log("Données d'inscription envoyées:", JSON.stringify({ ...userData, password: "***" }, null, 2));

          // Appel de la fonction d'inscription
          const response = await register(userData);

          // Vérifier que l'inscription a bien fonctionné
          if (response && response.user && response.token) {
            console.log("Inscription réussie avec les données utilisateur:", {
              id: response.user.id,
              email: response.user.email,
              firstName: response.user.firstName,
              role: response.user.role
            });

            // Afficher un message de succès pour informer l'utilisateur
            setError("Compte créé avec succès! Redirection...");

            // La redirection sera effectuée automatiquement par le composant qui vérifie l'état user,
            // mais on peut ajouter une redirection explicite après un court délai pour être sûr
            setTimeout(() => {
              console.log("Redirection après inscription réussie...");
              navigate('/app');
            }, 1500);
          } else {
            console.error("Réponse d'inscription incomplète:", response);
            throw new Error("Réponse du serveur incomplète");
          }
        } catch (registerError: any) {
          console.error("Erreur retournée par l'API:", registerError);

          // Détecter spécifiquement l'erreur de pseudo déjà utilisé
          if (registerError.message && registerError.message.toLowerCase().includes('pseudo')) {
            setPseudoError(registerError.message);
            setPseudoAlreadyExists(true);
            // Retourner à l'étape du pseudo
            setDirection(-1);
            setCurrentStep(2);
          }
          // Détecter l'erreur d'email déjà utilisé
          else if (registerError.message &&
            (registerError.message.toLowerCase().includes('email') ||
              registerError.message.toLowerCase().includes('adresse')) &&
            registerError.message.toLowerCase().includes('déjà utilisée')) {
            setEmailError("Cette adresse email est déjà utilisée.");
            // Retourner à l'étape de l'email
            setDirection(-1);
            setCurrentStep(3);
          } else {
            // Afficher l'erreur générale
            setError(`Erreur lors de l'inscription: ${registerError.message}`);
          }

          setIsComplete(false);
        }
      }
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      setError(`Une erreur inattendue s'est produite: ${error.message}`);
      setIsComplete(false);

      // Vérifier si l'utilisateur a quand même été créé en vérifiant le localStorage
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        console.log("Malgré l'erreur, un token et un utilisateur sont présents dans localStorage");

        try {
          // Tenter une redirection après un court délai
          setTimeout(() => {
            console.log("Tentative de redirection après délai...");
            navigate('/app');
          }, 2000);
        } catch (navError) {
          console.error("Erreur lors de la tentative de redirection:", navError);
        }
      }
    }
  };
  // Gérer l'appui sur la touche "Enter" pour avancer
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!checkingPseudo && !checkingEmail && !loading) {
        goToNextStep();
      }
    }
  };

  // Rendu du champ en fonction de l'étape actuelle
  const renderCurrentField = () => {
    console.log(`Rendu du champ pour l'étape: ${currentStep}/${steps.length - 1}`);
    console.log(`Étape de confirmation attendue: ${steps.length - 1}`);
    console.log(`Détail des étapes: ${JSON.stringify(steps)}`);

    switch (currentStep) {
      case 0:
        return (
          <div className="form-field-container">
            <motion.div
              className="form-field"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label htmlFor="firstName" className="field-label">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Votre prénom
              </label>              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={(e) => validateFirstName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Jean"
                className={`field-input ${firstNameError ? 'field-error' : ''}`}
                autoFocus
              />              {firstNameError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="error-message high-contrast-error"
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <AlertCircle className="w-3 h-3 xs:w-4 xs:h-4 min-w-[12px] mr-1" />
                  <span className="error-text text-xs">{firstNameError}</span>
                </motion.div>
              )}
            </motion.div>
          </div>
        );

      case 1:
        return (
          <div className="form-field-container">
            <motion.div
              className="form-field"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label htmlFor="lastName" className="field-label">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Votre nom (optionnel)
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={(e) => validateLastName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Dupont"
                className={`field-input ${lastNameError ? 'field-error' : ''}`}
                autoFocus
              />
              {lastNameError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="error-message high-contrast-error"
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <AlertCircle className="w-3 h-3 xs:w-4 xs:h-4 min-w-[12px] mr-1" />
                  <span className="error-text text-xs">{lastNameError}</span>
                </motion.div>
              )}
            </motion.div>
          </div>
        );

      case 2:
        return (
          <div className="form-field-container">
            <motion.div
              className="form-field"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >              <label htmlFor="pseudo" className="field-label">
                <AtSign className="h-5 w-5 mr-2 text-blue-500" />
                Votre pseudo
              </label>
              <div className="relative w-full flex justify-center">                <input
                id="pseudo"
                name="pseudo"
                type="text"
                value={pseudo}
                onChange={(e) => {
                  const newValue = e.target.value.toLowerCase();
                  setPseudo(newValue);

                  // Réinitialiser les états lors de chaque changement
                  setPseudoValid(false);
                  if (pseudoError) setPseudoError('');

                  // Validation basique sans appel API
                  if (newValue && !PSEUDO_REGEX.test(newValue)) {
                    setPseudoError('Le pseudo doit contenir entre 3 et 20 caractères (lettres minuscules, chiffres, underscore)');
                  } else if (pseudoError) {
                    setPseudoError('');
                  }
                }}
                onBlur={(e) => {                    // Validation locale uniquement sans appel API
                  if (e.target.value && !PSEUDO_REGEX.test(e.target.value)) {
                    setPseudoError('Le pseudo doit contenir entre 3 et 20 caractères (lettres minuscules, chiffres, underscore)');
                  }
                }}
                onKeyPress={handleKeyPress}
                placeholder="jean_dupont"
                className={`field-input w-[90%] ${pseudoError ? 'field-error' : pseudoValid ? 'border-green-500' : ''}`}
                style={{ width: "90%", maxWidth: "90%" }}
                autoFocus
                disabled={checkingPseudo}
              />
                {checkingPseudo ? (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  </div>
                ) : pseudoValid ? (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                ) : null}
              </div>

              {pseudoError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="error-message high-contrast-error"
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <AlertCircle className="w-3 h-3 xs:w-4 xs:h-4 min-w-[12px] mr-1" />
                  <span className="error-text text-xs">{pseudoError}</span>
                </motion.div>
              )}              {/* Suggestions de pseudo */}
              {pseudoAlreadyExists && pseudoSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="suggestions-container mt-3 p-3 bg-blue-50 dark:bg-gray-700 rounded-md"
                >
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                    <span className="font-medium">Ce pseudo est déjà utilisé.</span>{' '}
                    Essayez une de ces alternatives :
                  </p>
                  <div className="flex flex-wrap gap-1.5 xs:gap-2 justify-center">
                    {pseudoSuggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        type="button"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          transition: { delay: index * 0.1 }
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                          setPseudo(suggestion);
                          setPseudoError('');
                          setPseudoAlreadyExists(false);
                          setPseudoSuggestions([]);
                          // Valider immédiatement le nouveau pseudo choisi
                          await validatePseudo(suggestion);
                        }}
                        className="text-[0.65rem] xs:text-xs whitespace-nowrap bg-white dark:bg-gray-800 border border-blue-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 text-blue-600 dark:text-blue-400 rounded-full px-2 xs:px-3 py-1 transition-all"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        );

      case 3:
        return (
          <div className="form-field-container">
            <motion.div
              className="form-field"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >              <label htmlFor="email" className="field-label">
                <Mail className="h-5 w-5 mr-2 text-blue-500" />
                Votre adresse email
              </label>              <div className="relative w-full flex justify-center">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={(e) => validateEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="jean.dupont@exemple.com"
                  className={`field-input w-[90%] ${emailError ? 'field-error' : ''} ${checkingEmail ? 'pr-8' : ''}`}
                  style={{ width: "90%", maxWidth: "90%" }}
                  autoFocus
                  disabled={checkingEmail}
                />
                {checkingEmail && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  </div>
                )}
              </div>
              {emailError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="error-message high-contrast-error"
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <AlertCircle className="w-3 h-3 xs:w-4 xs:h-4 min-w-[12px] mr-1" />
                  <span className="error-text text-xs">{emailError}</span>
                </motion.div>
              )}
            </motion.div>
          </div>
        );

      case 4:
        return (
          <div className="form-field-container">
            <motion.div
              className="form-field"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >              <label htmlFor="password" className="field-label">
                <Lock className="h-5 w-5 mr-2 text-blue-500" />
                Votre mot de passe
              </label>              <div className="password-field-wrapper relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (confirmPassword) validateConfirmPassword(confirmPassword);
                  }}
                  onBlur={(e) => validatePassword(e.target.value)}
                  placeholder="••••••••"
                  className={`field-input pr-7 xs:pr-8 sm:pr-10 ${passwordError
                    ? 'field-error'
                    : (!passwordError && password && confirmPassword && password === confirmPassword)
                      ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10'
                      : ''
                    }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="password-toggle-button"
                  title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" /> : <Eye className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>

              <label htmlFor="confirm-password" className="field-label mt-4">
                <Lock className="h-5 w-5 mr-2 text-blue-500" />
                Confirmer le mot de passe
              </label>              <div className="password-field-wrapper relative">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    validateConfirmPassword(e.target.value);
                  }}
                  onBlur={(e) => validateConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="••••••••"
                  className={`field-input pr-8 xs:pr-10 sm:pr-12 ${passwordError
                    ? 'field-error'
                    : (!passwordError && password && confirmPassword && password === confirmPassword)
                      ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10'
                      : ''
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="password-toggle-button"
                  title={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showConfirmPassword ? <EyeOff className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" /> : <Eye className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>              {/* Message d'erreur pour les mots de passe - version plus compacte */}
              {passwordError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="error-message high-contrast-error my-1 py-1 critical-alert"
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <div className="flex items-center">
                    <AlertCircle className="w-3 h-3 xs:w-4 xs:h-4 text-red-700 mr-1.5 flex-shrink-0" />
                    <p className="text-xs error-text">{passwordError}</p>
                  </div>
                </motion.div>
              )}

              {/* Message de succès pour les mots de passe - version plus compacte */}
              {currentStep === steps.length - 1 && !passwordError && password && confirmPassword && password === confirmPassword && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="success-message high-contrast-success my-1 py-1 alert-message"
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <div className="flex items-center">
                    <Check className="w-3 h-3 xs:w-4 xs:h-4 text-green-700 mr-1.5 flex-shrink-0" />
                    <p className="text-xs">Parfait! Les mots de passe correspondent. <strong>Cliquez sur "Créer mon compte"</strong> ci-dessous.</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        );

      default:
        console.error(`⚠️ Cas non géré dans renderCurrentField: ${currentStep}`);
        // Renvoyer un message d'erreur visible pour l'utilisateur au lieu de null
        return (
          <div className="form-field-container">
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-600 p-4 text-red-700 dark:text-red-400">
              <p className="text-sm">Une erreur s'est produite lors de l'affichage du formulaire. Veuillez actualiser la page ou contacter le support.</p>
            </div>
          </div>
        );
    }

    // Log après le rendu pour vérification
    console.log(`Rendu terminé pour l'étape ${currentStep}. Contenu généré: ${currentStep < steps.length ? "Oui" : "Non - Erreur"}`);
  };

  // Effet pour vérifier si l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      console.log("Register: Détection de l'utilisateur connecté, redirection vers /app", user);
    }
  }, [user]);

  // Redirection si l'utilisateur est déjà connecté
  if (user) {
    console.log("Register: Redirection automatique vers /app car l'utilisateur est connecté", {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role
    });

    // Vérifier que le token est également présent
    const token = localStorage.getItem('token');
    console.log("Token dans localStorage:", token ? "présent" : "absent");

    return <Navigate to="/app" />;
  }
  return (
    <PageTransition type="slide" className="w-full h-screen">    <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex justify-center items-center py-1 xs:py-2 px-1 sm:px-4 md:py-8 auth-fullscreen-page">        <div className="absolute top-1 xs:top-2 left-1 xs:left-2 sm:top-4 sm:left-4 z-10">
      <Link
        to="/"
        className="flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 shadow-sm transition-all duration-200"
      >
        <ArrowLeft size={14} className="mr-1 xs:mr-1.5" />
        <span className="text-[10px] xs:text-xs sm:text-sm font-medium">Retour à l'accueil</span>
      </Link>
    </div>      <div className="flex w-full max-w-5xl rounded-lg sm:rounded-xl shadow-lg overflow-hidden h-auto md:h-[520px] bg-white dark:bg-gray-800 auth-container scale-[0.85] xs:scale-90 sm:scale-100">
        {/* Partie gauche avec image fixe */}        <div className="w-0 xs:w-1/4 sm:w-1/3 md:w-1/2 relative auth-image-slider">
          {/* Div principal avec image de fond */}
          <div
            className={`absolute inset-0 auth-image-slide ${imageLoaded ? 'loaded' : ''}`}
            style={{
              backgroundImage: imageFailed ? 'none' : `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: imageFailed ? '#1e3a8a' : 'transparent',
              transition: 'background-color 0.5s ease'
            }}
          >
            {/* Image fallback SVG visible en cas d'erreur */}            <img
              src={backgroundImage}
              alt={isProfessional ? "Image professionnel" : "Image client"}
              className={`fallback-image ${imageFailed ? 'show' : ''}`}
              onLoad={() => {
                console.log("Image chargée avec succès:", backgroundImage);
                setImageLoaded(true);
                setImageFailed(false);
              }}
              onError={(e) => {
                console.error("Erreur de chargement d'image:", backgroundImage);
                setImageFailed(true);

                // Afficher l'image de secours
                console.log("Utilisation de l'image de secours:", fallbackImage);
                (e.target as HTMLImageElement).src = fallbackImage;

                // Loguer l'URL complète pour débogage
                const img = new Image();
                img.src = backgroundImage;
                console.log("URL complète ayant échoué:", img.src);

                // Vérifier si l'image existe avec un fetch
                fetch(backgroundImage)
                  .then(response => {
                    if (!response.ok) {
                      console.error(`L'image n'est pas accessible: ${response.status} ${response.statusText}`);
                    } else {
                      console.log("L'image est accessible via fetch mais n'a pas pu être chargée comme background");
                    }
                  })
                  .catch(error => console.error("Erreur fetch image:", error));
              }}
            />

            {/* Message d'erreur de connexion au serveur */}
            {imageFailed && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-blue-900/90 text-white p-4 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-3">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <h3 className="text-sm font-semibold mb-1">Problème de connexion au serveur</h3>
                <p className="text-xs opacity-85">Impossible de charger les images. Veuillez vérifier votre connexion ou réessayer ultérieurement.</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-blue-600/0 hover:bg-blue-600/20 transition-colors duration-300"></div>
            <div className="absolute inset-0 flex items-end p-8">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2 text-shadow">ServiceBooking {isProfessional ? 'Pro' : ''}</h3>
                <p className="text-sm opacity-90 text-shadow">
                  {isProfessional
                    ? "Optimisez votre agenda et valorisez vos services"
                    : "Réservez facilement vos rendez-vous"}
                </p>
              </div>
            </div>

          </div>
        </div>
        {/* Partie droite avec formulaire */}
        <div className="w-full xs:w-3/4 sm:w-2/3 md:w-1/2 bg-white dark:bg-gray-800 p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-between register-form">
          <div>
            {/* En-tête */}
            <div className="flex items-center mb-3 sm:mb-6">
              {isProfessional ? (
                <Briefcase className="h-6 w-6 md:h-8 md:w-8 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              ) : (
                <Calendar className="h-6 w-6 md:h-8 md:w-8 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              )}              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {isProfessional ? "Compte professionnel" : "Nouveau compte"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {isProfessional
                    ? "Proposez vos services et gérez vos rendez-vous"
                    : "Réservez et gérez vos rendez-vous facilement"
                  }
                </p>
              </div>
            </div>              {/* Barre de progression */}
            <div className="flex justify-center mb-2 sm:mb-3">
              <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mb-2">
                <motion.div
                  className="bg-blue-600 h-1.5 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>            {/* Points de progression */}            <div className="flex justify-center mb-2 xs:mb-3 sm:mb-6 md:mb-8">
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                {steps.map((step, i) => (<React.Fragment key={i}>
                  <div
                    ref={el => progressDotRefs.current[i] = el}
                    className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full ${i < currentStep
                      ? 'bg-blue-600 cursor-pointer hover:scale-125'
                      : i === currentStep
                        ? 'bg-blue-500 ring-1 sm:ring-2 ring-blue-100 dark:ring-blue-900 animate-pulse'
                        : 'bg-gray-300 dark:bg-gray-600'
                      } transition-all duration-300`}
                    onClick={() => goToStep(i)}
                    style={i === currentStep ? {
                      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
                    } : {}}
                    title={step.title}
                  />
                  {i < steps.length - 1 && (
                    <div className={`h-0.5 w-2 sm:w-3 md:w-4 ${i < currentStep ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      } transition-all duration-300`} />
                  )}
                </React.Fragment>
                ))}
              </div>
            </div>{/* Titre de l'étape */}            <div className="text-center mb-2 xs:mb-3 sm:mb-4 md:mb-6">
              <motion.h3
                key={currentStep}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-base sm:text-lg font-bold text-gray-900 dark:text-white"
              >
                {steps[currentStep].title}
              </motion.h3>
              <motion.p
                key={`desc-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1"
              >
                {steps[currentStep].description}
              </motion.p>
            </div>

            {/* Champ du formulaire */}
            <div className="relative overflow-hidden min-h-[120px] xs:min-h-[140px] sm:min-h-[180px] md:min-h-[210px]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                {(() => {
                  // Logs pour le débogage avant le rendu
                  console.log(`Rendu de l'animation pour l'étape ${currentStep}/${steps.length - 1}`);
                  return (
                    <motion.div
                      key={currentStep}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="absolute w-full"
                      style={{ willChange: 'transform, opacity' }}
                    >
                      {(() => {
                        console.log(`Étape actuelle dans le rendu AnimatePresence: ${currentStep}`);
                        const renderedContent = renderCurrentField();
                        console.log(`Contenu rendu disponible: ${renderedContent ? 'Oui' : 'Non'}`);
                        return renderedContent;
                      })()}
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>
          </div>          {/* Boutons de navigation entre étapes du formulaire */}
          <div className="flex justify-between mt-4 xs:mt-5">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={goToPrevStep}
                className="flex items-center justify-center px-2 py-1 text-[10px] xs:text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-3 h-3 xs:w-3.5 xs:h-3.5 mr-1" />
                Précédent
              </button>
            ) : (<div>{/* Espace vide pour maintenir la flexbox alignée */}</div>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  console.log(`Clic sur le bouton - Étape actuelle: ${currentStep}, Étape de confirmation: ${steps.length - 1}`);
                  console.log(`isComplete: ${isComplete}, Bouton cliqué: "Suivant"`);
                  goToNextStep();
                }}
                disabled={checkingPseudo || checkingEmail || loading}
                className="flex items-center justify-center px-2 py-1 text-[10px] xs:text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 rounded-md shadow-sm transition-colors"
                title="Passer à l'étape suivante"
              >
                Suivant
                <ChevronRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 ml-1" />
              </button>
            ) : (
              <button
                type="button"
                id="create-account-button"
                onClick={handleSubmit}
                disabled={loading || !isComplete}
                className={`flex items-center justify-center px-4 py-3 text-sm sm:text-base font-medium text-white 
                  ${!isComplete
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 shadow-lg ring-4 ring-green-300 dark:ring-green-800/30 transform hover:scale-[1.03] animate-pulse cursor-pointer'
                  } disabled:opacity-50 rounded-md shadow-sm transition-all duration-300`}
                title={isComplete ? "Cliquez pour créer votre compte" : "Veuillez remplir correctement tous les champs du mot de passe"}
                ref={el => {
                  // Auto-focus sur le bouton à l'étape finale
                  console.log(`Référence au bouton final, étape actuelle: ${currentStep}, dernière étape: ${steps.length - 1}`);
                  if (el && !loading && currentStep === steps.length - 1) {
                    console.log("Mise au focus du bouton de création de compte");
                    setTimeout(() => el.focus(), 500);
                  }
                }}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Création...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <span className={`${isComplete ? 'bg-white/20 rounded-full p-1 mr-2' : 'mr-1'}`}>
                      <Check className={`${isComplete ? 'w-5 h-5' : 'w-4 h-4 ml-1'}`} />
                    </span>
                    Créer mon compte
                  </span>
                )}
                {isComplete && !loading && (
                  <span className="absolute inset-0 rounded-md overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20 animate-shine"></span>
                  </span>
                )}
              </button>
            )}
          </div>          {/* Messages d'erreur globaux */}
          {error && !emailError && !pseudoError && !passwordError && !firstNameError && !lastNameError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-2 xs:p-3 sm:p-4 my-2 xs:my-3 sm:my-4 rounded-r max-w-[95%] mx-auto"
            >
              <div className="flex items-start">
                <AlertCircle className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-red-500 dark:text-red-400 mr-1 sm:mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] xs:text-xs sm:text-sm font-medium text-red-700 dark:text-red-400 leading-tight">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Séparateur et lien de connexion */}
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-[11px] xs:text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Déjà un compte ?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">
                  Connectez-vous
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Register;