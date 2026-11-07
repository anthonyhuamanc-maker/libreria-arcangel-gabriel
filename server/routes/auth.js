const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// POST: Login de Usuarios
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ mensaje: 'Email y contraseña requeridos.' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
        }

        const usuario = rows[0];
        const userPasswordHash = usuario.password || usuario.contrasena;

        if (!userPasswordHash) {
            return res.status(401).json({ mensaje: 'La cuenta existe pero no tiene contraseña asignada.' });
        }

        const match = await bcrypt.compare(password, userPasswordHash);

        if (!match) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol || 'admin' },
            process.env.JWT_SECRET || 'secreto_super_seguro',
            { expiresIn: '8h' }
        );

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol || 'admin'
            }
        });
    } catch (error) {
        console.error('Error interno en Login:', error);
        res.status(500).json({ mensaje: 'Error al autenticar: ' + error.message });
    }
});

module.exports = router;