/**
 * Pure helpers powering `ReqoreDataView`. Kept in their own module so
 * consumers can use the structural primitives (type detection, envelope
 * unwrapping, scalar formatting) without pulling in the React surface.
 */
import { TReqoreIntent } from '../../constants/theme';

/** A typed-envelope shape — a record whose keys include a type label and a
 *  value field. Many serialisers (REST APIs, MessagePack, custom JSON
 *  encoders) wrap scalars this way; `ReqoreDataView` peels the envelope
 *  off so the inner value renders directly while the type label shows as
 *  a chip. */
export interface IReqoreDataViewEnvelope {
  /** The key on the record that holds the inner value. Defaults to
   *  `'value'`. */
  valueKey?: string;
  /** The key on the record that holds the type label. Defaults to
   *  `'type'`. */
  typeKey?: string;
  /** When set, the envelope is only recognised if EVERY key of the
   *  record is in this list. Lets you distinguish a real envelope
   *  (`{ type, value }`) from a record that happens to have those
   *  fields (`{ type, value, owner, created }`). When omitted, the
   *  matcher requires only that `typeKey` is a string and `valueKey`
   *  is present. */
  allowedKeys?: ReadonlyArray<string>;
}

export const DEFAULT_ENVELOPE: Required<Omit<IReqoreDataViewEnvelope, 'allowedKeys'>> & {
  allowedKeys?: ReadonlyArray<string>;
} = {
  valueKey: 'value',
  typeKey: 'type',
};

/** Classification used to drive value-colouring + the type-chip label. */
export type TReqoreDataValueKind =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'null'
  | 'object'
  | 'array';

/** Map a value to its display kind. */
export const reqoreDataValueKind = (value: unknown, type?: string): TReqoreDataValueKind => {
  if (value === null || value === undefined) return 'null';
  if (value instanceof Date) return 'date';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'string') {
    if (reqoreIsDateType(type)) return 'date';
    return 'string';
  }
  return 'string';
};

/** Map a value kind to the reqore intent that drives its chip colour.
 *  This goes through theme intents (NOT raw colours) so theme switches
 *  are respected. Returns undefined for `string` so plain strings stay
 *  neutral and don't shout. */
export const reqoreDataValueIntent = (kind: TReqoreDataValueKind): TReqoreIntent | undefined => {
  switch (kind) {
    case 'number':
      return 'success';
    case 'boolean':
      return 'warning';
    case 'date':
      return 'info';
    case 'null':
      return 'muted';
    case 'object':
    case 'array':
      return 'info';
    default:
      return undefined;
  }
};

export const reqoreIsRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);

const normalisedType = (type: unknown): string | undefined =>
  typeof type === 'string' && type.trim() ? type.trim().toLowerCase() : undefined;

export const reqoreIsDateType = (type: unknown): boolean => {
  const normal = normalisedType(type);
  return !!normal && /^(date|datetime|time|timestamp)$/i.test(normal);
};

/** Test whether a record matches the configured envelope shape. */
export const reqoreIsEnvelope = (
  value: unknown,
  envelope: IReqoreDataViewEnvelope = DEFAULT_ENVELOPE
): value is Record<string, unknown> => {
  const valueKey = envelope.valueKey ?? 'value';
  const typeKey = envelope.typeKey ?? 'type';

  if (!reqoreIsRecord(value)) return false;
  if (typeof value[typeKey] !== 'string') return false;
  if (!(valueKey in value)) return false;
  if (envelope.allowedKeys) {
    return Object.keys(value).every((key) => envelope.allowedKeys!.includes(key));
  }
  return true;
};

/** Unwrap an envelope's inner value, or return the input unchanged. */
export const reqoreUnwrapEnvelope = (
  value: unknown,
  envelope: IReqoreDataViewEnvelope = DEFAULT_ENVELOPE
): unknown => {
  if (!reqoreIsEnvelope(value, envelope)) return value;
  return value[envelope.valueKey ?? 'value'];
};

/** Pull the type label out of an envelope, or return undefined. */
export const reqoreEnvelopeType = (
  value: unknown,
  envelope: IReqoreDataViewEnvelope = DEFAULT_ENVELOPE
): string | undefined => {
  if (!reqoreIsEnvelope(value, envelope)) return undefined;
  return value[envelope.typeKey ?? 'type'] as string;
};

/** Test whether a value would render as a "structural" block (record /
 *  array) rather than a scalar. Envelope-aware. */
export const reqoreHasStructuredValue = (
  value: unknown,
  envelope: IReqoreDataViewEnvelope = DEFAULT_ENVELOPE
): boolean => {
  const unwrapped = reqoreUnwrapEnvelope(value, envelope);
  if (unwrapped === undefined || unwrapped === null || unwrapped === '') return false;
  if (Array.isArray(unwrapped)) return unwrapped.length > 0;
  if (reqoreIsRecord(unwrapped)) return Object.keys(unwrapped).length > 0;
  return true;
};

/** Immutable set-at-path — walks the structural tree (`data`),
 *  produces a new copy with the leaf at `path` replaced by `value`, and
 *  returns it. Used by the editable mode to apply per-cell edits while
 *  keeping the surrounding shape intact for diffing / undo / parent
 *  re-renders.
 *
 *  Supports nested records and arrays. Numeric path segments are
 *  interpreted as array indices when the parent at that level is an
 *  array. Out-of-range array indices extend the array (pushes
 *  `undefined` into the gap) — useful when an "add item" affordance
 *  appends to a list. Setting a record key that does not yet exist
 *  creates it. */
export const reqoreSetAtPath = (
  data: unknown,
  path: ReadonlyArray<string>,
  value: unknown
): unknown => {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(data)) {
    const index = Number.parseInt(head, 10);
    if (Number.isNaN(index) || index < 0) return data;
    const next = data.slice();
    while (next.length <= index) next.push(undefined);
    next[index] = reqoreSetAtPath(next[index], rest, value);
    return next;
  }
  if (reqoreIsRecord(data)) {
    return { ...data, [head]: reqoreSetAtPath((data as Record<string, unknown>)[head], rest, value) };
  }
  // Walking into a scalar — synthesize the missing container based on
  // the next path segment (numeric → array, otherwise record).
  const nextIsArray = /^\d+$/.test(head);
  const container: unknown = nextIsArray ? [] : {};
  return reqoreSetAtPath(container, path, value);
};

/** Coerce a value to a target value-kind, preserving the existing
 *  content where reasonable. Powers the inline type-change picker —
 *  when the operator flips a string to a number we try to parse it;
 *  when they flip a number to a boolean we use the standard
 *  zero-is-false rule; flips to an object or array discard the scalar
 *  and yield an empty container ready to be filled in.
 *
 *  Returns sensible defaults when conversion isn't possible:
 *    - string  → unchanged for string; `String(value)` for scalars; `''` for objects/arrays/null
 *    - number  → parsed when possible; `0` otherwise; booleans → 0/1
 *    - boolean → unchanged for boolean; `'true'`/`'1'` → true; numbers → !!value; else false
 *    - object  → unchanged for record; `{}` otherwise
 *    - array   → unchanged for array; `[]` otherwise
 *    - null    → always `null`
 */
export const reqoreCoerceValueToKind = (
  current: unknown,
  kind: TReqoreDataValueKind
): unknown => {
  switch (kind) {
    case 'string':
      if (typeof current === 'string') return current;
      if (typeof current === 'number' || typeof current === 'boolean') {
        return String(current);
      }
      return '';
    case 'number': {
      if (typeof current === 'number') return current;
      if (typeof current === 'boolean') return current ? 1 : 0;
      if (typeof current === 'string') {
        const trimmed = current.trim();
        if (trimmed === '') return 0;
        const parsed = Number(trimmed);
        return Number.isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    }
    case 'boolean':
      if (typeof current === 'boolean') return current;
      if (typeof current === 'number') return current !== 0;
      if (typeof current === 'string') {
        const lower = current.trim().toLowerCase();
        return lower === 'true' || lower === '1' || lower === 'yes';
      }
      return false;
    case 'object':
      return reqoreIsRecord(current) ? current : {};
    case 'array':
      return Array.isArray(current) ? current : [];
    case 'null':
    default:
      return null;
  }
};

/** Immutable key-rename — locate the record at `path` and rename one
 *  of its keys while preserving the insertion order of every other
 *  key. Returns the input unchanged if the path doesn't resolve to a
 *  record, if `oldKey` isn't a key on that record, or if `newKey` is
 *  already taken (refuses to overwrite). */
export const reqoreRenameKeyAtPath = (
  data: unknown,
  path: ReadonlyArray<string>,
  oldKey: string,
  newKey: string
): unknown => {
  if (oldKey === newKey) return data;
  if (path.length === 0) {
    if (!reqoreIsRecord(data)) return data;
    if (!(oldKey in data) || newKey in data) return data;
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      next[k === oldKey ? newKey : k] = v;
    }
    return next;
  }
  const [head, ...rest] = path;
  if (Array.isArray(data)) {
    const index = Number.parseInt(head, 10);
    if (Number.isNaN(index) || index < 0 || index >= data.length) return data;
    const arr = data.slice();
    arr[index] = reqoreRenameKeyAtPath(arr[index], rest, oldKey, newKey);
    return arr;
  }
  if (reqoreIsRecord(data)) {
    return {
      ...data,
      [head]: reqoreRenameKeyAtPath(
        (data as Record<string, unknown>)[head],
        rest,
        oldKey,
        newKey
      ),
    };
  }
  return data;
};

/** Immutable delete-at-path — walks the structural tree (`data`),
 *  produces a new copy with the leaf at `path` removed. For records,
 *  the key is dropped; for arrays, the index is spliced out (so later
 *  indices shift down). Returns the input unchanged if the path
 *  doesn't resolve. */
export const reqoreDeleteAtPath = (
  data: unknown,
  path: ReadonlyArray<string>
): unknown => {
  if (path.length === 0) return undefined;
  const [head, ...rest] = path;
  if (Array.isArray(data)) {
    const index = Number.parseInt(head, 10);
    if (Number.isNaN(index) || index < 0 || index >= data.length) return data;
    if (rest.length === 0) {
      const next = data.slice();
      next.splice(index, 1);
      return next;
    }
    const next = data.slice();
    next[index] = reqoreDeleteAtPath(next[index], rest);
    return next;
  }
  if (reqoreIsRecord(data)) {
    if (!(head in data)) return data;
    if (rest.length === 0) {
      const { [head]: _dropped, ...remaining } = data as Record<string, unknown>;
      return remaining;
    }
    return {
      ...data,
      [head]: reqoreDeleteAtPath((data as Record<string, unknown>)[head], rest),
    };
  }
  return data;
};

/** The shape returned by a custom `parseEmbedded` hook — used by the
 *  view to swap an embedded structured string in-place for the parsed
 *  tree. The optional `prefix` lets the source string carry a leading
 *  natural-language prefix that we render above the tree. */
export interface IReqoreDataViewEmbedded {
  prefix?: string;
  data: unknown;
}

/** Default scalar formatter — works on the value AFTER envelope unwrap.
 *  Handles dates (Date object + ISO strings when the type label says so),
 *  numbers / booleans (toString), strings (unchanged), and the
 *  null/undefined/empty trio (em-dash placeholder).
 *
 *  `parseDate` (optional) lets the caller plug in a stricter or looser
 *  date matcher. Without it, the default only matches the type label
 *  AND `Date.parse`able strings (so a UUID won't accidentally be
 *  treated as a date).
 *
 *  `formatDate` (optional) controls the display of a recognised date —
 *  defaults to `new Date(iso).toLocaleString()`.
 */
export interface IReqoreDataViewScalarOptions {
  parseDate?: (value: string, type?: string) => string | undefined;
  formatDate?: (iso: string) => string;
}

export interface IReqoreDataViewScalar {
  display: string;
  isDate: boolean;
  /** The original (un-normalised) input, only set when the display
   *  string differs from the input — e.g. for a date that we reformatted
   *  away from its server-provided shape. */
  raw?: string;
  /** The normalised kind, useful for choosing the chip intent. */
  kind: TReqoreDataValueKind;
}

const defaultParseDate = (value: string, type?: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) return undefined;
  // Without a date hint, only match strings that LOOK like dates (so a
  // bare integer parsed as epoch ms doesn't get reformatted).
  if (!reqoreIsDateType(type) && !/\d{4}-\d{2}-\d{2}|T\d{2}:\d{2}|\d{2}:\d{2}:\d{2}/.test(trimmed)) {
    return undefined;
  }
  return new Date(parsed).toISOString();
};

const defaultFormatDate = (iso: string): string => new Date(iso).toLocaleString();

export const reqoreFormatScalar = (
  value: unknown,
  type?: string,
  options: IReqoreDataViewScalarOptions = {}
): IReqoreDataViewScalar => {
  const parseDate = options.parseDate ?? defaultParseDate;
  const formatDate = options.formatDate ?? defaultFormatDate;

  if (value === undefined || value === null || value === '') {
    return { display: '—', isDate: false, kind: 'null' };
  }

  if (value instanceof Date) {
    const iso = value.toISOString();
    return { display: formatDate(iso), raw: iso, isDate: true, kind: 'date' };
  }

  if (typeof value === 'string') {
    const iso = parseDate(value, type);
    if (iso) {
      return { display: formatDate(iso), raw: value, isDate: true, kind: 'date' };
    }
    return { display: value, isDate: false, kind: 'string' };
  }

  if (typeof value === 'number') {
    return { display: String(value), isDate: false, kind: 'number' };
  }

  if (typeof value === 'boolean') {
    return { display: String(value), isDate: false, kind: 'boolean' };
  }

  try {
    return { display: JSON.stringify(value), isDate: false, kind: 'string' };
  } catch {
    return { display: String(value), isDate: false, kind: 'string' };
  }
};
