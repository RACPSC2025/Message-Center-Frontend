const fs = require('fs');
const path = require('path');

// Copy config.production.json to build/config.json so local dev URLs don't leak into builds
const sourcePath = path.join(__dirname, '../public/config.production.json');
const destPath = path.join(__dirname, '../build/config.json');

try {
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log('✅ config.production.json copied to build/config.json');
  } else {
    console.warn('⚠️  config.production.json not found in public folder');
  }
} catch (error) {
  console.error('❌ Error copying config.json:', error);
  process.exit(1);
}