-- 1. Base de Datos
CREATE DATABASE IF NOT EXISTS db_arcangel_gabriel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_arcangel_gabriel;

-- 2. Tabla Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- 3. Tabla Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'operador') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asegurar columnas si la tabla usuarios existía previamente
ALTER TABLE usuarios ADD COLUMN password VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN rol ENUM('admin', 'operador') DEFAULT 'admin';

-- 4. Tabla Productos
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    categoria_id INT NOT NULL,
    categoria VARCHAR(100) DEFAULT 'Papelería',
    detalle TEXT,
    stock INT DEFAULT 0,
    precio VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_productos_categorias FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

-- 5. Tabla Cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Semilla Categorías
INSERT IGNORE INTO categorias (id, nombre) VALUES 
(1, 'Papelería'), 
(2, 'Packs'), 
(3, 'Servicio'), 
(4, 'Arte'), 
(5, 'Otros');

-- 7. Semilla Usuario Administrador (Password: admin123)
INSERT IGNORE INTO usuarios (id, nombre, email, password, rol) VALUES 
(1, 'Administrador Gabriel', 'admin@arcangel.com', '$2a$10$w0/lUvgkvdQyXqg4QYf5/.1lHh732G2rD53XWpA6V8z.Wl.YhN86S', 'admin');

-- 8. Semilla Productos
INSERT IGNORE INTO productos (id, nombre, categoria_id, categoria, detalle, stock, precio) VALUES 
(1, 'Cuaderno Universitario A4', 1, 'Papelería', '100 hojas cuadriculadas Standford', 45, 'S/ 6.50'),
(2, 'Lista Escolar Completa', 2, 'Packs', 'Primaria / Secundaria personalizada', 2, 'Cotizar'),
(3, 'Impresiones y Copias', 3, 'Servicio', 'Blanco/Negro y Color', 100, 'S/ 0.20'),
(4, 'Set de Témperas y Pinceles', 4, 'Arte', 'Kit Faber Castell 12 colores', 3, 'S/ 12.00');