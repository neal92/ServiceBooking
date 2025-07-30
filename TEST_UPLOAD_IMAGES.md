# 🎯 Test de la fonctionnalité Upload d'Images

## Étapes pour tester

### 1. Démarrer le serveur
```bash
cd server
npm run dev
```

### 2. Démarrer le frontend
```bash
# Dans un autre terminal, à la racine du projet
npm run dev
```

### 3. Se connecter en tant qu'admin
- Allez sur `http://localhost:5173/login`
- Email: `admin@example.com`
- Mot de passe: `admin123`

### 4. Tester la création d'un service avec image

1. **Aller dans la section Services**
2. **Cliquer sur "Nouveau Service" ou "+"**
3. **Remplir le formulaire :**
   - Nom : `Coupe moderne`
   - Description : `Coupe tendance pour tous`
   - Prix : `35`
   - Durée : `45`
   - Catégorie : Choisir une catégorie existante
   - **Image : Cliquer sur la zone d'upload et sélectionner une image**

4. **Cliquer sur "Créer"**

### 5. Tester la modification d'un service

1. **Cliquer sur l'icône d'édition** d'un service existant
2. **Modifier l'image** en sélectionnant une nouvelle image
3. **Sauvegarder**

### 6. Tester la création d'une catégorie avec image

1. **Aller dans la section Catégories**
2. **Cliquer sur "Nouvelle Catégorie"**
3. **Remplir le formulaire avec une image**
4. **Créer la catégorie**

## ✅ Vérifications à faire

- [ ] L'image s'affiche dans l'aperçu pendant l'upload
- [ ] L'image est sauvegardée correctement
- [ ] L'image apparaît sur la carte du service/catégorie
- [ ] La modification d'image fonctionne
- [ ] Les services sans image affichent un placeholder
- [ ] Les erreurs de validation s'affichent (taille trop grande, format incorrect)

## 🐛 Problèmes possibles

### Images qui ne s'affichent pas
- Vérifier que les dossiers `server/public/images/services/` et `server/public/images/categories/` existent
- Vérifier les permissions d'écriture
- Consulter la console du navigateur pour les erreurs

### Erreurs d'upload
- Vérifier la taille de l'image (max 5MB)
- Vérifier le format (JPG, PNG, GIF, WebP uniquement)
- Vérifier que `express-fileupload` est bien installé

### Erreurs de compilation TypeScript
- Vérifier que les types sont à jour dans `src/types/index.ts`
- Redémarrer le serveur de développement

## 🧪 Test automatique

Pour un test rapide des APIs :
```bash
cd server
node scripts/test-upload-integration.js
```

## 📁 Fichiers modifiés

- `src/components/services/NewServiceModal.tsx` - Ajout de l'upload d'image
- `src/components/categories/NewCategoryModal.tsx` - Ajout de l'upload d'image
- `src/components/services/ServiceCard.tsx` - Affichage des images
- `src/components/categories/CategoryCard.tsx` - Nouveau composant avec images
- `src/components/ui/ImageUpload.tsx` - Composant d'upload réutilisable
- `src/services/serviceService.ts` - Service API avec FormData
- `src/services/categoryService.ts` - Service API avec FormData
- `src/types/index.ts` - Ajout de la propriété `image`

## 🎨 Fonctionnalités d'upload

- **Drag & Drop** : Glisser-déposer d'images
- **Validation** : Types et taille de fichiers
- **Aperçu** : Prévisualisation avant upload
- **Gestion d'erreurs** : Messages d'erreur clairs
- **Noms uniques** : Génération automatique de noms de fichiers
- **Suppression d'anciennes images** : Nettoyage automatique lors de la modification

Bonne chance pour les tests ! 🚀
