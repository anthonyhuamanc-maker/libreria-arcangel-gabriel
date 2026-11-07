const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_arcangel_gabriel',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convertir explícitamente el pool para soportar async / await (Promises)
const promisePool = pool.promise();

promisePool.getConnection()
  .then(connection => {
    console.log('🟢 Conexión exitosa a MySQL en Clever Cloud');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error de conexión a MySQL:', err.message);
  });

module.exports = promisePool;