// Copyright 2026 Qore Technologies, s.r.o.
import { expect } from 'storybook/test';

/** The red, green and blue of `element`'s text colour. */
const textRgb = (element: HTMLElement): number[] =>
  (getComputedStyle(element).color.match(/[\d.]+/g) ?? []).map(Number);

/**
 * `element`'s text is drawn in a red: its red channel leads the other two. How a destructive action
 * says so in a menu, where its own look (a red icon on a quiet button) is not drawn (r-qs-19).
 */
export const expectDrawnRed = (element: HTMLElement) => {
  const [r, g, b] = textRgb(element);

  expect(r, `"${element.textContent?.trim()}" is drawn in red`).toBeGreaterThan(g + 40);
  expect(r, `"${element.textContent?.trim()}" is drawn in red`).toBeGreaterThan(b + 40);
};

/** `element`'s text is not drawn in a red. */
export const expectNotDrawnRed = (element: HTMLElement) => {
  const [r, g, b] = textRgb(element);

  expect(r > g + 40 && r > b + 40, `"${element.textContent?.trim()}" is not drawn in red`).toBe(
    false
  );
};

/** The rows of the menu open in a popover, outside what opened it: a row's "⋯" or any action's own menu. */
export { openRowActionsMenuItems as openMenuItems } from './rowActionsMenu';
