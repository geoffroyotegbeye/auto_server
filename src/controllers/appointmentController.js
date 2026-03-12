import { validationResult } from 'express-validator';
import pool from '../config/database.js';
import { sendEmail } from '../utils/email.js';
import { sanitizeUpdateData } from '../utils/sanitize.js';

export const createAppointment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const appointmentData = req.body;
    const [result] = await pool.query('INSERT INTO appointments SET ?', appointmentData);

    // Envoyer email de confirmation
    const emailContent = `
      <h2>Confirmation de rendez-vous</h2>
      <p>Bonjour ${appointmentData.first_name} ${appointmentData.last_name},</p>
      <p>Votre demande de rendez-vous ${appointmentData.type === 'showroom' ? 'au showroom' : 'au SAV'} a bien été reçue.</p>
      <p><strong>Date souhaitée:</strong> ${appointmentData.preferred_date}</p>
      <p><strong>Heure souhaitée:</strong> ${appointmentData.preferred_time}</p>
      <p>Nous vous contacterons rapidement pour confirmer votre rendez-vous.</p>
      <p>Cordialement,<br>L'équipe VehicleMarket</p>
    `;

    await sendEmail(
      appointmentData.email,
      'Confirmation de votre demande de rendez-vous',
      emailContent
    );

    res.status(201).json({
      message: 'Rendez-vous créé avec succès',
      appointmentId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la création du rendez-vous' });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const { status, type, date } = req.query;
    let query = 'SELECT * FROM appointments';
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
    if (date) {
      conditions.push('preferred_date = ?');
      params.push(date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY preferred_date DESC, preferred_time DESC';

    const [appointments] = await pool.query(query, params);
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des rendez-vous' });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [appointments] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);

    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    res.json(appointments[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération du rendez-vous' });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = sanitizeUpdateData(req.body);

    const [result] = await pool.query('UPDATE appointments SET ? WHERE id = ?', [updateData, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    // Si le statut change en "confirmed", envoyer un email
    if (updateData.status === 'confirmed') {
      const [appointments] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
      const appointment = appointments[0];

      const emailContent = `
        <h2>Rendez-vous confirmé</h2>
        <p>Bonjour ${appointment.first_name} ${appointment.last_name},</p>
        <p>Votre rendez-vous ${appointment.type === 'showroom' ? 'au showroom' : 'au SAV'} est confirmé.</p>
        <p><strong>Date:</strong> ${appointment.preferred_date}</p>
        <p><strong>Heure:</strong> ${appointment.preferred_time}</p>
        <p>À bientôt !<br>L'équipe VehicleMarket</p>
      `;

      await sendEmail(
        appointment.email,
        'Votre rendez-vous est confirmé',
        emailContent
      );
    }

    res.json({ message: 'Rendez-vous mis à jour avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rendez-vous' });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM appointments WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    res.json({ message: 'Rendez-vous supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression du rendez-vous' });
  }
};
