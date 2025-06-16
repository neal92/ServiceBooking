-- Migration pour ajouter la colonne userId à la table appointments
ALTER TABLE appointments 
ADD COLUMN userId INT,
ADD FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL;

-- Mettre à jour le statut pour inclure "in-progress"
ALTER TABLE appointments 
MODIFY status ENUM('pending', 'confirmed', 'in-progress', 'cancelled', 'completed') DEFAULT 'pending';
