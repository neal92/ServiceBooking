-- Create database
CREATE DATABASE IF NOT EXISTS servicebooking;
USE servicebooking;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    pseudo VARCHAR(50) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    avatar VARCHAR(255),
    avatarColor VARCHAR(7) NULL COMMENT 'Couleur de l\'avatar personnalisé (format hex, ex: #3b82f6)',
    avatarInitials VARCHAR(3) NULL COMMENT 'Initiales de l\'avatar personnalisé (ex: AB)',
    isPresetAvatar BOOLEAN DEFAULT FALSE 
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(20),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image VARCHAR(255)
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    image VARCHAR(255) DEFAULT NULL,  
    categoryId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
);


-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clientName VARCHAR(100) NOT NULL,
    clientEmail VARCHAR(100) NOT NULL,
    clientPhone VARCHAR(20),
    serviceId INT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdBy VARCHAR(25),
    FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE SET NULL
);

-- Insert some sample categories
INSERT INTO categories (name, description) VALUES
('Haircuts', 'All types of haircuts for men, women, and children'),
('Coloring', 'Hair coloring services including highlights, lowlights, and full color'),
('Treatments', 'Hair treatments for damaged hair, scalp treatments, and more'),
('Styling', 'Hairstyling services for special occasions, events, and everyday');

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('appointment', 'service', 'category', 'user', 'system', 'reminder') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_id INT NULL,
  related_type VARCHAR(50) NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_created_at (created_at),
  INDEX idx_type (type)
);

CREATE TABLE notification_users (
    id INT NOT NULL AUTO_INCREMENT,
    notification_id INT NOT NULL,
    user_id INT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    read_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_notification (notification_id),
    KEY idx_user (user_id),
    CONSTRAINT fk_notification_users_notification FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_users_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Insert some sample services
INSERT INTO services (name, description, price, duration, categoryId) VALUES
('Men\'s Haircut', 'Classic men\'s haircut with styling', 30.00, 30, 1),
('Women\'s Haircut', 'Women\'s haircut with wash and blow dry', 50.00, 45, 1),
('Children\'s Haircut', 'Haircut for kids under 12', 25.00, 30, 1),
('Root Touch Up', 'Color touch up for roots only', 65.00, 60, 2),
('Full Color', 'Full color service including roots to ends', 90.00, 90, 2),
('Highlights', 'Partial or full highlights', 120.00, 120, 2),
('Deep Conditioning', 'Deep conditioning treatment for damaged hair', 45.00, 30, 3),
('Keratin Treatment', 'Smoothing keratin treatment', 200.00, 180, 3),
('Blowout', 'Wash and blowdry styling', 35.00, 30, 4),
('Special Event Styling', 'Hair styling for weddings, proms, and other special events', 85.00, 60, 4);

-- Insert some sample appointments
INSERT INTO appointments (clientName, clientEmail, clientPhone, serviceId, date, time, status, notes) VALUES
('John Doe', 'john.doe@example.com', '555-123-4567', 1, '2025-06-10', '10:00:00', 'confirmed', 'Regular client'),
('Jane Smith', 'jane.smith@example.com', '555-987-6543', 4, '2025-06-11', '14:30:00', 'pending', 'First time client'),
('Robert Johnson', 'robert.johnson@example.com', '555-456-7890', 8, '2025-06-15', '11:00:00', 'confirmed', 'Allergic to some products'),
('Sarah Williams', 'sarah.williams@example.com', '555-789-0123', 10, '2025-06-20', '16:00:00', 'pending', 'Wedding preparation');

-- Insert admin user (password: admin123)
INSERT INTO users (firstName, lastName, email, pseudo, password, role) VALUES
('Admin', 'User', 'admin@example.com', 'admin', '$2b$10$96Qr8PnqJCXTt1uGMTGvIOLKLY.5O9XpZpPGC8cbtCOlcVg2xi1Iy', 'admin');


---VUES 

CREATE VIEW user_rendezvous_count AS
SELECT 
  u.id,
  u.firstName,
  u.lastName,
  u.email,
  COUNT(a.id) AS total_rendezvous
FROM users u
LEFT JOIN appointments a ON a.clientEmail = u.email AND a.status = 'completed'
GROUP BY u.id;

