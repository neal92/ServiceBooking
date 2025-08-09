import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle, ArrowLeft, Briefcase, User, ChevronRight, ChevronLeft, Mail, Lock, AtSign, Eye, EyeOff, Check, AlertTriangle, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFullMediaUrl } from '../utils/config';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';

const Register = () => {
  // Récupérer le type d'utilisateur depuis la navigation
  const location = useLocation();
  const navigate = useNavigate();
  const userType = location.state?.userType || 'client';
  const isProfessional = userType === 'professional';

  // États pour les champs du formulaire
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

  // États pour le slider d'images (comme dans Login.tsx)
  const [slideIndex, setSlideIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<{ [key: string]: boolean }>({});
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  // Référence pour l'animation des dots
  const progressDotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { register, user, loading, error, setError } = useAuth();

  // Liste des images du slider (même que Login.tsx)
  const slideImages = [
    '/images/slides/slide 1.jpg',
    '/images/slides/slide 2.jpg',
    '/images/slides/slide 3.jpg',
    '/images/slides/slide 4.jpg',
    '/images/slides/slide 5.jpg',
    '/images/slides/slide 6.jpg',
    '/images/slides/slide 7.jpg',
    '/images/slides/slide 8.jpg',
    '/images/slides/slide 9.jpg',
  ].map(path => getFullMediaUrl(path));

  // Configuration du slider (copié de Login.tsx)
  useEffect(() => {
    const preloadImages = async () => {
      const imageLoadPromises = slideImages.map(src => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            setImagesLoaded(prev => ({ ...prev, [src]: true }));
            resolve();
          };
          img.onerror = () => {
            setImagesLoaded(prev => ({ ...prev, [src]: true }));
            resolve();
          };
        });
      });

      await Promise.all(imageLoadPromises);
      setAllImagesLoaded(true);
    };

    preloadImages();
  }, [slideImages]);

  // Gestion des transitions de slides (copié de Login.tsx)
  useEffect(() => {
    if (!allImagesLoaded) return;

    const nextSlide = () => {
      setPreviousIndex(slideIndex);
      const newIndex = (slideIndex + 1) % slideImages.length;
      setIsTransitioning(true);
      setSlideIndex(newIndex);

      setTimeout(() => {
        setIsTransitioning(false);
      }, 3000);
    };

    const interval = setInterval(() => {
      if (!isTransitioning) {
        nextSlide();
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [allImagesLoaded, slideIndex, slideImages.length, isTransitioning]);

  // Configuration des étapes du formulaire
  const steps = [
    { title: "Bienvenue", description: "Choisissez votre type de compte" },
    { title: "Identité", description: "Vos informations personnelles" },
    { title: "Pseudo", description: "Choisissez votre nom d'utilisateur" },
    { title: "Contact", description: "Votre adresse email" },
    { title: "Sécurité", description: "Créez votre mot de passe" }
  ];

  // Regex validations
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/; // Au moins une lettre, un chiffre, 6 caractères minimum (accepte tous caractères)
  const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s']{2,}$/;
  const PSEUDO_REGEX = /^[a-z0-9_]{3,20}$/;

  // Variants pour les animations
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? (window.innerWidth < 640 ? 300 : 800) : (window.innerWidth < 640 ? -300 : -800),
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
      x: direction < 0 ? (window.innerWidth < 640 ? 300 : 800) : (window.innerWidth < 640 ? -300 : -800),
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring" as const, stiffness: 350, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 }
      }
    })
  };

  // Fonctions de validation
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
    setPseudoSuggestions([]);
    setPseudoAlreadyExists(false);

    if (!value) {
      setPseudoError('Le pseudo est obligatoire');
      return false;
    }
    if (!PSEUDO_REGEX.test(value)) {
      setPseudoError('Le pseudo doit contenir entre 3 et 20 caractères (lettres minuscules, chiffres, underscore)');
      return false;
    }

    try {
      setCheckingPseudo(true);
      const authService = await import('../services/auth').then(m => m.default);
      const result = await authService.checkPseudoAvailability(value);
      setCheckingPseudo(false);

      if (!result.available) {
        setPseudoError('Ce pseudo est déjà utilisé');
        setPseudoAlreadyExists(true);

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
      setPseudoError('Erreur lors de la vérification du pseudo. Veuillez réessayer.');
      return false;
    }
  };

  const validateEmail = async (value: string) => {
    if (!value) {
      setEmailError('L\'adresse email est obligatoire');
      return false;
    }
    if (!EMAIL_REGEX.test(value)) {
      setEmailError('Veuillez entrer une adresse email valide');
      return false;
    }

    try {
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
      setEmailError('');
      return true;
    }
  };

  const validatePassword = (value: string) => {
    if (!value || value.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      setIsComplete(false);
      return false;
    }
    
    if (!/(?=.*[A-Za-z])/.test(value)) {
      setPasswordError('Le mot de passe doit contenir au moins une lettre');
      setIsComplete(false);
      return false;
    }
    
    if (!/(?=.*\d)/.test(value)) {
      setPasswordError('Le mot de passe doit contenir au moins un chiffre');
      setIsComplete(false);
      return false;
    }
    
    if (confirmPassword && value !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      setIsComplete(false);
      return false;
    }
    
    setPasswordError('');

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

    // Vérifier si le mot de passe principal est valide avant d'activer le bouton
    if (currentStep === steps.length - 1 && password && PASSWORD_REGEX.test(password)) {
      setIsComplete(true);
    }

    return true;
  };

  // Gérer le changement d'étape
  const goToNextStep = async () => {
    let isValid = false;

    if (checkingPseudo || checkingEmail || loading) {
      return;
    }

    try {
      switch (currentStep) {
        case 0:
          isValid = true; // Étape de bienvenue
          break;
        case 1:
          isValid = validateFirstName(firstName) && validateLastName(lastName);
          break;
        case 2:
          setCheckingPseudo(true);
          isValid = await validatePseudo(pseudo);
          setCheckingPseudo(false);
          break;
        case 3:
          isValid = await validateEmail(email);
          break;
        case 4:
          isValid = validatePassword(password) && validateConfirmPassword(confirmPassword);
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

    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(c => c + 1);
    } else {
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
    if (stepIndex < currentStep) {
      setDirection(stepIndex > currentStep ? 1 : -1);
      setCurrentStep(stepIndex);
    }
  };

  // Effet pour animer le point actif après chaque changement d'étape
  useEffect(() => {
    const activeDot = progressDotRefs.current[currentStep];

    if (activeDot) {
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

      const timer = setTimeout(() => {
        activeDot.animate(keyframes, options);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Effet pour mettre à jour l'état isComplete
  useEffect(() => {
    if (currentStep === steps.length - 1) {
      const passwordsValid = !!(password && confirmPassword && password === confirmPassword && PASSWORD_REGEX.test(password));
      setIsComplete(passwordsValid);

      if (passwordsValid) {
        setTimeout(() => {
          const createAccountButton = document.getElementById('create-account-button');
          if (createAccountButton) {
            createAccountButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    }
  }, [currentStep, password, confirmPassword, steps.length]);

  // Redirection si l'utilisateur est déjà connecté
  if (user) {
    navigate('/app');
    return null;
  }

  // Fonction pour soumettre le formulaire
  const handleSubmit = async () => {
    try {
      if (!firstName.trim()) {
        setError("Le prénom est requis");
        return;
      }

      if (!email.trim() || !EMAIL_REGEX.test(email)) {
        setError("Un email valide est requis");
        return;
      }

      if (!password || password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères");
        return;
      }

      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        return;
      }

      const userData: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim() || firstName.trim(),
        email: email.trim(),
        password,
        pseudo: pseudo.trim() || `${firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}`,
        role: isProfessional ? 'admin' : 'user',
        userType: isProfessional ? 'professional' : 'client'
      };

      console.log("Données d'inscription envoyées:", JSON.stringify({ ...userData, password: "***" }, null, 2));

      const response = await register(userData);

      if (response && response.user && response.token) {
        console.log("Inscription réussie");
        setTimeout(() => {
          navigate('/app');
        }, 1500);
      } else {
        throw new Error("Réponse du serveur incomplète");
      }
    } catch (registerError: any) {
      if (registerError.message.includes('pseudo')) {
        setPseudoError(registerError.message);
        setPseudoAlreadyExists(true);
        setDirection(-1);
        setCurrentStep(2);
      } else if (registerError.message.includes('email')) {
        setEmailError("Cette adresse email est déjà utilisée.");
        setDirection(-1);
        setCurrentStep(3);
      } else {
        setError(`Erreur lors de l'inscription: ${registerError.message}`);
      }
      setIsComplete(false);
    }
  };

  // Rendu du contenu de l'étape actuelle
  const renderCurrentField = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="mb-8">
              {isProfessional ? <Briefcase className="w-16 h-16 mx-auto mb-4 text-blue-600" /> : <User className="w-16 h-16 mx-auto mb-4 text-blue-600" />}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Compte {isProfessional ? 'Professionnel' : 'Client'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isProfessional 
                  ? 'Créez votre espace professionnel pour gérer vos services et rendez-vous'
                  : 'Rejoignez notre plateforme pour réserver facilement vos services'}
              </p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prénom *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setFirstNameError('');
                  }}
                  className="w-full pl-10 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Votre prénom"
                />
              </div>
              {firstNameError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{firstNameError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setLastNameError('');
                  }}
                  className="w-full pl-10 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Votre nom (optionnel)"
                />
              </div>
              {lastNameError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{lastNameError}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pseudo *
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={pseudo}
                  onChange={(e) => {
                    setPseudo(e.target.value.toLowerCase());
                    setPseudoError('');
                    setPseudoAlreadyExists(false);
                    setPseudoSuggestions([]);
                  }}
                  className="w-full pl-10 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="votre_pseudo"
                />
                {checkingPseudo && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              {pseudoError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{pseudoError}</p>
              )}
              {pseudoSuggestions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Suggestions disponibles :</p>
                  <div className="flex flex-wrap gap-2">
                    {pseudoSuggestions.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setPseudo(suggestion);
                          setPseudoError('');
                          setPseudoAlreadyExists(false);
                          setPseudoSuggestions([]);
                        }}
                        className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  className="w-full pl-10 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="votre@email.com"
                />
                {checkingEmail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{emailError}</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  className="w-full pl-10 pr-10 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Au moins 6 caractères, 1 lettre et 1 chiffre"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Indicateurs de validation du mot de passe */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-xs">
                    <div className={`w-2 h-2 rounded-full mr-2 ${password.length >= 6 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={password.length >= 6 ? 'text-green-600' : 'text-red-600'}>
                      Au moins 6 caractères
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className={`w-2 h-2 rounded-full mr-2 ${/(?=.*[A-Za-z])/.test(password) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={/(?=.*[A-Za-z])/.test(password) ? 'text-green-600' : 'text-red-600'}>
                      Au moins une lettre
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className={`w-2 h-2 rounded-full mr-2 ${/(?=.*\d)/.test(password) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={/(?=.*\d)/.test(password) ? 'text-green-600' : 'text-red-600'}>
                      Au moins un chiffre
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    validateConfirmPassword(e.target.value);
                  }}
                  className="w-full pl-10 pr-10 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Confirmer le mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordError}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageTransition type="slide" className="w-full h-screen">
      <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex justify-center items-center py-1 xs:py-2 px-1 sm:px-4 md:py-8 auth-fullscreen-page">
        {/* Bouton retour */}
        <div className="absolute top-1 xs:top-2 left-1 xs:left-2 sm:top-4 sm:left-4 z-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 shadow-sm transition-all duration-200"
          >
            <ArrowLeft size={14} className="mr-1 xs:mr-1.5" />
            <span className="text-[10px] xs:text-xs sm:text-sm font-medium">Retour à l'accueil</span>
          </button>
        </div>

        <div className="flex w-full max-w-5xl rounded-lg sm:rounded-xl shadow-lg overflow-hidden h-auto md:h-[520px] bg-white dark:bg-gray-800 auth-container scale-[0.85] xs:scale-90 sm:scale-100">
          {/* Partie gauche avec slider d'images */}
          <div className="w-0 xs:w-1/4 sm:w-1/3 md:w-1/2 relative auth-image-slider">
            {/* Fond de couleur pour éviter un flash blanc pendant le chargement */}
            <div className="absolute inset-0 bg-blue-900/40"></div>

            {/* Indicateur de chargement */}
            {!allImagesLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}

            {slideImages.map((image, index) => (
              <div
                key={index}
                className={`auth-image-slide ${index === slideIndex ? 'active' : ''}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: index === slideIndex || index === previousIndex ? 'block' : 'none',
                  opacity: index === slideIndex ? 1 : (index === previousIndex && isTransitioning ? 0.5 : 0),
                  transition: 'opacity 2.5s ease-in-out, transform 3s ease-in-out, filter 2.5s ease-in-out',
                  transform: index === slideIndex ? 'scale(1)' : (index === previousIndex ? 'scale(1.03)' : 'scale(0.98)'),
                  zIndex: index === slideIndex ? 2 : 1,
                  filter: index === slideIndex ? 'blur(0px)' : 'blur(2px) brightness(0.85)'
                }}
              >
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    transition: 'transform 8s ease-out, filter 2s ease-in-out, opacity 2s ease-in-out',
                    transform: index === slideIndex ? 'scale(1.08)' : 'scale(1)',
                    filter: index === slideIndex ? 'brightness(1.05) saturate(1.1) contrast(1.05)' : 'brightness(0.8) saturate(0.9) contrast(0.95)',
                    opacity: index === slideIndex ? 1 : (index === previousIndex && isTransitioning ? 0.7 : 0)
                  }}
                  loading="eager"
                />
              </div>
            ))}

            {/* Overlay pour améliorer l'effet de transition */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-blue-900/10 to-indigo-900/10 z-5"></div>
          </div>

          {/* Partie droite avec formulaire */}
          <div className="w-full xs:w-3/4 sm:w-2/3 md:w-1/2 bg-white dark:bg-gray-800 p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-between">
            {/* Indicateur de progression */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    ref={(el) => (progressDotRefs.current[index] = el)}
                    className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                      index === currentStep
                        ? 'bg-blue-600 ring-4 ring-blue-600/20'
                        : index < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    onClick={() => goToStep(index)}
                  />
                ))}
              </div>
              <div className="text-center">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {steps[currentStep].title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>

          {/* Contenu animé */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
                tabIndex={0}
              >
                {renderCurrentField()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Message d'erreur global */}
          {error && (
            <div className="mt-6 p-3 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={goToPrevStep}
              disabled={currentStep === 0}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} className="mr-1" />
              Précédent
            </button>

            <button
              id={currentStep === steps.length - 1 ? 'create-account-button' : undefined}
              onClick={goToNextStep}
              disabled={loading || checkingPseudo || checkingEmail || (currentStep === steps.length - 1 && !isComplete)}
              className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  <UserCheck size={20} className="mr-2" />
                  Créer mon compte
                </>
              ) : (
                <>
                  Continuer
                  <ChevronRight size={20} className="ml-1" />
                </>
              )}
            </button>
          </div>

          {/* Lien vers la connexion */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Déjà un compte ?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Register;
