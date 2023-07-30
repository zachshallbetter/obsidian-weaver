// Run: node scripts/compressor.js release, package, all
// Description: Compresses the build files into zip files for release.

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const archiver = require('archiver');
const { version, name: projectName } = require('../package.json');
const { minimatch } = require('minimatch')

const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

function getGitIgnorePatterns(sourceDir) {
  const gitIgnorePath = path.join(rootDir, '.gitignore');

  if (!fs.existsSync(gitIgnorePath)) {
    return [];
  }

  const ignorePatterns = fs.readFileSync(gitIgnorePath, 'utf-8')
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.startsWith('#'));

  return ignorePatterns;
}

function getFilesToCompress(sourceDir) {
  const ignorePatterns = getGitIgnorePatterns(sourceDir);

  const allFiles = glob.sync('**/*', {
    cwd: sourceDir,
  });

  const filesToCompress = allFiles.filter(file => !ignorePatterns.some(pattern => minimatch(file, pattern)));

  return filesToCompress;
}

function compressFiles(sourceDir, targetDir, prefix) {
  const outputPath = path.resolve(targetDir, `${prefix}-${projectName}-${version}.zip`);
  const filesToCompress = getFilesToCompress(sourceDir);
  compressDirectoryWithExclusions(sourceDir, outputPath, filesToCompress);
  return outputPath;
}

function compressDirectoryWithExclusions(sourceDir, outputPath, exclusions) {
  // Create a writable stream for the output zip file
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level
  });

  // Listen for archive completion
  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('Archiver has been finalized and the output file descriptor has closed.');
  });

  // Good practice to catch warnings (e.g. stat failures and other non-blocking errors)
  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      console.warn(err);
    } else {
      // Throw error for any other warnings
      throw err;
    }
  });

  // Good practice to catch this error explicitly
  archive.on('error', function (err) {
    throw err;
  });

  // Pipe archive data to the file
  archive.pipe(output);

  // Append the directory to the archive and apply exclusions
  archive.glob('**/*', {
    cwd: sourceDir,
    ignore: exclusions
  });

  // Finalize the archive
  archive.finalize();
}

function createZip(zipPath, filepaths) {
  const zipArgs = ['-r', zipPath, ...filepaths];
  try {
    child_process.spawnSync('zip', zipArgs, { stdio: 'inherit' });
} catch (error) {
    console.error('Error executing zip command:', error);
}
  console.log(`Zip file created: ${zipPath}`);
}

const buildType = process.argv[2];

if (buildType === 'release' || buildType === 'all') {
  const releaseFiles = ['manifest.json', 'main.js', 'style.css'];
  const releaseGzipFiles = compressFiles(rootDir, distDir, 'release', releaseFiles);
  const releaseZipPath = path.resolve(distDir, `release-${projectName}-${version}.zip`);
  createZip(releaseZipPath, releaseGzipFiles);
}

if (buildType === 'package' || buildType === 'all') {
  const packageGzipFiles = compressFiles(rootDir, distDir, 'package');
  const packageZipPath = path.resolve(distDir, `package-${projectName}-${version}.zip`);
  createZip(packageZipPath, packageGzipFiles);
}