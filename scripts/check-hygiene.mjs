#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const ignoredDirectories = new Set([
  '.git',
  'node_modules',
  'dist',
  'public',
  'coverage',
  '.turbo',
]);
const ignoredFiles = new Set(['.DS_Store', 'pnpm-lock.yaml', 'package-lock.json']);
const textExtensions = new Set([
  '.md',
  '.mdx',
  '.mjs',
  '.js',
  '.cjs',
  '.json',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml',
  '.html',
  '.txt',
  '.css',
  '.sh',
  '.bash',
  '.zsh',
  '.toml',
]);
const sourceExtensions = new Set([
  '.mjs',
  '.js',
  '.cjs',
  '.ts',
  '.tsx',
  '.sh',
  '.bash',
  '.zsh',
]);
const allowedEmails = new Set([
  'blankgrimoire.dev@gmail.com',
  '41898282+github-actions[bot]@users.noreply.github.com',
  '355030082+blankgrimoire-release-bot[bot]@users.noreply.github.com',
]);
const allowedHosts = new Set([
  'example.org',
  'example.com',
  'localhost',
  '127.0.0.1',
  '::1',
  'blankgrimoire.github.io',
  'users.noreply.github.com',
]);
const allowedHostPattern = /^(?:[a-z0-9-]+\.)*example\.(?:org|com)$/i;
const urlPattern = /\bhttps?:\/\/[^\s"'<>`]+/gi;
const bareDomainPattern =
  /\b(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:com|net|org|io|gg|app|dev|co|me|tv|xyz|info|biz|site|online|club|live|to|cn|ru|jp|fr|de|it|es|br|in|us|uk|ai|so|cc|ws|fm|page|link|space|store|tech|website|blog)\b/gi;
const emailPattern =
  /\b[A-Za-z0-9._%+-]+(?:\[[A-Za-z0-9._-]+\])?@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const forbiddenPublicTerms = /\b(?:manga|manhwa|scanlation)\b/i;
const forbiddenPublicSubstrings = /manga|manhwa|scanlation/i;
const secretPatterns = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key block'],
  [/\bgh[pousr]_[A-Za-z0-9]{20,}\b/, 'GitHub token'],
  [/\bgithub_pat_[A-Za-z0-9_]{20,}\b/, 'GitHub fine-grained token'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key'],
  [/\bsk-[A-Za-z0-9]{20,}\b/, 'API secret key'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, 'Slack token'],
];
const violations = [];

function isAllowedHost(hostname) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (allowedHosts.has(normalized)) return true;
  if (allowedHostPattern.test(normalized)) return true;
  if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(normalized)) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(normalized)) return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(normalized)) return true;
  if (/^172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(normalized)) return true;
  return false;
}

function stripMarkdownCode(content) {
  return content.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

function isPublicVocabularyFile(file) {
  return (
    file === 'README.md' ||
    file === 'CONTRIBUTING.md' ||
    file === 'DISCLAIMER.md' ||
    (file.startsWith('themes/') && file.endsWith('/README.md'))
  );
}

function report(file, line, label) {
  violations.push(`${file}:${line}: ${label}`);
}

function lineOf(content, index) {
  return content.slice(0, index).split('\n').length;
}

function checkUrls(content, file) {
  for (const match of content.matchAll(urlPattern)) {
    const value = match[0].replace(/[.,;:!?)\]]+$/, '');
    if (value.includes('${') || value.includes('<')) continue;
    try {
      const { hostname } = new URL(value);
      if (!isAllowedHost(hostname)) {
        report(file, lineOf(content, match.index ?? 0), `real domain ${value}`);
      }
    } catch {
      report(file, lineOf(content, match.index ?? 0), `invalid URL ${value}`);
    }
  }
}

function checkBareDomains(content, file) {
  const withoutEmails = content.replace(emailPattern, '[email]');
  for (const match of withoutEmails.matchAll(bareDomainPattern)) {
    const value = match[0];
    if (!isAllowedHost(value)) {
      report(file, lineOf(withoutEmails, match.index ?? 0), `real domain ${value}`);
    }
  }
}

function checkEmails(content, file) {
  for (const match of content.matchAll(emailPattern)) {
    if (!allowedEmails.has(match[0])) {
      report(file, lineOf(content, match.index ?? 0), `unexpected email ${match[0]}`);
    }
  }
}

function checkSecrets(content, file) {
  for (const [pattern, label] of secretPatterns) {
    const match = pattern.exec(content);
    if (match) {
      report(file, lineOf(content, match.index), label);
    }
  }
}

function checkSpdx(content, file) {
  const header = content.split('\n').slice(0, 5).join('\n');
  if (!/SPDX-License-Identifier:\s*(MIT|MPL-2\.0)/.test(header)) {
    report(file, 1, 'missing SPDX-License-Identifier: MIT or MPL-2.0 header');
  }
}

async function checkPackageMetadata(content, file) {
  let packageJson;
  try {
    packageJson = JSON.parse(content);
  } catch {
    report(file, 1, 'invalid package.json');
    return;
  }
  const publicValues = [
    ['description', packageJson.description ?? ''],
    ['blankgrimoire.adapterName', packageJson.blankgrimoire?.adapterName ?? ''],
  ];
  for (const [label, value] of publicValues) {
    if (typeof value === 'string' && forbiddenPublicSubstrings.test(value)) {
      report(file, 1, `forbidden public term in ${label}: ${value}`);
    }
  }
}

async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        await scan(join(directory, entry.name));
      }
      continue;
    }
    if (!entry.isFile() || ignoredFiles.has(entry.name)) continue;
    if (!textExtensions.has(extname(entry.name))) continue;

    const path = join(directory, entry.name);
    const file = relative(root, path);
    await scanFile(path, file);
  }
}

async function scanFile(path, file) {
  const content = await readFile(path, 'utf8');

  checkUrls(content, file);
  checkBareDomains(content, file);
  checkEmails(content, file);
  checkSecrets(content, file);

  if (sourceExtensions.has(extname(path))) {
    checkSpdx(content, file);
  }

  if (file.startsWith('themes/') && file.endsWith('/package.json')) {
    await checkPackageMetadata(content, file);
  }

  if (isPublicVocabularyFile(file)) {
    const prose = file.endsWith('.md') ? stripMarkdownCode(content) : content;
    const match = forbiddenPublicTerms.exec(prose);
    if (match) {
      report(file, lineOf(prose, match.index), `forbidden public term "${match[0]}"`);
    }
    forbiddenPublicTerms.lastIndex = 0;
  }
}

await scan(root);

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Hygiene check passed.');
}
