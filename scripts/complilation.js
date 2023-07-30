// Run: ts-node scripts/distribution.ts
// Description: Cleans the dist directory and copies the app directory to the dist directory.

import * as fs from 'fs';
import * as path from 'path';

function cleanDistDir(): void {
  const distDir = path.join(__dirname, 'dist');
  try {
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir);
      console.log('Dist directory created.');
      return;
    }
    const files = fs.readdirSync(distDir);
    files.forEach(file => {
      const filePath = path.join(distDir, file);
      fs.unlinkSync(filePath); // Delete each file in the dist directory
    });
    console.log('Dist directory cleaned.');
  } catch (err) {
    console.error('Error cleaning dist directory:', err);
    throw err;
  }
}

// Create the Dist Directory
function createDist() {

}

// Compile SASS to CSS
function compileSass(): void {

}

// Compile Typescript
function compileTypescript(): void {

}

// Compress Images
function compressImages(): void {

}


