# Nettoyage du module Calendrier

## Pourquoi cette modification ?

Le composant calendrier précédent présentait plusieurs problèmes :
- Duplication des boutons de navigation
- Conflits avec les boutons de profil et autres éléments d'interface
- Erreurs TypeScript dans les fonctions de formatage de dates
- Problèmes de performance et de rendu

## Solution mise en place

Le composant calendrier a été temporairement remplacé par une page statique indiquant que la fonctionnalité est en maintenance. Les utilisateurs sont encouragés à utiliser l'onglet "Rendez-vous" en attendant.

## Fichiers affectés

- `src/pages/Calendar.tsx` : simplifié pour afficher un message de maintenance
- `src/main.tsx` : nettoyé pour supprimer les imports problématiques
- `.gitignore` : mis à jour pour ignorer les fichiers liés au calendrier obsolètes

## Comment restaurer la fonctionnalité ?

Pour réintégrer une fonctionnalité de calendrier ultérieurement, il est recommandé de :
1. Utiliser une bibliothèque de calendrier plus simple et mieux documentée
2. Éviter les manipulations directes du DOM qui causent des conflits avec React
3. Simplifier la gestion des états et des événements

## Fonctionnalités préservées

Toutes les autres fonctionnalités de l'application restent opérationnelles, notamment :
- Gestion des rendez-vous
- Profil utilisateur
- Gestion des services et des catégories
- Authentification
