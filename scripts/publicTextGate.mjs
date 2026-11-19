// Copyright 2026 Qore Technologies, s.r.o.
/**
 * Reqore is a public, open-source library: what it says in its sources, stories, tests and docs is read by anyone.
 * So it names nothing of the private world it was built in: the apps that use it and their screens, private issues,
 * people, review and board ids, internal documents and hosts. A reason stays (what a component does and why); where
 * it came from does not. The gate is `__tests__/publicText.test.ts`; `node scripts/publicTextGate.mjs <files>` lists
 * what a file still names.
 *
 * Code is not prose: a config key such as `parameters.qlip` is lowercase and stays allowed.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** What may not be named, by kind. */
export const DENIED = [
  ['a private issue or PR', /\bqorus(?:-ide)?#\d+|qoretechnologies\/qorus(?:-ide)?(?![\w.-])/gi],
  ['an app or a screen of ours', /\bqorus[- ]ide\b|\badmin[- ]portal\b|\bQonsole\b|\bqlip-ui\b/gi],
  // case-sensitive: the names, never a lowercase config key (`parameters.qlip`) or a word in code
  ['an app or a tool of ours', /\bIDE\b|\bQlip\b|\bQogs?\b/g],
  ['a person or a persona', /\b(?:Filip|David|Nick|Dana|Foxhoundn)\b/g],
  ['a review, board or queue id', /\br-(?:qs|ed)-\d+\b|\bt-\d{2,3}\b|\bboard (?:[a-z]?\d+|t-\d+)\b|(?<![#\w])f[1-9]\d\b(?![\w-])|\bqueue items?\b/gi],
  ['an internal decision or document', /\bdecisions? \d{2,3}\b|instruction-files|BRAND_DESIGN/gi],
  ['a chat or a host', /qorus-ide-(?:c2|ec|\d+)\b|\blibrary chat\b|\b(?:drake|spinster)\b|hq\.qoretechnologies|\bhq\b/gi],
];

/** Where people are named only as made-up data, not as the people who built the library. */
const MADE_UP_PEOPLE = /^src\/mock\//;
/** The gate itself, which has to name what it denies. */
const THE_GATE = /^(?:scripts\/publicTextGate\.mjs|__tests__\/publicText\.test\.ts)$/;

/** Every public text file the gate reads. */
export const publicFiles = () =>
  execSync('git ls-files src __tests__ docs .storybook scripts README.md vitest.config.mts vite.config.mts', {
    encoding: 'utf8',
  })
    .split('\n')
    .filter((file) => /\.(?:tsx?|mts|mjs|js|md|mdx)$/.test(file) && !THE_GATE.test(file));

/** What each file still names: `{ file, line, kind, text }`. */
export const findInternalNames = (files) =>
  files.flatMap((file) =>
    readFileSync(file, 'utf8')
      .split('\n')
      .flatMap((text, index) =>
        DENIED.flatMap(([kind, pattern]) => {
          if (kind === 'a person or a persona' && MADE_UP_PEOPLE.test(file)) {
            return [];
          }
          return [...text.matchAll(new RegExp(pattern.source, pattern.flags))].map((match) => ({
            file,
            line: index + 1,
            kind,
            text: match[0],
          }));
        })
      )
  );

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const files = process.argv.slice(2).length ? process.argv.slice(2) : publicFiles();
  const found = findInternalNames(files);
  for (const { file, line, kind, text } of found) {
    console.log(`${file}:${line}: ${text} (${kind})`);
  }
  console.log(`${found.length} found in ${new Set(found.map(({ file }) => file)).size} files`);
}
