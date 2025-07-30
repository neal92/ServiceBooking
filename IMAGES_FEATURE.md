# Fonctionnalité Upload d'Images - ServiceBooking

## 📸 Vue d'ensemble

Cette fonctionnalité permet d'ajouter des images aux **services** et **catégories** dans votre application ServiceBooking. Les images sont stockées sur le serveur et affichées dans l'interface utilisateur.

## 🛠️ Modifications apportées

### Backend (Serveur)

#### 1. Base de données
- ✅ Ajout de la colonne `image VARCHAR(255)` dans les tables `services` et `categories`
- ✅ Correction de la syntaxe SQL dans `database.sql`

#### 2. Contrôleurs
- ✅ **serviceController.js** : Gestion de l'upload d'images pour les services
- ✅ **categoryController.js** : Gestion de l'upload d'images pour les catégories
- ✅ Validation des types de fichiers (JPEG, PNG, GIF, WebP)
- ✅ Validation de la taille (max 5MB)
- ✅ Génération de noms de fichiers uniques
- ✅ Suppression automatique des anciennes images lors de la mise à jour

#### 3. Modèles
- ✅ **service.js** : Mise à jour pour supporter la colonne `image`
- ✅ **category.js** : Mise à jour pour supporter la colonne `image`
- ✅ Requêtes SQL dynamiques pour les mises à jour partielles

#### 4. Serveur Express
- ✅ Configuration des routes statiques pour servir les images
- ✅ Création des dossiers `/public/images/services/` et `/public/images/categories/`

### Frontend (React)

#### 1. Types TypeScript
- ✅ Ajout de la propriété `image?: string` aux interfaces `Service` et `Category`

#### 2. Composants
- ✅ **ImageUpload.tsx** : Composant réutilisable pour l'upload d'images
- ✅ **ServiceForm.tsx** : Formulaire de création/édition de services avec upload
- ✅ **ServiceCard.tsx** : Mise à jour pour afficher les images des services

#### 3. Services API
- ✅ **serviceService.ts** : Service pour gérer les requêtes avec FormData
- ✅ **categoryService.ts** : Service pour gérer les catégories avec images

## 📁 Structure des fichiers

```
server/
├── config/
│   └── database.sql (modifié)
├── controllers/
│   ├── serviceController.js (modifié)
│   └── categoryController.js (modifié)
├── models/
│   ├── service.js (modifié)
│   └── category.js (modifié)
├── public/
│   └── images/
│       ├── services/ (nouveau)
│       └── categories/ (nouveau)
└── scripts/
    └── test-image-upload.js (nouveau)

src/
├── components/
│   ├── services/
│   │   ├── ServiceCard.tsx (modifié)
│   │   └── ServiceForm.tsx (nouveau)
│   └── ui/
│       └── ImageUpload.tsx (nouveau)
├── services/
│   ├── serviceService.ts (nouveau)
│   └── categoryService.ts (nouveau)
└── types/
    └── index.ts (modifié)
```

## 🚀 Utilisation

### 1. Créer un service avec image

```typescript
import serviceService from '../services/serviceService';

const createService = async (formData: CreateServiceData) => {
  try {
    const result = await serviceService.create({
      name: 'Coupe homme',
      description: 'Coupe classique pour homme',
      price: 30,
      duration: 30,
      categoryId: 1,
      image: selectedFile // File object from input
    });
    console.log('Service créé:', result);
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

### 2. Afficher un service avec image

```typescript
import ServiceCard from '../components/services/ServiceCard';

const MyComponent = () => {
  return (
    <ServiceCard
      service={service}
      onEdit={() => handleEdit(service)}
      onDelete={() => handleDelete(service)}
    />
  );
};
```

### 3. Upload d'image avec le composant ImageUpload

```typescript
import ImageUpload from '../components/ui/ImageUpload';

const MyForm = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  return (
    <ImageUpload
      onImageChange={setSelectedImage}
      placeholder="Ajouter une image"
    />
  );
};
```

## 🛡️ Validation et sécurité

### Types de fichiers autorisés
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)

### Limitations
- Taille maximale : **5MB**
- Validation côté serveur ET côté client
- Noms de fichiers uniques générés automatiquement

### Structure des noms de fichiers
- Services : `service_{timestamp}_{random}.{extension}`
- Catégories : `category_{timestamp}_{random}.{extension}`

## 🌐 URLs des images

Les images sont accessibles via les URLs suivantes :
- Services : `http://localhost:5000/images/services/{filename}`
- Catégories : `http://localhost:5000/images/categories/{filename}`

## 🧪 Tests

Un script de test est disponible pour vérifier la fonctionnalité :

```bash
cd server
node scripts/test-image-upload.js
```

## 📋 TODO / Améliorations futures

- [ ] Compression automatique des images
- [ ] Support de plus de formats (SVG, AVIF)
- [ ] Redimensionnement automatique
- [ ] Gestion des images en CDN
- [ ] Prévisualisation des images avant upload
- [ ] Drag & drop pour l'upload
- [ ] Cropping d'images

## 🔄 Migration de la base de données

Si vous avez déjà des données, vous pouvez mettre à jour votre schéma avec :

```sql
-- Ajouter la colonne image aux services existants
ALTER TABLE services ADD COLUMN image VARCHAR(255) DEFAULT NULL;

-- Ajouter la colonne image aux catégories existantes  
ALTER TABLE categories ADD COLUMN image VARCHAR(255) DEFAULT NULL;
```

## 🚨 Remarques importantes

1. **Permissions** : Assurez-vous que le serveur a les permissions d'écriture dans `/public/images/`
2. **Backup** : Les images ne sont pas sauvegardées automatiquement
3. **Production** : Considérez l'utilisation d'un CDN pour la production
4. **Nettoyage** : Implémentez un système de nettoyage des images orphelines

Cette fonctionnalité améliore considérablement l'expérience utilisateur en permettant une présentation visuelle attrayante des services et catégories !
