-- Migration pour ajouter la colonne createdBy à la table appointments
ALTER TABLE appointments 
ADD COLUMN createdBy ENUM('client', 'admin') DEFAULT 'client' AFTER notes;
