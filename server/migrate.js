const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function ejecutarMigracion() {
    console.log('🔄 Iniciando migración de la base de datos...');
    try {
        const sqlPath = path.join(__dirname, 'schema.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Limpiar comentarios SQL y dividir consultas
        const queries = sqlContent
            .split(';')
            .map(q => q.replace(/--.*$/gm, '').trim())
            .filter(q => q.length > 0);

        for (const query of queries) {
            try {
                await db.query(query);
            } catch (err) {
                // Ignorar advertencias si la columna o clave ya existía
                if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEYNAME') {
                    continue;
                }
            }
        }

        console.log('✅ Migración y persistencia de base de datos completada con éxito.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al ejecutar el script de migración:', error.message);
        process.exit(1);
    }
}

ejecutarMigracion();