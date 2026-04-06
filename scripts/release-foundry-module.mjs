#!/usr/bin/env node
/**
 * Publish a new release of the Foundry module.
 *
 * Usage:
 *   pnpm foundry:release patch   # 1.0.2 → 1.0.3
 *   pnpm foundry:release minor   # 1.0.2 → 1.1.0
 *   pnpm foundry:release major   # 1.0.2 → 2.0.0
 *   pnpm foundry:release 1.2.3   # explicit version
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, createWriteStream } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGzip } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const MODULE_JSON = resolve(ROOT, 'foundry-module/module.json');
const CONNECTOR_REPO = 'RebelliousSmile/sheet-magnet-connector';
const CONNECTOR_DIR = '/tmp/sheet-magnet-connector';

// ── Helpers ──────────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function runCapture(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

function bumpVersion(current, bump) {
  const [major, minor, patch] = current.split('.').map(Number);
  if (bump === 'major') return `${major + 1}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  if (bump === 'patch') return `${major}.${minor}.${patch + 1}`;
  // Explicit version
  if (/^\d+\.\d+\.\d+$/.test(bump)) return bump;
  throw new Error(`Invalid bump type: ${bump}. Use patch, minor, major, or x.y.z`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

const bump = process.argv[2] || 'patch';

// Read and update module.json
const moduleJson = JSON.parse(readFileSync(MODULE_JSON, 'utf8'));
const oldVersion = moduleJson.version;
const newVersion = bumpVersion(oldVersion, bump);
moduleJson.version = newVersion;
writeFileSync(MODULE_JSON, JSON.stringify(moduleJson, null, 2) + '\n');
console.log(`\n📦 ${oldVersion} → ${newVersion}\n`);

// Check GH_TOKEN
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) {
  console.error('❌ GITHUB_TOKEN or GH_TOKEN env var is required');
  process.exit(1);
}

// Sync connector repo
console.log('🔄 Syncing connector repo...');
run(`rm -rf ${CONNECTOR_DIR}`);
run(`git clone https://x-access-token:${token}@github.com/${CONNECTOR_REPO}.git ${CONNECTOR_DIR}`);
run(`cp -r ${ROOT}/foundry-module/. ${CONNECTOR_DIR}/`);
run(`git -C ${CONNECTOR_DIR} config user.name "github-actions[bot]"`);
run(`git -C ${CONNECTOR_DIR} config user.email "github-actions[bot]@users.noreply.github.com"`);
run(`git -C ${CONNECTOR_DIR} add -A`);
run(`git -C ${CONNECTOR_DIR} commit -m "chore: release v${newVersion}"`);
run(`git -C ${CONNECTOR_DIR} push origin main`);

// Create zip
const zipPath = `/tmp/sheet-magnet-connector.zip`;
console.log('\n📁 Creating zip...');
run(`cd ${ROOT}/foundry-module && zip -r ${zipPath} .`);

// Create GitHub release
console.log('\n🚀 Creating GitHub release...');
run(
  `GH_TOKEN=${token} gh release create "v${newVersion}" ${zipPath} ` +
  `--title "v${newVersion}" ` +
  `--notes "Released from sheetmagnet monorepo" ` +
  `--repo ${CONNECTOR_REPO}`,
);

// Commit version bump in monorepo
run(`git -C ${ROOT} add foundry-module/module.json`);
run(`git -C ${ROOT} commit -m "chore: bump foundry module to v${newVersion}"`);
run(`git -C ${ROOT} push origin main`);

console.log(`\n✅ Released v${newVersion}`);
console.log(`   https://github.com/${CONNECTOR_REPO}/releases/tag/v${newVersion}\n`);
