import { TABLE_EDGE_FADE_PX, tableEdgeFade, tableFadeSides } from '../src/components/Table/helpers';

/*
 * A phone draws no scrollbar, so a table that scrolls sideways fades the edge that still has columns past it.
 * The sides are measured from the body's scroll box; an edge a column is pinned to is left to the pinned
 * column's shadow. The fade itself is drawn in a browser (`Collections/Table › Scrolls Sideways With A Fade On
 * A Phone`).
 */
const NOTHING_PINNED = { left: false, right: false };
const box = (scrollLeft: number, clientWidth = 300, scrollWidth = 800) => ({
  scrollLeft,
  clientWidth,
  scrollWidth,
});

describe('a table fades the edge with more past it', () => {
  it('fades nothing when every column fits', () => {
    expect(tableFadeSides(box(0, 800, 800), NOTHING_PINNED)).toBe('');
  });

  it('fades the right edge at the start, both in the middle, the left at the end', () => {
    expect(tableFadeSides(box(0), NOTHING_PINNED)).toBe('right');
    expect(tableFadeSides(box(200), NOTHING_PINNED)).toBe('left right');
    expect(tableFadeSides(box(500), NOTHING_PINNED)).toBe('left');
  });

  it('never fades an edge a column is pinned to', () => {
    expect(tableFadeSides(box(200), { left: false, right: true })).toBe('left');
    expect(tableFadeSides(box(200), { left: true, right: false })).toBe('right');
    expect(tableFadeSides(box(200), { left: true, right: true })).toBe('');
  });

  it('draws a mask for each set of faded edges, over the fade width', () => {
    for (const sides of ['left', 'right', 'left right']) {
      expect(tableEdgeFade).toContain(`[data-reqore-table-fade='${sides}']`);
    }
    expect(tableEdgeFade).toContain(`${TABLE_EDGE_FADE_PX}px`);
    expect(tableEdgeFade).toContain('mask-image');
  });
});
