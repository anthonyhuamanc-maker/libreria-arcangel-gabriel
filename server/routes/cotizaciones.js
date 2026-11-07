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
    res.status(500).json({ mensaje: 'Error al obtener cotizaciones: ' + error.message });
  }
});

// POST /api/cotizaciones - Inserción dinámica con prueba de columnas
router.post('/', async (req, res) => {
  const { nombre, cliente_nombre, cliente, email, correo, telefono, mensaje, consulta } = req.body;

  const valNombre = nombre || cliente_nombre || cliente || 'Cliente Web';
  const valEmail = email || correo || '';
  const valTelefono = telefono || '';
  const valMensaje = mensaje || consulta || '';

  if (!valNombre || !valMensaje) {
    return res.status(400).json({ mensaje: 'Nombre y mensaje son obligatorios.' });
  }

  // Lista de posibles variantes de columnas en MySQL
  const intentos = [
    { sql: 'INSERT INTO cotizaciones (nombre, email, telefono, mensaje) VALUES (?, ?, ?, ?)', params: [valNombre, valEmail, valTelefono, valMensaje] },
    { sql: 'INSERT INTO cotizaciones (cliente_nombre, email, telefono, mensaje) VALUES (?, ?, ?, ?)', params: [valNombre, valEmail, valTelefono, valMensaje] },
    { sql: 'INSERT INTO cotizaciones (cliente, email, telefono, mensaje) VALUES (?, ?, ?, ?)', params: [valNombre, valEmail, valTelefono, valMensaje] },
    { sql: 'INSERT INTO cotizaciones (nombre, correo, telefono, mensaje) VALUES (?, ?, ?, ?)', params: [valNombre, valEmail, valTelefono, valMensaje] },
    { sql: 'INSERT INTO cotizaciones (nombre, email, telefono, consulta) VALUES (?, ?, ?, ?)', params: [valNombre, valEmail, valTelefono, valMensaje] }
  ];

  let ultimoError = null;
  for (const intento of intentos) {
    try {
      await db.query(intento.sql, intento.params);
      return res.status(201).json({ mensaje: 'Cotización enviada con éxito' });
    } catch (err) {
      ultimoError = err;
    }
  }

  console.error('Error MySQL POST cotizaciones:', ultimoError?.message);
  res.status(500).json({ mensaje: 'Error BD: ' + (ultimoError?.message || 'Error desconocido') });
});

// DELETE /api/cotizaciones
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM cotizaciones');
    res.json({ mensaje: 'Todas las cotizaciones han sido eliminadas' });
  } catch (error) {
    console.error('Error MySQL DELETE cotizaciones:', error.message);
    res.status(500).json({ mensaje: 'Error al eliminar cotizaciones: ' + error.message });
  }
});

module.exports = router;