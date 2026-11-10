#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import { createHash, generateKeyPairSync } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  createPublication,
  discoverAdapterPackages,
  adaptersDirectory,
} from './publish.mjs';

const adapters = await discoverAdapterPackages(adaptersDirectory);
const { privateKey, publicKey } = generateKeyPairSync('ed25519', {
  privateKeyEncoding: { format: 'pem', type: 'pkcs8' },
  publicKeyEncoding: { format: 'der', type: 'spki' },
});
const rawPublicKey = publicKey.subarray(-32).toString('base64');
const repositoryKey = `ed25519:${rawPublicKey}`;
const publication = await createPublication({
  privateKey,
  publicKey: repositoryKey,
  adapters,
});
const index = JSON.parse(
  await readFile(join(publication.outputDirectory, 'index.json'), 'utf8'),
);

if (index.extensions.length !== adapters.length) {
  throw new Error(
    `Expected ${adapters.length} entries, found ${index.extensions.length}`,
  );
}
if (index.publicKey !== repositoryKey) {
  throw new Error('Publication index uses an unexpected public key');
}
if (index.formatVersion !== 1) {
  throw new Error(`Unexpected formatVersion: ${index.formatVersion}`);
}
if (index.name !== 'BlankGrimoire Themes') {
  throw new Error(`Unexpected repository name: ${index.name}`);
}

const entries = new Map(index.extensions.map((entry) => [entry.id, entry]));
if (entries.size !== index.extensions.length) {
  throw new Error('Publication index contains duplicate adapter ids');
}

for (const adapter of adapters) {
  const entry = entries.get(adapter.id);
  if (!entry) {
    throw new Error(`Missing publication entry for ${adapter.id}`);
  }
  if (entry.version !== adapter.version) {
    throw new Error(
      `Publication version mismatch for ${adapter.id}: found ${entry.version}, expected ${adapter.version}`,
    );
  }
  if (entry.name !== adapter.name) {
    throw new Error(
      `Publication name mismatch for ${adapter.id}: found ${entry.name}`,
    );
  }
  if (entry.apiVersion !== 1) {
    throw new Error(
      `Publication apiVersion mismatch for ${adapter.id}: found ${entry.apiVersion}`,
    );
  }

  const adapterDirectory = join(
    publication.outputDirectory,
    'adapters',
    adapter.id,
  );
  const manifest = JSON.parse(
    await readFile(join(adapterDirectory, 'manifest.json'), 'utf8'),
  );
  const bundle = await readFile(join(adapterDirectory, 'runtime.js'));

  if (
    manifest.id !== entry.id ||
    manifest.name !== entry.name ||
    manifest.version !== entry.version
  ) {
    throw new Error(`Publication manifest mismatch for ${adapter.id}`);
  }
  if (createHash('sha256').update(bundle).digest('hex') !== entry.sha256) {
    throw new Error(`Published bundle hash mismatch for ${adapter.id}`);
  }
  if (entry.bundleURL !== `adapters/${adapter.id}/runtime.js`) {
    throw new Error(`Unexpected bundleURL for ${adapter.id}: ${entry.bundleURL}`);
  }
}

console.log(`Publication check passed for ${adapters.length} adapters.`);
