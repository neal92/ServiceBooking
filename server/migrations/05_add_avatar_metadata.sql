-- Migration pour ajouter les métadonnées d'avatar (couleur et initiales)
-- Fichier: 05_add_avatar_metadata.sql

-- Ajouter les colonnes pour les métadonnées d'avatar
ALTER TABLE users 
ADD COLUMN avatarColor VARCHAR(7) NULL COMMENT 'Couleur de l\'avatar personnalisé (format hex, ex: #3b82f6)',
ADD COLUMN avatarInitials VARCHAR(3) NULL COMMENT 'Initiales de l\'avatar personnalisé (ex: AB)';

-- Afficher le résultat
DESCRIBE users;
