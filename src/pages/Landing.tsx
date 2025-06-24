import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Shield, Check, Menu, X, Star, UserCheck, PhoneCall, Moon, Sun } from 'lucide-react';
import RegisterModal from '../components/auth/RegisterModal';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Initialisation du thème en fonction des préférences de l'utilisateur
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Fonction pour basculer entre les thèmes
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Gérer le scroll pour changer l'apparence de la navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Fonctions de redirection
  const handleLoginClick = () => navigate('/login');
  const handleRegisterClick = () => setIsRegisterModalOpen(true);
  const handleTryClick = () => setIsRegisterModalOpen(true);

  // Fonctions pour gérer la modale d'inscription
  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  // Fonction pour gérer la navigation vers la page d'inscription avec le type d'utilisateur
  const handleRegisterClient = () => navigate('/register', { state: { userType: 'client' } });
  const handleRegisterProfessional = () => navigate('/register', { state: { userType: 'professional' } });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Modal d'inscription */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
        onClient={handleRegisterClient}
        onProfessional={handleRegisterProfessional}
      />

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
            ? 'bg-white/95 dark:bg-gray-900/95 shadow-md backdrop-blur-sm py-2'
            : 'bg-transparent py-4'
          }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-600">
                ServiceBooking
              </span>
            </Link>

            {/* Menu pour mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Menu pour desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#fonctionnalites" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Fonctionnalités</a>
              <a href="#temoignages" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Témoignages</a>
              <a href="#tarifs" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Tarifs</a>
              <button
                onClick={toggleDarkMode}
                className="text-sm p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                aria-label={isDarkMode ? "Passer au mode clair" : "Passer au mode sombre"}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={handleLoginClick}
                className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Connexion
              </button>
              <button
                onClick={handleRegisterClick}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium transition duration-300 hover:shadow-lg"
              >
                Inscription
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 shadow-xl animate-fadeIn">
            <div className="px-4 py-2 space-y-2">
              <a
                href="#fonctionnalites"
                className="block p-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Fonctionnalités
              </a>
              <a
                href="#temoignages"
                className="block p-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Témoignages
              </a>
              <a
                href="#tarifs"
                className="block p-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Tarifs
              </a>
              <button
                onClick={() => {
                  toggleDarkMode();
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full text-left p-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md"
              >
                {isDarkMode ? <Sun size={18} className="mr-2" /> : <Moon size={18} className="mr-2" />}
                {isDarkMode ? "Mode clair" : "Mode sombre"}
              </button>
              <button
                onClick={() => {
                  handleLoginClick();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left p-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md"
              >
                Connexion
              </button>
              <button
                onClick={() => {
                  handleRegisterClick();
                  setIsMenuOpen(false);
                }}
                className="block w-full mt-2 px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium"
              >
                Inscription
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-28 md:pt-32 pb-12 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight animate-fadeIn">
                Simplifiez la gestion de vos <span className="text-blue-600 dark:text-blue-400">rendez-vous</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 animate-fadeIn animation-delay-200">
                ServiceBooking est une solution complète qui permet aux professionnels de gérer facilement leurs rendez-vous, clients et services.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fadeIn animation-delay-300">
                <button
                  onClick={handleTryClick}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Essayer gratuitement
                </button>
                <button
                  onClick={handleLoginClick}
                  className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:ring-offset-2"
                >
                  En savoir plus
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Partenaires */}
      <section className="py-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            Nous vous proposons un espace personalisable pour les professionelles en mettant en avant vos services
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-70 grayscale">
            <div className="h-8 flex items-center">
              <div className="text-xl font-bold text-gray-400">Company 1</div>
            </div>
            <div className="h-8 flex items-center">
              <div className="text-xl font-bold text-gray-400">Company 2</div>
            </div>
            <div className="h-8 flex items-center">
              <div className="text-xl font-bold text-gray-400">Company 3</div>
            </div>
            <div className="h-8 flex items-center">
              <div className="text-xl font-bold text-gray-400">Company 4</div>
            </div>
            <div className="h-8 flex items-center">
              <div className="text-xl font-bold text-gray-400">Company 5</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section id="fonctionnalites" className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Fonctionnalités complètes pour les professionnels
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Tout ce dont vous avez besoin pour gérer efficacement votre activité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Carte 1 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-fadeIn">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Gestion de calendrier
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Visualisez et gérez tous vos rendez-vous sur une interface intuitive. Contrôlez vos disponibilités et évitez les conflits d'horaire.
              </p>
            </div>

            {/* Carte 2 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-fadeIn animation-delay-100">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Messagerie instantanée
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Centralisez les informations de vos clients avec un chat en ligne sécurisé. Communiquez facilement avec vos clients pour confirmer ou modifier les rendez-vous.
              </p>
            </div>

            {/* Carte 3 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-fadeIn animation-delay-200">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Réservation en ligne 24/7
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Permettez à vos clients de réserver à tout moment, même en dehors des heures d'ouverture, vous avez la possiblité de valider ou non afin de mieux gérer votre emploi du temps.
              </p>
            </div>

            {/* Carte 4 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-fadeIn animation-delay-300">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                <PhoneCall className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Notifications et rappels
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Réduisez les rendez-vous manqués grâce à des rappels automatiques par email ou SMS envoyés à vos clients.
              </p>
            </div>

            {/* Carte 5 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-fadeIn animation-delay-400">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Gestion des de vos services
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Créez et personnalisez vos services avec les durées et les prix spécifiques pour une gestion optimale.
              </p>
            </div>

            {/* Carte 6 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-fadeIn animation-delay-500">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Sécurité et confidentialité
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Protection des données de vos clients avec les plus hauts standards de sécurité et conformité RGPD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section id="temoignages" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Ce qu'en disent nos utilisateurs
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Découvrez pourquoi les professionnels choisissent ServiceBooking
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Témoignage 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                "ServiceBooking a transformé la gestion de mon salon de coiffure. Mes clients peuvent réserver facilement et j'ai réduit les rendez-vous manqués de 60%."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">ML</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Marie L.</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Salon de coiffure</p>
                </div>
              </div>
            </div>

            {/* Témoignage 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                "L'interface est intuitive et mes clients adorent pouvoir réserver à tout moment. J'ai gagné du temps et augmenté ma clientèle."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">TM</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Thomas M.</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Massage-thérapie</p>
                </div>
              </div>
            </div>

            {/* Témoignage 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                "Je gère maintenant mon cabinet dentaire efficacement. Le support client est exceptionnel et l'application évolue constamment."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">SB</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Sophie B.</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cabinet dentaire</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Tarifs */}
      <section id="tarifs" className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Des tarifs adaptés à vos besoins
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Solutions flexibles pour les professionnels de toutes tailles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan Starter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-transform hover:scale-105 hover:shadow-xl">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Starter</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">€0</span>
                  <span className="text-gray-500 dark:text-gray-400">/mois</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Idéal pour les professionnels indépendants qui débutent
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Jusqu'à 10 rendez-vous/mois</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Gestion de base du calendrier</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Base de donnée clients</span>
                  </li>
                </ul>
                <button
                  onClick={handleTryClick}
                  className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors"
                >
                  Essayer gratuitement
                </button>
              </div>
            </div>

            {/* Plan Pro */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-xl transform transition-transform hover:scale-105 hover:shadow-2xl relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAIRE
              </div>
              <div className="p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">Pro</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">€29</span>
                  <span className="opacity-80">/mois</span>
                </div>
                <p className="text-sm opacity-80 mb-6">
                  Pour les professionnels qui cherchent à se développer
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                    <span>Rendez-vous illimités</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                    <span>Rappels automatiques</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                    <span>Paiements en ligne</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                    <span>Rapports d'activité</span>
                  </li>
                </ul>
                <button
                  onClick={handleRegisterClick}
                  className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-blue-600 font-medium rounded-lg transition-colors"
                >
                  S'inscrire maintenant
                </button>
              </div>
            </div>

            {/* Plan Business */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-transform hover:scale-105 hover:shadow-xl">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Business</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">€79</span>
                  <span className="text-gray-500 dark:text-gray-400">/mois</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Pour les entreprises avec plusieurs employés
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Tout le plan Pro</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Jusqu'à 10 employés</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">API personnalisable</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Support prioritaire</span>
                  </li>
                </ul>
                <button
                  onClick={handleRegisterClick}
                  className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors"
                >
                  Nous contacter
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à transformer votre gestion de rendez-vous ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Rejoignez des milliers de professionnels qui utilisent ServiceBooking chaque jour pour simplifier leur vie et développer leur activité.
          </p>
          <button
            onClick={handleTryClick}
            className="px-8 py-3 bg-white text-blue-600 font-medium text-lg rounded-lg shadow-lg hover:bg-blue-50 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
          >
            Commencer maintenant
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <span className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </span>
                <span className="text-lg font-bold text-white">ServiceBooking</span>
              </div>
              <p className="text-gray-400 mb-4">
                La solution complète pour la gestion de rendez-vous des professionnels du bien-être, de la beauté et des services.
              </p>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4">Produit</h3>
              <ul className="space-y-2">
                <li><a href="#fonctionnalites" className="text-gray-400 hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#temoignages" className="text-gray-400 hover:text-white transition-colors">Témoignages</a></li>
                <li><a href="#tarifs" className="text-gray-400 hover:text-white transition-colors">Tarifs</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4">Légal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Conditions</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">RGPD</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} ServiceBooking. Tous droits réservés.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c1.345 0 2.65.05 3.91.14 1.26.1 2.37.33 3.31.66.9.33 1.66.77 2.42 1.53.76.76 1.2 1.52 1.53 2.42.33.94.56 2.05.66 3.31.1 1.26.15 2.565.15 3.91s-.05 2.65-.15 3.91c-.1 1.26-.33 2.37-.66 3.31-.33.9-.77 1.66-1.53 2.42-.76.76-1.52 1.2-2.42 1.53-.94.33-2.05.56-3.31.66-1.26.1-2.565.15-3.91.15s-2.65-.05-3.91-.15c-1.26-.1-2.37-.33-3.31-.66-.9-.33-1.66-.77-2.42-1.53-.76-.76-1.2-1.52-1.53-2.42-.33-.94-.56-2.05-.66-3.31-.1-1.26-.15-2.565-.15-3.91s.05-2.65.15-3.91c.1-1.26.33-2.37.66-3.31.33-.9.77-1.66 1.53-2.42.76-.76 1.52-1.2 2.42-1.53.94-.33 2.05-.56 3.31-.66 1.26-.1 2.565-.15 3.91-.15zm0 2.15c-2.67 0-3.005.01-4.06.06-1.03.04-1.59.22-1.96.37a3.25 3.25 0 00-1.33.86c-.4.4-.65.85-.86 1.33-.15.37-.33.92-.37 1.96-.05 1.055-.06 1.39-.06 4.06 0 2.67.01 3.005.06 4.06.04 1.03.22 1.59.37 1.96.2.48.46.93.86 1.33.4.4.85.65 1.33.86.37.15.92.33 1.96.37 1.055.05 1.39.06 4.06.06 2.67 0 3.005-.01 4.06-.06 1.03-.04 1.59-.22 1.96-.37.48-.2.93-.46 1.33-.86.4-.4.65-.85.86-1.33.15-.37.33-.92.37-1.96.05-1.055.06-1.39.06-4.06 0-2.67-.01-3.005-.06-4.06-.04-1.03-.22-1.59-.37-1.96a3.25 3.25 0 00-.86-1.33 3.25 3.25 0 00-1.33-.86c-.37-.15-.92-.33-1.96-.37-1.055-.05-1.39-.06-4.06-.06zm0 3.65a5.2 5.2 0 110 10.4 5.2 5.2 0 010-10.4zm0 8.6a3.4 3.4 0 100-6.8 3.4 3.4 0 000 6.8zm6.45-9.9a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modale d'inscription */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
        onClient={handleRegisterClient}
        onProfessional={handleRegisterProfessional}
      />
    </div>
  );
};

export default Landing;
