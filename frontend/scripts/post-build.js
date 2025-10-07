const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const platform = args[0]; // 'web' o 'mobile'

if (!platform || !['web', 'mobile'].includes(platform)) {
  console.error('Usage: node post-build.js <web|mobile>');
  process.exit(1);
}

const sourcePath = path.join('www', platform, `index.${platform}.html`);
const targetPath = path.join('www', platform, 'index.html');

try {
  if (fs.existsSync(sourcePath)) {
    fs.renameSync(sourcePath, targetPath);
    console.log(`✅ Renamed ${sourcePath} to ${targetPath}`);
  } else {
    console.log(`ℹ️  Source file ${sourcePath} not found, skipping rename`);
  }
} catch (error) {
  console.error(`❌ Error renaming file: ${error.message}`);
  process.exit(1);
}
