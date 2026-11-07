document.addEventListener('DOMContentLoaded', () => {
  // Coordenadas exactas: Jr. Unión Mz. K3 Lote 13, VMT
  const latLocal = -12.196202;
  const lngLocal = -76.929241;

  // 1. Inicializar Mapa Leaflet con zoom cercano (nivel 18)
  const map = L.map('map').setView([latLocal, lngLocal], 18);

  // 2. Capa visual OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  // 3. Marcador exacto del local
  L.marker([latLocal, lngLocal]).addTo(map)
    .bindPopup('<b>Librería Arcángel Gabriel</b><br>Jr. Unión Mz. K3 Lote 13<br>(Frente a I.E. 6024)')
    .openPopup();

  // 4. Servicio de Geolocalización para el cliente
  const btnGeo = document.getElementById('btnGeolocalizar');
  const geoStatus = document.getElementById('geoStatus');

  if (btnGeo) {
    btnGeo.addEventListener('click', () => {
      if (!navigator.geolocation) {
        geoStatus.className = 'form-text text-danger d-block text-center mt-2';
        geoStatus.innerText = 'La geolocalización no es soportada por tu navegador.';
        return;
      }

      geoStatus.className = 'form-text text-primary d-block text-center mt-2';
      geoStatus.innerText = 'Obteniendo tu ubicación...';

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          map.setView([userLat, userLng], 16);
          L.marker([userLat, userLng]).addTo(map)
            .bindPopup('<b>Tu Ubicación Actual</b><br>Punto detectado para envío.')
            .openPopup();

          geoStatus.className = 'form-text text-success d-block text-center mt-2';
          geoStatus.innerText = '¡Ubicación detectada exitosamente!';
        },
        (error) => {
          geoStatus.className = 'form-text text-danger d-block text-center mt-2';
          geoStatus.innerText = 'No se pudo obtener el acceso a tu ubicación.';
        }
      );
    });
  }
});