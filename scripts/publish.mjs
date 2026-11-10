#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import { createHash, createPublicKey, verify } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIndexJson, signBundle } from '@blankgrimoire/cli';
import { discoverAdapterPackages } from './adapter-package.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outputDirectory = join(root, 'public');
const adaptersDirectory = join(root, 'themes');

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

function validateManifest({ manifest, adapter }) {
  if (manifest.id !== adapter.id) {
    throw new Error(
      `Manifest id mismatch for ${adapter.id}: found ${manifest.id}`,
    );
  }
  if (manifest.name !== adapter.name) {
    throw new Error(
      `Manifest name mismatch for ${adapter.id}: found ${manifest.name}`,
    );
  }
  if (manifest.version !== adapter.version) {
    throw new Error(
      `Manifest version mismatch for ${adapter.id}: found ${manifest.version}, expected ${adapter.version}`,
    );
  }
  if (manifest.apiVersion !== 1) {
    throw new Error(
      `Manifest apiVersion mismatch for ${adapter.id}: found ${manifest.apiVersion}`,
    );
  }
}

async function createPublication({
  privateKey,
  publicKey,
  outputDirectory: destination = outputDirectory,
  adapters,
}) {
  const publicKeyValue = publicKeyObject(publicKey);
  const adapterList = adapters ?? (await discoverAdapterPackages(adaptersDirectory));

  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  const entries = [];

  for (const adapter of adapterList) {
    const sourceDirectory = join(adapter.directory, 'dist');
    const bundle = await readFile(join(sourceDirectory, 'runtime.js'));
    const manifest = JSON.parse(
      await readFile(join(sourceDirectory, 'manifest.json'), 'utf8'),
    );
    validateManifest({ manifest, adapter });

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

    const relativeDirectory = `adapters/${adapter.id}`;
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

const isMain =
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isMain) {
  const publication = await createPublication({
    privateKey: requiredEnvironment('BLANKGRIMOIRE_PRIVATE_KEY'),
    publicKey: requiredEnvironment('BLANKGRIMOIRE_PUBLIC_KEY'),
  });
  console.log(
    `Published ${publication.entries.length} adapters to ${relative(root, outputDirectory)}`,
  );
}

export { adaptersDirectory, createPublication, discoverAdapterPackages };
