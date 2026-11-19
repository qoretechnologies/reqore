// Copyright 2026 Qore Technologies, s.r.o.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// Convention gate: a default label says what the reader wants, never what the code does.
//
// The words an app shows unless it passes its own (a button's label, a tooltip, an empty
// state, an error) name what the reader gets: "Hide", "Show all", "Try again", "Nothing to
// show". They never narrate the mechanism: no panel, drawer, row or component, no
// collapse or expand, no rendering, no "the rest of the…". A panel's collapse control said
// "Collapse", a tree "Expand all", and the error fallback "There was an error rendering this
// component".
//
// Every default written as `somethingLabel = '…'`, `somethingMessage: '…'` (also Tooltip,
// Text, Title, Placeholder) in the library's source is read. Stories and the mock data are
// left out: their words are an example's, not a default.

const SRC = join(process.cwd(), 'src');
const LEFT_OUT = [join(SRC, 'stories'), join(SRC, 'mock')];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      out.push(...walk(p));
    } else if (/\.tsx?$/.test(name) && !/\.(stories|test)\.tsx?$/.test(name)) {
      out.push(p);
    }
  }
  return out;
}

/** A default's name and its words: `closeLabel = 'Close'`, `errorMessage:\n 'Something…'`. */
const DEFAULT_COPY =
  /\b(\w+(?:Label|Message|Tooltip|Text|Title|Placeholder))\s*[=:]\s*(['"`])([^'"`\n]+)\2/g;

const MECHANISM =
  /\b(panels?|drawers?|rows?|components?|collaps\w*|expand\w*|render\w*|the rest of)\b/i;

/** Every default in the library's source, as `file name 'words'`. */
const defaults = (): { where: string; words: string }[] =>
  walk(SRC)
    .filter((file) => !LEFT_OUT.some((dir) => file.startsWith(dir)))
    .flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(DEFAULT_COPY)].map((match) => ({
        where: `${relative(process.cwd(), file)} ${match[1]}`,
        words: match[3],
      }))
    );

describe('Default copy says what the reader wants', () => {
  test('the scan reads the defaults, and the pattern finds a mechanism word', () => {
    const found = defaults();
    expect(found.some(({ words }) => words === 'Hide')).toBe(true);
    expect(found.some(({ words }) => words === 'Show top level')).toBe(true);
    expect(found.some(({ words }) => words.startsWith('This part of the page'))).toBe(true);
    expect(MECHANISM.test('Collapse all')).toBe(true);
    expect(MECHANISM.test('There was an error rendering this component')).toBe(true);
    expect(MECHANISM.test('Show the rest of the list')).toBe(true);
    expect(MECHANISM.test('Show all')).toBe(false);
  });

  test('no default names the mechanism', () => {
    const offending = defaults()
      .filter(({ words }) => MECHANISM.test(words))
      .map(({ where, words }) => `${where} '${words}'`);
    expect(offending).toEqual([]);
  });
});
