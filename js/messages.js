document.addEventListener('DOMContentLoaded', () => {
    cargarCotizaciones();

    const btnLimpiar = document.getElementById('btnLimpiarCotizaciones');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarCotizaciones);
    }
});

async function cargarCotizaciones() {
    const token = localStorage.getItem('token');
    const tablaBody = document.getElementById('tablaCotizacionesBody');
    const totalCotElem = document.getElementById('totalCotizaciones');

    if (!token || !tablaBody) return;

    try {
        const response = await fetch('http://localhost:5000/api/cotizaciones', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error('Error al obtener cotizaciones:', response.statusText);
            return;
        }

        const cotizaciones = await response.json();

        // 1. Actualizar contador en la tarjeta verde
        if (totalCotElem) {
            totalCotElem.innerText = cotizaciones.length;
        }

        // 2. Renderizar tabla de mensajes
        tablaBody.innerHTML = '';

        if (cotizaciones.length === 0) {
            tablaBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-3">No hay solicitudes registradas actualmente.</td>
                </tr>`;
            return;
        }

        cotizaciones.forEach(cot => {
            const fecha = new Date(cot.fecha_envio).toLocaleString('es-PE');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-3"><small class="text-muted">${fecha}</small></td>
                <td class="fw-bold">${cot.cliente_nombre}</td>
                <td><a href="https://wa.me/51${cot.telefono}" target="_blank" class="text-decoration-none text-success fw-semibold"><i class="fa-brands fa-whatsapp me-1"></i>${cot.telefono}</a></td>
                <td>${cot.email}</td>
                <td>${cot.mensaje}</td>
            `;
            tablaBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error de conexión al cargar cotizaciones:', error);
    }
}

async function limpiarCotizaciones() {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!confirm('¿Estás seguro de que deseas borrar todo el historial de solicitudes?')) return;

    try {
        const response = await fetch('http://localhost:5000/api/cotizaciones', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            cargarCotizaciones();
        } else {
            alert('Error al limpiar mensajes');
        }
    } catch (error) {
        console.error('Error al limpiar cotizaciones:', error);
    }
}