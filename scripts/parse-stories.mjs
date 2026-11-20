#!/usr/bin/env node
// Copyright 2026 Qore Technologies, s.r.o.
//
// `yarn stories:parse [files…]` — parse story files with Storybook's own indexer, in about a
// second, and name any it cannot read.
//
// A story file Storybook cannot index fails the WHOLE index: a running Storybook answers
// `index.json` with 500, every open preview reloads on each retry, and every story run fails
// before its first story. The unit gate (`__tests__/storyFilesAreIndexable.test.ts`) catches it,
// but only when the unit suite runs; a running Storybook reads the file the moment it is saved
// (a description with unescaped quotes once broke a host app's Storybook index for minutes).
// So run this right after every story-file edit, before anything else.
//
// With no files it checks the story files changed against HEAD (staged, unstaged and untracked).

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { loadCsf } from 'storybook/internal/csf-tools';

const STORY_FILE = /\.stories\.(js|jsx|ts|tsx)$/;

const changedStoryFiles = () =>
  execSync('git status --porcelain --untracked-files=all', { encoding: 'utf8' })
    .split('\n')
    .map((line) => line.slice(3).trim())
    .map((path) => (path.includes(' -> ') ? path.split(' -> ')[1] : path))
    .filter((path) => STORY_FILE.test(path) && existsSync(path));

const files = process.argv.slice(2).length ? process.argv.slice(2) : changedStoryFiles();

const offenders = files.flatMap((file) => {
  const fileName = relative(process.cwd(), file);
  try {
    const csf = loadCsf(readFileSync(file, 'utf8'), {
      fileName,
      makeTitle: (userTitle) => userTitle ?? fileName,
    }).parse();
    return Object.keys(csf._stories).length > 0 ? [] : [`${fileName}: no stories`];
  } catch (error) {
    return [`${fileName}: ${String(error?.message ?? error).split('\n')[0]}`];
  }
});

if (offenders.length) {
  console.error(`Storybook cannot index ${offenders.length} story file(s):`);
  for (const offender of offenders) console.error(`  ${offender}`);
  process.exit(1);
}
console.log(`${files.length} story file(s) parse.`);
