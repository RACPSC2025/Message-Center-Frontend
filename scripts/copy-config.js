const fs = require('fs');
const path = require('path');

// config.js (IIFE) es copiado automáticamente por CRA desde public/ → build/.
// Este script verifica que llegó y reporta su presencia.
const configJsPath = path.join(__dirname, '../build/config.js');

try {
  if (fs.existsSync(configJsPath)) {
    console.log('✅ config.js presente en build/');
  } else {
    console.warn('⚠️  config.js no encontrado en build/ — verifica public/config.js');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error verificando config.js:', error);
  process.exit(1);
}
