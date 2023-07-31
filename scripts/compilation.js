import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import * as sass from 'sass';
import { fileURLToPath } from 'url';

// Derive __dirname from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const staticFiles = ['manifest.json'];

function ensureOutputDir() {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log(`Created directory: ${distDir}`);
  }
}

function compileTypeScriptFiles() {
  const tscCommand = 'tsc';
  const configFilePath = 'tsconfig.json';
  const compilerOptions = '--project ' + configFilePath;

  exec(`${tscCommand} ${compilerOptions}`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error occurred during TypeScript compilation:', error);
      return;
    }

    if (stderr) {
      console.error('TypeScript compilation warnings:', stderr);
    }

    console.log('TypeScript files compiled successfully!');
  });
}


function compileAndMinifySass() {
  const scssFile = path.join(rootDir, 'styles.scss');
  const cssFile = path.join(distDir, 'styles.css');

  if (fs.existsSync(scssFile)) {
    sass.render({
      file: scssFile,
      outFile: cssFile,
      outputStyle: 'compressed',
      sourceMap: true
    }, function (error, result) {
      if (!error) {
        fs.writeFileSync(cssFile, result.css);
        fs.writeFileSync(path.join(distDir, 'styles.css.map'), result.map);
        console.log('SCSS has been compiled and minified. Source map has been generated.');
      } else {
        console.error('Error compiling SCSS:', error);
      }
    });
  } else {
    console.error(`Error: ${scssFile} does not exist.`);
  }
}

function copyStaticFiles() {
  staticFiles.forEach(file => {
    const sourcePath = path.join(rootDir, file);
    const destPath = path.join(distDir, file);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${file} to ${distDir}`);
    }
  });
}

function main() {
  // ensureOutputDir();
  compileTypeScriptFiles();
  // compileAndMinifySass();
  // copyStaticFiles();
  console.log('Output compiled files in /dist...');
}

main();
