import { qlipVitestPlugin } from '@qoretechnologies/qlip';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const qlipUploadToken = process.env.QLIP_UPLOAD_TOKEN;

/**
 * Story files with no story tagged `touch`, relative to the project root. The touch project leaves them out,
 * so it does not load every story module only to skip it. Read from the files themselves: tagging a story
 * is all it takes to run it on a touch screen.
 */
const storyFilesWithoutTouch = (): string[] =>
  readdirSync(path.join(dirname, 'src'), { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.stories.tsx'))
    .map((file) => path.join('src', file).split(path.sep).join('/'))
    .filter(
      (file) =>
        !/\btags:\s*\[[^\]]*['"]touch['"]/.test(readFileSync(path.join(dirname, file), 'utf8'))
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

// A new object for each project: Vitest names a project's browser instances on the objects themselves.
const storyBrowser = () => ({
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
  provider: playwright({
    contextOptions: { viewport: { width: 1920, height: 1080 } },
  }),
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
        // Stories run in two projects, and so in two browser pages. A story tagged `touch` holds the page as a
        // phone (`withTouchScreen` in src/stories/utils/touchScreen.ts), and Chromium cannot hand that page back
        // as it was: turning its touch emulation off takes the hover and pointer the machine reports, not the
        // ones the browser was launched with. Playwright launches its headless Chromium as a mouse
        // (`--blink-settings=primaryHoverType=2,…,primaryPointerType=4`); a Linux runner reports no mouse, so in
        // CI every story after a touch story in the same page found `(hover: none)` - the hover-only actions
        // shown, the Marquee and NavRail deaf to hover, Table's row menu at the touch size. On a Mac the machine
        // reports a mouse, so the same run passes there.
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
            browser: storyBrowser(),
            ...storyTest,
          },
        },
        // The stories tagged `touch`, in their own page, after the others (one file at a time: the touch
        // screen and the narrowed frame belong to the page).
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
            exclude: [...configDefaults.exclude, ...storyFilesWithoutTouch()],
            fileParallelism: false,
            sequence: { groupOrder: 1 },
            browser: storyBrowser(),
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
