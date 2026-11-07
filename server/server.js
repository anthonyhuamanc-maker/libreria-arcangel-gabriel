const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Conexión a la Base de Datos
const db = require('./config/db');

// Importación de Rutas
const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const cotizacionesRoutes = require('./routes/cotizaciones');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Registro de Endpoint Endpoints API
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/cotizaciones', cotizacionesRoutes);

// Ruta Raíz
app.get('/', (req, res) => {
    res.send('API REST de Librería Arcángel Gabriel funcionando correctamente');
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});