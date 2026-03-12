import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Envoyer un email
 * @param {string} to - Email du destinataire
 * @param {string} subject - Sujet de l'email
 * @param {string} html - Contenu HTML de l'email
 */
export const sendEmail = async (to, subject, html) => {
  try {
    // Désactivé temporairement - configuration email à corriger
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email simulé (dev mode):', { to, subject });
      return { messageId: 'dev-mode-' + Date.now() };
    }

    const mailOptions = {
      from: `VehicleMarket <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    // Ne pas bloquer l'application si l'email échoue
    return null;
  }
};

/**
 * Envoyer un email à l'équipe admin
 * @param {string} subject - Sujet
 * @param {string} html - Contenu HTML
 */
export const sendAdminNotification = async (subject, html) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  return sendEmail(adminEmail, subject, html);
};
