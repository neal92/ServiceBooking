import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Calendar, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/layout/PageTransition';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);
  const { register, user, loading, error } = useAuth();
  
  // Regex validations
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/; // Au moins 6 caractères, avec 1 lettre et 1 chiffre
  const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s']{2,}$/; // Au moins 2 caractères, lettres et espaces
  
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de tous les champs
    const isFirstNameValid = validateFirstName(firstName);
    const isLastNameValid = validateLastName(lastName);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(password, confirmPassword);
    
    // Si validation ok, procéder à l'inscription
    if (isFirstNameValid && isLastNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      await register(firstName, lastName, email, password);
    }
  };

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <PageTransition type="slide" className="w-full h-screen">
      <div className="h-screen w-full bg-gray-100 dark:bg-gray-900 flex justify-center items-center auth-fullscreen-page">
        <div className="flex w-full max-w-6xl rounded-xl shadow-lg overflow-hidden h-auto bg-white dark:bg-gray-800 auth-container">
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
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white md:text-left">
              Créer un compte
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 md:text-left">
              Ou{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                connectez-vous à votre compte existant
              </Link>
            </p>
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Prénom
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      placeholder="Votre prénom"
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

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nom
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Votre nom"
                      required
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        validateLastName(e.target.value);
                      }}
                      onBlur={(e) => validateLastName(e.target.value)}
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
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Adresse email
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

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mot de passe
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
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirmer le mot de passe
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
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Inscription en cours...
                    </span>
                  ) : (
                    "S'inscrire"
                  )}
                </button>
              </div>
              
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