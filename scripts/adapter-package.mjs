#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import { readdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

export const ADAPTER_ID_PATTERN = /^theme\.[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
export const SEMVER_PATTERN =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/;
const FORBIDDEN_PUBLIC_TERMS = /manga|manhwa|scanlation/i;

function assertNoForbiddenPublicTerms(label, value) {
  if (typeof value !== 'string') {
    throw new Error(`${label} must be a string`);
  }
  if (FORBIDDEN_PUBLIC_TERMS.test(value)) {
    throw new Error(`${label} contains a forbidden public term: ${value}`);
  }
}

/**
 * Reads and validates the public adapter metadata stored in a theme package.
 *
 * The package version is the single source of truth for the adapter version.
 * The `blankgrimoire` block is the single source of truth for the published id
 * and name used by the manifest and repository index.
 */
export async function readAdapterPackage(packageDirectory) {
  const packageFile = join(packageDirectory, 'package.json');
  const packageJson = JSON.parse(await readFile(packageFile, 'utf8'));
  const metadata = packageJson.blankgrimoire;

  if (!metadata || typeof metadata !== 'object') {
    throw new Error(`${packageFile}: missing "blankgrimoire" metadata`);
  }

  const { adapterId, adapterName } = metadata;
  if (typeof adapterId !== 'string' || !ADAPTER_ID_PATTERN.test(adapterId)) {
    throw new Error(`${packageFile}: blankgrimoire.adapterId must match theme.*`);
  }
  if (typeof adapterName !== 'string' || adapterName.trim() === '') {
    throw new Error(`${packageFile}: blankgrimoire.adapterName is required`);
  }
  if (adapterName !== adapterName.trim()) {
    throw new Error(`${packageFile}: blankgrimoire.adapterName has surrounding spaces`);
  }
  if (typeof packageJson.version !== 'string' || !SEMVER_PATTERN.test(packageJson.version)) {
    throw new Error(`${packageFile}: version must be a SemVer string`);
  }
  if (typeof packageJson.name !== 'string' || packageJson.name.trim() === '') {
    throw new Error(`${packageFile}: package name is required`);
  }

  assertNoForbiddenPublicTerms(
    `${packageFile}: blankgrimoire.adapterName`,
    adapterName,
  );
  assertNoForbiddenPublicTerms(
    `${packageFile}: description`,
    packageJson.description ?? '',
  );

  return {
    directory: packageDirectory,
    directoryName: basename(packageDirectory),
    packageName: packageJson.name,
    version: packageJson.version,
    id: adapterId,
    name: adapterName,
    description: packageJson.description ?? '',
  };
}

/**
 * Discovers every theme package under `themes/` and validates that adapter ids
 * are unique. The result is sorted by id so publications are deterministic.
 */
export async function discoverAdapterPackages(themesDirectory) {
  const entries = await readdir(themesDirectory, { withFileTypes: true });
  const adapters = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const directory = join(themesDirectory, entry.name);
    try {
      adapters.push(await readAdapterPackage(directory));
    } catch (error) {
      if (error?.code === 'ENOENT') continue;
      throw error;
    }
  }

  adapters.sort((left, right) => left.id.localeCompare(right.id));

  const seen = new Set();
  for (const adapter of adapters) {
    if (seen.has(adapter.id)) {
      throw new Error(`Duplicate adapter id: ${adapter.id}`);
    }
    seen.add(adapter.id);
  }

  if (adapters.length === 0) {
    throw new Error(`No adapter packages found in ${themesDirectory}`);
  }

  return adapters;
}
