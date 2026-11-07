document.addEventListener('DOMContentLoaded', () => {
    // 1. MANEJO DEL FORMULARIO DE COTIZACIÓN WEB
    const contactForm = document.getElementById('contactForm');
    const formAlert = document.getElementById('formAlert');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombre = document.getElementById('nombre').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const email = document.getElementById('email').value.trim();
            const mensaje = document.getElementById('mensaje').value.trim();

            if (!nombre || !telefono || !mensaje) {
                mostrarAlerta('Por favor completa todos los campos obligatorios (*).', 'danger');
                return;
            }

            try {
                const response = await fetch('https://libreria-arcangel-gabriel-44ro.onrender.com/api/cotizaciones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({
                    nombre: nombre,
                    cliente_nombre: nombre,
                    telefono: telefono,
                    email: email || 'Sin correo',
                    mensaje: mensaje
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    mostrarAlerta('¡Solicitud enviada con éxito! Tu mensaje ha sido registrado.', 'success');
                    contactForm.reset();
                } else {
                    mostrarAlerta(data.mensaje || 'Error al enviar la solicitud.', 'danger');
                }
            } catch (error) {
                console.error('Error al enviar cotización:', error);
                mostrarAlerta('No se pudo conectar con el servidor backend.', 'danger');
            }
        });
    }

    function mostrarAlerta(mensaje, tipo) {
        if (formAlert) {
            formAlert.className = `alert alert-${tipo} mb-3`;
            formAlert.innerText = mensaje;
            formAlert.classList.remove('d-none');
        }
    }

    // 2. MANEJO DEL FORMULARIO DE INICIO DE SESIÓN (LOGIN ADMIN)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            try {
                const response = await fetch('https://libreria-arcangel-gabriel-44ro.onrender.com/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Guardar datos de sesión en localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('usuario', JSON.stringify(data.usuario));
                    
                    // Redirigir al panel administrativo
                    window.location.href = 'dashboard.html';
                } else {
                    alert(data.mensaje || 'Credenciales incorrectas');
                }
            } catch (error) {
                console.error('Error en login:', error);
                alert('No se pudo conectar con el servidor de autenticación');
            }
        });
    }
});