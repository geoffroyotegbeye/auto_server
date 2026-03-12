import pool from '../config/database.js';

async function addLogoColumn() {
  try {
    console.log('🔄 Ajout de la colonne site_logo...\n');

    // Vérifier si la colonne existe déjà
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'site_config' 
      AND COLUMN_NAME = 'site_logo'
    `);

    if (columns.length > 0) {
      console.log('✅ La colonne site_logo existe déjà');
    } else {
      // Ajouter la colonne
      await pool.query(`
        ALTER TABLE site_config 
        ADD COLUMN site_logo VARCHAR(500) AFTER id
      `);
      console.log('✅ Colonne site_logo ajoutée avec succès');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

addLogoColumn();
