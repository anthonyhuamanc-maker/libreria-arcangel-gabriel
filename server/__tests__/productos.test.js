const request = require('supertest');
const app = require('../server'); // Importamos tu servidor

// Simulamos la conexión a la base de datos
jest.mock('../config/db', () => {
    return {
        query: jest.fn().mockResolvedValue([
            // Esto es lo que la base de datos "falsa" devolverá para la prueba
            [
                { id: 1, nombre: 'Biblia de Estudio', precio: 120.00, stock: 5 },
                { id: 2, nombre: 'Rosario de Madera', precio: 15.00, stock: 20 }
            ]
        ])
    };
});

describe('Pruebas de Integración - API de Productos', () => {
    
    test('GET /api/productos debería devolver estado 200 y una lista de productos', async () => {
        // Hacemos una petición simulada a la ruta
        const response = await request(app).get('/api/productos');
        
        // Verificamos que la respuesta sea 200 (OK)
        expect(response.status).toBe(200);
        
        // Verificamos que la respuesta sea un arreglo (lista)
        expect(Array.isArray(response.body)).toBe(true);
        
        // Verificamos que el primer producto sea el que simulamos
        expect(response.body[0]).toHaveProperty('nombre', 'Biblia de Estudio');
        expect(response.body[0]).toHaveProperty('precio', 120.00);
    });

});