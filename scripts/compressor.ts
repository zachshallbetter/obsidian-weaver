// Run: npm run build:compressor -- release, package, all
// Description: Compresses the build files into zip files for release.

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import * as glob from 'glob';
import * as child_process from 'child_process';
import { version, name as projectName } from '../package.json';
import minimatch from 'minimatch';

const inputDir = path.resolve(__dirname, 'app');
const distDir = path.resolve(__dirname, 'dist');

function getFilesToCompress(sourceDir) {
  const ignorePatterns = fs.readFileSync(path.join(sourceDir, '.gitignore'), 'utf-8')
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.startsWith('#'));

  const allFiles = glob.sync('**/*', {
    cwd: sourceDir,
  });

  const filesToCompress = allFiles.filter(file => !ignorePatterns.some(pattern => minimatch(file, pattern)));

  return filesToCompress;
}

function compressFiles(sourceDir, targetDir, prefix, filesToCompress) {
  const gzipFiles: string[] = [];

  for (const file of filesToCompress) {
    const filePath = path.resolve(sourceDir, file);

    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${file}`);
      continue;
    }

    const outputPath = path.resolve(targetDir, `${prefix}-${projectName}-${version}-${file}.gz`);
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(outputPath);
    const gzip = zlib.createGzip();

    input.pipe(gzip).pipe(output);
    gzipFiles.push(outputPath);
  }

  return gzipFiles;
}

function createZip(zipPath, filepaths) {
  const zipArgs = ['--junk-paths', '-r', zipPath, ...filepaths];
  child_process.spawnSync('zip', zipArgs, { stdio: 'inherit' });
  console.log(`Zip file created: ${zipPath}`);
}

const buildType = process.argv[2];

if (buildType === 'release' || buildType === 'all') {
  const releaseFiles = ['manifest.json', 'main.js', 'style.css'];
  const releaseGzipFiles = compressFiles(inputDir, distDir, 'release', releaseFiles);
  const releaseZipPath = path.resolve(distDir, `release-${projectName}-${version}.zip`);
  createZip(releaseZipPath, releaseGzipFiles);
}

if (buildType === 'package' || buildType === 'all') {
  const packageFiles = getFilesToCompress(inputDir);
  const packageGzipFiles = compressFiles(inputDir, distDir, 'package', packageFiles);
  const packageZipPath = path.resolve(distDir, `package-${projectName}-${version}.zip`);
  createZip(packageZipPath, packageGzipFiles);
}
