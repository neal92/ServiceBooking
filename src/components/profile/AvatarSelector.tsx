import { useState } from 'react';
import { User, Camera, X } from 'lucide-react';
import { getFullMediaUrl } from '../../utils/config';

interface AvatarSelectorProps {
  currentAvatar?: string | null;
  onAvatarSelect: (avatarPath: string) => Promise<void>;
  userFirstName?: string;
}

const AvatarSelector = ({ currentAvatar, onAvatarSelect, userFirstName = '' }: AvatarSelectorProps) => {
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  
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
      >          {currentAvatar ? (
          <>              <img 
                src={getFullMediaUrl(currentAvatar)} 
                alt="Avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Erreur de chargement de l\'avatar:', e);
                  e.currentTarget.src = getFullMediaUrl('/avatars/avatar1.svg');
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
                >                  <img
                    src={getFullMediaUrl(avatar)}
                    alt={`Avatar ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarSelector;
