// Run: node scripts/compressor.js release, package, all
// Description: Compresses the build files into zip files for release.

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import archiver from 'archiver';
import { minimatch } from 'minimatch';
import { fileURLToPath } from 'url';

// Derive __dirname from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf-8"));
const projectName = packageJson.name;
const version = packageJson.version;

function getGitIgnorePatterns() {
  const gitIgnorePath = path.join(rootDir, '.gitignore');

  if (!fs.existsSync(gitIgnorePath)) {
    return [];
  }

  return fs.readFileSync(gitIgnorePath, 'utf-8')
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.startsWith('#'));
}

function getFilesToCompress() {
  const ignorePatterns = getGitIgnorePatterns();
  const allFiles = glob.sync('**/*', {
    cwd: rootDir,
    nodir: true,
    dot: true,  // Include dot files
    ignore: ['dist/**/*', 'node_modules/**/*', '.git/**/*']
  });
  return allFiles.filter(file => !ignorePatterns.some(pattern => minimatch(file, pattern)));
}

function compressFiles(prefix) {
  const outputPath = path.resolve(distDir, `${prefix}-${projectName}-${version}.zip`);
  const filesToCompress = getFilesToCompress();

  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level
  });

  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      console.warn(err);
    } else {
      throw err;
    }
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);
  filesToCompress.forEach(file => archive.file(path.join(rootDir, file), { name: file }));
  archive.finalize();

  console.log(`Files compressed into: ${outputPath}`);
}

const buildType = process.argv[2];

if (buildType === 'release' || buildType === 'all') {
  const releaseFiles = ['manifest.json', 'main.js', 'styles.css'];
  compressFiles('release');
}

if (buildType === 'package' || buildType === 'all') {
  compressFiles('package');
}
