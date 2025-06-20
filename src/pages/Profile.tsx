import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/layout/PageTransition';
import authService from '../services/auth';
import { API_BASE_URL } from '../utils/config';
import AvatarSelector from '../components/profile/AvatarSelector';
import '../styles/profile-fix.css';

const Profile = () => {
  const { user, updateUser, changePassword } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
    // Aucun effet de débogage n'est nécessaire en production

  const [passwordErrors, setPasswordErrors] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Regex validation pour le mot de passe
  const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  const validateCurrentPassword = (value: string) => {
    if (!value) {
      setPasswordErrors(prev => ({ ...prev, current: 'Le mot de passe actuel est requis' }));
      return false;
    }
    // Efface l'erreur de mot de passe incorrect ainsi que l'erreur de champ vide
    setPasswordErrors(prev => ({ ...prev, current: '' }));
    // Effacer aussi l'erreur principale si elle concerne le mot de passe
    if (error && (error.includes('mot de passe') || error.includes('password'))) {
      setError('');
    }
    return true;
  };

  const validateNewPassword = (value: string) => {
    if (!PASSWORD_REGEX.test(value)) {
      setPasswordErrors(prev => ({ ...prev, new: 'Le mot de passe doit contenir au moins 6 caractères, avec au moins une lettre et un chiffre' }));
      return false;
    }
    setPasswordErrors(prev => ({ ...prev, new: '' }));
    return true;
  };

  const validateConfirmPassword = (newPass: string, confirmPass: string) => {
    if (newPass !== confirmPass) {
      setPasswordErrors(prev => ({ ...prev, confirm: 'Les mots de passe ne correspondent pas' }));
      return false;
    }
    setPasswordErrors(prev => ({ ...prev, confirm: '' }));
    return true;
  };
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Réinitialisez complètement le message de succès pour éviter toute confusion
    // avec le message de succès du changement de mot de passe
    setSuccess('');
    setShowSuccessModal(false);

    try {
      await updateUser(userInfo);
      // Message de succès spécifique pour la mise à jour des informations
      setSuccess('Informations mises à jour avec succès');
      setShowSuccessModal(true);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour des informations');
    }
  };
    const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialisation des états d'erreur
    setError('');
    setPasswordErrors({
      current: '',
      new: '',
      confirm: ''
    });
    
    // Début du processus de changement de mot de passe
    
    // Validation de tous les champs
    const isCurrentPasswordValid = validateCurrentPassword(password);
    const isNewPasswordValid = validateNewPassword(newPassword);
    const isConfirmPasswordValid = validateConfirmPassword(newPassword, confirmPassword);

    // Si toutes les validations sont ok, procéder au changement
    if (isCurrentPasswordValid && isNewPasswordValid && isConfirmPasswordValid) {
      try {
        await changePassword(password, newPassword);
        
        // Définir d'abord le message de succès
        const successMessage = 'Mot de passe modifié avec succès';
        // Définition du message de succès
        
        // Réinitialiser les champs
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Mettre à jour les états dans le bon ordre
        setIsEditingPassword(false);
        setSuccess(successMessage);
        setShowSuccessModal(true); // Afficher la modale de succès
      } catch (err: any) {        // Capture simplifiée de l'erreur
        
        // Effacer le message de succès en cas d'erreur
        setSuccess('');
        
        // Gérer les différents types d'erreurs
        if (err.name === 'IncorrectPasswordError' || 
            (err.message && err.message.includes('Current password is incorrect'))) {
          // Erreur de mot de passe incorrect détectée
          // Réinitialiser l'erreur générale et configurer l'erreur spécifique au champ
          setError('');
          setPasswordErrors(prev => ({ 
            ...prev, 
            current: 'Le mot de passe actuel est incorrect' 
          }));
          // Vider uniquement le champ du mot de passe actuel pour permettre une nouvelle saisie
          setPassword('');
        } else if (err.message && err.message.includes('User not found')) {
          setError('Utilisateur non trouvé. Veuillez vous reconnecter.');
          // Optionnellement, rediriger vers la page de connexion après un délai
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
        } else if (err.message && err.message.includes('Erreur serveur: informations utilisateur incomplètes')) {
          setError('Une erreur est survenue avec votre compte. Veuillez contacter le support.');
        } else if (err.status === 404 || (err.response && err.response.status === 404)) {
          setError('Service indisponible. Veuillez réessayer plus tard.');
        } else {
          setError(err.message || 'Erreur lors de la modification du mot de passe');
          // Capture de l'erreur générique
        }
      }
    }
  };
  return (
    <PageTransition type="slide">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 profile-container">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Mon Profil</h1>
        
        {/* Modal de succès */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 dark:text-white mb-4">
                Succès !
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                {success}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="p-8 md:w-1/3 bg-gray-50 dark:bg-gray-700/50 border-r border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto">                <AvatarSelector
                  currentAvatar={user?.avatar}
                  userFirstName={user?.firstName}                  onAvatarSelect={async (avatarUrl) => {
                    try {
                      setError('');
                      setSuccess('');
                      setShowSuccessModal(false);
                      
                      console.log('Traitement de l\'avatar URL:', avatarUrl ? avatarUrl.substring(0, 30) + '...' : 'null');
                      
                      // Cas 1: Avatar prédéfini
                      if (avatarUrl.startsWith('/avatars/')) {
                        const fileName = avatarUrl.split('/').pop() || 'avatar.svg';
                        
                        // Créer un blob avec un contenu minimal pour représenter l'avatar
                        const dummyContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"></svg>`;
                        const blob = new Blob([dummyContent], { type: 'image/svg+xml' });
                        
                        const file = new File([blob], fileName, { 
                          type: 'image/svg+xml',
                        });
                        
                        console.log('Sélection d\'avatar prédéfini:', fileName);
                          
                        // Upload de l'avatar avec l'indication que c'est un avatar prédéfini
                        const uploadResponse = await authService.uploadAvatar(file);
                        
                        await updateUser({
                          firstName: user?.firstName,
                          lastName: user?.lastName,
                          email: user?.email,
                          avatar: uploadResponse.avatarUrl,
                          isPresetAvatar: true,
                        });
                        
                        setSuccess('Avatar prédéfini mis à jour avec succès');
                        setShowSuccessModal(true);
                      } 
                      // Cas 2: Avatar personnalisé avec initiales (URL blob ou data URL)
                      else if (avatarUrl.startsWith('blob:') || avatarUrl.startsWith('data:')) {
                        console.log('Traitement d\'avatar personnalisé avec initiales');
                        
                        // Récupérer le contenu de l'URL
                        let content;
                        if (avatarUrl.startsWith('blob:')) {
                          const response = await fetch(avatarUrl);
                          content = await response.text();
                        } else {
                          // Pour data:image/svg+xml;base64
                          const base64Content = avatarUrl.split(',')[1];
                          content = atob(base64Content);
                        }
                          // Créer un fichier à partir du contenu
                        const blob = new Blob([content], { type: 'image/svg+xml' });
                        const fileName = `initials-avatar-${Date.now()}.svg`;
                        const file = new File([blob], fileName, { 
                          type: 'image/svg+xml',
                        });
                        
                        console.log('Envoi de l\'avatar personnalisé au serveur:', fileName);
                        // Upload de l'avatar (on s'assure que le service comprend que ce n'est PAS un avatar prédéfini)
                        const uploadResponse = await authService.uploadAvatar(file);
                        
                        // Mise à jour du profil utilisateur
                        await updateUser({
                          firstName: user?.firstName,
                          lastName: user?.lastName,
                          email: user?.email,
                          avatar: uploadResponse.avatarUrl,
                          isPresetAvatar: false,
                        });
                        
                        setSuccess('Avatar personnalisé mis à jour avec succès');
                        setShowSuccessModal(true);
                      }
                    } catch (err: any) {
                      // Gestion de l'erreur de sélection d'avatar
                      setError(err.message || 'Erreur lors de la mise à jour de l\'avatar');
                    }
                  }}
                />

                <div className="text-center mt-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Colonne de droite avec les infos */}
            <div className="p-8 md:w-2/3 bg-white dark:bg-gray-800">
              {/* Section des informations de base */}
              <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Informations personnelles
                  </h3>
                </div>
                
                <div className="p-6">
                  {!isEditing ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Prénom</label>
                          <div className="text-lg text-gray-900 dark:text-white">{user?.firstName || '-'}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</label>
                          <div className="text-lg text-gray-900 dark:text-white">{user?.lastName || '-'}</div>
                        </div>
                        
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                          <div className="text-lg text-gray-900 dark:text-white break-all">{user?.email}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true);
                          setUserInfo({
                            firstName: user?.firstName || '',
                            lastName: user?.lastName || '',
                            email: user?.email || '',
                          });
                        }}
                        className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                      >
                        Modifier mes informations
                      </button>
                    </>
                  ) : (
                    <form onSubmit={handleInfoSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Prénom
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            value={userInfo.firstName}
                            onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                          />
                        </div>

                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nom
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            value={userInfo.lastName}
                            onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={userInfo.email}
                            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 text-red-700 dark:text-red-400">
                          {error}
                        </div>
                      )}

                      {success && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-400 dark:border-green-500 text-green-700 dark:text-green-400">
                          {success}
                        </div>
                      )}

                      <div className="flex space-x-4 pt-2">
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        >
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setError('');
                            setSuccess('');
                          }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  )}              </div>
            </div>

              {/* Section mot de passe */}
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Changer le mot de passe
                  </h3>
                </div>
                  <div className="p-6">
                  {/* Message de succès permanent */}
                  {success && !isEditingPassword && (
                    <div 
                      key={success} 
                      className="mb-6 p-4 rounded-md bg-green-50 border border-green-200"
                      role="alert"
                    >
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">{success}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {!isEditingPassword ? (                    <button
                      type="button"
                      onClick={() => {
                        // Effacer le message de succès seulement lorsque l'utilisateur commence à modifier à nouveau
                        setSuccess('');
                        // Puis passer en mode édition
                        setIsEditingPassword(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      Modifier le mot de passe
                    </button>) : (                    <form onSubmit={handleChangePassword} className="space-y-6">
                      {/* Dans le formulaire d'édition, nous n'affichons pas le message de succès
                          car il sera affiché dans la section parente uniquement quand !isEditingPassword */}
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Mot de passe actuel
                          </label><input
                            type="password"
                            id="current-password"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              validateCurrentPassword(e.target.value);
                              // Réinitialiser l'erreur lorsque l'utilisateur commence à taper
                              if (passwordErrors.current) {
                                setPasswordErrors(prev => ({ ...prev, current: '' }));
                              }
                            }}
                            required
                            className={`mt-1 block w-full border ${
                              passwordErrors.current ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors`}
                          />
                          {passwordErrors.current && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              {passwordErrors.current}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              validateNewPassword(e.target.value);
                              if (confirmPassword) {
                                validateConfirmPassword(e.target.value, confirmPassword);
                              }
                            }}
                            required
                            className={`mt-1 block w-full border ${
                              passwordErrors.new ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors`}
                          />
                {passwordErrors.new && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              {passwordErrors.new}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Confirmer le nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              validateConfirmPassword(newPassword, e.target.value);
                            }}
                            required
                            className={`mt-1 block w-full border ${
                              passwordErrors.confirm ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors`}
                          />
                {passwordErrors.confirm && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              {passwordErrors.confirm}
                            </p>
                          )}
                        </div>
                      </div>

                      {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 text-red-700 dark:text-red-400">
                          {error}
                        </div>
                      )}

                      <div className="flex space-x-4 pt-2">
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        >
                          Enregistrer
                        </button>                        <button
                          type="button"                          onClick={() => {
                            // Réinitialiser les champs et les erreurs
                            setPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                            setError('');
                            setPasswordErrors({
                              current: '',
                              new: '',
                              confirm: ''
                            });
                            // Sortir du mode édition
                            // Ne pas effacer le message de succès quand on annule
                            setIsEditingPassword(false);
                          }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
