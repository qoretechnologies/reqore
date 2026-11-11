// Copyright 2026 Qore Technologies, s.r.o.

/*
 * What a rounded container draws at its top-left corner starts clear of the corner: at least the
 * corner's radius in from the container's outer edge.
 *
 * Seen in the admin portal (Filip, Qlip build #44: "I feel like the panel label is too close to the
 * border radius?"): a 14px `theme.panel.radius` on a `small` panel put its title 7px in, under the
 * curve, because a title bar was padded by its size's step and never by the corner.
 */

import { expect } from 'storybook/test';

/** A rounded container, and where in it the label it draws at its corner lives. */
const CONTAINERS = [
  { container: '.reqore-panel', label: '.reqore-panel-title-header' },
  { container: '.reqore-accordion', label: '.reqore-accordion-header' },
  { container: '.reqore-callout', label: '.reqore-callout-icon, .reqore-callout-body' },
  { container: '.reqore-statistic', label: '.reqore-statistic-content' },
  {
    container: '.reqore-feature-card',
    label: '.reqore-feature-card-marker, .reqore-feature-card-content',
  },
  {
    container: '.reqore-testimonial',
    label: '.reqore-testimonial-quote-icon, .reqore-testimonial-quote',
  },
] as const;

const TRANSPARENT = /^(transparent|rgba\(\d+,\s*\d+,\s*\d+,\s*0\))$/;

/** The left edge of the first thing a reader sees in `labels`: a line of text, an icon, an image. */
const leftOfContent = (labels: HTMLElement[]): number => {
  let left = Infinity;

  for (const label of labels) {
    const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);

    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent?.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of Array.from(range.getClientRects())) {
        if (rect.width > 0) left = Math.min(left, rect.left);
      }
    }

    for (const drawn of Array.from(label.querySelectorAll('svg, img'))) {
      const rect = drawn.getBoundingClientRect();
      if (rect.width > 0) left = Math.min(left, rect.left);
    }
  }

  return left;
};

/**
 * Every rounded container under `root` that draws a corner (a surface or an edge) starts what it
 * holds at its top-left at least its corner radius in from its outer edge. Returns how many were
 * measured, so a story can say how many it expected — a selector that matches nothing would
 * otherwise pass by measuring nothing.
 */
export const expectLabelsClearTheirCorners = (root: ParentNode = document.body): number => {
  let measured = 0;

  for (const { container, label } of CONTAINERS) {
    for (const box of Array.from(root.querySelectorAll<HTMLElement>(container))) {
      const rect = box.getBoundingClientRect();
      if (!rect.width) continue;

      const style = getComputedStyle(box);
      const radius = parseFloat(style.borderTopLeftRadius) || 0;
      const drawn =
        parseFloat(style.borderTopWidth) > 0 || !TRANSPARENT.test(style.backgroundColor);
      if (!radius || !drawn) continue;

      // Its own label, not one of a container nested in it.
      const labels = Array.from(box.querySelectorAll<HTMLElement>(label)).filter(
        (el) => el.closest(container) === box
      );
      const left = leftOfContent(labels);
      if (!Number.isFinite(left)) continue;

      const inset = left - rect.left;
      const name = (labels[0]?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40);
      measured += 1;
      expect(
        inset,
        `${container} "${name}" starts ${inset.toFixed(1)}px in, inside its ${radius}px corner`
      ).toBeGreaterThanOrEqual(radius - 0.5);
    }
  }

  return measured;
};
