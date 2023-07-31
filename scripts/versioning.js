
// Usage: node scripts/versioning.ts
// Description: Bumps the version in package.json and creates a git tag for the new version.

import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import packageJson from '../package.json' assert { type: 'json' };

const currentVersion = packageJson.version;

// Get latest git tag.
const latestTagCommand = "git describe --abbrev=0 --tags";
const latestTag = execSync(latestTagCommand, { encoding: "utf8" }).trim();

// Compare current version to latest tag and bump both to next version.
const nextVersion = getNextVersion(currentVersion, latestTag);
packageJson.version = nextVersion;
writeFileSync("package.json", JSON.stringify(packageJson, null, "\t"));

// Create git tag for new version.
const newTag = `v${nextVersion}`;
const tagMessage = `Release ${newTag}`;
const createTagCommand = `git tag -a ${newTag} -m "${tagMessage}"`;
execSync(createTagCommand);

console.log(`Version ${nextVersion} has been set in package.json and a git tag has been created.`);

function getNextVersion(currentVersion, latestTag) {
  // ... [Rest of the function logic]
}
