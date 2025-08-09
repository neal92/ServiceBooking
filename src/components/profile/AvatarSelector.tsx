import * as React from 'react';
import { useState, useEffect } from 'react';
import { User, Camera, X } from 'lucide-react';
import { getFullMediaUrl, isAvatarAccessible } from '../../utils/config';

interface AvatarSelectorProps {
  currentAvatar?: string | null;
  onAvatarSelect: (avatarPath: string) => Promise<void>;
  userFirstName?: string;
}

const AvatarSelector = ({ currentAvatar, onAvatarSelect, userFirstName = '' }: AvatarSelectorProps) => {
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [isCurrentAvatarValid, setIsCurrentAvatarValid] = useState(true);
  const [showInitialsCreator, setShowInitialsCreator] = useState(false);
  const [initials, setInitials] = useState(userFirstName ? userFirstName.charAt(0).toUpperCase() : '');
  const [bgColor, setBgColor] = useState('#3b82f6');
  const [extractedInitials, setExtractedInitials] = useState<string | null>(null);
  const [extractedColor, setExtractedColor] = useState<string | null>(null);
  // Fonction pour extraire les métadonnées d'un SVG
  const extractSvgMetadata = async (svgUrl: string): Promise<{ color?: string, initials?: string }> => {
    try {
      // Préfixer l'URL si nécessaire
      let fullUrl = svgUrl;
      if (svgUrl.startsWith('/avatars/') || svgUrl.startsWith('/uploads/')) {
        fullUrl = getFullMediaUrl(svgUrl);
      }

      console.log('Extraction des métadonnées SVG depuis:', fullUrl);

      // Récupérer le contenu SVG
      const response = await fetch(fullUrl);
      const svgContent = await response.text();      // Extraire la couleur des métadonnées
      const colorMatch = svgContent.match(/<metadata>\s*<color>(.*?)<\/color>\s*<\/metadata>/);
      const color = colorMatch ? colorMatch[1] : undefined;

      // Extraire les initiales du texte SVG
      const initialsMatch = svgContent.match(/<text.*?>([^<]+)<\/text>/s);
      const initials = initialsMatch ? initialsMatch[1].trim() : undefined;

      console.log('Métadonnées extraites:', { color, initials });
      return { color, initials };
    } catch (err) {
      console.error('Erreur lors de l\'extraction des métadonnées SVG:', err);
      return {};
    }
  };

  useEffect(() => {
    if (currentAvatar) {
      isAvatarAccessible(currentAvatar)
        .then(async (isValid) => {
          setIsCurrentAvatarValid(isValid);
          if (!isValid) {
            console.warn(`L'avatar ${currentAvatar} n'est pas accessible`);
          } else if (currentAvatar.startsWith('/uploads/') && currentAvatar.endsWith('.svg')) {
            // Si c'est un avatar SVG personnalisé, extraire les métadonnées
            try {
              const metadata = await extractSvgMetadata(currentAvatar);
              if (metadata.color) {
                setExtractedColor(metadata.color);
                setBgColor(metadata.color); // Préremplir le sélecteur avec la couleur extraite
              }
              if (metadata.initials) {
                setExtractedInitials(metadata.initials);
                setInitials(metadata.initials); // Préremplir le champ d'initiales
              }
            } catch (error) {
              console.error('Erreur lors de l\'extraction des métadonnées SVG:', error);
            }
          }
        })
        .catch(() => {
          setIsCurrentAvatarValid(false);
          console.error(`Erreur de vérification pour l'avatar ${currentAvatar}`);
        });
    } else {
      setIsCurrentAvatarValid(false);
    }
  }, [currentAvatar]);

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

  const avatarColors = [
    '#3b82f6', '#10b981', '#ef4444', '#f59e0b',
    '#8b5cf6', '#ec4899', '#6366f1', '#06b6d4',
  ];

  const handleAvatarSelect = async (avatarPath: string) => {
    try {
      await onAvatarSelect(avatarPath);
      setShowAvatarSelector(false);
    } catch (err) {
      console.error('Erreur lors de la sélection de l\'avatar:', err);
    }
  };  const generateInitialAvatar = async () => {
    if (!initials || initials.trim() === '') {
      console.error('Impossible de créer un avatar sans initiales');
      alert('Veuillez entrer des initiales avant de créer l\'avatar');
      return;
    }

    console.log('🎨 Début de création d\'avatar avec initiales:', {
      initiales: initials,
      couleur: bgColor
    });

    // Extraire le code couleur sans le # pour l'insérer dans le nom du fichier
    const colorCode = bgColor.replace('#', '');

    // Création du contenu SVG avec les initiales et la couleur choisie
    // Ajout de métadonnées sur la couleur pour faciliter la récupération ultérieure
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
  <metadata>
    <color>${bgColor}</color>
    <initials>${initials.toUpperCase()}</initials>
  </metadata>
  <circle cx="50" cy="50" r="50" fill="${bgColor}" />
  <text x="50" y="50" dy="0.35em" font-family="Arial, sans-serif" font-size="${initials.length > 1 ? '35' : '40'}" font-weight="bold" text-anchor="middle" fill="white">
    ${initials.toUpperCase()}
  </text>
</svg>`;

    try {
      // Création d'une data URL en base64 pour le SVG
      const base64Content = btoa(svgContent);
      const dataUrl = `data:image/svg+xml;base64,${base64Content}`;

      console.log('✅ Avatar SVG généré avec succès:', {
        initiales: initials,
        couleur: bgColor,
        colorCode: colorCode,
        tailleSVG: svgContent.length,
        tailleBase64: base64Content.length,
        dataUrl: dataUrl.substring(0, 100) + '...'
      });
      
      // Mettre à jour les données extraites avant d'appeler onAvatarSelect
      setExtractedColor(bgColor);
      setExtractedInitials(initials.toUpperCase());

      console.log('📤 Appel de onAvatarSelect avec la data URL...');
      
      // Appel de la fonction d'upload avec la data URL
      await onAvatarSelect(dataUrl);

      console.log('✅ Avatar créé et envoyé avec succès');

      // Fermeture des sélecteurs après réussite
      setShowInitialsCreator(false);
      setShowAvatarSelector(false);
    } catch (err: any) {
      console.error('❌ Erreur de création d\'avatar avec initiales:', err);
      alert(`Erreur lors de la création de l'avatar: ${err?.message || String(err)}`);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowAvatarSelector(!showAvatarSelector)}
        className="w-32 h-32 rounded-full overflow-hidden relative group"
      >
        {currentAvatar && isCurrentAvatarValid ? (
          <>
            <img
              key={currentAvatar}
              src={getFullMediaUrl(currentAvatar)}
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                setIsCurrentAvatarValid(false);
                e.currentTarget.src = getFullMediaUrl('/avatars/avatar1.svg');
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </>) : (<div className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: extractedColor || bgColor || '#3b82f6' }}>
            {extractedInitials ? (
              <span className="text-4xl font-bold text-white">
                {extractedInitials}
              </span>
            ) : userFirstName ? (
              <span className="text-4xl font-bold text-white">
                {userFirstName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>
        )}
      </button>

      {showAvatarSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choisir un avatar</h3>
              <button onClick={() => setShowAvatarSelector(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">              <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 pb-2">
              <button
                className={`px-3 py-2 ${!showInitialsCreator
                  ? 'font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                onClick={() => setShowInitialsCreator(false)}
              >
                Avatars prédéfinis
              </button>
              <button
                className={`px-3 py-2 ${showInitialsCreator
                  ? 'font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                onClick={() => setShowInitialsCreator(true)}
              >
                Créer avec initiales
              </button>
            </div>

              {!showInitialsCreator ? (
                <div className="grid grid-cols-4 gap-3">
                  {predefinedAvatars.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => handleAvatarSelect(avatar)}
                      className="w-full pt-[100%] relative rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500"
                    >
                      <img
                        src={getFullMediaUrl(avatar)}
                        alt={`Avatar ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>                    <label htmlFor="initials" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initiales</label>
                    <input
                      type="text"
                      id="initials"
                      value={initials}
                      onChange={(e) => setInitials(e.target.value.substring(0, 2))}
                      maxLength={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: AB"
                    />
                  </div>                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Couleur de fond</label>
                    <div className="grid grid-cols-4 gap-2">
                      {avatarColors.map((color, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setBgColor(color)}
                          className={`w-8 h-8 rounded-full ${bgColor === color ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400' : ''}`}
                          style={{ backgroundColor: color }}
                          aria-label={`Couleur ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>                  <div className="flex justify-center my-4">
                    <div className="w-20 h-20 rounded-full shadow-md" style={{ backgroundColor: bgColor }}>
                      <div className="flex items-center justify-center h-full">
                        <span className="text-2xl font-bold text-white">
                          {initials.toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                  </div>                  <div className="flex justify-center space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowInitialsCreator(false);
                        setShowAvatarSelector(false);
                      }}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-md shadow-sm transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={generateInitialAvatar}
                      disabled={!initials || initials.trim() === ''}
                      className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md shadow-sm transition-colors font-medium ${!initials || initials.trim() === '' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                    >
                      🎨 Créer l'avatar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarSelector;