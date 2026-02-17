const fs = require('fs');
const path = require('path');

// Copy config.json to build folder after build
const sourcePath = path.join(__dirname, '../public/config.json');
const destPath = path.join(__dirname, '../build/config.json');

try {
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log('✅ config.json copied to build folder');
  } else {
    console.warn('⚠️  config.json not found in public folder');
  }
} catch (error) {
  console.error('❌ Error copying config.json:', error);
  process.exit(1);
}