import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { uploadBrand } from '../middleware/upload.js';
import * as brandController from '../controllers/brandController.js';

const router = express.Router();

// Routes publiques
router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrandById);

// Routes admin (protégées)
router.post(
  '/',
  authenticateToken,
  isAdmin,
  uploadBrand.single('logo'),
  [
    body('name').notEmpty().withMessage('Le nom de la marque est requis')
  ],
  brandController.createBrand
);

router.put(
  '/:id',
  authenticateToken,
  isAdmin,
  uploadBrand.single('logo'),
  brandController.updateBrand
);

router.delete(
  '/:id',
  authenticateToken,
  isAdmin,
  brandController.deleteBrand
);

export default router;
