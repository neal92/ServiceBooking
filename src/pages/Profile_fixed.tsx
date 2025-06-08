import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/layout/PageTransition';
import SuccessToast from '../components/layout/SuccessToast';
import AvatarSelector from '../components/profile/AvatarSelector';

const Profile = () => {
  const { user, updateUser, changePassword } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
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
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  console.log('Profile - État initial:', { 
    id: user?.id,
    firstName: user?.firstName,
    lastName: user?.lastName,
    avatar: user?.avatar,
  });

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowSuccessToast(false);

    try {
      await updateUser(userInfo);
      setSuccess('Informations mises à jour avec succès');
      setShowSuccessToast(true);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour des informations');
    }
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowSuccessToast(false);

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await changePassword(password, newPassword);
      setSuccess('Mot de passe modifié avec succès');
      setShowSuccessToast(true);
      setIsEditingPassword(false);
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification du mot de passe');
    }
  };

  return (
    <PageTransition type="fade">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Mon Profil</h1>
        
        <SuccessToast 
          message={success} 
          show={showSuccessToast} 
          onClose={() => setShowSuccessToast(false)}
          duration={3000}
        />
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="p-8 md:w-1/3 bg-gray-50 dark:bg-gray-700/50 border-r border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto">
                <AvatarSelector
                  currentAvatar={user?.avatar}
                  userFirstName={user?.firstName}
                  onAvatarSelect={async (avatarUrl) => {
                    try {
                      setError('');
                      setSuccess('');
                      setShowSuccessToast(false);
                      
                      // Mise à jour de l'utilisateur avec l'avatar prédéfini
                      await updateUser({
                        firstName: user?.firstName,
                        lastName: user?.lastName,
                        email: user?.email,
                        avatar: avatarUrl,
                        isPresetAvatar: true,
                      });
                      
                      setSuccess('Avatar mis à jour avec succès');
                      setShowSuccessToast(true);
                    } catch (err: any) {
                      console.error('Erreur sélection avatar:', err);
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
                  {!isEditingPassword ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingPassword(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      Modifier le mot de passe
                    </button>
                  ) : (
                    <form onSubmit={handleChangePassword} className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Mot de passe actuel
                          </label>
                          <input
                            type="password"
                            id="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Confirmer le nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                          />
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
                            setIsEditingPassword(false);
                            setPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                            setError('');
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
