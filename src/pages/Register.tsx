import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Calendar, Check, AlertCircle, ArrowLeft, Briefcase, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/layout/PageTransition';

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
    // États pour la gestion des étapes du formulaire
  const [formStep, setFormStep] = useState(1); // 1 pour première étape, 2 pour seconde étape
  
  // Messages d'erreur
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [pseudoError, setPseudoError] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);
  const { register, user, loading, error } = useAuth();
    // Regex validations
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/; // Au moins 6 caractères, avec 1 lettre et 1 chiffre
  const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s']{2,}$/; // Au moins 2 caractères, lettres et espaces
  const PSEUDO_REGEX = /^[a-z0-9_]{3,20}$/; // Lettres minuscules, chiffres, underscore, 3-20 caractères
  
  // Images pour le slider (thème rendez-vous professionnels et entreprise)
  const slideImages = [
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3', // Planification d'équipe
    'https://images.unsplash.com/photo-1573496358961-3c82861ab8f4?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3', // Poignée de main professionnelle
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3', // Salle de réunion moderne
  ];
  
  // Préchargement des images et changement toutes les 5 secondes
  useEffect(() => {
    // Précharger les images
    slideImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
    
    const interval = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex + 1) % slideImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
    // Le champ est optionnel, donc s'il est vide c'est valide
    if (!value) {
      setLastNameError('');
      return true;
    }
    
    if (!NAME_REGEX.test(value)) {
      setLastNameError('Le nom doit contenir au moins 2 caractères (lettres et espaces)');
      return false;
    }
    setLastNameError('');
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
    setPasswordError('');
    return true;
  };
  
  const validateConfirmPassword = (password: string, confirmPwd: string) => {
    if (password !== confirmPwd) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return false;
    }
    setPasswordError('');
    return true;
  };  // Validation du pseudo
  const validatePseudo = (value: string) => {
    // Le pseudo est obligatoire pour tous les profils
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
  };  // Navigation entre les étapes
  const nextStep = () => {
    // Validation de l'étape 1 (informations personnelles)
    if (formStep === 1) {
      const isFirstNameValid = validateFirstName(firstName);
      const isLastNameValid = validateLastName(lastName);
      const isPseudoValid = validatePseudo(pseudo);
      
      if (isFirstNameValid && isLastNameValid && isPseudoValid) {
        // Animation de transition via les classes CSS
        setTimeout(() => {
          setFormStep(2);
        }, 100);
      }
    }
  };
  
  const prevStep = () => {
    // Animation de transition via les classes CSS
    setTimeout(() => {
      setFormStep(1);
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si on n'est pas à la dernière étape, avancer à l'étape suivante
    if (formStep === 1) {
      nextStep();
      return;
    }
    
    // À l'étape finale, soumettre le formulaire complet
    // Validation des champs de l'étape finale
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(password, confirmPassword);
    
    // Nous savons que les champs de la première étape sont déjà validés
    if (isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      try {
        // Si le nom est vide, utiliser le prénom
        const lastNameToUse = lastName || firstName;
        
        // Création des données utilisateur
        const userData: any = { 
          firstName, 
          lastName: lastNameToUse, 
          email, 
          password,
          pseudo, // Le pseudo est maintenant obligatoire pour tous les profils
          role: isProfessional ? 'professional' : 'user'
        };
        
        // Appel de la fonction d'inscription
        await register(userData);
        
        // Note: Le backend devra être adapté pour gérer les champs pseudo et phone
        // via la mise à jour du contrôleur authController.js
      } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
      }
    }
  };  // Redirection si l'utilisateur est déjà connecté
  if (user) {
    return <Navigate to="/app" />;
  }

  return (
    <PageTransition type="slide" className="w-full h-screen">
      <div className="h-screen w-full bg-gray-100 dark:bg-gray-900 flex justify-center items-center auth-fullscreen-page">
        <div className="flex w-full max-w-6xl rounded-xl shadow-lg overflow-hidden h-auto bg-white dark:bg-gray-800 auth-container">
          <div className="absolute top-4 left-4">
            <Link to="/" className="flex items-center text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
              <ArrowLeft size={18} className="mr-1" />
              <span className="text-sm">Retour à l'accueil</span>
            </Link>
          </div>
          {/* Partie gauche avec slider d'images */}
          <div className="hidden md:block md:w-1/2 relative auth-image-slider">
            {slideImages.map((image, index) => (
              <div 
                key={index} 
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out auth-image-slide ${index === slideIndex ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  backgroundImage: `url(${image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-blue-900 bg-opacity-30 auth-image-overlay flex items-end p-8">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-2">ServiceBooking Pro</h3>
                    <p className="text-sm opacity-90">Optimisez votre agenda et valorisez vos services</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Partie droite avec formulaire */}
          <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 p-8 md:p-12">
            <div className="flex justify-center md:justify-start">
              <Calendar className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>            <div className="flex items-center">
              {isProfessional ? (
                <Briefcase className="h-10 w-10 mr-3 text-blue-600 dark:text-blue-400" />
              ) : (
                <User className="h-10 w-10 mr-3 text-blue-600 dark:text-blue-400" />
              )}
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white md:text-left">
                  {isProfessional ? "Créer un compte professionnel" : "Créer un compte client"}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 md:text-left">
                  {isProfessional 
                    ? "Pour proposer vos services et gérer vos rendez-vous" 
                    : "Pour réserver des rendez-vous facilement"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 md:text-left">
              Ou{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                connectez-vous à votre compte existant
              </Link>
            </p>
              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {/* Indicateur d'étape */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    formStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    1
                  </div>
                  <div className={`h-1 w-8 ${
                    formStep === 2 ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    formStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Étape 1: Informations personnelles */}
              <div className={`form-step transition-all duration-300 ease-in-out transform ${
                formStep === 1 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 absolute -translate-x-full -z-10'
              }`}>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Informations personnelles
                </h3>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Prénom - requis pour tous */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {isProfessional ? "Prénom " : "Prénom"}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        placeholder={isProfessional ? "Votre prénom " : "Votre prénom"}
                        required
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          validateFirstName(e.target.value);
                        }}
                        onBlur={(e) => validateFirstName(e.target.value)}
                        className={`appearance-none block w-full px-3 py-3 border ${
                          firstNameError ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      />
                      {firstName && !firstNameError && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                      {firstNameError && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {firstNameError}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Nom de famille - optionnel pour tous les profils */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nom
                      <span className="text-xs ml-1 text-gray-500 dark:text-gray-400">(optionnel)</span>
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        placeholder="Votre nom"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          if (e.target.value) validateLastName(e.target.value);
                          else setLastNameError('');
                        }}
                        onBlur={(e) => {
                          if (e.target.value) validateLastName(e.target.value);
                          else setLastNameError('');
                        }}
                        className={`appearance-none block w-full px-3 py-3 border ${
                          lastNameError ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      />
                      {lastName && !lastNameError && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                      {lastNameError && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {lastNameError}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Pseudo - obligatoire pour tous */}
                  <div className="sm:col-span-2">
                    <label htmlFor="pseudo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pseudo
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="pseudo"
                        name="pseudo"
                        type="text"
                        placeholder="Votre pseudo"
                        required
                        value={pseudo}
                        onChange={(e) => {
                          setPseudo(e.target.value.toLowerCase());
                          validatePseudo(e.target.value);
                        }}
                        onBlur={(e) => validatePseudo(e.target.value)}
                        className={`appearance-none block w-full px-3 py-3 border ${
                          pseudoError ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      />
                      {pseudo && !pseudoError && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                      {pseudoError && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {pseudoError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Étape 2: Informations de connexion */}
              <div className={`form-step transition-all duration-300 ease-in-out transform ${
                formStep === 2 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 absolute translate-x-full -z-10'
              }`}>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Informations de connexion
                </h3>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Adresse email
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="exemple@email.com"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        validateEmail(e.target.value);
                      }}
                      onBlur={(e) => validateEmail(e.target.value)}
                      className={`appearance-none block w-full px-3 py-3 border ${
                        emailError ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    />
                    {email && !emailError && (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                    {emailError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {emailError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mot de passe
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Votre mot de passe"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validatePassword(e.target.value);
                      }}
                      onBlur={(e) => validatePassword(e.target.value)}
                      className={`appearance-none block w-full px-3 py-3 border ${
                        passwordError ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    />
                    {password && !passwordError && (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                    {passwordError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {passwordError}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirmer le mot de passe
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Confirmez votre mot de passe"
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        validateConfirmPassword(password, e.target.value);
                      }}
                      onBlur={(e) => validateConfirmPassword(password, e.target.value)}
                      className={`appearance-none block w-full px-3 py-3 border ${
                        passwordError ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    />
                    {confirmPassword && !passwordError && (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                    {passwordError && confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {passwordError}
                      </p>
                    )}
                  </div>
                </div>              </div>
              
              {/* Boutons de navigation entre les étapes */}
              <div className="flex justify-between mt-8">
                {formStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Retour
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`${formStep > 1 ? '' : 'w-full'} flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isProfessional 
                      ? 'bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700' 
                      : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Inscription en cours...
                    </span>
                  ) : formStep === 1 ? (
                    <span className="flex items-center">
                      Continuer <ChevronRight className="ml-2 w-4 h-4" />
                    </span>
                  ) : (
                    isProfessional ? 'Créer mon compte professionnel' : 'Créer mon compte client'
                  )}
                </button>
              </div>
              
              {/* Notice d'information pour les utilisateurs */}
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                {isProfessional ? (
                  <p>En créant un compte professionnel, vous acceptez nos <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">conditions d'utilisation</a> et notre <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">politique de confidentialité</a>.</p>
                ) : (
                  <p>En créant un compte, vous acceptez nos <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">conditions d'utilisation</a>.</p>
                )}
              </div>
              
              {/* Notice d'information pour les professionnels */}
              {isProfessional && (
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                  En créant un compte professionnel, vous acceptez nos <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">conditions d'utilisation</a> et notre <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">politique de confidentialité</a>.
                </p>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Déjà un compte ?{' '}
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">
                    Connectez-vous
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Register;