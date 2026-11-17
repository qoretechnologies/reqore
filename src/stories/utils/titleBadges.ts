// Copyright 2026 Qore Technologies, s.r.o.
import { expect, waitFor } from 'storybook/test';
import { wordsBrokenAcrossLines } from './controlsInside';

/** A panel title bar's title and the badges after it: the title is always the first. */
const titleAndBadges = (panel: HTMLElement) => {
  const row = panel.querySelector('.reqore-panel-title-label-and-badges') as HTMLElement;

  expect(row, 'the title bar has a title').toBeTruthy();

  const [title, ...badges] = Array.from(row.children) as HTMLElement[];

  return { title, badges };
};

/**
 * Every character of the panel's title is on screen: no box in it holds more text than it shows (an
 * ellipsis, a clamp or a clip), and no word is broken across lines.
 */
export const expectTitleWhole = async (panel: HTMLElement) => {
  await waitFor(() => {
    const { title } = titleAndBadges(panel);
    const boxes = [title, ...Array.from(title.querySelectorAll<HTMLElement>('*'))];
    const cut = boxes
      .filter((box) => box.clientWidth > 0)
      .filter(
        (box) => box.scrollWidth > box.clientWidth + 1 || box.scrollHeight > box.clientHeight + 1
      )
      .map(
        (box) =>
          `"${box.textContent?.trim()}" ${box.scrollWidth}x${box.scrollHeight}` +
          ` in ${box.clientWidth}x${box.clientHeight}`
      );

    expect(cut, `title cut:\n${cut.join('\n')}`).toEqual([]);
    expect(wordsBrokenAcrossLines(title)).toEqual([]);
  });
};

/** Where `element`'s first ink is: the left of its first word or icon. */
const inkLeft = (element: HTMLElement): number => {
  const lefts: number[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node instanceof SVGSVGElement) {
      lefts.push(node.getBoundingClientRect().left);
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      const range = document.createRange();

      range.selectNodeContents(node);
      Array.from(range.getClientRects())
        .filter((rect) => rect.width > 0)
        .forEach((rect) => lefts.push(rect.left));
    }
  }

  return Math.min(...lefts);
};

/** A badge's edge as the eye finds it: a chip's box, or a text badge's words (it draws no box). */
const badgeEdge = (badge: HTMLElement): number => {
  const tag = (badge.querySelector('.reqore-tag') as HTMLElement) ?? badge;
  const style = getComputedStyle(tag);
  const drawsBox =
    !/rgba\(.*, 0\)$|transparent/.test(style.backgroundColor) ||
    style.boxShadow !== 'none' ||
    parseFloat(style.borderLeftWidth) > 0;

  return drawsBox ? tag.getBoundingClientRect().left : inkLeft(tag);
};

/**
 * The badges are on a line of their own under the title, starting on the title's left edge: a chip
 * by its box, a text badge by its words.
 */
export const expectBadgesUnderTitle = async (panel: HTMLElement) => {
  await waitFor(() => {
    const { title, badges } = titleAndBadges(panel);
    const titleBox = title.getBoundingClientRect();

    expect(badges.length, 'the title has badges').toBeGreaterThan(0);
    badges.forEach((badge) =>
      expect(badge.getBoundingClientRect().top).toBeGreaterThanOrEqual(titleBox.bottom - 1)
    );
    // Within 2px: an icon is drawn a little inside its own box.
    expect(Math.abs(badgeEdge(badges[0]) - inkLeft(title))).toBeLessThanOrEqual(2);
  });
};

/** Reused: allocating a canvas per measurement is the expensive part. */
let fontCanvas: HTMLCanvasElement | undefined;

/**
 * Where the first line of `element`'s text sits: the top of its first text's box plus its font's
 * ascent. Read without touching the page, because a check that adds an element inside `waitFor`
 * wakes `waitFor` again and, while it fails, never lets it give up.
 */
export const baselineOf = (element: HTMLElement): number => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  const text = walker.nextNode() as Text;
  const range = document.createRange();

  range.selectNodeContents(text);
  const box = Array.from(range.getClientRects()).find((rect) => rect.width > 0)!;
  const style = getComputedStyle(text.parentElement!);

  fontCanvas = fontCanvas || document.createElement('canvas');
  const context = fontCanvas.getContext('2d')!;

  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

  return box.top + context.measureText(text.data).fontBoundingBoxAscent;
};

/** The badges share the title's line, after it. */
export const expectBadgesBesideTitle = async (panel: HTMLElement) => {
  await waitFor(() => {
    const { title, badges } = titleAndBadges(panel);
    const titleBox = title.getBoundingClientRect();

    expect(badges.length, 'the title has badges').toBeGreaterThan(0);
    badges.forEach((badge) => {
      const box = badge.getBoundingClientRect();

      expect(box.top).toBeLessThan(titleBox.bottom - 1);
      expect(box.left).toBeGreaterThanOrEqual(titleBox.right);
      // On the title's baseline, a badge with an icon too.
      expect(Math.abs(baselineOf(badge) - baselineOf(title))).toBeLessThanOrEqual(1);
    });
  });
};

/** The title's icon sits beside the title, centred on it, not on the title and the badges under it. */
export const expectIconBesideTitle = async (panel: HTMLElement) => {
  await waitFor(() => {
    const { title } = titleAndBadges(panel);
    const icon = panel.querySelector('.reqore-panel-title-icon') as HTMLElement;
    const titleBox = title.getBoundingClientRect();
    const iconBox = icon.getBoundingClientRect();

    expect(
      Math.abs(iconBox.top + iconBox.height / 2 - (titleBox.top + titleBox.height / 2))
    ).toBeLessThanOrEqual(2);
  });
};
