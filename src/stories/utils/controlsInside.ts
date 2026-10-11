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
