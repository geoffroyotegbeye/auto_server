import express from 'express';
import { body } from 'express-validator';
import * as usersController from '../controllers/usersController.js';

const router = express.Router();

router.get('/', usersController.getAll);
router.post('/', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caractères'),
  body('name').notEmpty().withMessage('Nom requis'),
  body('role').isIn(['lecteur', 'editeur', 'admin']).withMessage('Rôle invalide')
], usersController.create);
router.put('/:id', usersController.update);
router.delete('/:id', usersController.deleteUser);

export default router;
