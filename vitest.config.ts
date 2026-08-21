import { qlipVitestPlugin } from '@qoretechnologies/qlip';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const qlipUploadToken = process.env.QLIP_UPLOAD_TOKEN;

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
            qlipVitestPlugin({
              auto: true,
              captureOnError: true,
              disableAnimations: true,
              pauseAnimationsAtEnd: true,
              viewport: { width: 1920, height: 1080 },
              // serverUrl omitted — defaults to https://qlip.qoretechnologies.com
              ...(qlipUploadToken ? { upload: { uploadToken: qlipUploadToken } } : {}),
            }),
            storybookTest({
              configDir: path.join(dirname, '.storybook'),
              storybookScript: 'yarn storybook --no-open',
            }),
          ],
          test: {
            name: 'storybook',
            browser: {
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
