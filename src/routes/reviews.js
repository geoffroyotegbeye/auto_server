import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import * as reviewController from '../controllers/reviewController.js';

const router = express.Router();

// Routes publiques
router.get('/', reviewController.getApprovedReviews);
router.post(
  '/',
  [
    body('customer_name').notEmpty().withMessage('Nom requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Note entre 1 et 5'),
    body('service_type').isIn(['vente', 'sav', 'general']),
    body('comment').notEmpty().withMessage('Commentaire requis')
  ],
  reviewController.createReview
);

// Routes admin
router.get('/all', authenticateToken, isAdmin, reviewController.getAllReviews);
router.put('/:id/approve', authenticateToken, isAdmin, reviewController.approveReview);
router.put('/:id/reject', authenticateToken, isAdmin, reviewController.rejectReview);
router.delete('/:id', authenticateToken, isAdmin, reviewController.deleteReview);

export default router;
