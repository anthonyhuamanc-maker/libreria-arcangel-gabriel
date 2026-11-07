const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, esAdmin } = require('../middleware/authMiddleware');

// Función para obtener ID de categoría válido
async function getCategoriaIdValido(nombreCat) {
    try {
        const [rows] = await db.query('SELECT * FROM categorias');
        if (rows.length > 0) {
            const encontrada = rows.find(c => 
                (c.nombre && c.nombre.toLowerCase() === nombreCat.toLowerCase()) ||
                (c.nombre_categoria && c.nombre_categoria.toLowerCase() === nombreCat.toLowerCase()) ||
                (c.categoria && c.categoria.toLowerCase() === nombreCat.toLowerCase())
            );
            if (encontrada) return encontrada.id || encontrada.id_categoria || rows[0].id;
            return rows[0].id || rows[0].id_categoria || 1;
        }

        const [result] = await db.query('INSERT INTO categorias (nombre) VALUES (?)', [nombreCat || 'Papelería']);
        return result.insertId;
    } catch (err) {
        console.error('Error al obtener categoria_id:', err.message);
        return 1;
    }
}

// GET: Obtener todos los productos (Público)
router.get('/', async (req, res) => {
  try {
    const [productos] = await db.query('SELECT * FROM productos');
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ mensaje: 'Error al obtener productos' });
  }
});

// POST: Crear nuevo producto (Protegido)
router.post('/', authMiddleware, async (req, res) => {
    const { nombre, categoria, detalle, stock, precio } = req.body;

    if (!nombre || !categoria || !detalle || stock === undefined || stock === null || !precio) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    try {
        const catId = await getCategoriaIdValido(categoria);

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

// PUT: Actualizar producto (Protegido)
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

// DELETE: Eliminar producto (Protegido por rol Administrador)
router.delete('/:id', authMiddleware, esAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM productos WHERE id = ?', [id]);
        res.json({ mensaje: 'Producto eliminado correctamente por Administrador' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar producto' });
    }
});

module.exports = router;