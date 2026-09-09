/** How well a value answers a search query. Higher is better; `0` is no match. */
export type TReqoreQueryMatch = 0 | 1 | 2 | 3 | 4;

/**
 * Scores one value against a lower-cased query: an exact value wins over a value
 * that starts with the query, which wins over a value with a word that starts with
 * it, which wins over a value that merely contains it. Objects and empty values
 * never match; numbers match as their text.
 */
export const getQueryMatchScore = (value: unknown, query: string): TReqoreQueryMatch => {
  if (value === undefined || value === null || typeof value === 'object') {
    return 0;
  }

  const text = value.toString().toLowerCase();

  if (text === query) {
    return 4;
  }

  if (text.startsWith(query)) {
    return 3;
  }

  const at = text.indexOf(query);

  if (at === -1) {
    return 0;
  }

  return /[^a-z0-9]/.test(text.charAt(at - 1)) ? 2 : 1;
};

/** Reads one searchable field of an item; `undefined` when the item has none. */
export type TReqoreQueryField<T> = (item: T) => unknown;

/** The searchable text of a field value: strings and numbers as they are, anything else nothing. */
export const asSearchText = (value: unknown): string | number | undefined =>
  typeof value === 'string' || typeof value === 'number' ? value : undefined;

/**
 * Orders items that already passed a search filter by how well they match it.
 *
 * A filter says which items contain the query; it says nothing about order, so a
 * list searched by name showed the items *called* that name wherever the alphabet
 * put them, among items that merely mention the word somewhere. Items are ranked by
 * the FIRST field that matches, with `fields` in the order they matter — the first
 * field is what an item IS (its label), so a label that merely contains the word
 * beats a description that starts with it — and within that field by how well it
 * matches (exact, prefix, word prefix, substring). An item matched only through
 * data no field covers ranks last. Ties keep the order they arrived in, so the
 * caller's ordering still decides between equally good matches.
 */
export const rankByQuery = <T>(items: T[], query: string, fields: TReqoreQueryField<T>[]): T[] => {
  if (!query) {
    return items;
  }

  const ranked = items.map((item, index) => {
    const field = fields.findIndex((read) => getQueryMatchScore(read(item), query) > 0);
    const score = field === -1 ? 0 : getQueryMatchScore(fields[field](item), query);

    return { item, index, field: field === -1 ? fields.length : field, score };
  });

  return ranked
    .sort((a, b) => a.field - b.field || b.score - a.score || a.index - b.index)
    .map(({ item }) => item);
};

/** The one prop name every searchable component uses for the ranking opt-in. */
export type TReqoreFilterRanking = 'relevance' | 'none';
