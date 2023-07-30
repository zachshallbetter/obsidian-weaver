// Run: ts-node scripts/manifest.ts
// Description: Reads the package.json file and outputs a manifest.json file in the dist directory.

import * as fs from 'fs';

let packageJson;
try {
    packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
} catch (error) {
    console.error("Error reading package.json:", error);
    process.exit(1);
}

const manifest = {
    'name' : packageJson.name,
    'version' : packageJson.version,
    'description' : packageJson.description,
    'main' : packageJson.main,
    'dependencies' : packageJson.dependencies,
    'devDependencies' : packageJson.devDependencies
};

const manifestPath = "dist/manifest.json";

if (fs.existsSync(manifestPath)) {
  const existingManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (existingManifest.version === manifest.version) {
    console.log(`Manifest version ${manifest.version} already exists.`);
    process.exit(0);
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Manifest version ${manifest.version} has been created.`);