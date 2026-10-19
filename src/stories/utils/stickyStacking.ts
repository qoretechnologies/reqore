// Copyright 2026 Qore Technologies, s.r.o.

/*
 * Sticky layers stack in the order they are read:
 *
 * - a panel's sticky header, and what it holds, is drawn above everything in the panel's body while the body
 *   scrolls under it - a table's pinned columns, anything with a `z-index` of its own;
 * - a pinned column's header cell is opaque, and drawn above the header cells that scroll under it.
 *
 * Seen in the Qorus IDE (qorus#646): scrolled, the pinned first and last columns of the workflow orders table were
 * drawn over its sticky header, cutting off its label and covering its menu, and the pinned Actions column's header
 * let the headers behind it show through ("ORDER DA" under "ACTIONS").
 */

/** The alpha of a computed CSS color: 1 for `rgb()`, its fourth part for `rgba()`, 0 for `transparent`. */
export const colorAlpha = (color: string): number => {
  const parts = /rgba?\(([^)]*)\)/
    .exec(color)?.[1]
    ?.split(/[,/\s]+/)
    .filter(Boolean);

  if (!parts) {
    return color === 'transparent' ? 0 : 1;
  }

  return parts.length > 3 ? Number(parts[3]) : 1;
};

/** What an element shows, for a failure to name it. */
const named = (el: Element): string =>
  `"${(el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40)}"`;

/**
 * The layer `hit` is drawn in: the nearest element from it up that is positioned with a `z-index` of its own (a
 * sticky cell, a raised row), else `hit` itself. What wins a point is that layer, not the text it holds.
 */
const layerOf = (hit: Element): Element => {
  for (let node: Element | null = hit; node; node = node.parentElement) {
    const style = getComputedStyle(node);

    if (style.position !== 'static' && style.zIndex !== 'auto') {
      return node;
    }
  }

  return hit;
};

/** A layer, for a failure to name it: what it shows, how it is positioned and its `z-index`. */
const namedLayer = (layer: Element): string => {
  const style = getComputedStyle(layer);

  return `${named(layer)} (position: ${style.position}; z-index: ${style.zIndex})`;
};

/** Whether an element is pinned: sticky to a side. */
const pinnedToASide = (el: Element): boolean => {
  const style = getComputedStyle(el);

  return style.position === 'sticky' && (style.left !== 'auto' || style.right !== 'auto');
};

/** The nearest ancestor of `el` that scrolls up and down. */
const verticalScroller = (el: Element): HTMLElement | undefined => {
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (
      /(auto|scroll)/.test(getComputedStyle(node).overflowY) &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
  }

  return undefined;
};

/** A panel's own sticky header: its title bar, not the title bar of a panel inside it. */
export const stickyHeaderOf = (panel: Element): HTMLElement => {
  const header = [...panel.querySelectorAll<HTMLElement>('.reqore-panel-title')].find(
    (title) =>
      title.closest('.reqore-panel') === panel && getComputedStyle(title).position === 'sticky'
  );

  if (!header) {
    throw new Error(`the panel ${named(panel)} has no sticky header`);
  }

  return header;
};

/**
 * What is drawn over a panel's sticky header while `target`, in the panel's body, scrolls under it.
 *
 * The panel's scroller is scrolled until the header has stuck and `target` crosses the header's middle, every
 * point along that middle line is read, and the scroller goes back where it was. Each element that answers a point
 * and is not in the header is named once. A target that cannot be scrolled under the header is a failure of the
 * story, not a pass: the check would have read nothing.
 */
export const findDrawnOverStickyHeader = (panel: Element, target: Element): string[] => {
  const header = stickyHeaderOf(panel);
  const scroller = verticalScroller(header);

  if (!scroller) {
    throw new Error(`nothing scrolls the sticky header ${named(header)}`);
  }

  const restore = scroller.scrollTop;

  try {
    // the target to the scroller's top: the header has stuck by then, since the target is under it in the panel
    scroller.scrollTop += target.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    // and then its middle to the stuck header's middle
    const stuck = header.getBoundingClientRect();
    const box = target.getBoundingClientRect();
    scroller.scrollTop += box.top + box.height / 2 - (stuck.top + stuck.height / 2);

    const at = header.getBoundingClientRect();
    const y = at.top + at.height / 2;
    const under = target.getBoundingClientRect();

    if (under.top > y || under.bottom < y) {
      throw new Error(
        `${named(target)} could not be scrolled under the sticky header ${named(header)}: ` +
          `it spans ${under.top}..${under.bottom}, the header's middle is at ${y}`
      );
    }

    const over = new Set<Element>();

    for (let x = at.left + 2; x < at.right - 2; x += 8) {
      const hit = document.elementFromPoint(x, y);

      if (hit && !header.contains(hit)) {
        over.add(layerOf(hit));
      }
    }

    return [...over].map(
      (layer) => `${namedLayer(layer)} is drawn over the sticky header ${named(header)}`
    );
  } finally {
    scroller.scrollTop = restore;
  }
};

/** The pinned column header cells of the tables in `root`: the sticky cells of each header row. */
export const pinnedHeaderCells = (root: ParentNode): HTMLElement[] =>
  [...root.querySelectorAll<HTMLElement>('.reqore-table-header-wrapper *')].filter(pinnedToASide);

/** The pinned column header cells in `root` that let what scrolls under them show through, with their paint. */
export const findSeeThroughPinnedHeaders = (root: ParentNode): string[] =>
  pinnedHeaderCells(root).flatMap((cell) => {
    const style = getComputedStyle(cell);

    return colorAlpha(style.backgroundColor) < 1 && style.backgroundImage === 'none'
      ? [
          `the pinned column header ${named(cell)} lets what scrolls under it show through (${style.backgroundColor})`,
        ]
      : [];
  });

/** The pinned column header cells in `root` that something else is drawn over, at their middle. */
export const findCoveredPinnedHeaders = (root: ParentNode): string[] =>
  pinnedHeaderCells(root).flatMap((cell) => {
    const box = cell.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);

    return hit && !cell.contains(hit)
      ? [`${namedLayer(layerOf(hit))} is drawn over the pinned column header ${named(cell)}`]
      : [];
  });
