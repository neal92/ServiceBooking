import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFullMediaUrl } from '../utils/config';
import PageTransition from '../components/layout/PageTransition';
import '../styles/form-styles.css';
import '../styles/auth-styles.css';
import '../styles/slider.css';
import '../styles/image-preload.css'; // Importer les styles de préchargement

const Login = () => {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);
  const { login, user, loading, error } = useAuth();
  const [sessionExpired, setSessionExpired] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Ajouter un état pour suivre les images chargées
  const [imagesLoaded, setImagesLoaded] = useState<{ [key: string]: boolean }>({});
  // Ajouter un état pour vérifier si toutes les images sont chargées
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  // Liste des images du slider
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

  // Configuration du slider
  useEffect(() => {
    // Débogage des URLs d'images
    console.log('URLs des images du slider:');
    slideImages.forEach((url, index) => {
      console.log(`Slide ${index + 1}:`, url);
    });

    // Précharger les images
    const preloadImages = async () => {
      const imageLoadPromises = slideImages.map(src => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            // Marquer l'image comme chargée avec succès
            setImagesLoaded(prev => ({ ...prev, [src]: true }));
            resolve();
          };
          img.onerror = () => {
            console.error(`Erreur de chargement de l'image: ${src}`);
            // Marquer l'image comme chargée même en cas d'erreur pour ne pas bloquer le slider
            setImagesLoaded(prev => ({ ...prev, [src]: true }));
            resolve();
          };
        });
      });

      // Attendre que toutes les images soient chargées
      await Promise.all(imageLoadPromises);
      setAllImagesLoaded(true);
    };

    preloadImages();

    const interval = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex + 1) % slideImages.length);
    }, 6000); // Augmenté à 6 secondes pour mieux apprécier chaque slide
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
      <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex justify-center items-center py-1 xs:py-2 px-1 sm:px-4 md:py-8 auth-fullscreen-page">
        <div className="absolute top-1 xs:top-2 left-1 xs:left-2 sm:top-4 sm:left-4 z-10">
          <Link
            to="/"
            className="flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 shadow-sm transition-all duration-200"
          >
            <ArrowLeft size={14} className="mr-1 xs:mr-1.5" />
            <span className="text-[10px] xs:text-xs sm:text-sm font-medium">Retour à l'accueil</span>
          </Link>
        </div>
        <div className="flex w-full max-w-5xl rounded-lg sm:rounded-xl shadow-lg overflow-hidden h-auto md:h-[520px] bg-white dark:bg-gray-800 auth-container scale-[0.85] xs:scale-90 sm:scale-100">
          {/* Partie gauche avec slider d'images */}
          <div className="w-0 xs:w-1/4 sm:w-1/3 md:w-1/2 relative auth-image-slider">
            {/* Fond de couleur pour éviter un flash blanc pendant le chargement */}
            <div className="absolute inset-0 bg-blue-900/40"></div>

            {/* Indicateur de chargement */}
            {!allImagesLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="spinner"></div>
              </div>
            )}

            {slideImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 auth-image-slide ${index === slideIndex ? 'active' : ''} ${allImagesLoaded ? 'loaded' : 'opacity-0'}`}
              >
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                  onError={(e) => {
                    console.error(`Erreur de chargement de l'image: ${image}`);
                    e.currentTarget.src = getFullMediaUrl('/images/slides/placeholder.jpg'); // Image de repli
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 bg-blue-600/0 hover:bg-blue-600/20 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex items-end p-8">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-2 text-shadow">ServiceBooking</h3>
                    <p className="text-sm opacity-90 text-shadow">
                      {index === 0 && "Réservez facilement vos rendez-vous"}
                      {index === 1 && "Planifiez votre agenda en toute simplicité"}
                      {index === 2 && "Gérez vos services professionnels"}
                      {index === 3 && "Suivez vos réservations en temps réel"}
                      {index === 4 && "Une interface intuitive pour tous vos besoins"}
                      {index === 5 && "Optimisez votre temps et votre efficacité"}
                      {index === 6 && "Restez connecté avec vos clients"}
                      {index === 7 && "Des notifications pour ne rien manquer"}
                      {index === 8 && "Votre succès, notre priorité"}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Indicateurs de slide (dots) */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              {slideImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSlideIndex(index)}
                  className={`h-2 w-2 rounded-full transition-all duration-300 
                    ${index === slideIndex ? 'bg-white w-4' : 'bg-white/60 hover:bg-white/80'}`}
                  aria-label={`Voir slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
          {/* Partie droite avec formulaire */}
          <div className="w-full xs:w-3/4 sm:w-2/3 md:w-1/2 bg-white dark:bg-gray-800 p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-between login-form">
            <div>
              {/* En-tête */}
              <div className="flex items-center mb-3 sm:mb-6">
                <Calendar className="h-6 w-6 md:h-8 md:w-8 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    Connexion à votre compte
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Accédez à votre espace personnel
                  </p>
                </div>
              </div>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {sessionExpired && (
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
                <div className="px-4 py-3 mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-400 flex items-center animate-fadeIn">
                  <svg className="h-5 w-5 text-red-500 dark:text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-base font-medium text-gray-700 dark:text-gray-300">
                  Adresse email <span className="text-red-500 dark:text-red-400">*</span>
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
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-shadow hover:shadow"
                  />
                </div>
              </div>
              <div className="mt-5">
                <label htmlFor="password" className="block text-base font-medium text-gray-700 dark:text-gray-300">
                  Mot de passe <span className="text-red-500 dark:text-red-400">*</span>
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
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-shadow hover:shadow"
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
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.99]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
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
            </form>
            {/* Séparateur et lien d'inscription */}
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-[11px] xs:text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Pas encore de compte ?{' '}
                  <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">
                    Inscrivez-vous
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

export default Login;