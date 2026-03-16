import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|avif/;
  const ext = allowed.test(file.originalname.toLowerCase());
  const mime = allowed.test(file.mimetype) || file.mimetype === 'image/avif';
  if (ext && mime) cb(null, true);
  else cb(new Error('Seules les images (JPEG, JPG, PNG, WEBP, AVIF) sont autorisées'));
};

// Vehicles
export const upload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: 'auto/vehicles', allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'], transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }] },
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter,
});

// Brands
export const uploadBrand = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: 'auto/brands', allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'], transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto' }] },
  }),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter,
});

// Hero
export const uploadHero = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: 'auto/hero', allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'], transformation: [{ width: 1920, height: 1080, crop: 'limit', quality: 'auto' }] },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter,
});

// Config (logos)
export const uploadConfig = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: 'auto/config', allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'], transformation: [{ width: 400, height: 200, crop: 'limit', quality: 'auto' }] },
  }),
  limits: { fileSize: 2 * 1024 * 1024, files: 2 },
  fileFilter,
});

// Helper pour supprimer une image Cloudinary depuis son URL
export const deleteCloudinaryImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) return;
  try {
    // Extraire le public_id depuis l'URL : .../auto/vehicles/abc123.jpg → auto/vehicles/abc123
    const matches = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    if (matches && matches[1]) {
      await cloudinary.uploader.destroy(matches[1]);
    }
  } catch (e) {
    console.error('Erreur suppression Cloudinary:', e.message);
  }
};
