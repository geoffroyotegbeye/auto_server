import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { uploadHero } from '../middleware/upload.js';
import * as heroController from '../controllers/heroController.js';

const router = express.Router();

// Routes publiques
router.get('/settings', heroController.getHeroSettings);
router.get('/stats', heroController.getStats);

// Routes admin (protégées)
router.put(
  '/settings',
  authenticateToken,
  isAdmin,
  uploadHero.single('main_image'),
  heroController.updateHeroSettings
);

export default router;
