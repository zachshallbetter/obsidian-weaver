import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// Get the output directory from the environment variable or default to 'dist/obsidian-weaver'
const outputDir = path.join(process.env.PLUGIN_OUTPUT_DIR || 'dist', 'obsidian-weaver');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
}

// Compile TypeScript in watch mode
exec('tsc -w', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});

// List of static files to copy
const staticFiles = ['styles.css', 'manifest.json'];

staticFiles.forEach(file => {
    const sourcePath = path.join(__dirname, '..', file);
    const destPath = path.join(outputDir, file);

    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${file} to ${outputDir}`);
    }
});

// Watch the output directory for changes
fs.watch(outputDir, (eventType, filename) => {
    if (['main.js', 'styles.css'].includes(filename)) {
        // If main.js or styles.css has changed, trigger your hot-reloading functionality here
        console.log(`${filename} has changed. Reloading plugin...`);
    }
});

console.log('Watching for changes...');
