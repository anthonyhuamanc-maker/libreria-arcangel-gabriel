const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authImport = require('../middleware/authMiddleware');

const authMiddleware = typeof authImport === 'function' 
  ? authImport 
  : (authImport.authMiddleware || ((req, res, next) => next()));

// GET /api/cotizaciones - Estandariza las columnas devueltas hacia el frontend
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cotizaciones ORDER BY id DESC');
    
    const cotizacionesEstandarizadas = rows.map(row => ({
      id: row.id,
      nombre: row.nombre || row.cliente_nombre || row.nombre_cliente || row.cliente || 'Sin nombre',
      telefono: row.telefono || row.celular || row.whatsapp || '',
      email: row.email || row.correo || row.email_cliente || '',
      mensaje: row.mensaje || row.consulta || row.detalle || row.descripcion || '',
      fecha: row.fecha || row.fecha_creacion || row.created_at || row.createdAt || new Date().toISOString()
    }));

    res.json(cotizacionesEstandarizadas);
  } catch (error) {
    console.error('Error MySQL GET cotizaciones:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener cotizaciones: ' + error.message });
  }
});

// POST /api/cotizaciones - Inserción dinámica por inspección de esquema
router.post('/', async (req, res) => {
  const { nombre, cliente_nombre, cliente, email, correo, telefono, mensaje, consulta } = req.body;

  const valNombre = nombre || cliente_nombre || cliente || 'Cliente Web';
  const valEmail = email || correo || '';
  const valTelefono = telefono || '';
  const valMensaje = mensaje || consulta || '';

  if (!valNombre || !valMensaje) {
    return res.status(400).json({ mensaje: 'Nombre y mensaje son obligatorios.' });
  }

  try {
    const [columns] = await db.query('SHOW COLUMNS FROM cotizaciones');
    const dbCols = columns.map(c => c.Field);

    const fieldsToInsert = {};

    const nameCol = dbCols.find(c => ['nombre', 'cliente_nombre', 'nombre_cliente', 'cliente'].includes(c.toLowerCase()));
    if (nameCol) fieldsToInsert[nameCol] = valNombre;

    const emailCol = dbCols.find(c => ['email', 'correo', 'email_cliente'].includes(c.toLowerCase()));
    if (emailCol) fieldsToInsert[emailCol] = valEmail;

    const phoneCol = dbCols.find(c => ['telefono', 'celular', 'whatsapp', 'telefono_cliente'].includes(c.toLowerCase()));
    if (phoneCol) fieldsToInsert[phoneCol] = valTelefono;

    const msgCol = dbCols.find(c => ['mensaje', 'consulta', 'detalle', 'descripcion'].includes(c.toLowerCase()));
    if (msgCol) fieldsToInsert[msgCol] = valMensaje;

    const keys = Object.keys(fieldsToInsert);
    const values = Object.values(fieldsToInsert);

    if (keys.length === 0) {
      return res.status(500).json({ mensaje: 'No se encontraron columnas válidas en la tabla cotizaciones.' });
    }

    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO cotizaciones (${keys.join(', ')}) VALUES (${placeholders})`;

    await db.query(sql, values);
    res.status(201).json({ mensaje: 'Cotización enviada con éxito' });

  } catch (error) {
    console.error('Error MySQL POST cotizaciones:', error.message);
    res.status(500).json({ mensaje: 'Error al registrar la cotización: ' + error.message });
  }
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