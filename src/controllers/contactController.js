import { validationResult } from 'express-validator';
import pool from '../config/database.js';
import { sendEmail } from '../utils/email.js';
import { sanitizeUpdateData } from '../utils/sanitize.js';

export const createContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const contactData = req.body;
    const [result] = await pool.query('INSERT INTO contacts SET ?', contactData);

    // Envoyer email de confirmation au client
    const clientEmail = `
      <h2>Message bien reçu</h2>
      <p>Bonjour ${contactData.name},</p>
      <p>Nous avons bien reçu votre message concernant : <strong>${contactData.subject}</strong></p>
      <p>Notre équipe vous répondra dans les plus brefs délais.</p>
      <p>Cordialement,<br>L'équipe VehicleMarket</p>
    `;

    await sendEmail(contactData.email, 'Confirmation de réception', clientEmail);

    res.status(201).json({
      message: 'Message envoyé avec succès',
      contactId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM contacts';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [contacts] = await pool.query(query, params);
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des contacts' });
  }
};

export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const [contacts] = await pool.query('SELECT * FROM contacts WHERE id = ?', [id]);

    if (contacts.length === 0) {
      return res.status(404).json({ error: 'Contact non trouvé' });
    }

    // Marquer comme lu
    await pool.query('UPDATE contacts SET status = ? WHERE id = ? AND status = ?', ['read', id, 'new']);

    res.json(contacts[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération du contact' });
  }
};

export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = sanitizeUpdateData(req.body);

    const [result] = await pool.query('UPDATE contacts SET ? WHERE id = ?', [updateData, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact non trouvé' });
    }

    res.json({ message: 'Contact mis à jour avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du contact' });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM contacts WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact non trouvé' });
    }

    res.json({ message: 'Contact supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression du contact' });
  }
};
