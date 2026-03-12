import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import * as contactController from '../controllers/contactController.js';

const router = express.Router();

// Route publique - Formulaire de contact
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Nom requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('subject').notEmpty().withMessage('Sujet requis'),
    body('message').notEmpty().withMessage('Message requis')
  ],
  contactController.createContact
);

// Routes admin
router.get('/', authenticateToken, isAdmin, contactController.getAllContacts);
router.get('/:id', authenticateToken, isAdmin, contactController.getContactById);
router.put('/:id', authenticateToken, isAdmin, contactController.updateContact);
router.delete('/:id', authenticateToken, isAdmin, contactController.deleteContact);

export default router;
