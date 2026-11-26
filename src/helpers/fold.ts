import { isArray, isObject } from 'lodash';
import { TReqoreBadge } from '../components/Button';

/**
 * A badge that needs a person: one drawn with a `danger` or `warning` intent ("Failing 16" in
 * red). A row of choices folds the item carrying it last, so the count stays on screen.
 */
export const badgeNeedsAttention = (badge?: TReqoreBadge | TReqoreBadge[]): boolean =>
  (isArray(badge) ? badge : [badge]).some(
    (item) =>
      isObject(item) &&
      ((item as { intent?: string }).intent === 'danger' ||
        (item as { intent?: string }).intent === 'warning')
  );

/**
 * Folds a row's items into a trailing group (the "More" a segmented control or a tab strip draws)
 * until the row is no longer too wide, one item at a time from the end. An item `foldsLast` says
 * so of (a count that needs attention) stays while any other item can fold in its place; the
 * folded items keep their order in the row. The group counts as one item, and the row never
 * folds below one.
 */
export const foldToFit = <T>(
  items: T[],
  tooWide: (arranged: (T | T[])[]) => boolean,
  foldsLast: (item: T) => boolean = () => false
): (T | T[])[] => {
  const shown = [...items];
  const folded: T[] = [];
  const arranged = (): (T | T[])[] => (folded.length ? [...shown, folded] : shown);

  while (tooWide(arranged()) && arranged().length > 1) {
    let index = shown.length - 1;
    while (index > 0 && foldsLast(shown[index])) index--;
    // only items that fold last are left (or the first one): fold the last of them
    if (foldsLast(shown[index])) index = shown.length - 1;
    const [item] = shown.splice(index, 1);
    folded.push(item);
    folded.sort((a, b) => items.indexOf(a) - items.indexOf(b));
  }

  return arranged();
};

/**
 * `foldToFit` for a row whose fold is labelled by what it holds (a function `overflowLabel`):
 * folds with the label in full and with it in its short form ("+3"), which `tooWide` is told
 * about, and keeps the full label unless the short one keeps more of the items that fold last
 * on screen (or the row only fits with it). `short` says which one the row is drawn with. A fixed label has no short
 * form: pass `shortens` false.
 */
export const foldToFitWithLabel = <T>(
  items: T[],
  tooWide: (arranged: (T | T[])[], short: boolean) => boolean,
  foldsLast: (item: T) => boolean = () => false,
  shortens = true
): { arranged: (T | T[])[]; short: boolean } => {
  const full = foldToFit(items, (arranged) => tooWide(arranged, false), foldsLast);
  if (!shortens) {
    return { arranged: full, short: false };
  }
  const short = foldToFit(items, (arranged) => tooWide(arranged, true), foldsLast);
  // what must stay on screen (`foldsLast`) decides: the short label only where it keeps more of it
  const kept = (arranged: (T | T[])[]) =>
    arranged.filter((item) => !Array.isArray(item) && foldsLast(item as T)).length;
  const useShort =
    kept(short) > kept(full) || (tooWide(full, false) && !tooWide(short, true));
  return useShort ? { arranged: short, short: true } : { arranged: full, short: false };
};

/** A fold's label in its short form: how many it holds ("+3"). */
export const shortFoldLabel = (folded: unknown[]): string => `+${folded.length}`;
