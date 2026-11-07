const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware');

// GET: Obtener todas las cotizaciones (Protegido)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cotizaciones ORDER BY fecha_envio DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener cotizaciones' });
    }
});

// POST: Registrar nueva cotización desde la web (Público)
router.post('/', async (req, res) => {
    const { cliente_nombre, telefono, email, mensaje } = req.body;

    if (!cliente_nombre || !telefono || !email || !mensaje) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    try {
        await db.query(
            'INSERT INTO cotizaciones (cliente_nombre, telefono, email, mensaje) VALUES (?, ?, ?, ?)',
            [cliente_nombre, telefono, email, mensaje]
        );
        res.status(201).json({ mensaje: 'Cotización enviada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al guardar la cotización' });
    }
});

// DELETE: Limpiar todas las cotizaciones (Protegido)
router.delete('/', authMiddleware, async (req, res) => {
    try {
        await db.query('DELETE FROM cotizaciones');
        res.json({ mensaje: 'Historial de cotizaciones limpiado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar cotizaciones' });
    }
});

module.exports = router;