import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import * as serviceController from '../controllers/serviceController.js';

const router = express.Router();

// Route publique
router.get('/', serviceController.getAllServices);

// Routes admin
router.post(
  '/',
  authenticateToken,
  isAdmin,
  [
    body('name').notEmpty().withMessage('Nom requis'),
    body('category').isIn(['entretien', 'reparation', 'diagnostic', 'carrosserie', 'pneumatique', 'autre']),
    body('description').notEmpty().withMessage('Description requise')
  ],
  serviceController.createService
);

router.put('/:id', authenticateToken, isAdmin, serviceController.updateService);
router.delete('/:id', authenticateToken, isAdmin, serviceController.deleteService);

export default router;
