document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();

    const formProducto = document.getElementById('formProducto');
    if (formProducto) {
        formProducto.addEventListener('submit', guardarProducto);
    }
});

async function cargarProductos() {
    const tablaBody = document.getElementById('tablaProductosBody');
    if (!tablaBody) return;

    try {
        const response = await fetch('https://libreria-arcangel-gabriel-44ro.onrender.com/api/productos');
        const productos = await response.json();

        // 1. Actualizar métricas del panel
        actualizarMetricasProductos(productos);

        // 2. Renderizar filas en la tabla
        tablaBody.innerHTML = '';

        if (productos.length === 0) {
            tablaBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-3">No hay productos registrados en el inventario.</td>
                </tr>`;
            return;
        }

        productos.forEach(prod => {
            const stockNum = parseInt(prod.stock, 10);
            const esStockBajo = !isNaN(stockNum) && stockNum <= 5;
            
            const badgeStock = esStockBajo
                ? `<span class="badge bg-warning-subtle text-dark border border-warning fw-bold px-2 py-1"><i class="fa-solid fa-triangle-exclamation me-1"></i>${prod.stock} un. (Bajo)</span>`
                : `<span class="badge bg-success-subtle text-success border border-success fw-bold px-2 py-1">${prod.stock} un.</span>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-3 fw-bold text-muted">${prod.id}</td>
                <td class="fw-bold">${prod.nombre}</td>
                <td><span class="badge bg-secondary">${prod.categoria || 'Papelería'}</span></td>
                <td><small class="text-muted">${prod.descripcion || 'Sin descripción'}</small></td>
                <td>${badgeStock}</td>
                <td class="fw-semibold">${prod.precio}</td>
                <td class="text-end pe-3">
                    <button class="btn btn-warning btn-sm me-1 fw-semibold" onclick="prepararEdicion(${prod.id}, '${escapeQuotes(prod.nombre)}', '${escapeQuotes(prod.categoria)}', '${escapeQuotes(prod.detalle)}', ${prod.stock}, '${escapeQuotes(prod.precio)}')">
                        <i class="fa-solid fa-pen-to-square"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm fw-semibold" onclick="eliminarProducto(${prod.id})">
                        <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            tablaBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

function actualizarMetricasProductos(productos) {
    const totalElem = document.getElementById('totalProductos');
    const stockBajoElem = document.getElementById('stockBajoAlertas');

    if (totalElem) {
        totalElem.innerText = productos.length;
    }

    if (stockBajoElem) {
        const bajoStockCount = productos.filter(p => {
            const stockNum = parseInt(p.stock, 10);
            return !isNaN(stockNum) && stockNum <= 5;
        }).length;
        stockBajoElem.innerText = bajoStockCount;
    }
}

function escapeQuotes(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

async function guardarProducto(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('Sesión no válida.');

    const id = document.getElementById('productoId').value;
    const nombre = document.getElementById('nombreProducto').value.trim();
    const categoria = document.getElementById('categoriaProducto').value;
    const precio = document.getElementById('precioProducto').value.trim();
    const stock = document.getElementById('stockProducto').value;
    const detalle = document.getElementById('detalleProducto').value.trim();

    const payload = { nombre, categoria, precio, stock: Number(stock), detalle };
    const url = id ? `https://libreria-arcangel-gabriel-44ro.onrender.com/api/productos/${id}` : 'https://libreria-arcangel-gabriel-44ro.onrender.com/api/productos';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const modalElem = document.getElementById('modalProducto');
            const modal = bootstrap.Modal.getInstance(modalElem);
            if (modal) modal.hide();
            document.getElementById('formProducto').reset();
            document.getElementById('productoId').value = '';
            cargarProductos();
        } else {
            const err = await res.json();
            alert(err.mensaje || 'Error al guardar producto');
        }
    } catch (error) {
        console.error('Error al guardar:', error);
    }
}

function prepararEdicion(id, nombre, categoria, detalle, stock, precio) {
    document.getElementById('productoId').value = id;
    document.getElementById('nombreProducto').value = nombre;
    document.getElementById('categoriaProducto').value = categoria || 'Papelería';
    document.getElementById('precioProducto').value = precio;
    document.getElementById('stockProducto').value = stock;
    document.getElementById('detalleProducto').value = detalle;

    const titleElem = document.getElementById('modalProductoTitle');
    if (titleElem) titleElem.innerText = 'Editar Producto';

    const modalElem = document.getElementById('modalProducto');
    const modal = new bootstrap.Modal(modalElem);
    modal.show();
}

async function eliminarProducto(id) {
    const token = localStorage.getItem('token');
    if (!token) return alert('Debes iniciar sesión.');

    if (!confirm('¿Deseas eliminar este producto?')) return;

    try {
        const res = await fetch(`https://libreria-arcangel-gabriel-44ro.onrender.com/api/productos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            cargarProductos();
        } else {
            const err = await res.json();
            alert(err.mensaje || 'No tienes permisos para eliminar productos.');
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
    }
}