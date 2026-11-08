#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import { generateKeyPairSync } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createPublication } from './publish.mjs';

const { privateKey, publicKey } = generateKeyPairSync('ed25519', {
  privateKeyEncoding: { format: 'pem', type: 'pkcs8' },
  publicKeyEncoding: { format: 'der', type: 'spki' },
});
const rawPublicKey = publicKey.subarray(-32).toString('base64');
const repositoryKey = `ed25519:${rawPublicKey}`;
const publication = await createPublication({
  privateKey,
  publicKey: repositoryKey,
});
const index = JSON.parse(await readFile(`${publication.outputDirectory}/index.json`, 'utf8'));

if (index.extensions.length !== 3 || index.publicKey !== repositoryKey) {
  throw new Error('Publication index validation failed');
}

for (const entry of index.extensions) {
  const manifest = JSON.parse(
    await readFile(`${publication.outputDirectory}/${entry.bundleURL.replace(/\/runtime\.js$/, '/manifest.json')}`, 'utf8'),
  );
  if (manifest.id !== entry.id || manifest.version !== entry.version) {
    throw new Error(`Publication entry mismatch for ${entry.id}`);
  }
}

console.log('Publication check passed.');
