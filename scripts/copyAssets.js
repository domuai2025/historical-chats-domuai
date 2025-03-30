// Copy uploads directory to dist folder for deployment

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Source directories to copy
const uploadsSrc = path.join(rootDir, 'uploads');
const dataSrc = path.join(rootDir, 'data');

// Destination directories
const uploadsDest = path.join(rootDir, 'dist', 'uploads');
const dataDest = path.join(rootDir, 'dist', 'data');

// Function to recursively copy a directory
function copyDir(src, dest) {
  // Create the destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
    console.log(`Created directory: ${dest}`);
  }

  // Read all files/directories in the source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      copyDir(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  }
}

// Copy uploads directory if it exists
if (fs.existsSync(uploadsSrc)) {
  console.log('Copying uploads directory to dist folder...');
  copyDir(uploadsSrc, uploadsDest);
  console.log('Uploads directory copied successfully!');
} else {
  console.log('Uploads directory not found - skipping');
}

// Copy data directory if it exists
if (fs.existsSync(dataSrc)) {
  console.log('Copying data directory to dist folder...');
  copyDir(dataSrc, dataDest);
  console.log('Data directory copied successfully!');
} else {
  console.log('Data directory not found - skipping');
}

console.log('Asset copying complete!');
