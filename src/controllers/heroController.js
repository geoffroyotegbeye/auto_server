import pool from '../config/database.js';
import { sanitizeUpdateData } from '../utils/sanitize.js';

export const getHeroSettings = async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT * FROM hero_settings WHERE is_active = TRUE LIMIT 1');
    
    if (settings.length === 0) {
      return res.status(404).json({ error: 'Paramètres du hero non trouvés' });
    }

    res.json(settings[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres' });
  }
};

export const updateHeroSettings = async (req, res) => {
  try {
    let settingsData = sanitizeUpdateData(req.body);

    // Gérer l'upload de l'image principale si présente
    if (req.file) {
      settingsData.main_image = `/uploads/hero/${req.file.filename}`;
    }

    // Récupérer l'ID du premier enregistrement
    const [existing] = await pool.query('SELECT id FROM hero_settings LIMIT 1');
    
    if (existing.length === 0) {
      // Créer si n'existe pas
      const [result] = await pool.query('INSERT INTO hero_settings SET ?', settingsData);
      return res.json({ message: 'Paramètres créés avec succès', id: result.insertId });
    }

    // Mettre à jour
    const [result] = await pool.query('UPDATE hero_settings SET ? WHERE id = ?', [settingsData, existing[0].id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Paramètres non trouvés' });
    }

    res.json({ message: 'Paramètres mis à jour avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres' });
  }
};

export const getStats = async (req, res) => {
  try {
    // Compter les véhicules disponibles
    const [vehiclesCount] = await pool.query('SELECT COUNT(*) as count FROM vehicles WHERE status = "available"');
    
    // Compter les marques actives avec au moins 1 véhicule
    const [brandsCount] = await pool.query(`
      SELECT COUNT(DISTINCT b.id) as count 
      FROM brands b 
      INNER JOIN vehicles v ON v.brand = b.name 
      WHERE b.is_active = TRUE AND v.status = "available"
    `);
    
    // Calculer le taux de satisfaction (moyenne des avis approuvés)
    const [satisfaction] = await pool.query(`
      SELECT ROUND(AVG(rating) / 5 * 100, 0) as rate 
      FROM reviews 
      WHERE status = "approved"
    `);

    res.json({
      vehicles: vehiclesCount[0].count,
      brands: brandsCount[0].count,
      satisfaction: satisfaction[0].rate || 98
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};
