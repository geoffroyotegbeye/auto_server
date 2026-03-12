import pool from '../config/database.js';

async function checkTables() {
  try {
    console.log('🔍 Vérification des tables...\n');

    const [tables] = await pool.query('SHOW TABLES');
    console.log('✅ Tables existantes:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    console.log('\n📊 Comptage des données:\n');

    const tablesToCheck = [
      'users', 'vehicles', 'brands', 'services', 
      'reviews', 'site_config', 'hero_settings', 'stats'
    ];

    for (const table of tablesToCheck) {
      try {
        const [count] = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ${table}: ${count[0].count} enregistrement(s)`);
      } catch (error) {
        console.log(`   ${table}: ❌ Table n'existe pas`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkTables();
