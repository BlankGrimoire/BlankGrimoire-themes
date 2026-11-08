#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import { createHash, createPublicKey, verify } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { buildIndexJson, signBundle } from '@blankgrimoire/cli';

const root = new URL('..', import.meta.url).pathname;
const outputDirectory = join(root, 'public');
const adaptersDirectory = join(root, 'themes');
const adapters = [
  {
    directory: 'wp-manga',
    id: 'theme.wp-manga',
    name: 'WordPress Content Theme',
  },
  {
    directory: 'themesia',
    id: 'theme.themesia',
    name: 'Themesia Content Theme',
  },
  {
    directory: 'spa-hydration',
    id: 'theme.spa-hydration',
    name: 'SPA Hydration Theme',
  },
  {
    directory: 'wp-madara',
    id: 'wp-madara',
    name: 'WordPress Madara',
  },
  {
    directory: 'wp-mangastream',
    id: 'wp-mangastream',
    name: 'WordPress MangaStream',
  },
  {
    directory: 'static-advanced',
    id: 'static-advanced',
    name: 'Static Advanced',
  },
  {
    directory: 'spa-nextjs',
    id: 'spa-nextjs',
    name: 'SPA Next.js',
  },
];

function requiredEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function publicKeyObject(publicKey) {
  if (!publicKey.startsWith('ed25519:')) {
    throw new Error('BLANKGRIMOIRE_PUBLIC_KEY must use the ed25519:BASE64 format');
  }
  const raw = Buffer.from(publicKey.slice('ed25519:'.length), 'base64');
  if (raw.length !== 32) {
    throw new Error('BLANKGRIMOIRE_PUBLIC_KEY must contain a 32-byte key');
  }
  return createPublicKey({
    key: Buffer.concat([
      Buffer.from('302a300506032b6570032100', 'hex'),
      raw,
    ]),
    format: 'der',
    type: 'spki',
  });
}

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

async function createPublication({
  privateKey,
  publicKey,
  outputDirectory: destination = outputDirectory,
}) {
  const publicKeyValue = publicKeyObject(publicKey);
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  const entries = [];

  for (const adapter of adapters) {
    const sourceDirectory = join(adaptersDirectory, adapter.directory, 'dist');
    const bundle = await readFile(join(sourceDirectory, 'runtime.js'));
    const manifest = JSON.parse(await readFile(join(sourceDirectory, 'manifest.json'), 'utf8'));
    if (manifest.id !== adapter.id || manifest.name !== adapter.name) {
      throw new Error(`Manifest identity mismatch for ${adapter.id}`);
    }
    if (manifest.sha256 !== sha256(bundle)) {
      throw new Error(`Manifest hash mismatch for ${adapter.id}`);
    }

    const signature = await signBundle({ privateKey, data: bundle });
    const signatureBytes = Buffer.from(signature, 'base64');
    if (
      signatureBytes.length !== 64 ||
      !verify(null, bundle, publicKeyValue, signatureBytes)
    ) {
      throw new Error(`Signature verification failed for ${adapter.id}`);
    }

    const relativeDirectory = join('adapters', adapter.id);
    const destinationDirectory = join(destination, relativeDirectory);
    await mkdir(destinationDirectory, { recursive: true });
    await writeFile(join(destinationDirectory, 'runtime.js'), bundle);
    await writeFile(
      join(destinationDirectory, 'manifest.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
    await writeFile(join(destinationDirectory, 'runtime.sig'), `${signature}\n`);

    entries.push({
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      apiVersion: manifest.apiVersion,
      bundleURL: `${relativeDirectory}/runtime.js`,
      sha256: manifest.sha256,
      bundleSignature: signature,
    });
  }

  await buildIndexJson({
    name: 'BlankGrimoire Themes',
    publicKey,
    extensions: entries,
    outFile: join(destination, 'index.json'),
  });

  return { entries, outputDirectory: destination };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  await createPublication({
    privateKey: requiredEnvironment('BLANKGRIMOIRE_PRIVATE_KEY'),
    publicKey: requiredEnvironment('BLANKGRIMOIRE_PUBLIC_KEY'),
  });
  console.log(`Published ${adapters.length} adapters to ${relative(root, outputDirectory)}`);
}

export { createPublication };
