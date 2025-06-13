# Architecture MVC de la page Profil

Ce document explique comment la page de profil utilisateur suit le pattern MVC (Modèle-Vue-Contrôleur).

## 1. Modèle (Model)

Le modèle représente les données et la logique métier.

**Fichiers concernés:**
- `/src/services/auth.ts` : Service qui gère les opérations d'authentification et de profil utilisateur
- `/server/models/user.js` : Définition du modèle utilisateur côté serveur
- `/server/controllers/authController.js` : Contrôleur côté serveur qui gère les opérations liées au profil

Le modèle contient:
- Structure des données utilisateur
- Méthodes pour manipuler ces données
- Validation des données

## 2. Vue (View)

La vue représente l'interface utilisateur.

**Fichiers concernés:**
- `/src/pages/Profile.tsx` : Composant React qui affiche le profil utilisateur
- `/src/components/profile/AvatarSelector.tsx` : Composant pour la sélection d'avatar
- `/src/styles/profile-fix.css` : Styles CSS spécifiques à la page profil

La vue est responsable de:
- Présentation des données à l'utilisateur
- Capture des interactions utilisateur (formulaires, boutons)
- Affichage des états (chargement, succès, erreur)

## 3. Contrôleur (Controller)

Le contrôleur fait le lien entre le modèle et la vue.

**Fichiers concernés:**
- `/src/contexts/AuthContext.tsx` : Context qui fournit les fonctions de contrôle
- Fonctions dans le composant Profile.tsx qui gèrent les soumissions de formulaire

Le contrôleur est responsable de:
- Traitement des actions de l'utilisateur
- Mise à jour du modèle en réponse à ces actions
- Mise à jour de la vue en fonction des changements du modèle

## Flux de données

1. L'utilisateur interagit avec la page profil (ex: modification des informations)
2. Le contrôleur traite cette action (ex: `handleInfoSubmit`)
3. Le modèle est mis à jour via les services (ex: `updateUser`)
4. La vue est mise à jour pour refléter les changements

## Exemple concret

Lors de la modification du mot de passe:
1. L'utilisateur remplit le formulaire de changement de mot de passe
2. La fonction `handleChangePassword` du contrôleur est appelée
3. Le contrôleur valide les données (règles de validation du mot de passe)
4. Le service `authService.changePassword` est appelé pour mettre à jour le modèle
5. La vue est mise à jour pour afficher un message de succès ou d'erreur

## Avantages de cette architecture

- **Séparation des préoccupations** : Chaque partie a une responsabilité claire
- **Maintenabilité** : Modifications isolées sans affecter les autres parties
- **Testabilité** : Chaque composant peut être testé indépendamment
- **Réutilisabilité** : Les composants peuvent être réutilisés dans d'autres parties de l'application
