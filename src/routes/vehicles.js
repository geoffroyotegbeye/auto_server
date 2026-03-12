import express from 'express';
import { body, query, param } from 'express-validator';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import * as vehicleController from '../controllers/vehicleController.js';

const router = express.Router();

// Routes publiques
router.get('/', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleById);

// Routes admin (protégées)
router.post(
  '/',
  authenticateToken,
  isAdmin,
  upload.array('images', 10),
  [
    body('brand').notEmpty().withMessage('La marque est requise'),
    body('model').notEmpty().withMessage('Le modèle est requis'),
    body('price').notEmpty().withMessage('Prix requis'),
    body('year').notEmpty().withMessage('Année requise'),
    body('km').notEmpty().withMessage('Kilométrage requis'),
    body('fuel').isIn(['Essence', 'Diesel', 'Hybride', 'Hybride rechargeable', 'Électrique', 'GPL']),
    body('transmission').notEmpty()
  ],
  vehicleController.createVehicle
);

router.put(
  '/:id',
  authenticateToken,
  isAdmin,
  upload.array('images', 10),
  vehicleController.updateVehicle
);

router.delete(
  '/:id',
  authenticateToken,
  isAdmin,
  vehicleController.deleteVehicle
);

export default router;
