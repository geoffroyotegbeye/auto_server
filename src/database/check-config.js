import pool from '../config/database.js';

async function checkConfig() {
  try {
    console.log('🔍 Vérification de la configuration...\n');

    const [config] = await pool.query('SELECT * FROM site_config WHERE id = 1');
    
    if (config.length > 0) {
      console.log('✅ Configuration trouvée:');
      console.log(JSON.stringify(config[0], null, 2));
    } else {
      console.log('❌ Aucune configuration trouvée');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkConfig();
