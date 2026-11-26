import { badgeNeedsAttention, foldToFit } from '../src/helpers/fold';

type TItem = { id: string; width: number; badge?: unknown };

const row = (ids: string[], attention: string[] = []): TItem[] =>
  ids.map((id) => ({
    id,
    width: 100,
    badge: attention.includes(id) ? { label: 16, intent: 'danger' } : undefined,
  }));

/** The row's width: each shown item at its width, the fold at 80. */
const tooWideAt = (room: number) => (arranged: (TItem | TItem[])[]) =>
  arranged.reduce((sum, item) => sum + (Array.isArray(item) ? 80 : item.width), 0) > room;

const ids = (arranged: (TItem | TItem[])[]) =>
  arranged.map((item) => (Array.isArray(item) ? `[${item.map((i) => i.id).join(',')}]` : item.id));

test('folds from the end until the row fits', () => {
  expect(ids(foldToFit(row(['a', 'b', 'c', 'd', 'e']), tooWideAt(300)))).toEqual(['a', 'b', '[c,d,e]']);
});

test('a row that fits folds nothing', () => {
  expect(ids(foldToFit(row(['a', 'b']), tooWideAt(300)))).toEqual(['a', 'b']);
});

test('an item that needs attention folds last, and the folded keep their order', () => {
  const items = row(['all', 'running', 'failing', 'never', 'disabled', 'archived'], ['failing']);
  const arranged = foldToFit(items, tooWideAt(300), (item) => badgeNeedsAttention(item.badge as never));
  expect(ids(arranged)).toEqual(['all', 'failing', '[running,never,disabled,archived]']);
});

test('when only items that fold last are left, the last of them folds', () => {
  const items = row(['a', 'b', 'c'], ['a', 'b', 'c']);
  const arranged = foldToFit(items, tooWideAt(200), (item) => badgeNeedsAttention(item.badge as never));
  expect(ids(arranged)).toEqual(['a', '[b,c]']);
});

test('never folds below one item', () => {
  expect(ids(foldToFit(row(['a', 'b', 'c']), tooWideAt(10)))).toEqual(['[a,b,c]']);
});

test('a badge needs attention only in red or amber', () => {
  expect(badgeNeedsAttention({ label: 3, intent: 'danger' })).toBe(true);
  expect(badgeNeedsAttention([2, { label: 3, intent: 'warning' }])).toBe(true);
  expect(badgeNeedsAttention({ label: 3, intent: 'info' })).toBe(false);
  expect(badgeNeedsAttention(3)).toBe(false);
  expect(badgeNeedsAttention(undefined)).toBe(false);
});
