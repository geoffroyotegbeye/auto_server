import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import pool from '../config/database.js';

export const getAll = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, name, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, name, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO users (email, password, name, role, is_active) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, name, role, true]
    );
    
    res.status(201).json({ id: result.insertId, message: 'Utilisateur créé' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Cet email existe déjà' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, is_active, password, currentPassword } = req.body;
    
    // Si l'utilisateur change son propre mot de passe, vérifier l'ancien
    if (password && currentPassword) {
      const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [id]);
      if (users.length === 0) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Ancien mot de passe incorrect' });
      }
    }
    
    let query = 'UPDATE users SET name = ?, role = ?, is_active = ?';
    let params = [name, role, is_active];
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await pool.query(query, params);
    res.json({ message: 'Utilisateur mis à jour' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
