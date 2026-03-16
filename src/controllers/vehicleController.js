import { validationResult } from 'express-validator';
import pool from '../config/database.js';
import { sanitizeUpdateData } from '../utils/sanitize.js';
import { deleteCloudinaryImage } from '../middleware/upload.js';

export const getAllVehicles = async (req, res) => {
  try {
    const {
      brand, fuel, transmission, priceMin, priceMax,
      yearMin, yearMax, status,
      page = 1, limit = 12, sort = 'created_at DESC'
    } = req.query;

    let query = 'SELECT * FROM vehicles';
    const params = [];
    const conditions = [];

    if (status) { conditions.push('status = ?'); params.push(status); }
    if (brand) { conditions.push('brand = ?'); params.push(brand); }
    if (fuel) { conditions.push('fuel = ?'); params.push(fuel); }
    if (transmission) { conditions.push('transmission = ?'); params.push(transmission); }
    if (priceMin) { conditions.push('price >= ?'); params.push(priceMin); }
    if (priceMax) { conditions.push('price <= ?'); params.push(priceMax); }
    if (yearMin) { conditions.push('year >= ?'); params.push(yearMin); }
    if (yearMax) { conditions.push('year <= ?'); params.push(yearMax); }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ` ORDER BY ${sort}`;

    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [vehicles] = await pool.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM vehicles';
    const countParams = [];
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
      countParams.push(...params.slice(0, -2));
    }
    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      vehicles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des véhicules' });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const [vehicles] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);

    if (vehicles.length === 0) return res.status(404).json({ error: 'Véhicule non trouvé' });

    await pool.query('UPDATE vehicles SET views = views + 1 WHERE id = ?', [id]);
    res.json(vehicles[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération du véhicule' });
  }
};

export const createVehicle = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const vehicleData = req.body;

    if (vehicleData.price) vehicleData.price = parseFloat(vehicleData.price);
    if (vehicleData.year) vehicleData.year = parseInt(vehicleData.year);
    if (vehicleData.doors) vehicleData.doors = parseInt(vehicleData.doors);
    if (vehicleData.seats) vehicleData.seats = parseInt(vehicleData.seats);

    if (vehicleData.features) {
      if (typeof vehicleData.features === 'string' && vehicleData.features.trim() !== '') {
        try { vehicleData.features = JSON.parse(vehicleData.features); }
        catch (e) { vehicleData.features = null; }
      } else {
        vehicleData.features = null;
      }
    } else {
      vehicleData.features = null;
    }

    if (vehicleData.power === '') delete vehicleData.power;
    if (vehicleData.version === '') delete vehicleData.version;
    if (vehicleData.color === '') delete vehicleData.color;
    if (vehicleData.description === '') delete vehicleData.description;
    if (vehicleData.location === '') delete vehicleData.location;

    // Images Cloudinary — req.files contient { path: url_cloudinary }
    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map(file => file.path);
      vehicleData.images = JSON.stringify(imagePaths);
      vehicleData.main_image = imagePaths[0];
    }

    const [result] = await pool.query('INSERT INTO vehicles SET ?', vehicleData);
    res.status(201).json({ message: 'Véhicule créé avec succès', vehicleId: result.insertId });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ error: 'Erreur lors de la création du véhicule' });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    let vehicleData = sanitizeUpdateData(req.body);

    const [existingVehicle] = await pool.query('SELECT images, main_image FROM vehicles WHERE id = ?', [id]);
    if (existingVehicle.length === 0) return res.status(404).json({ error: 'Véhicule non trouvé' });

    let existingImages = [];
    try { existingImages = existingVehicle[0].images ? JSON.parse(existingVehicle[0].images) : []; }
    catch (e) { existingImages = []; }

    // Supprimer les images marquées pour suppression (Cloudinary + liste)
    if (vehicleData.imagesToDelete) {
      const imagesToDelete = JSON.parse(vehicleData.imagesToDelete);
      for (const img of imagesToDelete) await deleteCloudinaryImage(img);
      existingImages = existingImages.filter(img => !imagesToDelete.includes(img));
      delete vehicleData.imagesToDelete;
    }

    // Ajouter les nouvelles images Cloudinary
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(file => file.path);
      existingImages = [...existingImages, ...newImagePaths];
    }

    if (existingImages.length > 0) {
      vehicleData.images = JSON.stringify(existingImages);
      vehicleData.main_image = existingImages[0];
    }

    const [result] = await pool.query('UPDATE vehicles SET ? WHERE id = ?', [vehicleData, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Véhicule non trouvé' });

    res.json({ message: 'Véhicule mis à jour avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du véhicule' });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Supprimer les images Cloudinary avant de supprimer le véhicule
    const [vehicles] = await pool.query('SELECT images, main_image FROM vehicles WHERE id = ?', [id]);
    if (vehicles.length > 0) {
      try {
        const images = vehicles[0].images ? JSON.parse(vehicles[0].images) : [];
        for (const img of images) await deleteCloudinaryImage(img);
      } catch (e) {}
    }

    const [result] = await pool.query('DELETE FROM vehicles WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Véhicule non trouvé' });

    res.json({ message: 'Véhicule supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression du véhicule' });
  }
};
