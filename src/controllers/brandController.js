import { validationResult } from 'express-validator';
import pool from '../config/database.js';
import { sanitizeUpdateData } from '../utils/sanitize.js';

export const getAllBrands = async (req, res) => {
  try {
    const { active } = req.query;
    let query = 'SELECT * FROM brands';
    const params = [];

    if (active === 'true') {
      query += ' WHERE is_active = TRUE';
    }

    query += ' ORDER BY display_order ASC, name ASC';

    const [brands] = await pool.query(query, params);
    res.json(brands);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des marques' });
  }
};

export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const [brands] = await pool.query('SELECT * FROM brands WHERE id = ?', [id]);

    if (brands.length === 0) {
      return res.status(404).json({ error: 'Marque non trouvée' });
    }

    res.json(brands[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la marque' });
  }
};

export const createBrand = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const brandData = req.body;

    // Gérer l'upload du logo si présent
    if (req.file) {
      brandData.logo = `/uploads/brands/${req.file.filename}`;
    }

    const [result] = await pool.query('INSERT INTO brands SET ?', brandData);

    res.status(201).json({
      message: 'Marque créée avec succès',
      brandId: result.insertId
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Cette marque existe déjà' });
    }
    res.status(500).json({ error: 'Erreur lors de la création de la marque' });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    let brandData = sanitizeUpdateData(req.body);

    // Gérer l'upload du logo si présent
    if (req.file) {
      brandData.logo = `/uploads/brands/${req.file.filename}`;
    }

    const [result] = await pool.query('UPDATE brands SET ? WHERE id = ?', [brandData, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Marque non trouvée' });
    }

    res.json({ message: 'Marque mise à jour avec succès' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Cette marque existe déjà' });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la marque' });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si des véhicules utilisent cette marque
    const [vehicles] = await pool.query('SELECT COUNT(*) as count FROM vehicles WHERE brand = (SELECT name FROM brands WHERE id = ?)', [id]);
    
    if (vehicles[0].count > 0) {
      return res.status(400).json({ 
        error: `Impossible de supprimer cette marque car ${vehicles[0].count} véhicule(s) l'utilisent` 
      });
    }

    const [result] = await pool.query('DELETE FROM brands WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Marque non trouvée' });
    }

    res.json({ message: 'Marque supprimée avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la marque' });
  }
};
