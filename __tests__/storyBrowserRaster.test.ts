// Copyright 2026 Qore Technologies, s.r.o.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Every story browser rasters whole tiles. With Chromium's partial raster a rounded corner's
 * anti-aliasing depended on the order the page changed in before the capture, and the same story's
 * Qlip capture alternated between two images build to build. The flag is in the one place every
 * story project's browser is made (`storyBrowser` in vitest.config.mts); this keeps it there.
 */
test('the story browsers are launched with --disable-partial-raster', () => {
  const config = readFileSync(resolve(__dirname, '../vitest.config.mts'), 'utf8');
  const storyBrowser = config.slice(config.indexOf('const storyBrowser'), config.indexOf('const storyTest'));

  expect(storyBrowser).toContain("args: ['--disable-partial-raster']");
});
