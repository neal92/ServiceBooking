import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/layout/PageTransition';
import '../styles/form-styles.css';
import '../styles/auth-styles.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [slideIndex, setSlideIndex] = useState(0); const { login, user, loading, error } = useAuth();
  const [sessionExpired, setSessionExpired] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Images pour le slider (thème rendez-vous professionnels et entreprise)
  const slideImages = [
    '/images/slides/calendar-planning.svg', // Image de calendrier/planning locale
    '/images/slides/team-meeting.svg',      // Image d'équipe locale  
    '/images/slides/business-meeting.svg',  // Image de réunion professionnelle locale
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
  // Vérifier si l'utilisateur a été redirigé suite à une expiration de session
  useEffect(() => {
    // Récupérer le paramètre 'expired' de l'URL
    const params = new URLSearchParams(location.search);
    const expired = params.get('expired');

    if (expired === 'true') {
      console.log('Détection du paramètre expired=true dans l\'URL');

      // Afficher le message d'expiration de session
      setSessionExpired(true);

      // Clean up URL parameter after setting the state
      // This prevents the message from showing again on refresh
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      // S'assurer que l'utilisateur est bien déconnecté
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [location]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear session expired message when attempting to login
    setSessionExpired(false);
    await login(email, password);
  };
  if (user) {
    return <Navigate to="/app" />;
  }
  return (
    <PageTransition type="slide" className="w-full h-screen">
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 auth-fullscreen-page">
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
          <Link
            to="/"
            className="flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 shadow-sm transition-all duration-200"
          >
            <ArrowLeft size={14} className="mr-1 xs:mr-1.5" />
            <span className="text-[10px] xs:text-xs sm:text-sm font-medium">Retour à l'accueil</span>
          </Link>
        </div>

        <div className="flex w-full max-w-5xl rounded-lg sm:rounded-xl shadow-lg overflow-hidden h-auto md:h-[520px] bg-white dark:bg-gray-800 auth-container scale-[0.85] xs:scale-90 sm:scale-100">{/* Partie gauche avec slider d'images - visible même sur mobile en version réduite */}
          <div className="w-0 xs:w-1/4 sm:w-1/3 md:w-1/2 relative auth-image-slider">
            {slideImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out auth-image-slide ${index === slideIndex ? 'opacity-100' : 'opacity-0'}`} style={{
                  backgroundImage: `url(${image})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: '#f0f9ff', /* Bleu très clair */
                }}
              >                <div className="absolute inset-0 auth-image-overlay flex items-end p-8">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-2 text-shadow">Gérez vos rendez-vous efficacement</h3>
                    <p className="text-sm opacity-90">Connectez-vous pour accéder à votre espace professionnel</p>
                  </div>
                </div>
              </div>
            ))}          </div>          {/* Partie droite avec formulaire */}
          <div className="w-full xs:w-3/4 sm:w-2/3 md:w-1/2 bg-white dark:bg-gray-800 p-3 sm:p-5 md:p-6 lg:p-8">
            <div className="flex justify-center md:justify-start">
              <Calendar className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white md:text-left">
              Connexion
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 md:text-left">
              Ou{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                créez un nouveau compte
              </Link>
            </p>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>              {sessionExpired && (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 animate-fadeIn">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-amber-800">Session expirée</h4>
                    <p className="text-sm text-amber-700">Votre session a expiré pour des raisons de sécurité. Veuillez vous reconnecter pour continuer.</p>
                  </div>
                </div>
              </div>
            )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

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
                    required
                    placeholder="exemple@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
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
                    autoComplete="current-password"
                    placeholder="Votre mot de passe"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Se souvenir de moi
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                    Mot de passe oublié?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Connexion en cours...
                    </span>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pas encore de compte ?{' '}
                  <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">
                    Inscrivez-vous
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

export default Login;