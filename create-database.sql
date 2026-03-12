-- Script de création de la base de données
-- Exécuter avec : mysql -u root -p < create-database.sql

CREATE DATABASE IF NOT EXISTS auto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Afficher les bases de données
SHOW DATABASES;

-- Message de confirmation
SELECT 'Base de données "auto" créée avec succès !' AS message;
