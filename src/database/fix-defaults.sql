-- ============================================================
-- FIX DEFAULTS — corrige les colonnes sans DEFAULT sur Railway
-- Sans vider aucune table
-- ============================================================

-- ── vehicles ──────────────────────────────────────────────
-- Ajoute km si absent, sinon met DEFAULT 0
SET @km_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vehicles' AND COLUMN_NAME = 'km');
SET @sql_km = IF(@km_exists = 0,
  'ALTER TABLE vehicles ADD COLUMN km int(11) NOT NULL DEFAULT 0 AFTER seats',
  'ALTER TABLE vehicles MODIFY km int(11) NOT NULL DEFAULT 0');
PREPARE stmt FROM @sql_km; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE `vehicles`
  MODIFY `is_new`      tinyint(1)   NOT NULL DEFAULT 0,
  MODIFY `is_featured` tinyint(1)   NOT NULL DEFAULT 0,
  MODIFY `views`       int(11)      NOT NULL DEFAULT 0,
  MODIFY `status`      enum('available','reserved','sold') NOT NULL DEFAULT 'available',
  MODIFY `body_style`  enum('Berline','SUV','Break','Coupé','Cabriolet','Monospace','Citadine','Pick-up') DEFAULT NULL,
  MODIFY `doors`       int(11)      DEFAULT NULL,
  MODIFY `seats`       int(11)      DEFAULT NULL,
  MODIFY `power`       varchar(50)  DEFAULT NULL,
  MODIFY `color`       varchar(50)  DEFAULT NULL,
  MODIFY `location`    varchar(255) DEFAULT NULL,
  MODIFY `version`     varchar(255) DEFAULT NULL,
  MODIFY `description` text         DEFAULT NULL,
  MODIFY `main_image`  varchar(500) DEFAULT NULL;

-- ── brands ────────────────────────────────────────────────
ALTER TABLE `brands`
  MODIFY `is_active`   tinyint(1)   NOT NULL DEFAULT 1,
  MODIFY `logo`        varchar(500) DEFAULT NULL,
  MODIFY `description` text         DEFAULT NULL;

-- ── services ──────────────────────────────────────────────
ALTER TABLE `services`
  MODIFY `is_active`     tinyint(1)    NOT NULL DEFAULT 1,
  MODIFY `display_order` int(11)       NOT NULL DEFAULT 0,
  MODIFY `price_from`    decimal(10,2) DEFAULT NULL,
  MODIFY `duration`      varchar(50)   DEFAULT NULL,
  MODIFY `icon`          varchar(50)   DEFAULT NULL;

-- ── hero_settings ─────────────────────────────────────────
ALTER TABLE `hero_settings`
  MODIFY `is_active`           tinyint(1)   NOT NULL DEFAULT 1,
  MODIFY `main_image`          varchar(500) DEFAULT NULL,
  MODIFY `title_line1`         varchar(255) DEFAULT 'Trouvez votre',
  MODIFY `title_line2`         varchar(255) DEFAULT 'véhicule idéal',
  MODIFY `title_line3`         varchar(255) DEFAULT 'au meilleur prix',
  MODIFY `badge_text`          varchar(100) DEFAULT '98%',
  MODIFY `badge_subtext`       varchar(100) DEFAULT 'Clients satisfaits',
  MODIFY `card_title`          varchar(255) DEFAULT 'Mercedes Classe A',
  MODIFY `card_subtitle`       varchar(255) DEFAULT '2024 • 5 000 km',
  MODIFY `card_price`          varchar(100) DEFAULT '18 500 000',
  MODIFY `floating_card_title` varchar(255) DEFAULT '12 000+',
  MODIFY `floating_card_text`  varchar(255) DEFAULT 'Véhicules disponibles';

-- ── users ─────────────────────────────────────────────────
ALTER TABLE `users`
  MODIFY `is_active` tinyint(1) NOT NULL DEFAULT 1,
  MODIFY `role`      enum('lecteur','editeur','admin') NOT NULL DEFAULT 'lecteur';

-- ── quotes ────────────────────────────────────────────────
ALTER TABLE `quotes`
  MODIFY `financing`        tinyint(1)    NOT NULL DEFAULT 0,
  MODIFY `trade_in`         tinyint(1)    NOT NULL DEFAULT 0,
  MODIFY `status`           enum('pending','processing','sent','closed') NOT NULL DEFAULT 'pending',
  MODIFY `budget`           decimal(10,2) DEFAULT NULL,
  MODIFY `trade_in_details` text          DEFAULT NULL,
  MODIFY `message`          text          DEFAULT NULL,
  MODIFY `admin_notes`      text          DEFAULT NULL;

-- ── contacts ──────────────────────────────────────────────
ALTER TABLE `contacts`
  MODIFY `status`      enum('new','read','replied','archived') NOT NULL DEFAULT 'new',
  MODIFY `phone`       varchar(20) DEFAULT NULL,
  MODIFY `admin_notes` text        DEFAULT NULL;

-- ── appointments ──────────────────────────────────────────
ALTER TABLE `appointments`
  MODIFY `status`      enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
  MODIFY `message`     text DEFAULT NULL,
  MODIFY `admin_notes` text DEFAULT NULL;

-- ── reviews ───────────────────────────────────────────────
ALTER TABLE `reviews`
  MODIFY `is_featured` tinyint(1)   NOT NULL DEFAULT 0,
  MODIFY `status`      enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  MODIFY `title`       varchar(255) DEFAULT NULL,
  MODIFY `admin_notes` text         DEFAULT NULL;

-- ── stats ─────────────────────────────────────────────────
ALTER TABLE `stats`
  MODIFY `total_vehicles`    int(11)      NOT NULL DEFAULT 0,
  MODIFY `total_brands`      int(11)      NOT NULL DEFAULT 0,
  MODIFY `satisfaction_rate` decimal(5,2) NOT NULL DEFAULT 98.00,
  MODIFY `avg_delivery_days` int(11)      NOT NULL DEFAULT 7;
