import { validationResult } from 'express-validator';
import pool from '../config/database.js';
import { sanitizeUpdateData } from '../utils/sanitize.js';

export const getAllServices = async (req, res) => {
  try {
    const { category, is_active = true } = req.query;
    let query = 'SELECT * FROM services WHERE is_active = ?';
    const params = [is_active];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY display_order ASC, name ASC';

    const [services] = await pool.query(query, params);
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des services' });
  }
};

export const createService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const serviceData = req.body;
    const [result] = await pool.query('INSERT INTO services SET ?', serviceData);

    res.status(201).json({
      message: 'Service créé avec succès',
      serviceId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la création du service' });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = sanitizeUpdateData(req.body);

    const [result] = await pool.query('UPDATE services SET ? WHERE id = ?', [updateData, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }

    res.json({ message: 'Service mis à jour avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du service' });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM services WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }

    res.json({ message: 'Service supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression du service' });
  }
};
