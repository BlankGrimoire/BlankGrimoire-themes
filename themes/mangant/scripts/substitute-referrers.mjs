#!/usr/bin/env node
// SPDX-License-Identifier: MIT

/**
 * Prepares `dist/runtime.js` for publication.
 *
 * Two rewrites happen here, both on the generated bundle only:
 *
 * 1. The `version` field is set from `package.json`. A changeset bumps the
 *    package version, so the bundle must follow it; the manifest generator
 *    rejects a bundle whose version differs from the package.
 * 2. The referrer placeholders (`*.example.org`) are replaced with the real
 *    CDN hosts and origin of a deployment.
 *
 * Sources always keep generic placeholders, so a real domain can never end up
 * in a committed file. Values come from `referrer-headers.config.json`
 * (gitignored, local use) or, when the file is absent, from `REFERRER_*`
 * environment variables (CI).
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const packageDir = process.cwd();
const distBundlePath = join(packageDir, 'dist', 'runtime.js');
const packagePath = join(packageDir, 'package.json');
const configPath = join(packageDir, 'referrer-headers.config.json');

const placeholders = [
  'cdn.example.org',
  'img-r1.example.org',
  'img-r2.example.org',
  'imgs-2.example.org',
  'https://example.org/',
];

const environmentValues = {
  'cdn.example.org': process.env.REFERRER_CDN,
  'img-r1.example.org': process.env.REFERRER_IMG_R1,
  'img-r2.example.org': process.env.REFERRER_IMG_R2,
  'imgs-2.example.org': process.env.REFERRER_IMGS_2,
  'https://example.org/': process.env.REFERRER_ORIGIN,
};

function clean(value) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed.length > 0 && trimmed !== 'undefined' ? trimmed : undefined;
}

const replacements = {};

for (const placeholder of placeholders) {
  const value = clean(environmentValues[placeholder]);
  if (value && value !== placeholder) {
    replacements[placeholder] = value;
  }
}

if (existsSync(configPath)) {
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  for (const [placeholder, value] of Object.entries(config)) {
    const real = clean(value);
    if (real && real !== placeholder) {
      replacements[placeholder] = real;
    }
  }
}

if (!existsSync(distBundlePath)) {
  throw new Error(
    `${distBundlePath} is missing. Run "pnpm build" before preparing the bundle.`,
  );
}

let bundle = readFileSync(distBundlePath, 'utf8');

// The package version is the single source of truth. Changesets bump
// `package.json` only, so the bundle version must be injected here.
const packageJSON = JSON.parse(readFileSync(packagePath, 'utf8'));
const versionPattern = /(\n\s*version:\s*)"[^"]*"/;
if (!versionPattern.test(bundle)) {
  throw new Error(`${distBundlePath} does not export a version field.`);
}
bundle = bundle.replace(
  versionPattern,
  (_match, prefix) => `${prefix}${JSON.stringify(packageJSON.version)}`,
);

const configured = Object.keys(replacements).length;
if (configured > 0) {
  // Only the referrer map may contain deployment-specific hosts. The detection
  // signature stays generic so it keeps matching the committed detection.json.
  const mapPattern = /(referrerHeaders\s*:\s*\{)([\s\S]*?)(\})/;
  const mapMatch = bundle.match(mapPattern);
  if (!mapMatch) {
    throw new Error(
      `${distBundlePath} does not export a referrerHeaders map; cannot substitute.`,
    );
  }

  let mapBody = mapMatch[2];
  for (const [placeholder, real] of Object.entries(replacements)) {
    mapBody = mapBody.split(placeholder).join(real);
  }

  bundle = bundle.replace(mapPattern, (_match, head, _body, tail) => head + mapBody + tail);

  const remaining = placeholders.filter((placeholder) => mapBody.includes(placeholder));
  console.log(
    `Substituted ${configured} referrer value(s) in dist/runtime.js` +
      (remaining.length > 0 ? `; placeholders left: ${remaining.join(', ')}` : ''),
  );
} else {
  console.log(
    'No referrer values configured; keeping placeholders. The app can still ' +
      'learn the working referrer at runtime.',
  );
}

writeFileSync(distBundlePath, bundle);
