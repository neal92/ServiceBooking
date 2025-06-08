import { useState } from 'react';
import { User, Camera, X } from 'lucide-react';

interface AvatarSelectorProps {
  currentAvatar?: string | null;
  onAvatarChange: (file: File) => Promise<void>;
  onAvatarSelect: (avatarPath: string) => Promise<void>;
  userFirstName?: string;
}

const AvatarSelector = ({ currentAvatar, onAvatarChange, onAvatarSelect, userFirstName = '' }: AvatarSelectorProps) => {
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  console.log('Render AvatarSelector - currentAvatar:', 
    currentAvatar?.substring(0, 100), 
    'type:', typeof currentAvatar
  );
  
  // Liste d'avatars prédéfinis
  const predefinedAvatars = [
    '/avatars/avatar1.svg',
    '/avatars/avatar2.svg',
    '/avatars/avatar3.svg',
    '/avatars/avatar4.svg',
    '/avatars/avatar5.svg',
    '/avatars/avatar6.svg',
    '/avatars/avatar7.svg',
    '/avatars/avatar8.svg',
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Fichier sélectionné:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      try {
        console.log('Tentative de changement d\'avatar avec le fichier');
        await onAvatarChange(file);
        console.log('Changement d\'avatar réussi');
        setShowAvatarSelector(false);
      } catch (err) {
        console.error('Erreur détaillée lors du changement d\'avatar:', err);
      }
    }
  };

  const handleAvatarSelect = async (avatarPath: string) => {
    console.log('handleAvatarSelect - Sélection de l\'avatar:', avatarPath);
    try {
      await onAvatarSelect(avatarPath);
      console.log('Sélection d\'avatar réussie');
      setShowAvatarSelector(false);
    } catch (err) {
      console.error('Erreur lors de la sélection de l\'avatar:', err);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowAvatarSelector(!showAvatarSelector)}
        className="w-32 h-32 rounded-full overflow-hidden relative group"
      >
        {currentAvatar ? (
          <>
            <img 
              src={currentAvatar} 
              alt="Avatar" 
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Erreur de chargement de l\'avatar:', e);
                e.currentTarget.src = '/avatars/avatar1.svg';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </>        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {userFirstName ? (
              <span className="text-4xl font-bold text-gray-500 dark:text-gray-400">
                {userFirstName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            )}
          </div>
        )}
      </button>

      {showAvatarSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Choisir un avatar
              </h3>
              <button
                onClick={() => setShowAvatarSelector(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Grille d'avatars prédéfinis */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {predefinedAvatars.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => handleAvatarSelect(avatar)}
                  className="w-full pt-[100%] relative rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <img
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Séparateur */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Ou chargez votre propre avatar
                </span>
              </div>
            </div>

            {/* Upload personnalisé */}
            <div className="flex justify-center">
              <label className="cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span>Charger une image</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarSelector;
