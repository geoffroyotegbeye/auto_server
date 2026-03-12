import pool from '../config/database.js';

async function runMigrations() {
  try {
    console.log('🔄 Démarrage des migrations complètes...\n');

    await pool.query('SET FOREIGN_KEY_CHECKS = 0');

    // 1. Table des marques
    console.log('📝 Création de la table brands...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS brands (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) UNIQUE NOT NULL,
        logo VARCHAR(500),
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_active (is_active),
        INDEX idx_order (display_order)
      )
    `);

    // 2. Table des paramètres du hero
    console.log('📝 Création de la table hero_settings...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hero_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title_line1 VARCHAR(255) DEFAULT 'Trouvez votre',
        title_line2 VARCHAR(255) DEFAULT 'véhicule idéal',
        title_line3 VARCHAR(255) DEFAULT 'au meilleur prix',
        subtitle TEXT DEFAULT 'Plus de 12 000 véhicules neufs disponibles\\nLivraison rapide partout au Bénin',
        badge_text VARCHAR(100) DEFAULT '98%',
        badge_subtext VARCHAR(100) DEFAULT 'Clients satisfaits',
        main_image VARCHAR(500),
        card_title VARCHAR(255) DEFAULT 'Mercedes Classe A',
        card_subtitle VARCHAR(255) DEFAULT '2024 • 5 000 km',
        card_price VARCHAR(100) DEFAULT '18 500 000',
        floating_card_title VARCHAR(255) DEFAULT '12 000+',
        floating_card_text VARCHAR(255) DEFAULT 'Véhicules disponibles',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 3. Table des utilisateurs (admin)
    console.log('📝 Création de la table users...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('lecteur', 'editeur', 'admin') DEFAULT 'lecteur',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 4. Table des véhicules
    console.log('📝 Création de la table vehicles...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        version VARCHAR(255),
        price DECIMAL(10, 2) NOT NULL,
        year INT NOT NULL,
        km INT NOT NULL,
        fuel ENUM('Essence', 'Diesel', 'Hybride', 'Hybride rechargeable', 'Électrique', 'GPL') NOT NULL,
        transmission ENUM('Manuelle', 'Automatique', 'Semi-automatique', 'CVT', 'DSG', 'PDK') NOT NULL,
        power VARCHAR(50),
        body_style ENUM('Berline', 'SUV', 'Break', 'Coupé', 'Cabriolet', 'Monospace', 'Citadine', 'Pick-up'),
        color VARCHAR(50),
        doors INT,
        seats INT,
        location VARCHAR(255),
        description TEXT,
        features JSON,
        images JSON,
        main_image VARCHAR(500),
        is_new BOOLEAN DEFAULT FALSE,
        is_featured BOOLEAN DEFAULT FALSE,
        badge VARCHAR(50),
        badge_type ENUM('badge-new', 'badge-promo', 'badge-accent'),
        status ENUM('available', 'reserved', 'sold') DEFAULT 'available',
        views INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_brand (brand),
        INDEX idx_price (price),
        INDEX idx_fuel (fuel),
        INDEX idx_status (status)
      )
    `);

    // 5. Table des rendez-vous
    console.log('📝 Création de la table appointments...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type ENUM('showroom', 'sav') NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        preferred_date DATE NOT NULL,
        preferred_time TIME NOT NULL,
        vehicle_id INT,
        message TEXT,
        status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
        INDEX idx_date (preferred_date),
        INDEX idx_status (status)
      )
    `);

    // 6. Table des demandes de devis
    console.log('📝 Création de la table quotes...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type ENUM('new') NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        vehicle_id INT,
        brand VARCHAR(100),
        model VARCHAR(100),
        budget DECIMAL(10, 2),
        financing BOOLEAN DEFAULT FALSE,
        trade_in BOOLEAN DEFAULT FALSE,
        trade_in_details TEXT,
        message TEXT,
        status ENUM('pending', 'processing', 'sent', 'closed') DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
        INDEX idx_status (status)
      )
    `);

    // 7. Table des contacts
    console.log('📝 Création de la table contacts...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status)
      )
    `);

    // 8. Table des avis clients
    console.log('📝 Création de la table reviews...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        service_type ENUM('vente', 'sav', 'general') NOT NULL,
        title VARCHAR(255),
        comment TEXT NOT NULL,
        vehicle_id INT,
        appointment_id INT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        is_featured BOOLEAN DEFAULT FALSE,
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
        INDEX idx_rating (rating),
        INDEX idx_status (status)
      )
    `);

    // 9. Table des services du garage
    console.log('📝 Création de la table services...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        category ENUM('entretien', 'reparation', 'diagnostic', 'carrosserie', 'pneumatique', 'autre') NOT NULL,
        description TEXT NOT NULL,
        price_from DECIMAL(10, 2),
        duration VARCHAR(50),
        icon VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_active (is_active)
      )
    `);

    // 10. Table des statistiques
    console.log('📝 Création de la table stats...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stats (
        id INT PRIMARY KEY AUTO_INCREMENT,
        total_vehicles INT DEFAULT 0,
        total_brands INT DEFAULT 0,
        satisfaction_rate DECIMAL(5, 2) DEFAULT 98.00,
        avg_delivery_days INT DEFAULT 7,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 11. Table de configuration du site
    console.log('📝 Création de la table site_config...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_config (
        id INT PRIMARY KEY DEFAULT 1,
        site_logo VARCHAR(500),
        site_logo_dark VARCHAR(500),
        currency_symbol VARCHAR(10) DEFAULT 'FCFA',
        currency_name VARCHAR(50) DEFAULT 'Franc CFA',
        currency_position ENUM('before', 'after') DEFAULT 'after',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n✅ Toutes les tables ont été créées avec succès !');
    console.log('\n📋 Tables créées:');
    console.log('   1. brands');
    console.log('   2. hero_settings');
    console.log('   3. users');
    console.log('   4. vehicles');
    console.log('   5. appointments');
    console.log('   6. quotes');
    console.log('   7. contacts');
    console.log('   8. reviews');
    console.log('   9. services');
    console.log('   10. stats');
    console.log('   11. site_config');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error);
    process.exit(1);
  }
}

runMigrations();
