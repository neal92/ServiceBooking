import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/layout/PageTransition';
import AvatarSelector from '../components/profile/AvatarSelector';
import { SuccessToast, ErrorToast } from '../components/layout';
import '../styles/profile-fix.css';

const Profile = () => {
  const { user, updateUser, changePassword, refreshUserData, uploadAvatar } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    pseudo: user?.pseudo || '',
  });

  // Effet pour mettre à jour l'état local lorsque les données utilisateur changent
  React.useEffect(() => {
    if (user) {
      console.log("Profile: Mise à jour de l'état local avec les nouvelles données utilisateur", {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
      setUserInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        pseudo: user.pseudo || '',
      });
    }
  }, [user]);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(''); const [success, setSuccess] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
  // Helper to show a success message in both modal and toast
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    setSuccess(message);
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowSuccessModal(false);

    // Validation côté client avant envoi
    const validationErrors = [];

    if (!userInfo.firstName.trim()) {
      validationErrors.push('Le prénom est requis');
    }
    if (!userInfo.lastName.trim()) {
      validationErrors.push('Le nom est requis');
    }
    if (!userInfo.email.trim()) {
      validationErrors.push('L\'email est requis');
    }
    if (userInfo.email && !userInfo.email.includes('@')) {
      validationErrors.push('L\'email doit être valide');
    }
    if (userInfo.pseudo && userInfo.pseudo.trim().length > 0 && userInfo.pseudo.trim().length < 3) {
      validationErrors.push('Le pseudo doit contenir au moins 3 caractères');
    }
    if (userInfo.pseudo && userInfo.pseudo.trim().length > 20) {
      validationErrors.push('Le pseudo ne peut pas dépasser 20 caractères');
    }
    if (userInfo.pseudo && !/^[a-zA-Z0-9_.-]+$/.test(userInfo.pseudo.trim())) {
      validationErrors.push('Le pseudo ne peut contenir que des lettres, chiffres, points, tirets et underscores');
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    try {
      // Nettoyer les données avant envoi
      const cleanedData = {
        firstName: userInfo.firstName.trim(),
        lastName: userInfo.lastName.trim(),
        email: userInfo.email.trim(),
        pseudo: userInfo.pseudo.trim() || undefined, // Envoyer undefined si vide
      };

      console.log('Envoi des données nettoyées:', cleanedData);

      await updateUser(cleanedData);      

      // Fermer d'abord le mode édition
      setIsEditing(false);

      // Puis afficher la notification de succès
      showSuccess('Informations personnelles mises à jour avec succès');

      // Afficher la popup modale de succès
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour:', err);
      setError(err.message || 'Erreur lors de la mise à jour des informations');
    }
  };
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordErrors({ current: '', new: '', confirm: '' });

    console.log('Profile: Début du changement de mot de passe');

    // Validation des champs
    const isCurrentValid = validateCurrentPassword(password);
    const isNewValid = validateNewPassword(newPassword);
    const isConfirmValid = validateConfirmPassword(newPassword, confirmPassword);

    console.log('Profile: Validation des champs:', {
      isCurrentValid,
      isNewValid,
      isConfirmValid,
      currentPasswordLength: password.length,
      newPasswordLength: newPassword.length
    });

    if (!isCurrentValid || !isNewValid || !isConfirmValid) {
      console.log('Profile: Validation échouée, arrêt du processus');
      return;
    }

    try {
      console.log('Profile: Appel de changePassword...');
      await changePassword(password, newPassword);
      
      console.log('Profile: Changement de mot de passe réussi');
      
      // Réinitialiser les champs
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditingPassword(false);
      
      // Afficher le message de succès
      showSuccess('Mot de passe modifié avec succès');
    } catch (err: any) {
      console.error('Profile: Erreur lors du changement de mot de passe:', err);
      if (err.message.includes('mot de passe actuel')) {
        setPasswordErrors(prev => ({ ...prev, current: 'Le mot de passe actuel est incorrect' }));
      } else {
        setError(err.message || 'Erreur lors du changement de mot de passe');
      }
    }
  };

  // Utilisation de la fonction refreshUserData du contexte
  const handleRefreshUserData = async () => {
    try {
      setError('');
      await refreshUserData();
    } catch (error: any) {
      console.error("Erreur lors du rafraîchissement des données:", error);
      setError("Impossible de récupérer vos informations. Veuillez rafraîchir la page.");
    }
  };

  // Effet pour récupérer les données utilisateur si elles ne sont pas disponibles
  React.useEffect(() => {
    if (!user || !user.firstName) {
      console.log("Données utilisateur manquantes, tentative de récupération");
      refreshUserData();
    }
  }, [refreshUserData]);

  return (
    <PageTransition type="slide">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 profile-container">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Colonne gauche : Avatar et infos de base */}
          <div className="p-8 md:w-1/3 bg-gray-50 dark:bg-gray-700/50 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
            <AvatarSelector
              currentAvatar={user?.avatar}
              userFirstName={user?.firstName}
              onAvatarSelect={async (avatarUrl) => {
                try {
                  setError('');
                  setSuccess('');
                  setShowSuccessModal(false);
                  // Cas 1: Avatar prédéfini
                  if (avatarUrl.startsWith('/avatars/')) {
                    const fileName = avatarUrl.split('/').pop() || 'avatar.svg';
                    const dummyContent = `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"></svg>`;
                    const blob = new Blob([dummyContent], { type: 'image/svg+xml' });
                    const file = new File([blob], fileName, { type: 'image/svg+xml' });
                    await uploadAvatar(file);
                    showSuccess('Avatar prédéfini mis à jour avec succès');
                    setShowSuccessModal(true);
                    setTimeout(() => setShowSuccessModal(false), 3000);
                  }
                  // Cas 2: Avatar personnalisé (blob/data URL)
                  else if (avatarUrl.startsWith('blob:') || avatarUrl.startsWith('data:')) {
                    console.log('🎨 Traitement d\'un avatar personnalisé (data URL):', avatarUrl.substring(0, 100) + '...');
                    
                    let content;
                    if (avatarUrl.startsWith('blob:')) {
                      console.log('📥 Récupération du contenu depuis blob URL...');
                      const response = await fetch(avatarUrl);
                      content = await response.text();
                    } else {
                      console.log('📥 Décodage du contenu base64...');
                      const base64Content = avatarUrl.split(',')[1];
                      content = atob(base64Content);
                    }
                    
                    console.log('📄 Contenu SVG décodé:', {
                      longueur: content.length,
                      debut: content.substring(0, 200) + '...'
                    });
                    
                    const blob = new Blob([content], { type: 'image/svg+xml' });
                    const fileName = `initials-avatar-${Date.now()}.svg`;
                    const file = new File([blob], fileName, { type: 'image/svg+xml' });
                    
                    console.log('📤 Upload du fichier avatar:', {
                      nom: file.name,
                      type: file.type,
                      taille: file.size
                    });
                    
                    await uploadAvatar(file);
                    showSuccess('Avatar personnalisé mis à jour avec succès');
                    setShowSuccessModal(true);
                    setTimeout(() => setShowSuccessModal(false), 3000);
                  }
                } catch (err: any) {
                  setError(err.message || "Erreur lors de la mise à jour de l'avatar");
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

          {/* Colonne droite : Infos et mot de passe */}
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
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Pseudo</label>
                        <div className="text-lg text-gray-900 dark:text-white">{user?.pseudo || '-'}</div>
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
                          pseudo: user?.pseudo || '',
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
                      <div className="md:col-span-2">
                        <label htmlFor="pseudo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Pseudo
                        </label>
                        <input
                          type="text"
                          id="pseudo"
                          value={userInfo.pseudo}
                          onChange={(e) => setUserInfo({ ...userInfo, pseudo: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                          placeholder="Ex: john_doe"
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
                )}
              </div>
            </div>
            {/* Section mot de passe */}
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Changer le mot de passe
                </h3>
              </div>
              <div className="p-6">
                {success && !isEditingPassword && (
                  <div
                    key={success}
                    className="mb-6 p-4 rounded-md bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 animate-pulse"
                    role="alert"
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-base font-medium text-green-800 dark:text-green-400">{success}</p>
                      </div>
                    </div>
                  </div>
                )}
                {!isEditingPassword ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess('');
                      setIsEditingPassword(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    Modifier le mot de passe
                  </button>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Mot de passe actuel *
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            validateCurrentPassword(e.target.value);
                          }}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                          placeholder="Votre mot de passe actuel"
                        />
                        {passwordErrors.current && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.current}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Nouveau mot de passe *
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            validateNewPassword(e.target.value);
                            if (confirmPassword) {
                              validateConfirmPassword(e.target.value, confirmPassword);
                            }
                          }}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                          placeholder="Minimum 6 caractères avec lettres et chiffres"
                        />
                        {passwordErrors.new && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.new}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Confirmer le nouveau mot de passe *
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            validateConfirmPassword(newPassword, e.target.value);
                          }}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                          placeholder="Confirmez votre nouveau mot de passe"
                        />
                        {passwordErrors.confirm && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.confirm}</p>
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
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setError('');
                          setPasswordErrors({ current: '', new: '', confirm: '' });
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
      {/* Notification de succès */}
      <SuccessToast
        show={showSuccessToast}
        message={successMessage}
        duration={4000}
        onClose={() => setShowSuccessToast(false)}
      />
      {/* Notification d'erreur */}
      <ErrorToast
        show={!!error || !!passwordErrors.current}
        message={error || passwordErrors.current || "Une erreur s'est produite"}
        duration={5000}
        onClose={() => {
          setError('');
        }}
      />
    </PageTransition>
  );
}

export default Profile;
