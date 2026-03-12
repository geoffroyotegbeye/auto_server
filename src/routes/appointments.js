import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { publicFormLimiter } from '../middleware/security.js';
import * as appointmentController from '../controllers/appointmentController.js';

const router = express.Router();

// Route publique - Créer un RDV
router.post(
  '/',
  publicFormLimiter,
  [
    body('type').isIn(['showroom', 'sav']).withMessage('Type invalide'),
    body('first_name').trim().notEmpty().withMessage('Prénom requis').isLength({ max: 50 }),
    body('last_name').trim().notEmpty().withMessage('Nom requis').isLength({ max: 50 }),
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('phone').trim().notEmpty().withMessage('Téléphone requis').matches(/^[0-9+\s()-]+$/),
    body('preferred_date').isDate().withMessage('Date invalide'),
    body('preferred_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure invalide'),
    body('message').optional().trim().isLength({ max: 1000 })
  ],
  appointmentController.createAppointment
);

// Routes admin
router.get('/', authenticateToken, isAdmin, appointmentController.getAllAppointments);
router.get('/:id', authenticateToken, isAdmin, appointmentController.getAppointmentById);
router.put('/:id', authenticateToken, isAdmin, appointmentController.updateAppointment);
router.delete('/:id', authenticateToken, isAdmin, appointmentController.deleteAppointment);

export default router;
