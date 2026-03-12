import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

async function seedAll() {
  try {
    console.log('🌱 Démarrage du seed complet...\n');

    // 1. Créer un utilisateur admin
    console.log('👤 Création de l\'utilisateur admin...');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    await pool.query(
      'INSERT INTO users (email, password, name, role, is_active) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
      ['admin@migmotors.com', hashedPassword, 'Administrateur MigMotors', 'admin', true]
    );
    console.log('✅ Admin créé : admin@migmotors.com / Admin123!');

    // 2. Insérer les marques
    console.log('\n🏷️  Insertion des marques...');
    await pool.query(`
      INSERT INTO brands (name, is_active, display_order) VALUES
        ('Audi', TRUE, 1),
        ('BMW', TRUE, 2),
        ('Citroën', TRUE, 3),
        ('Ford', TRUE, 4),
        ('Hyundai', TRUE, 5),
        ('Kia', TRUE, 6),
        ('Mercedes', TRUE, 7),
        ('Nissan', TRUE, 8),
        ('Peugeot', TRUE, 9),
        ('Porsche', TRUE, 10),
        ('Renault', TRUE, 11),
        ('Skoda', TRUE, 12),
        ('Tesla', TRUE, 13),
        ('Toyota', TRUE, 14),
        ('Volkswagen', TRUE, 15),
        ('Volvo', TRUE, 16)
      ON DUPLICATE KEY UPDATE id=id
    `);
    console.log('✅ 16 marques insérées');

    // 3. Insérer les paramètres hero
    console.log('\n🎨 Insertion des paramètres hero...');
    await pool.query(`
      INSERT INTO hero_settings (
        id,
        title_line1,
        title_line2,
        title_line3,
        subtitle,
        badge_text,
        badge_subtext,
        card_title,
        card_subtitle,
        card_price,
        floating_card_title,
        floating_card_text,
        is_active
      ) VALUES (
        1,
        'Trouvez votre',
        'véhicule idéal',
        'au meilleur prix',
        'Plus de 12 000 véhicules neufs disponibles\\nLivraison rapide partout au Bénin',
        '98%',
        'Clients satisfaits',
        'Mercedes Classe A',
        '2024 • 5 000 km',
        '18 500 000',
        '12 000+',
        'Véhicules disponibles',
        TRUE
      )
      ON DUPLICATE KEY UPDATE id=id
    `);
    console.log('✅ Hero settings insérés');

    // 4. Insérer la configuration du site
    console.log('\n⚙️  Insertion de la configuration...');
    await pool.query(`
      INSERT INTO site_config (id, site_logo, site_logo_dark, currency_symbol, currency_name, currency_position) 
      VALUES (1, NULL, NULL, 'FCFA', 'Franc CFA', 'after')
      ON DUPLICATE KEY UPDATE id=id
    `);
    console.log('✅ Configuration FCFA insérée');

    // 5. Insérer les statistiques
    console.log('\n📊 Insertion des statistiques...');
    await pool.query(`
      INSERT INTO stats (total_vehicles, total_brands, satisfaction_rate, avg_delivery_days) 
      VALUES (12000, 48, 98.00, 7)
      ON DUPLICATE KEY UPDATE id=id
    `);
    console.log('✅ Statistiques insérées');

    // 6. Insérer des véhicules
    console.log('\n🚗 Insertion des véhicules...');
    const vehicles = [
      {
        brand: 'BMW',
        model: 'Série 3',
        version: '320d xDrive M Sport',
        price: 29900000,
        year: 2023,
        km: 18500,
        fuel: 'Diesel',
        transmission: 'Automatique',
        power: '190 ch',
        body_style: 'Berline',
        color: 'Noir',
        doors: 4,
        seats: 5,
        location: 'Cotonou, Bénin',
        description: 'BMW Série 3 en excellent état, entretien complet, garantie constructeur.',
        features: JSON.stringify(['GPS', 'Caméra de recul', 'Sièges chauffants', 'Climatisation auto']),
        images: JSON.stringify([]),
        main_image: null,
        is_new: false,
        is_featured: true,
        badge: 'Coup de cœur',
        badge_type: 'badge-accent',
        status: 'available'
      },
      {
        brand: 'Mercedes',
        model: 'Classe A',
        version: '200 AMG Line 7G-DCT',
        price: 33500000,
        year: 2024,
        km: 4200,
        fuel: 'Essence',
        transmission: 'Automatique',
        power: '163 ch',
        body_style: 'Berline',
        color: 'Gris',
        doors: 5,
        seats: 5,
        location: 'Porto-Novo, Bénin',
        description: 'Mercedes Classe A presque neuve, pack AMG, toutes options.',
        features: JSON.stringify(['MBUX', 'Pack AMG', 'LED', 'Jantes 18"']),
        images: JSON.stringify([]),
        main_image: null,
        is_new: true,
        is_featured: true,
        badge: 'Presque neuf',
        badge_type: 'badge-new',
        status: 'available'
      },
      {
        brand: 'Audi',
        model: 'A3',
        version: 'Sportback 40 TFSI e S line',
        price: 27800000,
        year: 2022,
        km: 31000,
        fuel: 'Hybride rechargeable',
        transmission: 'Automatique',
        power: '204 ch',
        body_style: 'Berline',
        color: 'Bleu',
        doors: 5,
        seats: 5,
        location: 'Parakou, Bénin',
        description: 'Audi A3 hybride rechargeable, économique et performante.',
        features: JSON.stringify(['Virtual Cockpit', 'MMI', 'Aide au stationnement']),
        images: JSON.stringify([]),
        main_image: null,
        is_new: false,
        is_featured: true,
        status: 'available'
      },
      {
        brand: 'Tesla',
        model: 'Model 3',
        version: 'Long Range AWD',
        price: 47500000,
        year: 2024,
        km: 2000,
        fuel: 'Électrique',
        transmission: 'Automatique',
        power: '358 ch',
        body_style: 'Berline',
        color: 'Blanc',
        doors: 4,
        seats: 5,
        location: 'Cotonou, Bénin',
        description: 'Tesla Model 3 Long Range, autonomie 600km, autopilot.',
        features: JSON.stringify(['Autopilot', 'Supercharger', 'Écran 15"', 'Premium Audio']),
        images: JSON.stringify([]),
        main_image: null,
        is_new: true,
        is_featured: true,
        badge: 'Nouveau',
        badge_type: 'badge-new',
        status: 'available'
      },
      {
        brand: 'Peugeot',
        model: '508',
        version: 'SW Hybrid 225 EAT8',
        price: 38900000,
        year: 2023,
        km: 14000,
        fuel: 'Hybride rechargeable',
        transmission: 'Automatique',
        power: '225 ch',
        body_style: 'Break',
        color: 'Gris',
        doors: 5,
        seats: 5,
        location: 'Abomey-Calavi, Bénin',
        description: 'Peugeot 508 SW hybride, spacieuse et élégante.',
        features: JSON.stringify(['i-Cockpit', 'Massage', 'Hayon électrique', 'Vision 360']),
        images: JSON.stringify([]),
        main_image: null,
        is_new: false,
        is_featured: false,
        status: 'available'
      },
      {
        brand: 'Volkswagen',
        model: 'Golf',
        version: 'GTI 2.0 TSI DSG',
        price: 34500000,
        year: 2023,
        km: 12000,
        fuel: 'Essence',
        transmission: 'Automatique',
        power: '190 ch',
        body_style: 'Berline',
        color: 'Argent',
        doors: 5,
        seats: 5,
        location: 'Cotonou, Bénin',
        description: 'Golf GTI, sportive et pratique au quotidien.',
        features: JSON.stringify(['DCC', 'Freins Brembo', 'Échappement sport', 'Jantes 19"']),
        images: JSON.stringify([]),
        main_image: null,
        is_new: false,
        is_featured: false,
        status: 'available'
      },
      {
        brand: 'Toyota',
        model: 'RAV4',
        version: 'Hybride Dynamic AWD',
        price: 42900000,
        year: 2024,
        km: 5500,
        fuel: 'Hybride',
        transmission: 'CVT',
        power: '222 ch',
        body_style: 'SUV',
        color: 'Blanc',
        doors: 5,
        seats: 5,
        location: 'Cotonou, Bénin',
        description: 'Toyota RAV4 hybride, fiabilité et économie garanties.',
        features: JSON.stringify(['Toyota Safety Sense', 'AWD', 'Toit panoramique', 'JBL']),
        images: JSON.stringify([]),
        main_image: null,
        is_new: true,
        is_featured: false,
        status: 'available'
      },
      {
        brand: 'Renault',
        model: 'Mégane',
        version: 'E-Tech 100% électrique 220 ch',
        price: 31800000,
        year: 2023,
        km: 18000,
        fuel: 'Électrique',
        transmission: 'Automatique',
        power: '220 ch',
        body_style: 'Berline',
        color: 'Gris',
        doors: 5,
        seats: 5,
        location: 'Porto-Novo, Bénin',
        description: 'Renault Mégane E-Tech, 100% électrique, design moderne.',
        features: JSON.stringify(['OpenR Link', 'Charge rapide', 'Autonomie 450km']),
        images: JSON.stringify([]),
        main_image: null,
        is_new: false,
        is_featured: false,
        status: 'available'
      }
    ];

    for (const vehicle of vehicles) {
      await pool.query('INSERT IGNORE INTO vehicles SET ?', vehicle);
    }
    console.log('✅ Véhicules insérés');

    // 7. Insérer des services SAV
    console.log('\n🔧 Insertion des services SAV...');
    const services = [
      {
        name: 'Révision complète',
        category: 'entretien',
        description: 'Révision complète selon préconisations constructeur : vidange, filtres, contrôle des niveaux et points de sécurité.',
        price_from: 75000,
        duration: '2h',
        icon: 'WrenchScrewdriverIcon',
        is_active: true,
        display_order: 1
      },
      {
        name: 'Vidange',
        category: 'entretien',
        description: 'Vidange moteur avec huile de qualité et remplacement du filtre à huile.',
        price_from: 40000,
        duration: '30min',
        icon: 'BeakerIcon',
        is_active: true,
        display_order: 2
      },
      {
        name: 'Diagnostic électronique',
        category: 'diagnostic',
        description: 'Diagnostic complet de votre véhicule avec valise multimarque.',
        price_from: 25000,
        duration: '1h',
        icon: 'ComputerDesktopIcon',
        is_active: true,
        display_order: 3
      },
      {
        name: 'Freinage',
        category: 'reparation',
        description: 'Remplacement plaquettes et disques de frein, contrôle du circuit.',
        price_from: 100000,
        duration: '2h',
        icon: 'ShieldCheckIcon',
        is_active: true,
        display_order: 4
      },
      {
        name: 'Climatisation',
        category: 'entretien',
        description: 'Recharge et désinfection du système de climatisation.',
        price_from: 45000,
        duration: '1h',
        icon: 'CloudIcon',
        is_active: true,
        display_order: 5
      },
      {
        name: 'Pneumatiques',
        category: 'pneumatique',
        description: 'Montage, équilibrage et géométrie. Large choix de marques.',
        price_from: 30000,
        duration: '1h',
        icon: 'CircleStackIcon',
        is_active: true,
        display_order: 6
      }
    ];

    for (const service of services) {
      await pool.query('INSERT IGNORE INTO services SET ?', service);
    }
    console.log('✅ Services SAV insérés');

    // 8. Insérer des avis clients approuvés
    console.log('\n⭐ Insertion des avis clients...');
    const reviews = [
      {
        customer_name: 'Jean Koffi',
        email: 'jean.koffi@example.com',
        rating: 5,
        service_type: 'vente',
        title: 'Excellent service',
        comment: 'Très satisfait de mon achat. Équipe professionnelle et à l\'écoute. Je recommande vivement !',
        status: 'approved',
        is_featured: true
      },
      {
        customer_name: 'Marie Adjovi',
        email: 'marie.adjovi@example.com',
        rating: 5,
        service_type: 'sav',
        title: 'SAV au top',
        comment: 'Révision effectuée rapidement et proprement. Prix corrects. Je reviendrai.',
        status: 'approved',
        is_featured: true
      },
      {
        customer_name: 'Pierre Dossou',
        email: 'pierre.dossou@example.com',
        rating: 4,
        service_type: 'vente',
        title: 'Bon rapport qualité/prix',
        comment: 'Véhicule conforme à la description. Livraison rapide. Très content.',
        status: 'approved',
        is_featured: false
      }
    ];

    for (const review of reviews) {
      await pool.query('INSERT IGNORE INTO reviews SET ?', review);
    }
    console.log('✅ Avis clients insérés');

    console.log('\n🎉 Seed complet terminé avec succès !');
    console.log('\n📝 Résumé:');
    console.log('   ✅ 1 admin créé');
    console.log('   ✅ 16 marques');
    console.log('   ✅ 1 hero settings');
    console.log('   ✅ 1 configuration FCFA');
    console.log('   ✅ 1 statistiques');
    console.log('   ✅ 8 véhicules');
    console.log('   ✅ 6 services SAV');
    console.log('   ✅ 3 avis clients');
    console.log('\n🔐 Compte admin:');
    console.log('   Email: admin@migmotors.com');
    console.log('   Mot de passe: Admin123!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
}

seedAll();
