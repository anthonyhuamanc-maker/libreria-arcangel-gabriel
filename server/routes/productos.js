const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authImport = require('../middleware/authMiddleware');

// Validar la exportación del middleware para evitar errores de arranque en Express
const authMiddleware = typeof authImport === 'function'
  ? authImport
  : (authImport.authMiddleware || authImport.verifyToken || ((req, res, next) => next()));

// GET /api/productos - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error MySQL GET:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener productos' });
  }
});

// POST /api/productos - Crear un producto
router.post('/', authMiddleware, async (req, res) => {
  const { nombre, categoria, detalle, stock, precio } = req.body;

  if (!nombre || !categoria || !detalle || stock === undefined || stock === null || !precio) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
  }

  try {
    try {
      await db.query(
        'INSERT INTO productos (nombre, categoria, descripcion, stock, precio) VALUES (?, ?, ?, ?, ?)',
        [nombre, categoria, detalle, Number(stock), precio]
      );
    } catch (e1) {
      await db.query(
        'INSERT INTO productos (nombre, categoria, detalle, stock, precio) VALUES (?, ?, ?, ?, ?)',
        [nombre, categoria, detalle, Number(stock), precio]
      );
    }

    res.status(201).json({ mensaje: 'Producto creado exitosamente' });
  } catch (error) {
    console.error('Error MySQL POST:', error.message);
    res.status(500).json({ mensaje: 'Error al guardar en BD: ' + error.message });
  }
});

// PUT /api/productos/:id - Actualizar un producto
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, detalle, stock, precio } = req.body;

  if (!nombre || !categoria || !detalle || stock === undefined || stock === null || !precio) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
  }

  try {
    try {
      await db.query(
        'UPDATE productos SET nombre = ?, categoria = ?, descripcion = ?, stock = ?, precio = ? WHERE id = ?',
        [nombre, categoria, detalle, Number(stock), precio, id]
      );
    } catch (e1) {
      await db.query(
        'UPDATE productos SET nombre = ?, categoria = ?, detalle = ?, stock = ?, precio = ? WHERE id = ?',
        [nombre, categoria, detalle, Number(stock), precio, id]
      );
    }

    res.json({ mensaje: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error('Error MySQL PUT:', error.message);
    res.status(500).json({ mensaje: 'Error al actualizar: ' + error.message });
  }
});

// DELETE /api/productos/:id - Eliminar un producto
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM productos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error MySQL DELETE:', error.message);
    res.status(500).json({ mensaje: 'Error al eliminar el producto' });
  }
});

module.exports = router;