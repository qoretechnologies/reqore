import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        // Component/interaction tests: run every story in a real browser via Playwright.
        // Replaces the former @storybook/test-runner.
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: path.join(dirname, '.storybook'),
              storybookScript: 'yarn storybook --no-open',
            }),
          ],
          test: {
            name: 'storybook',
            browser: {
              enabled: true,
              provider: playwright({}),
              headless: true,
              // Match the Chromatic snapshot viewport; the default (414px) is below
              // responsive breakpoints like the Table's hideBelowWidth columns.
              viewport: { width: 1440, height: 900 },
              instances: [{ browser: 'chromium' }],
            },
            setupFiles: ['./.storybook/vitest.setup.ts'],
            // Some interaction stories deliberately render slow content and the shared
            // play-function helpers wait up to ~17s; give them headroom.
            testTimeout: 30000,
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
