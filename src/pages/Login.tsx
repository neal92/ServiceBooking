import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/layout/PageTransition';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);
  const { login, user, loading, error } = useAuth();
  const [sessionExpired, setSessionExpired] = useState(false);
  const location = useLocation();
  
  // Images pour le slider (thème rendez-vous professionnels et entreprise)
  const slideImages = [
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3', // Agenda et planification
    'https://images.unsplash.com/photo-1576267423048-15c0040fec78?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3', // Calendrier de bureau
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3', // Réunion d'entreprise
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
                    <h3 className="text-2xl font-bold mb-2">Gérez vos rendez-vous efficacement</h3>
                    <p className="text-sm opacity-90">Connectez-vous pour accéder à votre espace professionnel</p>
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