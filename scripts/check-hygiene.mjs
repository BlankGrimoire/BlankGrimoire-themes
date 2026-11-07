#!/usr/bin/env node
// SPDX-License-Identifier: MIT
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url);
const themesRoot = join(root.pathname, "themes");
const forbiddenDomains = /https?:\/\/(?!(?:example\.org|example\.com)\b)[^\s"'<>]+/gi;
const forbiddenTerms = /\b(?:scanlation|manhwa)\b/gi;
const ignoredDirectories = new Set([".git", "node_modules", "dist", "coverage"]);
const textExtensions = new Set([".md", ".mjs", ".json", ".ts", ".tsx", ".yaml", ".yml"]);
const violations = [];

async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) {
      await scan(join(directory, entry.name));
      continue;
    }

    const extension = entry.name.includes(".")
      ? `.${entry.name.split(".").at(-1)}`
      : "";
    if (!entry.isFile() || !textExtensions.has(extension)) continue;

    const path = join(directory, entry.name);
    const content = await readFile(path, "utf8");
    for (const [pattern, label] of [
      [forbiddenDomains, "real domain"],
      [forbiddenTerms, "forbidden vocabulary"],
    ]) {
      if (pattern.test(content)) {
        violations.push(`${relative(root.pathname, path)}: ${label}`);
      }
      pattern.lastIndex = 0;
    }
  }
}

await scan(themesRoot);
if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Hygiene check passed.");
}
