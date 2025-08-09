# Guide de Dépannage - Images de Services

## 🐛 Problème : URL blob qui ne s'affiche pas

### Symptômes
```
GET blob:http://localhost:5174/c1809e35-eb22-4377-96c4-f06d9614fd71 net::ERR_FILE_NOT_FOUND
```

### Cause
Après la création d'un service avec une image, l'URL blob temporaire côté client est remplacée par l'image servie depuis le serveur, mais la transition ne se fait pas correctement.

## ✅ Solutions Implémentées

### 1. **Detection des URLs Blob dans ServiceCard**
```tsx
// Vérifier si service.image est une URL blob (temporaire)
if (service.image.startsWith('blob:')) {
  // Si on force le refresh, ne pas utiliser l'URL blob
  if (forceImageRefresh) {
    return null; // Fallback vers placeholder
  }
  return service.image; // Utiliser temporairement
}
```

### 2. **Rafraîchissement Forcé après Opérations**
```tsx
// Dans Services.tsx
const handleOperationSuccess = (message: string) => {
  fetchData(); // Rafraîchir immédiatement
  setRefreshImages(true); // Forcer cache-buster
  setTimeout(() => setRefreshImages(false), 10000);
  
  // Double rafraîchissement pour sécurité
  setTimeout(() => fetchData(), 1000);
};
```

### 3. **Cache-Buster dans les URLs d'Images**
```tsx
// api.ts
getImageUrl: (serviceId: string, cacheBuster?: boolean): string => {
  const baseUrl = `${API_URL}/services/${serviceId}/image`;
  return cacheBuster ? `${baseUrl}?t=${Date.now()}` : baseUrl;
}
```

### 4. **Nettoyage d'État dans NewServiceModal**
```tsx
// Réinitialiser après création réussie
if (!service) { // Nouveaux services seulement
  setName('');
  setSelectedImage(null);
  // ... autres champs
}
```

## 🔄 Workflow Corrigé

1. **Création de service** → Upload d'image
2. **Backend** → Traite et sauvegarde l'image  
3. **Frontend** → `onSuccess` callback déclenché
4. **Rafraîchissement** → `fetchData()` récupère les nouvelles données
5. **Cache-buster** → Force le rechargement des images
6. **ServiceCard** → Détecte et remplace les URLs blob

## 🛠️ Debugging

### Vérifier l'état des services
```tsx
console.log('Service image:', service.image);
console.log('Is blob?', service.image?.startsWith('blob:'));
console.log('Force refresh?', forceImageRefresh);
```

### Vérifier les URLs générées
```tsx
console.log('Generated URL:', getImageUrl());
```

### Vérifier la réponse du serveur
```tsx
// Dans la console réseau, vérifier :
// GET /api/services/{id}/image
// Statut 200 avec image
```

## 🎯 Bonnes Pratiques

1. **Toujours utiliser des cache-busters** après modifications d'images
2. **Double rafraîchissement** pour les opérations critiques  
3. **Nettoyage d'état** après opérations réussies
4. **Fallback vers placeholder** en cas d'erreur de chargement
5. **URLs blob temporaires** seulement pendant l'édition

## 🔍 Points de Contrôle

- [ ] L'image apparaît immédiatement après création
- [ ] Pas d'erreurs `ERR_FILE_NOT_FOUND` dans la console
- [ ] Cache-buster actif pendant 10 secondes après opération
- [ ] Rafraîchissement des données en arrière-plan
- [ ] État du modal nettoyé après création

## 📋 Tests Recommandés

1. Créer un nouveau service avec image
2. Vérifier l'affichage immédiat dans la liste
3. Actualiser la page et vérifier la persistance
4. Modifier l'image d'un service existant
5. Vérifier les performances avec plusieurs images

**Statut : ✅ Problème résolu - Images s'affichent correctement**
