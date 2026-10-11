// Copyright 2026 Qore Technologies, s.r.o.
import { expect, waitFor } from 'storybook/test';

/** What a person taps or types into. */
const CONTROL = 'button, a[href], input, select, textarea, [role="button"], [role="link"]';

/** A control that reaches past the box it is drawn in, as `"label" left..right in left..right`. */
const describe = (control: Element, box: DOMRect, inside: DOMRect): string =>
  `"${(control.getAttribute('aria-label') || control.textContent || control.tagName)
    .trim()
    .slice(0, 30)}" ${Math.round(box.left)}..${Math.round(box.right)} in ${Math.round(
    inside.left
  )}..${Math.round(inside.right)}`;

/**
 * Every control under `scope` stays inside `container` from side to side: none reaches past its right or
 * its left edge, where it is cut off or hangs over what is next to it. Hidden controls (no box) and those
 * in something that scrolls sideways do not count.
 */
export const expectControlsInside = async (container: HTMLElement, scope: HTMLElement = container) => {
  await waitFor(() => {
    const inside = container.getBoundingClientRect();
    const past = Array.from(scope.querySelectorAll(CONTROL)).flatMap((control) => {
      const box = control.getBoundingClientRect();
      if (!box.width || !box.height) return [];
      for (let el = control.parentElement; el && el !== container; el = el.parentElement) {
        if (['auto', 'scroll'].includes(getComputedStyle(el).overflowX)) return [];
      }
      return box.left < inside.left - 0.5 || box.right > inside.right + 0.5
        ? [describe(control, box, inside)]
        : [];
    });
    expect(past, `controls past their box:\n${past.join('\n')}`).toEqual([]);
  });
};

/**
 * The words of the text under `element` that are broken across lines: each word is laid out on the lines of
 * its characters' boxes, and a word on two lines was broken inside itself.
 */
export const wordsBrokenAcrossLines = (element: HTMLElement): string[] => {
  const broken: string[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const text = node.data;
    for (const match of text.matchAll(/\S+/g)) {
      const range = document.createRange();
      range.setStart(node, match.index ?? 0);
      range.setEnd(node, (match.index ?? 0) + match[0].length);
      const lines = new Set(
        Array.from(range.getClientRects())
          .filter((rect) => rect.width > 0)
          .map((rect) => Math.round(rect.top))
      );
      if (lines.size > 1) broken.push(match[0]);
    }
  }
  return broken;
};

/** No word of the text under `element` is broken across lines. */
export const expectWordsWhole = async (element: HTMLElement) => {
  await waitFor(() => {
    const broken = wordsBrokenAcrossLines(element);
    expect(broken, `words broken across lines: ${broken.join(', ')}`).toEqual([]);
  });
};
