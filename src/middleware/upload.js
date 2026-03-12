import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Créer les dossiers uploads s'ils n'existent pas
const uploadDirs = ['uploads/vehicles', 'uploads/brands', 'uploads/hero', 'uploads/config'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuration du stockage pour véhicules
const vehicleStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/vehicles');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'vehicle-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configuration du stockage pour hero
const heroStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/hero');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'hero-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configuration du stockage pour brands
const brandStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/brands');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'brand-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configuration du stockage pour config (logo)
const configStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/config');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtrer les types de fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|avif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'image/avif';

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images (JPEG, JPG, PNG, WEBP, AVIF) sont autorisées'));
  }
};

export const upload = multer({
  storage: vehicleStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB par fichier
    files: 5 // Maximum 5 fichiers
  },
  fileFilter: fileFilter
});

export const uploadHero = multer({
  storage: heroStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: fileFilter
});

export const uploadBrand = multer({
  storage: brandStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1
  },
  fileFilter: fileFilter
});

export const uploadConfig = multer({
  storage: configStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1
  },
  fileFilter: fileFilter
});
