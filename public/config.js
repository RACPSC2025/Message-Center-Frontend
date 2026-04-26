// ============================================
// Configuración de Rutas — Editable por Proyecto
// ============================================
// Este archivo permite reutilizar el mismo compilado
// en distintos entornos. Solo modifique los valores
// aquí según el entorno de despliegue.
// ============================================
(function () {
  var host = window.location.hostname;
  var apiUrl;
  var baseName;
  var environment;
  var version = '0.3.6';

  // Localhost — Docker local (puerto 8080)
  if (host === 'localhost' || host === '127.0.0.1') {
    apiUrl      = 'http://localhost:8080/';
    baseName    = '/message-center';
    environment = 'local';
  }

  // Ocensa Ambiental — DEV
  else if (host.includes('ocensacentral.dev.sofacto.info')) {
    apiUrl      = 'https://ocensacentral.dev.sofacto.info/ambiental/';
    baseName    = '/ambiental/message-center';
    environment = 'development';
  }

  // Ocensa Ambiental — PRE / PRODUCCIÓN
  else if (host.includes('ocensa.amatia.cloud')) {
    apiUrl      = 'https://ocensa.amatia.cloud/ambiental/';
    baseName    = '/ambiental/message-center';
    environment = 'production';
  }

  // Fallback — usa dev si el host no coincide
  else {
    apiUrl      = 'https://ocensacentral.dev.sofacto.info/ambiental/';
    baseName    = '/ambiental/message-center';
    environment = 'production';
  }

  window.__APP_CONFIG__ = {
    apiUrl:      apiUrl,
    baseName:    baseName,
    environment: environment,
    version:     version
  };
})();
