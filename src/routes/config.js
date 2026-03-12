import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { uploadConfig } from '../middleware/upload.js';
import * as configController from '../controllers/configController.js';

const router = express.Router();

// Routes publiques
router.get('/', configController.getConfig);
router.get('/price-range', configController.getPriceRange);

// Routes admin (protégées)
router.put('/', authenticateToken, isAdmin, uploadConfig.fields([{ name: 'logo', maxCount: 1 }, { name: 'logo_dark', maxCount: 1 }]), configController.updateConfig);

export default router;
