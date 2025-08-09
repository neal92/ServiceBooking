# Redimensionnement Manuel d'Images

## 🎯 Fonctionnalité

Le système d'upload d'images supporte maintenant le **redimensionnement manuel** en plus du redimensionnement automatique.

## ✨ Nouvelles Fonctionnalités

### 🖼️ **ImageCropper Component**
- Interface de recadrage/redimensionnement interactive
- Déplacement de la zone de crop par glisser-déposer
- Redimensionnement avec ou sans conservation des proportions
- Tailles prédéfinies (400×300, 600×450, 800×600, 150×150)
- Aperçu temps réel des modifications

### 🔧 **ImageUpload Enhanced**
- Nouvelle prop `allowManualResize={true}` pour activer le mode manuel
- Bouton de redimensionnement intégré
- Compatible avec le redimensionnement automatique existant

## 📋 Utilisation

### Mode Automatique (existant)
```tsx
<ImageUpload
  value={selectedImage}
  onChange={setSelectedImage}
  allowManualResize={false} // Par défaut
/>
```

### Mode Manuel (nouveau)
```tsx
<ImageUpload
  value={selectedImage}
  onChange={setSelectedImage}
  allowManualResize={true} // Active le redimensionnement manuel
/>
```

## 🎮 Interface Utilisateur

### Redimensionnement Manuel
1. **Upload d'image** : Glissez-déposez ou sélectionnez une image
2. **Activation** : Cliquez sur l'icône de recadrage (✂️) ou le bouton "Redimensionner"
3. **Édition** :
   - **Déplacement** : Glissez la zone de sélection
   - **Redimensionnement** : Modifiez les dimensions dans le panneau
   - **Proportions** : Activez/désactivez le maintien des proportions
   - **Presets** : Utilisez les tailles prédéfinies
4. **Validation** : Cliquez sur "Appliquer" pour confirmer

### Contrôles Disponibles
- **Dimensions personnalisées** : Largeur et hauteur en pixels
- **Maintien des proportions** : Checkbox pour conserver le ratio
- **Presets rapides** : 400×300, 600×450, 800×600, 150×150
- **Informations** : Dimensions originales et zone sélectionnée
- **Réinitialisation** : Bouton pour revenir aux dimensions par défaut

## 🔄 Workflow Technique

### Côté Frontend
1. **Selection d'image** → `ImageUpload` component
2. **Mode manuel activé** → Ouverture `ImageCropper`
3. **Édition utilisateur** → Manipulation de la zone de crop
4. **Validation** → Génération du fichier redimensionné
5. **Canvas processing** → Création de l'image finale
6. **Callback** → Retour vers le composant parent

### Côté Backend (inchangé)
- Le serveur continue de traiter les images normalement
- Redimensionnement automatique toujours actif en complément
- Optimisation et compression standard

## 📁 Fichiers Modifiés

### Nouveaux Composants
- `src/components/ui/ImageCropper.tsx` - Interface de redimensionnement manuel
- `src/components/TestImageResize.tsx` - Page de test

### Composants Mis à Jour
- `src/components/ui/ImageUpload.tsx` - Support du mode manuel
- `src/components/services/NewServiceModal.tsx` - Activation du mode manuel

## 🎨 Configuration des Services

Le modal de création/édition de services active automatiquement le redimensionnement manuel :

```tsx
<ImageUpload
  value={selectedImage}
  onChange={setSelectedImage}
  allowManualResize={true} // ✅ Activé pour les services
  maxSize={10}
  preview={true}
/>
```

## 🔍 Avantages

### Pour l'Utilisateur
- **Contrôle total** sur le cadrage et les dimensions
- **Aperçu en temps réel** des modifications
- **Interface intuitive** avec glisser-déposer
- **Presets rapides** pour les tailles communes

### Pour les Performances
- **Optimisation côté client** avant upload
- **Réduction de la bande passante** (images déjà redimensionnées)
- **Compatible** avec l'optimisation serveur existante

## 🧪 Test

Utilisez le composant de test pour valider la fonctionnalité :

```bash
# Ajouter la route de test temporairement
import TestImageResize from './components/TestImageResize';

// Dans votre router ou App.tsx
<Route path="/test-resize" component={TestImageResize} />
```

## 📐 Spécifications Techniques

### Dimensions par Défaut
- **Ratio par défaut** : 4:3 (400×300)
- **Taille max** : 800×600 pixels
- **Formats supportés** : JPG, PNG, GIF, WebP
- **Taille fichier max** : 10MB

### Technologies Utilisées
- **Canvas API** pour le traitement d'images
- **File API** pour la génération de fichiers
- **React Hooks** pour la gestion d'état
- **Tailwind CSS** pour le styling

## 🚀 Déploiement

La fonctionnalité est prête pour la production :
- ✅ Tests de compilation réussis
- ✅ Interface utilisateur complète
- ✅ Intégration avec les services existants
- ✅ Documentation complète

**Prêt à tester et utiliser ! 🎉**
