import { validationResult } from 'express-validator';
import pool from '../config/database.js';

export const createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const reviewData = req.body;
    const [result] = await pool.query('INSERT INTO reviews SET ?', reviewData);

    res.status(201).json({
      message: 'Avis soumis avec succès. Il sera publié après modération.',
      reviewId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la soumission de l\'avis' });
  }
};

export const getApprovedReviews = async (req, res) => {
  try {
    const { service_type, limit = 10 } = req.query;
    let query = 'SELECT * FROM reviews WHERE status = ?';
    const params = ['approved'];

    if (service_type) {
      query += ' AND service_type = ?';
      params.push(service_type);
    }

    query += ' ORDER BY is_featured DESC, created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [reviews] = await pool.query(query, params);
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des avis' });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM reviews';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [reviews] = await pool.query(query, params);
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des avis' });
  }
};

export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE reviews SET status = ? WHERE id = ?',
      ['approved', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Avis non trouvé' });
    }

    res.json({ message: 'Avis approuvé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l\'approbation de l\'avis' });
  }
};

export const rejectReview = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE reviews SET status = ? WHERE id = ?',
      ['rejected', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Avis non trouvé' });
    }

    res.json({ message: 'Avis rejeté' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors du rejet de l\'avis' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Avis non trouvé' });
    }

    res.json({ message: 'Avis supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'avis' });
  }
};
