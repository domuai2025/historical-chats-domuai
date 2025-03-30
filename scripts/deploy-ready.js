// deploy-ready.js
// This script prepares the project for deployment by copying required assets
// Run this script before deployment to ensure all necessary files are included

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const directories = [
  { src: 'uploads', dest: 'dist/uploads' },
  { src: 'data', dest: 'dist/data' }
];

// Create dist directory if it doesn't exist
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log(`Created dist directory: ${distDir}`);
}

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
      console.log(`Copied: ${srcPath} → ${destPath}`);
    }
  }
}

// Copy all configured directories
for (const dir of directories) {
  const srcPath = path.join(rootDir, dir.src);
  const destPath = path.join(rootDir, dir.dest);
  
  if (fs.existsSync(srcPath)) {
    console.log(`\nCopying ${dir.src} directory to ${dir.dest}...`);
    copyDir(srcPath, destPath);
    console.log(`✓ ${dir.src} directory copied successfully!`);
  } else {
    console.log(`\n⚠️ ${dir.src} directory not found - skipping`);
  }
}

// Create a simple .deployignore file to ensure uploads directory is included
const deployIgnorePath = path.join(rootDir, '.deployignore');
const deployIgnoreContent = `
# Standard node ignores
node_modules
.DS_Store

# Make sure to keep these important directories
!uploads/
!uploads/**/*
!dist/uploads/
!dist/uploads/**/*
!data/
!data/**/*
!dist/data/
!dist/data/**/*
`;

fs.writeFileSync(deployIgnorePath, deployIgnoreContent);
console.log(`\n✓ Created/Updated .deployignore file to include important directories`);

console.log('\n✅ Deployment preparation complete!');
console.log('Your project is now ready for deployment with all necessary files included.');