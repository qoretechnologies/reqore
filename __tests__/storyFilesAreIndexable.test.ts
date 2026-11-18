// Copyright 2026 Qore Technologies, s.r.o.
import { readdirSync, readFileSync, statSync } from 'node:fs';
// `node:` prefix: a bare 'path' import resolves to the userland `path` package
import { join, relative } from 'node:path';
import { loadCsf } from 'storybook/internal/csf-tools';
import { describe, expect, it } from 'vitest';

// Every story file is one Storybook can index.
//
// Storybook reads a story file's default export statically, with the parser this test runs. A
// meta it cannot read (a call where an object literal belongs) or a string it cannot parse
// (unescaped quotes in a description) fails the WHOLE index: `index.json` answers 500, every open
// preview reloads on each retry, and every `yarn test:stories` run fails before its first story,
// whichever files it was given. This names the file in the unit suite. `yarn stories:parse
// [files…]` (`scripts/parse-stories.mjs`) runs the same parser on just those files in about a
// second: run it right after every story-file edit (qorus-ide 080573019, ported 18 Nov).

const SRC = join(process.cwd(), 'src');
/** `.storybook/main.ts`: `stories: ['../src/**\/*.stories.@(js|jsx|ts|tsx)']` */
const STORY_FILE = /\.stories\.(js|jsx|ts|tsx)$/;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (STORY_FILE.test(name)) out.push(p);
  }
  return out;
}

describe('story files are indexable', () => {
  const files = walk(SRC);

  it('finds the story files', () => {
    // a broken walk would pass vacuously
    expect(files.length).toBeGreaterThan(70);
  });

  it("every story file parses with Storybook's own indexer", () => {
    const offenders = files.flatMap((file) => {
      const fileName = relative(process.cwd(), file);
      try {
        const csf = loadCsf(readFileSync(file, 'utf8'), {
          fileName,
          // a meta without a title is titled from its path; only a title Storybook cannot read fails
          makeTitle: (userTitle?: string) => userTitle ?? fileName,
        }).parse();
        return Object.keys(csf._stories).length > 0 ? [] : [`${fileName}: no stories`];
      } catch (error) {
        return [`${fileName}: ${String((error as Error).message).split('\n')[0]}`];
      }
    });
    expect(
      offenders,
      'Storybook cannot index these story files; `yarn stories:parse <file>` names the line'
    ).toEqual([]);
  });
});
