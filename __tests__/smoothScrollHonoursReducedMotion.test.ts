import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { REDUCED_MOTION_QUERY, smoothScrollBehavior } from '../src/hooks/usePrefersReducedMotion';

/* A scroll the library starts (a table back to its top, a page of results, a navigation rail's section) is smooth,
   unless the user asked for reduced motion: then it jumps (WCAG 2.3.3). A smooth scroll is motion the user did not
   start, and an app's story runner that asks for reduced motion caught its pages partway through one. */

const matchMediaAnswering = (reduce: boolean) =>
  vi.fn((query: string) => ({
    matches: reduce && query === REDUCED_MOTION_QUERY,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('a scroll the library starts', () => {
  test('is smooth for a user who has not asked for reduced motion', () => {
    vi.stubGlobal('matchMedia', matchMediaAnswering(false));
    expect(smoothScrollBehavior()).toBe('smooth');
  });

  test('jumps for a user who asked for reduced motion, read as the scroll starts', () => {
    vi.stubGlobal('matchMedia', matchMediaAnswering(true));
    expect(smoothScrollBehavior()).toBe('auto');
    vi.stubGlobal('matchMedia', matchMediaAnswering(false));
    expect(smoothScrollBehavior()).toBe('smooth');
  });

  test('never names smooth scrolling itself: it asks smoothScrollBehavior()', () => {
    const SRC = join(process.cwd(), 'src');
    const walk = (dir: string): string[] =>
      readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) {
          return name === 'stories' ? [] : walk(path);
        }
        return /\.tsx?$/.test(name) ? [path] : [];
      });
    const smooth = walk(SRC).flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .map((text, index) => ({ text, line: index + 1 }))
        .filter(({ text }) =>
          /behavior:\s*['"`]smooth['"`]|scroll-behavior\s*:\s*smooth/.test(text)
        )
        .map(({ text, line }) => `${relative(process.cwd(), file)}:${line} ${text.trim()}`)
    );
    expect(smooth).toEqual([]);
  });
});
