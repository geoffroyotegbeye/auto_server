import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { publicFormLimiter } from '../middleware/security.js';
import * as quoteController from '../controllers/quoteController.js';

const router = express.Router();

// Route publique - Demande de devis
router.post(
  '/',
  publicFormLimiter,
  [
    body('type').isIn(['new']).withMessage('Type invalide'),
    body('first_name').trim().notEmpty().withMessage('Prénom requis').isLength({ max: 50 }),
    body('last_name').trim().notEmpty().withMessage('Nom requis').isLength({ max: 50 }),
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('phone').trim().notEmpty().withMessage('Téléphone requis').matches(/^[0-9+\s()-]+$/),
    body('message').optional().trim().isLength({ max: 1000 })
  ],
  quoteController.createQuote
);

// Routes admin
router.get('/', authenticateToken, isAdmin, quoteController.getAllQuotes);
router.get('/:id', authenticateToken, isAdmin, quoteController.getQuoteById);
router.put('/:id', authenticateToken, isAdmin, quoteController.updateQuote);
router.delete('/:id', authenticateToken, isAdmin, quoteController.deleteQuote);

export default router;
