import pool from '../config/database.js';

async function migrateUsersTable() {
  try {
    console.log('🔄 Migration de la table users...\n');

    // 1. Ajouter la colonne is_active si elle n'existe pas
    console.log('📝 Ajout de la colonne is_active...');
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE AFTER role
    `);
    console.log('✅ Colonne is_active ajoutée');

    // 2. Mettre à jour les utilisateurs existants AVANT de modifier la colonne
    console.log('\n📝 Mise à jour des utilisateurs existants...');
    await pool.query(`
      UPDATE users 
      SET role = 'admin', is_active = TRUE
    `);
    console.log('✅ Utilisateurs existants mis à jour');

    // 3. Modifier la colonne role pour les nouveaux rôles
    console.log('\n📝 Modification de la colonne role...');
    await pool.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('lecteur', 'editeur', 'admin') DEFAULT 'lecteur'
    `);
    console.log('✅ Colonne role modifiée (lecteur, editeur, admin)');

    console.log('\n🎉 Migration de la table users terminée avec succès !');
    console.log('\n📋 Nouveaux rôles disponibles:');
    console.log('   - lecteur (lecture seule)');
    console.log('   - editeur (lecture + modification)');
    console.log('   - admin (tous les droits)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

migrateUsersTable();
