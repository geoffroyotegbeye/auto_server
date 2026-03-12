import jwt from 'jsonwebtoken';
import { logUnauthorizedAccess } from './security.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logUnauthorizedAccess(req);
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logUnauthorizedAccess(req);
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
    req.user = user;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    logUnauthorizedAccess(req);
    return res.status(403).json({ error: 'Accès refusé - Admin requis' });
  }
  next();
};
