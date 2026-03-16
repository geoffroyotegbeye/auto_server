/**
 * Script de migration : upload toutes les images locales /uploads/... vers Cloudinary
 * et met à jour les URLs en BDD
 * Usage : node src/database/migrate-images-cloudinary.js
 */

import { v2 as cloudinary } from 'cloudinary';
import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsBase = path.join(__dirname, '../../uploads');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload un fichier local vers Cloudinary, retourne l'URL sécurisée
async function uploadToCloudinary(localPath, folder) {
  try {
    const result = await cloudinary.uploader.upload(localPath, { folder: `auto/${folder}`, use_filename: false });
    return result.secure_url;
  } catch (e) {
    console.error(`  ✗ Erreur upload ${localPath}:`, e.message);
    return null;
  }
}

// Convertit un chemin /uploads/xxx/fichier.jpg en chemin absolu local
function toLocalPath(dbPath) {
  if (!dbPath) return null;
  if (dbPath.startsWith('http')) return null; // déjà Cloudinary
  const relative = dbPath.startsWith('/') ? dbPath.slice(1) : dbPath;
  const full = path.join(path.join(__dirname, '../../'), relative);
  return fs.existsSync(full) ? full : null;
}

async function migrate() {
  console.log('🚀 Migration images → Cloudinary\n');

  // ── VEHICLES ──────────────────────────────────────────────
  console.log('📦 Véhicules...');
  const [vehicles] = await pool.query('SELECT id, main_image, images FROM vehicles');

  for (const v of vehicles) {
    let changed = false;
    let newMainImage = v.main_image;
    let newImages = [];

    try { newImages = v.images ? JSON.parse(v.images) : []; } catch (e) { newImages = []; }

    // main_image
    const mainLocal = toLocalPath(v.main_image);
    if (mainLocal) {
      console.log(`  Vehicle ${v.id} main_image...`);
      const url = await uploadToCloudinary(mainLocal, 'vehicles');
      if (url) { newMainImage = url; changed = true; }
    }

    // images array
    const migratedImages = [];
    for (const img of newImages) {
      const local = toLocalPath(img);
      if (local) {
        console.log(`  Vehicle ${v.id} image ${img}...`);
        const url = await uploadToCloudinary(local, 'vehicles');
        migratedImages.push(url || img);
        if (url) changed = true;
      } else {
        migratedImages.push(img);
      }
    }

    if (changed) {
      await pool.query('UPDATE vehicles SET main_image = ?, images = ? WHERE id = ?', [
        newMainImage,
        JSON.stringify(migratedImages),
        v.id
      ]);
      console.log(`  ✓ Vehicle ${v.id} mis à jour`);
    }
  }

  // ── BRANDS ────────────────────────────────────────────────
  console.log('\n📦 Marques...');
  const [brands] = await pool.query('SELECT id, name, logo FROM brands');

  for (const b of brands) {
    const local = toLocalPath(b.logo);
    if (local) {
      console.log(`  Brand "${b.name}" logo...`);
      const url = await uploadToCloudinary(local, 'brands');
      if (url) {
        await pool.query('UPDATE brands SET logo = ? WHERE id = ?', [url, b.id]);
        console.log(`  ✓ Brand "${b.name}" mis à jour`);
      }
    }
  }

  // ── HERO ──────────────────────────────────────────────────
  console.log('\n📦 Hero...');
  const [hero] = await pool.query('SELECT id, main_image FROM hero_settings');

  for (const h of hero) {
    const local = toLocalPath(h.main_image);
    if (local) {
      console.log(`  Hero ${h.id} main_image...`);
      const url = await uploadToCloudinary(local, 'hero');
      if (url) {
        await pool.query('UPDATE hero_settings SET main_image = ? WHERE id = ?', [url, h.id]);
        console.log(`  ✓ Hero mis à jour`);
      }
    }
  }

  // ── CONFIG (logos) ────────────────────────────────────────
  console.log('\n📦 Config logos...');
  const [configs] = await pool.query('SELECT id, site_logo, site_logo_dark FROM site_config');

  for (const c of configs) {
    const updates = {};

    const logoLocal = toLocalPath(c.site_logo);
    if (logoLocal) {
      console.log(`  Config logo...`);
      const url = await uploadToCloudinary(logoLocal, 'config');
      if (url) updates.site_logo = url;
    }

    const logoDarkLocal = toLocalPath(c.site_logo_dark);
    if (logoDarkLocal) {
      console.log(`  Config logo_dark...`);
      const url = await uploadToCloudinary(logoDarkLocal, 'config');
      if (url) updates.site_logo_dark = url;
    }

    if (Object.keys(updates).length > 0) {
      await pool.query('UPDATE site_config SET ? WHERE id = ?', [updates, c.id]);
      console.log(`  ✓ Config mis à jour`);
    }
  }

  console.log('\n✅ Migration terminée !');
  process.exit(0);
}

migrate().catch(e => { console.error('Erreur migration:', e); process.exit(1); });
