import pool from '../config/database.js';
import { deleteCloudinaryImage } from '../middleware/upload.js';

export const getConfig = async (req, res) => {
  try {
    const [configs] = await pool.query('SELECT * FROM site_config WHERE id = 1');
    if (configs.length === 0) {
      return res.json({
        site_logo: null,
        site_logo_dark: null,
        currency_symbol: 'FCFA',
        currency_name: 'Franc CFA',
        currency_position: 'after'
      });
    }
    res.json(configs[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la configuration' });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const { currency_symbol, currency_name, currency_position } = req.body;
    const files = req.files || {};

    const updateData = {};

    if (files.logo) {
      // Supprimer l'ancien logo Cloudinary
      const [existing] = await pool.query('SELECT site_logo FROM site_config WHERE id = 1');
      if (existing.length > 0) await deleteCloudinaryImage(existing[0].site_logo);
      updateData.site_logo = files.logo[0].path;
    }

    if (files.logo_dark) {
      const [existing] = await pool.query('SELECT site_logo_dark FROM site_config WHERE id = 1');
      if (existing.length > 0) await deleteCloudinaryImage(existing[0].site_logo_dark);
      updateData.site_logo_dark = files.logo_dark[0].path;
    }

    if (currency_symbol !== undefined) updateData.currency_symbol = currency_symbol;
    if (currency_name !== undefined) updateData.currency_name = currency_name;
    if (currency_position !== undefined) updateData.currency_position = currency_position;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    const [existing] = await pool.query('SELECT id FROM site_config WHERE id = 1');
    if (existing.length === 0) {
      await pool.query('INSERT INTO site_config SET ?', { id: 1, ...updateData });
    } else {
      await pool.query('UPDATE site_config SET ? WHERE id = 1', updateData);
    }

    res.json({ message: 'Configuration mise à jour avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la configuration' });
  }
};

export const getPriceRange = async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT MIN(price) as minPrice, MAX(price) as maxPrice FROM vehicles WHERE status = "available"'
    );
    res.json({
      minPrice: result[0].minPrice || 0,
      maxPrice: result[0].maxPrice || 100000000
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des prix' });
  }
};
