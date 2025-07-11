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
import '../styles/animations.css'; // Nouvelles animations
import '../styles/transition-indicator.css'; // Styles pour l'indicateur de transition

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);
  const { login, user, loading, error } = useAuth();
  const [sessionExpired, setSessionExpired] = useState(false);
  const location = useLocation();

  // Ajouter un état pour suivre les images chargées
  const [imagesLoaded, setImagesLoaded] = useState<{ [key: string]: boolean }>({});
  // Ajouter un état pour vérifier si toutes les images sont chargées
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  // Ajouter un état pour suivre la transition active
  const [isTransitioning, setIsTransitioning] = useState(false);

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
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            // Marquer l'image comme chargée avec succès
            console.log(`Image chargée avec succès: ${src}`);
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
      console.log("Toutes les images ont été chargées");
      setAllImagesLoaded(true);
    };

    preloadImages();
  }, []);

  // Gestion simplifiée des transitions de slides
  useEffect(() => {
    // Attendons que les images soient chargées avant de commencer les transitions
    if (!allImagesLoaded) return;

    console.log("Configuration du slider: toutes les images sont chargées");

    // Fonction simplifiée pour gérer les transitions entre slides, utilisant CSS transitions
    const nextSlide = () => {
      // Définir l'index précédent et calculer le nouvel index
      setPreviousIndex(slideIndex);
      const newIndex = (slideIndex + 1) % slideImages.length;
      console.log(`Changement de slide: ${slideIndex} -> ${newIndex}`);

      // Activer l'état de transition
      setIsTransitioning(true);
      console.log("Début de transition...");

      // Mettre à jour l'index actif
      setSlideIndex(newIndex);

      // Réinitialiser l'état de transition après la fin de l'animation
      setTimeout(() => {
        setIsTransitioning(false);
        console.log("Fin de la transition, prêt pour la prochaine");
      }, 3000); // Réajusté à 3 secondes pour correspondre à la transition CSS
    };

    // Timer pour changer de slide
    const interval = setInterval(() => {
      if (!isTransitioning) {
        nextSlide();
      } else {
        console.log("Transition encore active, report du changement");
      }
    }, 12000); // Augmenté à 12 secondes pour laisser l'image pleinement visible avant la transition

    // Nettoyer l'intervalle lors du démontage du composant
    return () => {
      console.log("Nettoyage de l'intervalle du slider");
      clearInterval(interval);
    };
  }, [allImagesLoaded, slideIndex, slideImages.length, isTransitioning]);

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

            {/* Message d'erreur en cas de problème de connexion au serveur */}
            {allImagesLoaded && Object.values(imagesLoaded).filter(Boolean).length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-blue-900/90 text-white p-4 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-3">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <h3 className="text-sm font-semibold mb-1">Problème de connexion au serveur</h3>
                <p className="text-xs opacity-85">Impossible de charger les images. Veuillez vérifier votre connexion ou réessayer ultérieurement.</p>
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
                  onLoad={() => {
                    console.log(`Image ${index + 1} chargée avec succès`);
                  }}
                  onError={(e) => {
                    console.error(`Erreur de chargement de l'image: ${image}`);
                    // Utiliser une image de repli avec un dégradé par défaut
                    const fallbackUrl = getFullMediaUrl('/images/slides/placeholder.jpg');
                    console.log(`Utilisation de l'image de repli: ${fallbackUrl}`);
                    e.currentTarget.src = fallbackUrl;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div
                  className="absolute inset-0 transition-all"
                  style={{
                    background: index === slideIndex
                      ? 'linear-gradient(to right, rgba(30, 64, 175, 0.05), rgba(79, 70, 229, 0.05))'
                      : 'linear-gradient(to right, rgba(30, 64, 175, 0.2), rgba(79, 70, 229, 0.2))',
                    opacity: index === slideIndex ? 1 : 0.7,
                    transition: 'opacity 1.5s ease-in-out, background 1.5s ease-in-out'
                  }}
                ></div>
                {/* Ajout d'un effet de surbrillance pendant la transition */}
                {isTransitioning && index === slideIndex && (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                      animation: 'fadeIn 0.8s ease-out, fadeOut 1.2s ease-in 0.8s'
                    }}
                  ></div>
                )}
                <div className="absolute inset-0 bg-blue-600/0 hover:bg-blue-600/20 transition-colors duration-300"></div>
                <div
                  className="absolute inset-0 flex items-end p-8"
                  style={{
                    opacity: index === slideIndex ? 1 : 0,
                    transform: index === slideIndex ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 1.2s ease-out, transform 1.2s ease-out',
                    transitionDelay: index === slideIndex ? '0.5s' : '0s'
                  }}
                >
                  <div className="text-white">
                    <h3
                      className="text-2xl font-bold mb-2 text-shadow"
                      style={{
                        opacity: index === slideIndex ? 1 : 0,
                        transform: index === slideIndex ? 'translateY(0)' : 'translateY(5px)',
                        transition: 'opacity 1.2s cubic-bezier(0.33, 1, 0.68, 1), transform 1.2s cubic-bezier(0.33, 1, 0.68, 1)',
                        transitionDelay: index === slideIndex ? '1.1s' : '0s'
                      }}
                    >
                      ServiceBooking
                    </h3>
                    <p
                      className="text-sm opacity-90 text-shadow"
                      style={{
                        opacity: index === slideIndex ? 1 : 0,
                        transform: index === slideIndex ? 'translateY(0)' : 'translateY(5px)',
                        transition: 'opacity 1.2s cubic-bezier(0.33, 1, 0.68, 1), transform 1.2s cubic-bezier(0.33, 1, 0.68, 1)',
                        transitionDelay: index === slideIndex ? '1.3s' : '0s'
                      }}
                    >
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

            {/* Overlay pour améliorer l'effet de transition */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-blue-900/10 to-indigo-900/10 z-5"></div>
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
                <div className="login-session-expired bg-amber-50 dark:bg-amber-900/30 border border-amber-500 dark:border-amber-600 rounded-md p-3 mb-3 animate-fadeIn shadow-sm animate-pulse-subtle">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 dark:text-amber-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-400 text-sm">Session expirée</h4>
                      <p className="text-xs text-amber-700 dark:text-amber-300">Votre session a expiré pour des raisons de sécurité. Veuillez vous reconnecter pour continuer.</p>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="login-error-message px-3 py-2 mb-3 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-600 dark:border-red-700 text-red-700 dark:text-red-400 flex items-center animate-fadeIn">
                  <svg className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm">{error}</span>
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