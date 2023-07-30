// Usage: node scripts/versioning.ts
// Description: Bumps the version in package.json and creates a git tag for the new version.

import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

// Read version from package.json.
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
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
  const currentVersionParts = currentVersion.split(".");
  const latestTagParts = latestTag.split(".");
  const major = parseInt(currentVersionParts[0]);
  const minor = parseInt(currentVersionParts[1]);
  const patch = parseInt(currentVersionParts[2]);
  const latestTagPatch = parseInt(latestTagParts[2]);
  if (major > latestTagParts[0] || minor > latestTagParts[1]) {
    return `${major}.${minor}.0`;
  } else if (patch > latestTagPatch) {
    return `${major}.${minor}.${patch + 1}`;
  } else {
    return `${major}.${minor}.${latestTagPatch + 1}`;
  }
}