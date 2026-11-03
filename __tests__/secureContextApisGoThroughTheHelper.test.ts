// Copyright 2026 Qore Technologies, s.r.o.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// Convention gate: no browser API that exists only in a secure context is called directly.
//
// Reqore is also served over plain http by address or host name (a review Storybook, an app on a
// LAN). There `navigator.clipboard` and `crypto.randomUUID` are undefined: the Tree's and the
// Export modal's copy buttons called `navigator.clipboard.writeText` directly, so they threw or
// failed and still said "copied". Every use goes through `src/helpers/secureContextApis.ts`
// (`copyText`, `randomUuid`), which works in any context and says when a copy did not happen.
//
// Stories are left out: a story stands in for the browser (a clipboard that refuses) to show
// what the library does there.

const SRC = join(process.cwd(), 'src');
const HELPER = join(SRC, 'helpers', 'secureContextApis.ts');
const STORIES = join(SRC, 'stories');

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

/** Every line of reqore's source, outside the helper, that matches `pattern`, as `file:line text`. */
const linesMatching = (pattern: RegExp): string[] =>
  walk(SRC)
    .filter((file) => file !== HELPER && !file.startsWith(STORIES))
    .flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .map((text, index) => ({ text, line: index + 1 }))
        .filter(({ text }) => pattern.test(text))
        .map(({ text, line }) => `${relative(process.cwd(), file)}:${line} ${text.trim()}`)
    );

const CLIPBOARD = /\bnavigator\s*(\?\.|\.)\s*clipboard\b|\bclipboard\s*(\?\.|\.)\s*writeText\b/;
const RANDOM_UUID = /\brandomUUID\b/;
const OTHER =
  /\bcrypto\s*(\?\.|\.)\s*subtle\b|\bnavigator\s*(\?\.|\.)\s*(share|credentials|serviceWorker)\b|\bClipboardItem\b|\bshowSaveFilePicker\b|\bexecCommand\b/;

describe('Secure-context-only browser APIs go through the helper', () => {
  test('the scan reads the library source, and the helper is where the calls are', () => {
    const files = walk(SRC);
    expect(files).toContain(HELPER);
    expect(files.some((file) => file.endsWith(join('components', 'Tree', 'index.tsx')))).toBe(true);
    // the patterns find what they guard against: in the helper, which is left out of the scan
    const helper = readFileSync(HELPER, 'utf8');
    expect(CLIPBOARD.test(helper)).toBe(true);
    expect(RANDOM_UUID.test(helper)).toBe(true);
    expect(OTHER.test(helper)).toBe(true);
  });

  test('the patterns catch the direct calls the copy buttons made', () => {
    expect(CLIPBOARD.test('navigator.clipboard.writeText(text);')).toBe(true);
    expect(CLIPBOARD.test('await navigator?.clipboard?.writeText(text);')).toBe(true);
    expect(CLIPBOARD.test('window.navigator.clipboard.readText()')).toBe(true);
    expect(RANDOM_UUID.test('const id = crypto.randomUUID();')).toBe(true);
    expect(OTHER.test('await crypto.subtle.digest("SHA-256", data)')).toBe(true);
    expect(OTHER.test('document.execCommand("copy")')).toBe(true);
    expect(CLIPBOARD.test('copyText(value)')).toBe(false);
  });

  test('no navigator.clipboard outside the helper: copy with copyText()', () => {
    expect(linesMatching(CLIPBOARD)).toEqual([]);
  });

  test('no crypto.randomUUID outside the helper: ask randomUuid()', () => {
    expect(linesMatching(RANDOM_UUID)).toEqual([]);
  });

  test('no other secure-context-only API (or the copy command) is called directly', () => {
    expect(linesMatching(OTHER)).toEqual([]);
  });
});
