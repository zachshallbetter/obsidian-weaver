
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf-8"));
} catch (error) {
  console.error("Error reading package.json:", error);
  process.exit(1);
}

const manifest = {
  'id': packageJson.name,
  'name': 'Weaver',
  'author': packageJson.author,
  'authorUrl': packageJson.authorUrl,
  'version': packageJson.version,
  'minAppVersion': '1.3.5',
  'description': packageJson.description,
  'isDesktopOnly': true
};

const manifestPath = path.join(distDir, "manifest.json");

if (fs.existsSync(manifestPath)) {
  const existingManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  if (existingManifest.version === manifest.version) {
    console.log(`Manifest version ${manifest.version} already exists.`);
    process.exit(0);
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Manifest version ${manifest.version} has been created.`);
