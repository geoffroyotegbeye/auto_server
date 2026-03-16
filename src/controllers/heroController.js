import pool from '../config/database.js';
import { sanitizeUpdateData } from '../utils/sanitize.js';
import { deleteCloudinaryImage } from '../middleware/upload.js';

export const getHeroSettings = async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT * FROM hero_settings WHERE is_active = TRUE LIMIT 1');
    if (settings.length === 0) return res.status(404).json({ error: 'Paramètres du hero non trouvés' });
    res.json(settings[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres' });
  }
};

export const updateHeroSettings = async (req, res) => {
  try {
    let settingsData = sanitizeUpdateData(req.body);

    if (req.file) {
      const [existing] = await pool.query('SELECT main_image FROM hero_settings LIMIT 1');
      if (existing.length > 0) await deleteCloudinaryImage(existing[0].main_image);
      settingsData.main_image = req.file.path;
    }

    const [existing] = await pool.query('SELECT id FROM hero_settings LIMIT 1');

    if (existing.length === 0) {
      const [result] = await pool.query('INSERT INTO hero_settings SET ?', settingsData);
      return res.json({ message: 'Paramètres créés avec succès', id: result.insertId });
    }

    const [result] = await pool.query('UPDATE hero_settings SET ? WHERE id = ?', [settingsData, existing[0].id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Paramètres non trouvés' });

    res.json({ message: 'Paramètres mis à jour avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres' });
  }
};

export const getStats = async (req, res) => {
  try {
    const [vehiclesCount] = await pool.query('SELECT COUNT(*) as count FROM vehicles WHERE status = "available"');
    const [brandsCount] = await pool.query(`
      SELECT COUNT(DISTINCT b.id) as count 
      FROM brands b 
      INNER JOIN vehicles v ON v.brand = b.name 
      WHERE b.is_active = TRUE AND v.status = "available"
    `);
    const [satisfaction] = await pool.query(`
      SELECT ROUND(AVG(rating) / 5 * 100, 0) as rate 
      FROM reviews WHERE status = "approved"
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
