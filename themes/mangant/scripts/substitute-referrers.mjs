#!/usr/bin/env node
// SPDX-License-Identifier: MIT

/**
 * Replaces the referrer placeholders in the built bundle with the real CDN
 * hosts and origin of a deployment.
 *
 * Sources always keep generic placeholders (`*.example.org`). Only the
 * generated `dist/runtime.js` is rewritten, so a real domain can never end up
 * in a committed file. The manifest generator runs afterwards and reads the
 * substituted map from the bundled adapter.
 *
 * Values come from `referrer-headers.config.json` (gitignored, local use) or,
 * when the file is absent, from `REFERRER_*` environment variables (CI).
 * Both use the same shape: placeholder key -> real value.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const packageDir = process.cwd();
const distBundlePath = join(packageDir, 'dist', 'runtime.js');
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

const configured = Object.keys(replacements).length;
if (!existsSync(distBundlePath)) {
  throw new Error(
    `${distBundlePath} is missing. Run "pnpm build" before substituting referrers.`,
  );
}

if (configured === 0) {
  console.log(
    'No referrer values configured; keeping placeholders. The app can still ' +
      'learn the working referrer at runtime.',
  );
  process.exit(0);
}

let bundle = readFileSync(distBundlePath, 'utf8');

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
writeFileSync(distBundlePath, bundle);

const remaining = placeholders.filter((placeholder) => mapBody.includes(placeholder));
console.log(
  `Substituted ${configured} referrer value(s) in dist/runtime.js` +
    (remaining.length > 0 ? `; placeholders left: ${remaining.join(', ')}` : ''),
);
