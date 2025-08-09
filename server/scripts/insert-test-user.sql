-- Script pour insérer un utilisateur de test
-- Mot de passe: "password123" (sera hashé avec bcrypt)

-- 1. Utilisateur test avec mot de passe simple
INSERT INTO users (
    firstName, 
    lastName, 
    email, 
    password, 
    pseudo, 
    role, 
    phone, 
    avatar,
    createdAt
) VALUES (
    'Test',
    'User', 
    'test@test.com',
    'motdepasse123'
    'testuser',
    'user',
    '+33123456789',
    NULL,
    NOW()
);

-- 2. Admin test avec mot de passe simple
INSERT INTO users (
    firstName, 
    lastName, 
    email, 
    password, 
    pseudo, 
    role, 
    phone, 
    avatar,
    createdAt
) VALUES (
    'Admin',
    'Test', 
    'admin@test.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password123
    'admintest',
    'admin',
    '+33987654321',
    NULL,
    NOW()
);

-- 3. Vérifier les utilisateurs créés
SELECT id, firstName, lastName, email, pseudo, role, 
       SUBSTRING(password, 1, 20) as password_hash_preview
FROM users 
WHERE email IN ('test@test.com', 'admin@test.com');
