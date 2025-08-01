# 🗓️ ServiceBooking

Une application web moderne de gestion de rendez-vous pour les professionnels de services, construite avec React/TypeScript et Node.js.

## 📋 Table des matières

- [🎯 Description](#-description)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🛠️ Technologies](#️-technologies)
- [📁 Structure du projet](#-structure-du-projet)
- [🚀 Installation](#-installation)
- [🔧 Configuration](#-configuration)
- [📖 Documentation API](#-documentation-api)
- [🔐 Authentification](#-authentification)
- [🎨 Interface utilisateur](#-interface-utilisateur)
- [📱 Responsive Design](#-responsive-design)
- [🤝 Contribution](#-contribution)

## 🎯 Description

ServiceBooking est une solution complète de gestion de rendez-vous qui permet aux professionnels de :
- Gérer leurs clients et leurs rendez-vous
- Organiser leurs services en catégories
- Offrir une interface de réservation en ligne
- Suivre leurs statistiques d'activité

L'application propose deux interfaces :
- **Interface Administrateur** : Gestion complète des rendez-vous, services et catégories
- **Interface Client** : Réservation de rendez-vous et suivi des réservations

## ✨ Fonctionnalités

### 👤 Gestion des utilisateurs
- ✅ Inscription/Connexion sécurisée
- ✅ Profils utilisateur avec avatars personnalisés
- ✅ Gestion des rôles (Admin/Utilisateur)
- ✅ Changement de mot de passe
- ✅ Upload d'avatars

### 📅 Gestion des rendez-vous
- ✅ Création, modification, suppression de rendez-vous
- ✅ Filtrage par statut (En attente, Confirmé, En cours, Terminé, Annulé)
- ✅ Filtrage par période (À venir, Aujourd'hui, Passés)
- ✅ Vue calendrier interactive
- ✅ Notifications de succès/erreur

### 🛠️ Gestion des services
- ✅ CRUD complet des services
- ✅ Organisation par catégories
- ✅ Gestion des prix et durées
- ✅ Description détaillée des services

### 📂 Gestion des catégories
- ✅ Création et organisation des catégories
- ✅ Code couleur pour la visualisation
- ✅ Filtrage des services par catégorie

### 📊 Tableau de bord
- ✅ Statistiques en temps réel
- ✅ Graphiques de performance
- ✅ Vue d'ensemble des activités

## 🛠️ Technologies

### Frontend
- **React 18** avec TypeScript
- **Vite** - Build tool moderne
- **Tailwind CSS** - Framework CSS utilitaire
- **Framer Motion** - Animations fluides
- **React Router** - Navigation SPA
- **Axios** - Client HTTP

### Backend
- **Node.js** avec Express.js
- **MySQL** - Base de données relationnelle
- **JWT** - Authentification sécurisée
- **bcrypt** - Hachage des mots de passe
- **express-validator** - Validation des données
- **Swagger** - Documentation API

### DevOps & Outils
- **ESLint** - Linting JavaScript/TypeScript
- **Prettier** - Formatage du code
- **Git** - Contrôle de version

## 📁 Structure du projet

```
ServiceBooking/
├── 📁 src/                          # Frontend React
│   ├── 📁 components/               # Composants réutilisables
│   │   ├── 📁 appointments/         # Composants de gestion des RDV
│   │   ├── 📁 auth/                 # Composants d'authentification
│   │   ├── 📁 layout/               # Composants de mise en page
│   │   └── 📁 profile/              # Composants de profil
│   ├── 📁 contexts/                 # Contexts React (Auth, Theme)
│   ├── 📁 hooks/                    # Hooks personnalisés
│   ├── 📁 pages/                    # Pages de l'application
│   ├── 📁 services/                 # Services API
│   ├── 📁 styles/                   # Fichiers CSS
│   ├── 📁 types/                    # Types TypeScript
│   └── 📁 utils/                    # Utilitaires
├── 📁 server/                       # Backend Node.js
│   ├── 📁 config/                   # Configuration (DB, Swagger)
│   ├── 📁 controllers/              # Contrôleurs API
│   ├── 📁 middleware/               # Middlewares Express
│   ├── 📁 models/                   # Modèles de données
│   ├── 📁 routes/                   # Routes API
│   ├── 📁 scripts/                  # Scripts utilitaires
│   └── 📁 public/                   # Fichiers statiques
├── 📁 public/                       # Assets publics
└── 📄 Documentation files
```

## 🚀 Installation

### Prérequis
- Node.js (v18+)
- MySQL (v8+)
- npm ou yarn

### 1. Cloner le projet
```bash
git clone https://github.com/neal92/ServiceBooking.git
cd ServiceBooking
```

### 2. Installation des dépendances

**Frontend :**
```bash
npm install
```

**Backend :**
```bash
cd server
npm install
```

### 3. Configuration de la base de données

1. Créer une base de données MySQL :
```sql
CREATE DATABASE servicebooking;
```

2. Exécuter le script d'initialisation :
```bash
cd server
npm run init-db
# ou
node config/init-db.js
```

### 4. Configuration des variables d'environnement

**Backend (.env dans /server) :**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=servicebooking
JWT_SECRET=votre_secret_jwt_super_securise
```

**Frontend (.env dans /) :**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_MEDIA_BASE_URL=http://localhost:5000
```

### 5. Démarrage de l'application

**Méthode rapide (recommandée) :**
```bash
# Démarre frontend et backend ensemble
npm run start-dev
```

**Méthode séparée :**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### 6. Vérification des utilisateurs

Pour vérifier les utilisateurs existants :
```bash
cd server
node scripts/check-users.js
```

## 🔧 Configuration

### Base de données
La structure de la base de données comprend :
- `users` - Informations utilisateurs
- `categories` - Catégories de services
- `services` - Services proposés
- `appointments` - Rendez-vous

### Authentification JWT
- Durée de validité des tokens : 24h
- Middleware de protection des routes sensibles
- Refresh automatique des données utilisateur

### Avatars

L'application supporte les avatars prédéfinis et personnalisés :

**Avatars prédéfinis :**
- Disponibles dans `/public/avatars/`
- Consultez `/public/avatars/README.md` pour les URLs
- Formats supportés : SVG, PNG, JPEG

**Avatars personnalisés :**
- Upload via la page de profil
- Stockage dans `server/public/uploads/`
- Validation automatique des formats et tailles

## 📖 Documentation API

### Base URL
```
http://localhost:5000/api
```

### 📚 Swagger Documentation
Accédez à la documentation interactive Swagger :
```
http://localhost:5000/api-docs
```

### 🔐 Authentification (`/auth`)

#### Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "motdepasse123",
  "pseudo": "johndoe",
  "phone": "+33123456789",
  "role": "user"
}
```

**Réponse 201 :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "pseudo": "johndoe",
    "phone": "+33123456789",
    "role": "user",
    "avatar": null
  }
}
```

#### Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "motdepasse123"
}
```

#### Récupérer utilisateur actuel
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Réponse 200 :**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "pseudo": "johndoe",
  "phone": "+33123456789",
  "role": "user",
  "avatar": "/uploads/avatar_1234567890.jpg"
}
```

#### Mettre à jour le profil
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "pseudo": "johndoe",
  "phone": "+33123456789"
}
```

#### Changer le mot de passe
```http
PUT /api/auth/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "ancien_mot_de_passe",
  "newPassword": "nouveau_mot_de_passe"
}
```

#### Upload d'avatar
```http
POST /api/auth/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "avatar": [fichier]
}
```

#### Vérifications de disponibilité
```http
GET /api/auth/check-pseudo?pseudo=johndoe
GET /api/auth/check-email?email=john@example.com
```

### 📅 Rendez-vous (`/appointments`)

#### Lister les rendez-vous
```http
GET /api/appointments
Authorization: Bearer <token>
```

**Réponse 200 :**
```json
[
  {
    "id": 1,
    "date": "2024-01-15",
    "time": "14:30:00",
    "status": "confirmed",
    "clientName": "Marie Dupont",
    "clientEmail": "marie@example.com",
    "clientPhone": "+33123456789",
    "notes": "Première visite",
    "service": {
      "id": 1,
      "name": "Coupe Cheveux",
      "price": "25.00",
      "duration": 30
    },
    "user": {
      "id": 2,
      "firstName": "Coiffeur",
      "lastName": "Pro"
    }
  }
]
```

#### Créer un rendez-vous
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceId": 1,
  "date": "2024-01-15",
  "time": "14:30",
  "clientName": "Marie Dupont",
  "clientEmail": "marie@example.com",
  "clientPhone": "+33123456789",
  "notes": "Première visite"
}
```

#### Mettre à jour un rendez-vous
```http
PUT /api/appointments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed",
  "date": "2024-01-15",
  "time": "15:00",
  "notes": "Modification d'horaire"
}
```

#### Supprimer un rendez-vous
```http
DELETE /api/appointments/:id
Authorization: Bearer <token>
```

### 🛠️ Services (`/services`)

#### Lister les services
```http
GET /api/services
```

**Réponse 200 :**
```json
[
  {
    "id": 1,
    "name": "Coupe Cheveux",
    "description": "Coupe personnalisée selon vos désirs",
    "price": "25.00",
    "duration": 30,
    "category": {
      "id": 1,
      "name": "Coiffure",
      "color": "#3B82F6"
    }
  }
]
```

#### Créer un service (Admin uniquement)
```http
POST /api/services
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Coupe Cheveux",
  "description": "Coupe personnalisée selon vos désirs",
  "price": 25.00,
  "duration": 30,
  "categoryId": 1
}
```

#### Mettre à jour un service
```http
PUT /api/services/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Coupe + Shampoing",
  "description": "Coupe avec shampoing inclus",
  "price": 30.00,
  "duration": 45
}
```

#### Supprimer un service
```http
DELETE /api/services/:id
Authorization: Bearer <token>
```

### 📂 Catégories (`/categories`)

#### Lister les catégories
```http
GET /api/categories
```

**Réponse 200 :**
```json
[
  {
    "id": 1,
    "name": "Coiffure",
    "description": "Services de coiffure professionnels",
    "color": "#3B82F6",
    "serviceCount": 5
  }
]
```

#### Créer une catégorie (Admin uniquement)
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Coiffure",
  "description": "Services de coiffure professionnels",
  "color": "#3B82F6"
}
```

#### Mettre à jour une catégorie
```http
PUT /api/categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Coiffure & Beauté",
  "description": "Services de coiffure et de beauté",
  "color": "#10B981"
}
```

#### Supprimer une catégorie
```http
DELETE /api/categories/:id
Authorization: Bearer <token>
```

## 🔐 Authentification

### Système de tokens JWT
- **Durée de vie** : 24 heures
- **Stockage** : localStorage côté client
- **Protection** : Middleware authenticate sur les routes sensibles
- **Refresh** : Récupération automatique des données utilisateur

### Rôles utilisateur
- **user** : Peut créer et gérer ses propres rendez-vous
- **admin** : Accès complet à tous les rendez-vous, services et catégories

### Headers d'authentification
```javascript
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Middleware de protection
```javascript
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};
```

## 🎨 Interface utilisateur

### Design System
- **Framework CSS** : Tailwind CSS
- **Thème** : Mode sombre/clair automatique
- **Couleurs principales** : 
  - Primaire : Bleu (#3B82F6)
  - Secondaire : Vert (#10B981)
  - Accent : Violet (#8B5CF6)
- **Animations** : Framer Motion pour les transitions fluides
- **Typographie** : Inter (Google Fonts)

### Composants principaux

#### Layout
- **Header** : Navigation principale avec logo et menu utilisateur
- **Sidebar** : Navigation latérale adaptative
- **PageTransition** : Animations entre les pages
- **Footer** : Informations et liens utiles

#### Forms
- **Validation temps réel** : Feedback visuel immédiat
- **Multi-étapes** : Inscription progressive
- **Upload** : Glisser-déposer pour les avatars
- **Autocomplétion** : Suggestions intelligentes

#### Modals & Toasts
- **Confirmations** : Actions destructives
- **Formulaires** : Création/édition en overlay
- **Notifications** : Succès, erreurs, informations
- **Animations** : Entrée/sortie fluides

#### Calendrier
- **Vue mensuelle** : Aperçu complet des rendez-vous
- **Navigation** : Mois précédent/suivant
- **Interactions** : Clic pour créer/modifier
- **Légende** : Statuts par couleur

### Pages principales

1. **Landing** (`/`) - Page d'accueil avec présentation du service
2. **Login** (`/login`) - Connexion avec slider d'images interactif
3. **Register** (`/register`) - Inscription multi-étapes avec validation
4. **Dashboard** (`/app`) - Tableau de bord avec statistiques
5. **Appointments** (`/app/appointments`) - Gestion complète des RDV
6. **Calendar** (`/app/calendar`) - Vue calendrier interactive
7. **Services** (`/app/services`) - Gestion des services (Admin)
8. **Categories** (`/app/categories`) - Gestion des catégories (Admin)
9. **Profile** (`/app/profile`) - Profil utilisateur avec avatar

### États des composants
- **Loading** : Spinners et squelettes
- **Empty** : Messages d'état vide avec illustrations
- **Error** : Gestion des erreurs avec retry
- **Success** : Confirmations visuelles

## 📱 Responsive Design

### Breakpoints Tailwind
- **sm** : 640px+ (tablettes portrait)
- **md** : 768px+ (tablettes paysage)
- **lg** : 1024px+ (desktop)
- **xl** : 1280px+ (large desktop)
- **2xl** : 1536px+ (ultra-wide)

### Adaptations mobiles
- **Navigation** : Hamburger menu avec overlay
- **Formulaires** : Champs optimisés pour le tactile
- **Calendrier** : Vue responsive avec scroll
- **Tables** : Scroll horizontal avec indicateurs
- **Modals** : Plein écran sur mobile

### Touch optimizations
- **Boutons** : Taille minimum 44px
- **Espacement** : Zones tactiles confortables
- **Scroll** : Momentum naturel
- **Gestures** : Swipe pour navigation

## 🔍 Fonctionnalités avancées

### Gestion des états
- **React Context** : Authentification globale
- **État local** : Formulaires et interactions
- **Persistance** : localStorage pour les préférences
- **Synchronisation** : Backend automatique

### Validation des données

#### Frontend (React)
```javascript
// Validation email en temps réel
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = emailRegex.test(email);

// Validation mot de passe
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
```

#### Backend (Express Validator)
```javascript
body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Email invalide'),
body('password')
  .isLength({ min: 6 })
  .withMessage('Mot de passe trop court')
```

### Upload de fichiers
- **Avatars** : Support SVG, JPG, PNG (max 5MB)
- **Stockage** : `/server/public/uploads/`
- **Sécurité** : Validation MIME type
- **Optimisation** : Redimensionnement automatique

### Filtrage et recherche
- **Temps réel** : Filtrage instantané
- **Multi-critères** : Statut + période + utilisateur
- **Persistance** : Sauvegarde des filtres
- **Performance** : Debounce sur la recherche

### Notifications système
- **Types** : Success, Error, Warning, Info
- **Positionnement** : Top-right avec stack
- **Auto-dismiss** : 3-5 secondes selon le type
- **Actions** : Boutons d'action intégrés

## 🧪 Tests et qualité

### Linting et formatage
```bash
# ESLint - Analyse statique
npm run lint
npm run lint:fix

# Prettier - Formatage automatique
npm run format
npm run format:check

# TypeScript - Vérification types
npm run type-check
```

### Configuration ESLint
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "react-hooks/exhaustive-deps": "error"
  }
}
```

### Structure de test recommandée
```
tests/
├── unit/                    # Tests unitaires
│   ├── components/          # Tests composants React
│   ├── utils/              # Tests fonctions utilitaires
│   └── services/           # Tests services API
├── integration/            # Tests d'intégration
│   ├── api/               # Tests routes API
│   └── database/          # Tests requêtes DB
└── e2e/                   # Tests end-to-end
    ├── auth.spec.js       # Tests authentification
    ├── appointments.spec.js # Tests gestion RDV
    └── navigation.spec.js # Tests navigation
```

### Métriques de qualité
- **Coverage** : >80% recommandé
- **Performance** : Lighthouse CI
- **Accessibilité** : WCAG 2.1 AA
- **SEO** : Meta tags et structure

## 🚀 Déploiement

### Variables d'environnement de production

**Backend (.env.production) :**
```env
NODE_ENV=production
PORT=80
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-secure-production-password
DB_NAME=servicebooking_prod
JWT_SECRET=your-super-secure-production-jwt-secret-at-least-32-chars
CORS_ORIGIN=https://your-domain.com
```

**Frontend (.env.production) :**
```env
VITE_API_BASE_URL=https://api.your-domain.com/api
VITE_MEDIA_BASE_URL=https://api.your-domain.com
VITE_APP_NAME=ServiceBooking
```

### Build de production
```bash
# Build frontend
npm run build
# Génère le dossier /dist

# Build backend (si nécessaire)
cd server
npm run build

# Start production
npm start
```

### Checklist de déploiement
- [ ] Variables d'environnement configurées
- [ ] Base de données initialisée
- [ ] SSL/TLS activé (HTTPS)
- [ ] CORS configuré pour le domaine
- [ ] Logs de production activés
- [ ] Monitoring en place
- [ ] Backups automatiques
- [ ] Tests de charge effectués

### Docker (optionnel)
```dockerfile
# Dockerfile.frontend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribution

### Workflow de développement
1. **Fork** du projet sur GitHub
2. **Clone** votre fork localement
3. **Créer** une branche feature
   ```bash
   git checkout -b feature/nouvelle-fonctionnalite
   ```
4. **Développer** avec tests
5. **Commit** avec messages conventionnels
6. **Push** vers votre fork
7. **Pull Request** vers la branche main

### Standards de code

#### TypeScript
- **Strict mode** activé
- **Types explicites** pour les props et états
- **Interfaces** pour les objets complexes
- **Enums** pour les constantes

#### React
- **Functional components** avec hooks
- **Custom hooks** pour la logique réutilisable
- **Props destructuring** systématique
- **Key props** pour les listes

#### CSS/Tailwind
- **Utility-first** approach
- **Responsive** par défaut
- **Custom components** si réutilisable
- **Consistent spacing** (4, 8, 16, 24px)

### Conventional Commits
```bash
# Nouvelles fonctionnalités
feat: add appointment notification system
feat(auth): implement social login with Google

# Corrections de bugs
fix: resolve calendar date rendering issue
fix(api): handle edge case in appointment validation

# Documentation
docs: update API documentation
docs(readme): add deployment instructions

# Refactoring
refactor: optimize database queries
refactor(components): extract reusable form elements

# Tests
test: add unit tests for appointment service
test(e2e): add calendar interaction tests

# Style/formatage
style: fix linting issues in auth components
style: improve mobile responsive design

# Performance
perf: implement lazy loading for images
perf(db): add indexes for frequent queries
```

### Code Review Guidelines
- **Fonctionnalité** : Répond-elle au besoin ?
- **Tests** : Couverture suffisante ?
- **Performance** : Pas de régression ?
- **Sécurité** : Failles potentielles ?
- **UX** : Interface intuitive ?
- **Accessibilité** : Standards respectés ?

## 📊 Monitoring et Analytics

### Métriques importantes
- **Performance** : Temps de chargement, FCP, LCP
- **Utilisation** : Pages vues, durée session
- **Erreurs** : Taux d'erreur, logs d'exception
- **Business** : Rendez-vous créés, taux conversion

### Outils recommandés
- **Frontend** : Google Analytics, Sentry
- **Backend** : Winston logger, New Relic
- **Infrastructure** : Prometheus, Grafana
- **Uptime** : Pingdom, StatusPage

## 🔒 Sécurité

### Mesures implémentées
- **JWT** avec expiration
- **bcrypt** pour les mots de passe
- **express-validator** pour les entrées
- **CORS** configuré
- **Rate limiting** sur les APIs
- **SQL injection** prévention

### Recommandations production
- **HTTPS** obligatoire
- **Headers sécurisés** (CSP, HSTS)
- **Audit régulier** des dépendances
- **Logs sécurisés** (sans données sensibles)
- **Backup chiffré** de la DB

## 📝 Changelog

### Version 1.0.0 (Actuelle)
- ✅ Système d'authentification JWT complet
- ✅ Gestion CRUD des rendez-vous avec filtres
- ✅ Interface administrateur responsive
- ✅ Profils utilisateur avec upload d'avatars
- ✅ Vue calendrier interactive avec navigation
- ✅ Design system cohérent avec Tailwind
- ✅ Validation formulaires en temps réel
- ✅ Documentation API Swagger complète
- ✅ Multi-rôles (admin/user) avec permissions
- ✅ Notifications toast pour feedback UX

### Roadmap v1.1.0
- 🔄 Notifications email automatiques (rappels RDV)
- 🔄 Système de rappels SMS via API
- 🔄 Export PDF des planning/factures
- 🔄 Statistiques avancées avec graphiques
- 🔄 Intégration Google Calendar bidirectionnelle

### Roadmap v1.2.0
- 🔄 API mobile (React Native companion)
- 🔄 Système de paiement en ligne (Stripe)
- 🔄 Chat temps réel client/professionnel
- 🔄 Système de reviews/notes
- 🔄 Multi-tenant (plusieurs entreprises)

### Roadmap v2.0.0
- 🔄 IA pour optimisation planning
- 🔄 App mobile native (iOS/Android)
- 🔄 Marketplace de services
- 🔄 Analytics avancés avec ML
- 🔄 API publique pour partenaires

## 📞 Support et communauté

### Documentation
- **Swagger API** : `http://localhost:5000/api-docs`
- **GitHub Wiki** : Guides détaillés
- **Storybook** : Composants UI (à venir)

### Liens utiles
- **Repository** : [GitHub - ServiceBooking](https://github.com/neal92/ServiceBooking)
- **Issues** : Reporter bugs et suggestions
- **Discussions** : Questions et idées
- **Releases** : Historique des versions

### Contact
- **Développeur principal** : Adrian (@neal92)
- **Email projet** : contact@servicebooking.com
- **Discord** : Communauté développeurs (à venir)

### Contribution financière
Si ce projet vous aide, considérez :
- ⭐ **Star** le repository
- 🐛 **Reporter** les bugs
- 💡 **Proposer** des améliorations
- 🔄 **Partager** avec d'autres développeurs

---

## 📋 Quick Start

```bash
# 1. Clone et installation
git clone https://github.com/neal92/ServiceBooking.git
cd ServiceBooking
npm install && cd server && npm install && cd ..

# 2. Configuration DB
# Créer une DB MySQL 'servicebooking'
cd server && npm run init-db

# 3. Lancement
npm run start-dev
```

**🎉 L'application est maintenant accessible sur `http://localhost:5173`**

---

**ServiceBooking** - Solution moderne de gestion de rendez-vous pour les professionnels.

*Développé avec ❤️ par Adrian en utilisant React, TypeScript et Node.js*

---

### 🏷️ Tags
`react` `typescript` `nodejs` `mysql` `tailwindcss` `jwt` `appointment-booking` `crm` `business-management` `responsive-design`
