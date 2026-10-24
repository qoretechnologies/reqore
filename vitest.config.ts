import { qlipVitestPlugin } from '@qoretechnologies/qlip';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';
import type { BrowserCommand } from 'vitest/node';
import { POSIX_LANGUAGE } from './src/stories/utils/posixLocale';
import viteConfig from './vite.config';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const qlipUploadToken = process.env.QLIP_UPLOAD_TOKEN;

/**
 * Story files that cannot hold a story tagged `tag` (`touch`, `scrollbars`, `posix-locale`),
 * relative to the project root. The project that runs the stories with that tag leaves them out, so
 * it does not load every story module only to skip it. Read from the files themselves: tagging a
 * story is all it takes to run it on a touch screen, with classic scrollbars, or in a browser whose
 * locale is POSIX.
 *
 * The story projects split the stories by the tags Storybook reads from a story file's source
 * before it runs it (`tags` below): string literals, in a `tags` array on a story or its meta, or
 * in an array the file names there. So a file with no `'touch'` or `"touch"` in it has no story
 * any project counts as tagged, and any other file is loaded here. Matching the shape of a
 * `tags` line instead left out a file that tagged its stories another way Storybook reads
 * (`tags: TOUCH`, a comment in the array): the desktop project left those stories out and this
 * one never loaded them, so they ran nowhere and nothing failed. A file that only mentions the
 * word costs a module load. A tag a story only has when it runs (spread into it from a shared
 * object) is read from the source by no project: `.storybook/vitest.setup.ts` fails it for `touch`.
 */
const storyFilesWithoutTag = (tag: string): string[] =>
  readdirSync(path.join(dirname, 'src'), { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.stories.tsx'))
    .map((file) => path.join('src', file).split(path.sep).join('/'))
    .filter(
      (file) => !new RegExp(`['"]${tag}['"]`).test(readFileSync(path.join(dirname, file), 'utf8'))
    );

// One plugin for both story projects, so they make one qlip build: one build id, and one upload at the end
// of the run (the plugin registers its reporter once, however many projects load it).
const qlip = qlipVitestPlugin({
  auto: true,
  captureOnError: true,
  disableAnimations: true,
  pauseAnimationsAtEnd: true,
  viewport: { width: 1920, height: 1080 },
  // serverUrl omitted — defaults to https://qlip.qoretechnologies.com
  ...(qlipUploadToken ? { upload: { uploadToken: qlipUploadToken } } : {}),
});

/**
 * The browser a story project runs in: a desktop with a mouse; the phone the stories tagged `touch`
 * run on (`src/stories/utils/touchScreen.ts`); a desktop that draws its scrollbars, which the
 * stories tagged `scrollbars` run on (`src/stories/utils/scrollbars.ts`); or a desktop whose locale
 * is POSIX, which the stories tagged `posix-locale` run on (`src/stories/utils/posixLocale.ts`). A
 * new object for each project: Vitest names a project's browser instances on the objects themselves.
 */
const storyBrowser = (kind: 'desktop' | 'phone' | 'scrollbars' | 'posix-locale' = 'desktop') => ({
  enabled: true,
  // Vitest 4's @vitest/browser-playwright no longer applies
  // `browser.viewport` to the Playwright context (the line is
  // commented out in the provider), so the context silently falls
  // back to Playwright's 1280×720 default and every capture is
  // clamped to it — while the manifest still records qlip's
  // 1920×1080, yielding blurry, mislabeled snapshots. Pass the
  // viewport through the provider's `contextOptions` (which IS
  // applied) so the browser window matches qlip's capture viewport
  // 1:1 and screenshots come out at their true resolution.
  //
  // The phone is a phone from the start: Playwright makes its context with `isMobile` and `hasTouch`, so
  // `(pointer: coarse)` and `(hover: none)` match and a touch is a finger's, and nothing turns that on or
  // off. Turning Chromium's touch emulation off over the DevTools protocol (how a touch story used to
  // borrow a desktop page) leaves the page with the hover and pointer the machine reports, not the mouse
  // Playwright launched it with (`--blink-settings=primaryHoverType=2,…`), and a Linux CI runner reports
  // none: every later story in the page found `(hover: none)` (qorus#646).
  //
  // Playwright launches Chromium with `--hide-scrollbars`, so a scrollbar takes no room in the other
  // projects, wherever the browser runs. Without it, Chromium on Linux (the CI runner) draws classic
  // 15px scrollbars, as Linux, Windows and a Mac set to always show them do: a layout that has to
  // leave room for one (a field measured while it draws one, qorus#646) is only seen there. A Mac
  // that shows its scrollbars as it scrolls draws them over the content, so there they take no room.
  //
  // A Chromium that takes its language from the POSIX locale (LC_ALL, then LANG: C, C.UTF-8, POSIX
  // or none, as in most Linux containers) reports `navigator.language` as `en-US@posix`, which is
  // no BCP 47 tag: `Intl` throws on it (qorus#646). Not every build does: the arm64 Linux one does,
  // and the amd64 Linux one the CI runs reports `en-US` whatever the locale or `--lang` says, as a
  // Mac's takes the system's. So the `posix-locale` project does not ask the platform for it: its
  // context is given the language itself (`locale`), which Chromium then reports as it is, Intl's
  // default locale following it, on every platform and build.
  provider: playwright({
    ...(kind === 'scrollbars'
      ? { launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } }
      : {}),
    contextOptions:
      kind === 'phone'
        ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
        : {
            viewport: { width: 1920, height: 1080 },
            ...(kind === 'posix-locale' ? { locale: POSIX_LANGUAGE } : {}),
          },
  }),
  /* Asks for reduced motion (`prefers-reduced-motion: reduce`) or stops asking, in the page the stories run in.
     Reqore honours it: its springs settle at once and its transitions take no time. The contrast gate asks for it
     while it measures, so it measures what stays on screen, never a frame of a fade (qorus#646: a clear button
     measured on its way in); a story tagged `reduced-motion` runs under it (.storybook/vitest.setup.ts). */
  commands: {
    emulateReducedMotion: (async ({ page }, reduce) => {
      await page.emulateMedia({ reducedMotion: reduce ? 'reduce' : 'no-preference' });
    }) satisfies BrowserCommand<[reduce: boolean]>,
  },
  headless: true,
  instances: [{ browser: 'chromium' as const }],
});

const storyTest = {
  setupFiles: ['./.storybook/vitest.setup.ts'],
  // Some interaction stories deliberately render slow content and the shared
  // play-function helpers wait up to ~17s; give them headroom.
  testTimeout: 30000,
};

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        // Component/interaction tests: run every story in a real browser via Playwright.
        // Replaces the former @storybook/test-runner.
        //
        // Stories run in four projects, each in a browser of its own kind (see `storyBrowser`): every story
        // on a desktop with a mouse, but those tagged `touch`, which run on a phone; those tagged
        // `scrollbars` run again on a desktop that draws its scrollbars, and those tagged `posix-locale` on a
        // desktop whose locale is POSIX. `.storybook/vitest.setup.ts` checks each story's browser is the one
        // its project promises.
        {
          extends: true,
          plugins: [
            qlip,
            storybookTest({
              configDir: path.join(dirname, '.storybook'),
              storybookScript: 'yarn storybook --no-open',
              tags: { exclude: ['touch'] },
            }),
          ],
          test: {
            name: 'storybook',
            // after the stories on the phone: each story here checks it still has its mouse
            sequence: { groupOrder: 1 },
            browser: storyBrowser('desktop'),
            ...storyTest,
          },
        },
        // The stories tagged `touch`, on the phone. Before the others, not beside them: the two projects share
        // Storybook's dependency cache (it is named after the config directory), which is not built twice at
        // once.
        {
          extends: true,
          plugins: [
            qlip,
            storybookTest({
              configDir: path.join(dirname, '.storybook'),
              storybookScript: 'yarn storybook --no-open',
              tags: { include: ['touch'] },
            }),
          ],
          test: {
            name: 'storybook-touch',
            exclude: [...configDefaults.exclude, ...storyFilesWithoutTag('touch')],
            sequence: { groupOrder: 0 },
            browser: storyBrowser('phone'),
            ...storyTest,
          },
        },
        // The stories tagged `scrollbars` again, on a desktop that draws its scrollbars: those that check a
        // layout leaves room for a scrollbar, or is not narrowed by one. After the others, for the same
        // dependency cache. No qlip: their frames are the desktop project's, and a scrollbar drawn or not
        // differs from machine to machine.
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: path.join(dirname, '.storybook'),
              storybookScript: 'yarn storybook --no-open',
              // a phone's scrollbars are drawn over the content: a story on the phone has none to check
              tags: { include: ['scrollbars'], exclude: ['touch'] },
            }),
          ],
          test: {
            name: 'storybook-scrollbars',
            exclude: [...configDefaults.exclude, ...storyFilesWithoutTag('scrollbars')],
            sequence: { groupOrder: 2 },
            browser: storyBrowser('scrollbars'),
            ...storyTest,
          },
        },
        // The stories tagged `posix-locale` again, on a desktop whose locale is POSIX: those that hand
        // the browser's language to `Intl`. After the others, for the same dependency cache. No qlip:
        // their frames are the desktop project's.
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: path.join(dirname, '.storybook'),
              storybookScript: 'yarn storybook --no-open',
              // a touch story runs on the phone only (`.storybook/vitest.setup.ts`)
              tags: { include: ['posix-locale'], exclude: ['touch'] },
            }),
          ],
          test: {
            name: 'storybook-posix-locale',
            exclude: [...configDefaults.exclude, ...storyFilesWithoutTag('posix-locale')],
            sequence: { groupOrder: 3 },
            browser: storyBrowser('posix-locale'),
            ...storyTest,
          },
        },
        // Unit tests: the former Jest suite, now on Vitest + jsdom.
        {
          extends: true,
          test: {
            name: 'unit',
            globals: true,
            environment: 'jsdom',
            include: ['__tests__/**/*.test.{ts,tsx}'],
            setupFiles: ['./__tests__/setup.ts'],
            // The former Jest suite raised the timeout to 30s for the heavier
            // data-grid/pagination tests via jest.setTimeout(); match that globally.
            testTimeout: 30000,
          },
        },
      ],
    },
  })
);
