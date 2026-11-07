const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authImport = require('../middleware/authMiddleware');

const authMiddleware = typeof authImport === 'function' 
  ? authImport 
  : (authImport.authMiddleware || ((req, res, next) => next()));

// GET /api/cotizaciones
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cotizaciones ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error MySQL GET cotizaciones:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener cotizaciones' });
  }
});

// POST /api/cotizaciones
router.post('/', async (req, res) => {
  const { nombre, email, telefono, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ mensaje: 'Nombre, email y mensaje son obligatorios.' });
  }

  try {
    await db.query(
      'INSERT INTO cotizaciones (nombre, email, telefono, mensaje) VALUES (?, ?, ?, ?)',
      [nombre, email, telefono || '', mensaje]
    );
    res.status(201).json({ mensaje: 'Cotización enviada con éxito' });
  } catch (error) {
    console.error('Error MySQL POST cotizaciones:', error.message);
    res.status(500).json({ mensaje: 'Error al registrar la cotización' });
  }
});

// DELETE /api/cotizaciones
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM cotizaciones');
    res.json({ mensaje: 'Todas las cotizaciones han sido eliminadas' });
  } catch (error) {
    console.error('Error MySQL DELETE cotizaciones:', error.message);
    res.status(500).json({ mensaje: 'Error al eliminar cotizaciones' });
  }
});

module.exports = router;