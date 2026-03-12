import rateLimit from 'express-rate-limit';

// Rate limiter pour les tentatives de login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour les routes publiques (formulaires)
export const publicFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 soumissions max par heure
  message: { error: 'Trop de soumissions. Réessayez dans 1 heure.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sanitize HTML pour éviter XSS
export const sanitizeHtml = (text) => {
  if (!text) return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Middleware pour sanitizer les inputs
export const sanitizeInputs = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key]);
      }
    });
  }
  next();
};

// Logger les tentatives de connexion échouées
export const logFailedLogin = (email, ip) => {
  const timestamp = new Date().toISOString();
  console.warn(`[SECURITY] Failed login attempt - Email: ${email}, IP: ${ip}, Time: ${timestamp}`);
};

// Logger les accès non autorisés
export const logUnauthorizedAccess = (req) => {
  const timestamp = new Date().toISOString();
  console.warn(`[SECURITY] Unauthorized access attempt - Path: ${req.path}, IP: ${req.ip}, Time: ${timestamp}`);
};
