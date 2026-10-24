// Copyright 2026 Qore Technologies, s.r.o.

/**
 * The Vitest project the stories tagged `scrollbars` run in a second time (vitest.config.ts): a
 * desktop whose Chromium draws its scrollbars, which Playwright otherwise hides. Where the platform
 * draws classic scrollbars (Linux, the CI runner; Windows; a Mac set to always show them), a
 * scrollbar takes room from what it scrolls, so a story there sees a layout that has to leave room
 * for one. Tag a story `scrollbars` when what it checks depends on that room: a box sized to its
 * content, a measurement taken while its content overflows, a width that a scrollbar would narrow.
 */
export const SCROLLBARS_STORY_PROJECT = 'storybook-scrollbars';

/**
 * The room a vertical scrollbar takes in this browser, in CSS pixels: 0 where scrollbars are hidden
 * or drawn over the content.
 */
export const scrollbarWidth = (): number => {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position: absolute; top: -200px; width: 100px; height: 100px; overflow: scroll;';
  document.body.appendChild(probe);
  try {
    return probe.offsetWidth - probe.clientWidth;
  } finally {
    probe.remove();
  }
};
