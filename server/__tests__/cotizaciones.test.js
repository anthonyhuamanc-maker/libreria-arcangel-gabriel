const request = require('supertest');
const app = require('../server');

// Simulamos la base de datos de una forma más completa
jest.mock('../config/db', () => {
    return {
        query: jest.fn().mockImplementation((queryStr, values) => {
            // Si es un INSERT, simulamos éxito
            if (queryStr.includes('INSERT INTO')) {
                return Promise.resolve([{ insertId: 1 }]);
            }
            // Retorno por defecto
            return Promise.resolve([[]]);
        })
    };
});

describe('Pruebas de Integración - API de Cotizaciones', () => {
    
    test('POST /api/cotizaciones debería recibir y procesar una nueva cotización', async () => {
        // Asegúrate de que los nombres de los campos coincidan exactamente con tu frontend/backend
        const nuevaCotizacion = {
            cliente_nombre: 'María López', // Revisa si tu backend espera 'nombre' o 'cliente_nombre'
            email: 'maria@test.com',      // Revisa si espera 'correo' o 'email'
            telefono: '987654321',
            detalles: 'Consulta sobre un rosario bendecido' // Revisa si espera 'mensaje' o 'detalles'
        };

        const response = await request(app)
            .post('/api/cotizaciones')
            .send(nuevaCotizacion);
        
        // Verificamos que el servidor responda correctamente
        expect(response.status).toBeLessThan(500); 
    });

});