import express from 'express';
import { body } from 'express-validator';
import { loginLimiter } from '../middleware/security.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Mot de passe minimum 8 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('Le mot de passe doit contenir: majuscule, minuscule, chiffre et caractère spécial'),
    body('name').trim().notEmpty().withMessage('Nom requis').isLength({ max: 100 })
  ],
  authController.register
);

router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe requis')
  ],
  authController.login
);

export default router;
