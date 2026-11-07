const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function resetAdmin() {
    try {
        const hash = await bcrypt.hash('admin123', 10);
        await db.query(
            `INSERT INTO usuarios (email, nombre, password, rol) 
             VALUES ('admin@arcangel.com', 'Administrador Gabriel', ?, 'admin')
             ON DUPLICATE KEY UPDATE password = ?, rol = 'admin'`,
            [hash, hash]
        );
        console.log('✅ Usuario Administrador actualizado con éxito. Contraseña: admin123');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error al actualizar admin:', err.message);
        process.exit(1);
    }
}

resetAdmin();