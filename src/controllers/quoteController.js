import { validationResult } from 'express-validator';
import pool from '../config/database.js';
import { sendEmail } from '../utils/email.js';
import { sanitizeUpdateData } from '../utils/sanitize.js';

export const createQuote = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const quoteData = req.body;
    const [result] = await pool.query('INSERT INTO quotes SET ?', quoteData);

    // Email de confirmation
    const emailContent = `
      <h2>Demande de devis reçue</h2>
      <p>Bonjour ${quoteData.first_name} ${quoteData.last_name},</p>
      <p>Nous avons bien reçu votre demande de devis pour un véhicule neuf.</p>
      ${quoteData.brand && quoteData.model ? `<p><strong>Véhicule:</strong> ${quoteData.brand} ${quoteData.model}</p>` : ''}
      ${quoteData.budget ? `<p><strong>Budget:</strong> ${quoteData.budget} €</p>` : ''}
      <p>Notre équipe commerciale vous contactera rapidement avec une proposition personnalisée.</p>
      <p>Cordialement,<br>L'équipe VehicleMarket</p>
    `;

    await sendEmail(quoteData.email, 'Confirmation de votre demande de devis', emailContent);

    res.status(201).json({
      message: 'Demande de devis créée avec succès',
      quoteId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la création de la demande de devis' });
  }
};

export const getAllQuotes = async (req, res) => {
  try {
    const { status, type } = req.query;
    let query = 'SELECT * FROM quotes';
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const [quotes] = await pool.query(query, params);
    res.json(quotes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des devis' });
  }
};

export const getQuoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const [quotes] = await pool.query('SELECT * FROM quotes WHERE id = ?', [id]);

    if (quotes.length === 0) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    res.json(quotes[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération du devis' });
  }
};

export const updateQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = sanitizeUpdateData(req.body);

    const [result] = await pool.query('UPDATE quotes SET ? WHERE id = ?', [updateData, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    res.json({ message: 'Devis mis à jour avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du devis' });
  }
};

export const deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM quotes WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    res.json({ message: 'Devis supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression du devis' });
  }
};
