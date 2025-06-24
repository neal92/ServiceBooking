import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Calendar, AlertCircle, ArrowLeft, Briefcase, User, ChevronRight, ChevronLeft, Mail, Lock, AtSign, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/layout/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/form-styles.css';
import '../styles/auth-styles.css';

const Register = () => {
  // Récupérer le type d'utilisateur depuis la navigation
  const location = useLocation();
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
  const [slideIndex, setSlideIndex] = useState(0);

  // Messages d'erreur
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [pseudoError, setPseudoError] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  // Référence pour l'animation des dots
  const progressDotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { register, user, loading, error } = useAuth();
  // Configuration des étapes du formulaire
  const steps = [
    { title: "Prénom", description: "Comment souhaitez-vous être appelé ?" },
    { title: "Nom", description: "Votre nom de famille (optionnel)" },
    { title: "Pseudo", description: "Choisissez un identifiant unique" },
    { title: "Email", description: "Votre adresse email" },
    { title: "Mot de passe", description: "Créez un mot de passe sécurisé" }
  ];

  // Regex validations
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/; // Au moins 6 caractères, avec 1 lettre et 1 chiffre
  const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s']{2,}$/; // Au moins 2 caractères, lettres et espaces
  const PSEUDO_REGEX = /^[a-z0-9_]{3,20}$/; // Lettres minuscules, chiffres, underscore, 3-20 caractères    // Images pour le slider (thème rendez-vous professionnels et entreprise)
  const slideImages = [
    '/images/slides/team-meeting.svg',      // Image d'équipe locale
    '/images/slides/business-meeting.svg',  // Image de réunion professionnelle locale
    '/images/slides/calendar-planning.svg', // Image de calendrier/planning locale
  ];

  // Préchargement des images et changement toutes les 7 secondes
  useEffect(() => {
    // Précharger les images
    slideImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    const interval = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex + 1) % slideImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);  // Variants pour les animations
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
    if (!NAME_REGEX.test(value)) {
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

  const validatePseudo = (value: string) => {
    if (!value) {
      setPseudoError('Le pseudo est obligatoire');
      return false;
    }
    if (!PSEUDO_REGEX.test(value)) {
      setPseudoError('Le pseudo doit contenir entre 3 et 20 caractères (lettres minuscules, chiffres, underscore)');
      return false;
    }
    setPseudoError('');
    return true;
  };

  const validateEmail = (value: string) => {
    if (!EMAIL_REGEX.test(value)) {
      setEmailError('Veuillez entrer une adresse email valide');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string) => {
    if (!PASSWORD_REGEX.test(value)) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères, avec au moins une lettre et un chiffre');
      return false;
    }
    if (confirmPassword && value !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (value: string) => {
    if (value !== password) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Gérer le changement d'étape
  const goToNextStep = () => {
    let isValid = false;

    // Valider l'étape actuelle avant de continuer
    switch (currentStep) {
      case 0:
        isValid = validateFirstName(firstName);
        break;
      case 1:
        isValid = validateLastName(lastName);
        break;
      case 2:
        isValid = validatePseudo(pseudo);
        break;
      case 3:
        isValid = validateEmail(email);
        break;
      case 4:
        isValid = validatePassword(password) && validateConfirmPassword(confirmPassword);
        break;
      default:
        isValid = true;
    }

    if (!isValid) return;

    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(c => c + 1);
    } else {
      // On est à la dernière étape, on peut soumettre le formulaire
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
  // Fonction pour soumettre le formulaire
  const handleSubmit = async () => {
    try {
      // Validation finale avant soumission
      if (
        validateFirstName(firstName) &&
        validateLastName(lastName) &&
        validatePseudo(pseudo) &&
        validateEmail(email) &&
        validatePassword(password) &&
        validateConfirmPassword(confirmPassword)
      ) {
        setIsComplete(true);

        // Construction des données utilisateur
        const userData: any = {
          firstName,
          lastName: lastName || firstName,
          email,
          password,
          pseudo,
          role: isProfessional ? 'professional' : 'user'
        };

        // Appel de la fonction d'inscription
        await register(userData);

        // Note: La redirection sera effectuée automatiquement par le contexte d'authentification
        // lorsque l'utilisateur est défini
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      setIsComplete(false);
    }
  };

  // Gérer l'appui sur la touche "Enter" pour avancer
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goToNextStep();
    }
  };  // Rendu du champ en fonction de l'étape actuelle
  const renderCurrentField = () => {
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
                  className="error-message"
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <AlertCircle className="w-3 h-3 xs:w-4 xs:h-4 min-w-[12px] mr-1" />
                  <span className="error-text">{firstNameError}</span>
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
              />              {lastNameError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="error-message"
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <AlertCircle className="w-3 h-3 xs:w-4 xs:h-4 min-w-[12px] mr-1" />
                  <span className="error-text">{lastNameError}</span>
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
            >
              <label htmlFor="pseudo" className="field-label">
                <AtSign className="h-5 w-5 mr-2 text-blue-500" />
                Votre pseudo
              </label>
              <input
                id="pseudo"
                name="pseudo"
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value.toLowerCase())}
                onBlur={(e) => validatePseudo(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="jean_dupont"
                className={`field-input ${pseudoError ? 'field-error' : ''}`}
                autoFocus
              />              {pseudoError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="error-message"
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <AlertCircle className="w-3 h-3 xs:w-4 xs:h-4 min-w-[12px] mr-1" />
                  <span className="error-text">{pseudoError}</span>
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
            >
              <label htmlFor="email" className="field-label">
                <Mail className="h-5 w-5 mr-2 text-blue-500" />
                Votre adresse email
              </label>
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
                className={`field-input ${emailError ? 'field-error' : ''}`}
                autoFocus
              />              {emailError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="error-message"
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <AlertCircle className="w-3 h-3 xs:w-4 xs:h-4 min-w-[12px] mr-1" />
                  <span className="error-text">{emailError}</span>
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
                  className={`field-input pr-8 xs:pr-10 sm:pr-12 ${passwordError ? 'field-error' : ''}`}
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
                  className={`field-input pr-8 xs:pr-10 sm:pr-12 ${passwordError ? 'field-error' : ''}`}
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
              </div>{passwordError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="error-message"
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <AlertCircle className="w-3 h-3 xs:w-4 xs:h-4 min-w-[12px] mr-1" />
                  <span className="error-text">{passwordError}</span>
                </motion.div>
              )}
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  // Redirection si l'utilisateur est déjà connecté
  if (user) {
    return <Navigate to="/app" />;
  }

  return (
    <PageTransition type="slide" className="w-full h-screen">    <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex justify-center items-center py-1 xs:py-2 px-1 sm:px-4 md:py-8 auth-fullscreen-page">        <div className="absolute top-1 xs:top-2 left-1 xs:left-2 sm:top-4 sm:left-4 z-10">
      <Link to="/" className="flex items-center text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
        <ArrowLeft size={14} className="mr-1 xs:mr-1.5" />
        <span className="text-[10px] xs:text-xs sm:text-sm">Retour</span>
      </Link>
    </div>

      <div className="flex w-full max-w-5xl rounded-lg sm:rounded-xl shadow-lg overflow-hidden h-auto md:h-[550px] bg-white dark:bg-gray-800 auth-container scale-[0.85] xs:scale-90 sm:scale-100">
        {/* Partie gauche avec slider d'images */}
        <div className="hidden md:block md:w-1/2 relative auth-image-slider">
          {slideImages.map((image, index) => (<div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out auth-image-slide ${index === slideIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#f0f9ff', /* Bleu très clair */
            }}
          >              <div className="absolute inset-0 auth-image-overlay flex items-end p-8">
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
          ))}
        </div>          {/* Partie droite avec formulaire */}        <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-between">
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
            </div>            {/* Points de progression */}
            <div className="flex justify-center mb-3 xs:mb-5 sm:mb-8 md:mb-10">
              <div className="flex items-center space-x-1 sm:space-x-2">
                {steps.map((step, i) => (<React.Fragment key={i}>
                  <div
                    ref={el => progressDotRefs.current[i] = el}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${i < currentStep
                      ? 'bg-blue-600 cursor-pointer hover:scale-125'
                      : i === currentStep
                        ? 'bg-blue-500 ring-2 sm:ring-4 ring-blue-100 dark:ring-blue-900 animate-pulse'
                        : 'bg-gray-300 dark:bg-gray-600'
                      } transition-all duration-300`}
                    onClick={() => goToStep(i)}
                    style={i === currentStep ? {
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)'
                    } : {}}
                    title={step.title}
                  />
                  {i < steps.length - 1 && (
                    <div className={`h-0.5 w-3 sm:w-4 md:w-6 ${i < currentStep ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      } transition-all duration-300`} />
                  )}
                </React.Fragment>
                ))}
              </div>
            </div>            {/* Titre de l'étape */}
            <div className="text-center mb-3 xs:mb-4 sm:mb-6 md:mb-8">
              <motion.h3
                key={currentStep}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white"
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
            </div>              {/* Champ du formulaire */}
            <div className="relative overflow-hidden min-h-[120px] xs:min-h-[140px] sm:min-h-[180px] md:min-h-[200px]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
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
                  {renderCurrentField()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>            {/* Messages d'erreur */}
          {error && (
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
          )}{/* Boutons de navigation */}            <motion.div
            className="mt-3 xs:mt-4 sm:mt-8 md:mt-10 flex justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >            <motion.button
            type="button"
            onClick={goToPrevStep}
            disabled={currentStep === 0}
            className={`${currentStep === 0 ? 'invisible' : ''
              } inline-flex items-center px-2 xs:px-3 sm:px-4 md:px-5 py-1.5 xs:py-2 md:py-2.5 text-[11px] xs:text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Retour
            </motion.button>            <motion.button
              type="button"
              onClick={goToNextStep}
              disabled={loading}
              className={`inline-flex items-center px-3 xs:px-4 sm:px-5 md:px-7 py-1.5 xs:py-2 sm:py-2.5 md:py-3 border border-transparent text-[11px] xs:text-xs sm:text-sm font-medium rounded-md shadow-sm text-white ${isProfessional
                ? 'bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >{loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span className="text-xs sm:text-sm">Inscription en cours...</span>
              </span>
            ) : isComplete ? (<motion.span
              className="flex items-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs sm:text-sm">Compte créé !</span>
            </motion.span>) : currentStep === steps.length - 1 ? (
              <span className="flex items-center text-xs sm:text-sm">
                <span className="whitespace-nowrap">
                  Créer {window.innerWidth < 360 ? '' : 'mon compte'} {isProfessional && window.innerWidth >= 360 ? 'pro' : ''}
                </span>
              </span>
            ) : (
              <span className="flex items-center text-xs sm:text-sm">
                Continuer <ChevronRight className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4" />
              </span>
            )}
            </motion.button>
          </motion.div>          {/* Lien de connexion */}
          <div className="mt-2 xs:mt-3 sm:mt-6 text-center">
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
    </PageTransition>
  );
};

export default Register;