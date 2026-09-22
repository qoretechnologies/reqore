/*
 * The two rules that decide what a select ITEM shows, and the string the
 * preview of a structured one is built from.
 *
 * They live in `helpers/` rather than in `Select` because the DROPDOWN's rows
 * apply the same rules — the list and the selection are two halves of one
 * control and must not disagree about what an unlabelled item says — and
 * `Dropdown/item` reaching into `Select` for them closed a module cycle:
 * `Select` value-imports `ReqoreDropdown` from the barrel, which reaches
 * `Dropdown/item`, which reached back. A cycle like that resolves to
 * `undefined` for whichever side is evaluated first, which is an import-order
 * bug waiting for an unrelated reordering to detonate it. A helper is
 * downstream of both, so there is nothing to order.
 *
 * Pure, and a `.ts`: the rendered preview — the styled block the string goes
 * into, and the tooltip built around it — is `Select`'s own, and lives in
 * `components/Select/valuePreview`. Only `Dropdown/item` reaches in here, and
 * only for `selectItemLabel`, so the cycle stays closed by this half alone
 * while `helpers/` stays free of React.
 */
import type { TReqoreSelectItem } from '../components/Select';

/**
 * A readable preview of a structured value, for the chip's tooltip.
 *
 * The label names WHICH preset was picked; it cannot show what is in it. For a
 * hash the operator has otherwise no way to see what they chose without
 * reopening the list and reading the source, so the contents are offered on
 * hover instead.
 *
 * Capped, because a tooltip is a glance and a large hash is not: past the cap
 * the reader is better served by opening the value properly. `JSON.stringify`
 * throws on a circular structure, which is a thing a consumer's value can
 * legitimately be, so a value that cannot be previewed simply gets no tooltip.
 */
const STRUCTURED_TOOLTIP_MAX = 600;

/**
 * And a cap on LINES, which is the one that bounds the popover's HEIGHT.
 *
 * The character cap alone does not: pretty-printed JSON is mostly short lines, so 600
 * characters of a nested hash is roughly forty of them — around 700px, most of a laptop
 * screen, for something the reader triggered by pointing at it. Height is what makes a
 * tooltip oppressive, and height is a count of lines, so that is what to count.
 *
 * There is no scrolling to fall back on: `InternalPopover` clamps its width to the
 * viewport but sets no default max-height, and a hover popover closes when the pointer
 * leaves the trigger — and is `pointer-events: none` besides — so anything past the fold
 * could be neither seen nor reached. Better to stop early and say so with the ellipsis
 * than to render a wall and clip it silently.
 *
 * Twelve because a tooltip is a glance. Past that the reader is better served by opening
 * the value properly, which is the consumer's surface and not this one.
 */
const STRUCTURED_TOOLTIP_MAX_LINES = 12;

/**
 * And a cap on the length of ONE line, which is the one that bounds the WIDTH.
 *
 * Neither cap above touches width, and the preview is set `white-space: pre`, which
 * never wraps. A value whose bulk is one long scalar rather than deep structure —
 * a SQL statement, a URL, a base64 blob, a stack trace — therefore serialises to a
 * handful of enormous lines: measured, an 11.5kb hash holding one long `sql` string
 * came out as 3 lines whose longest was 598 characters, about 4300px at this font.
 * The line cap does not bite (3 < 12) and the character cap is a budget for the whole
 * preview, not for one line of it, so it does not either.
 *
 * What happens then is the bad kind of failure: the popover wrapper clamps itself to
 * the viewport and `StyledPopoverContent` is `overflow: hidden`, so the line is cut
 * off mid-value with nothing to say that it was — a full-width tooltip showing a
 * prefix that looks like the whole value.
 *
 * So each line is cut here instead, where an ellipsis can be put on it. A hundred
 * characters is about 720px at `TEXT_FROM_SIZE.small` in `MONO_FONT`, comfortably
 * inside a laptop viewport, and far past the width of any line that ordinary nested
 * JSON produces — the 205-line config hash measured alongside the case above has a
 * longest line of 44 characters, so this is inert for it.
 */
const STRUCTURED_TOOLTIP_MAX_LINE_CHARS = 100;

/**
 * Previews already built, keyed by the value they describe.
 *
 * `selectItemTooltip` is called from a chip's render, so without this a select
 * holding a large hash re-serialises the whole thing on every render that does
 * not bail out of `memo` — 10kb of `JSON.stringify` to keep at most 600
 * characters of it, and the caps cannot help because they apply to the result.
 *
 * Keyed on the value itself, which is sound for the same reason the editor's
 * chip-props cache is: a value the consumer has not replaced is the same object,
 * and a replaced one is a new object that misses. Entries go with the values.
 * Only objects reach here — the scalar case returns before this — so a WeakMap
 * can key on them, and `has` rather than `get` because `undefined` is a real
 * answer (the circular case) and not an absence.
 */
const previewCache = new WeakMap<object, string | undefined>();

/** Cuts one line to the width cap, marking it where it was cut. */
const capLine = (line: string): string =>
  line.length > STRUCTURED_TOOLTIP_MAX_LINE_CHARS
    ? `${line.slice(0, STRUCTURED_TOOLTIP_MAX_LINE_CHARS)}…`
    : line;

export const structuredValueTooltip = (value: unknown): string | undefined => {
  if (value === null || typeof value !== 'object') {
    return undefined;
  }

  if (previewCache.has(value)) {
    return previewCache.get(value);
  }

  const preview = buildStructuredPreview(value);

  previewCache.set(value, preview);

  return preview;
};

const buildStructuredPreview = (value: object): string | undefined => {
  try {
    const preview = JSON.stringify(value, null, 2);

    if (!preview) {
      return undefined;
    }

    const lines = preview.split('\n');
    const tooTall = lines.length > STRUCTURED_TOOLTIP_MAX_LINES;
    const visible = tooTall ? lines.slice(0, STRUCTURED_TOOLTIP_MAX_LINES) : lines;
    /* Width before the character budget below, so the budget is spent on lines
       the reader can see rather than on the tail of one already cut. Each cut
       line carries its own ellipsis: it marks THAT value as continuing, which
       the single trailing one at the end cannot say for a line in the middle. */
    const kept = visible.map(capLine);
    const tooWide = kept.some((line, index) => line !== visible[index]);
    const capped = kept.join('\n');
    const tooLong = capped.length > STRUCTURED_TOOLTIP_MAX;

    // One TRAILING ellipsis however many of the three caps applied — two in a
    // row there would read as part of the value.
    return tooTall || tooLong || tooWide
      ? `${tooLong ? capped.slice(0, STRUCTURED_TOOLTIP_MAX) : capped}\n…`
      : capped;
  } catch {
    return undefined;
  }
};

/**
 * What an item with no `label` shows: its own value.
 *
 * The fallback exists because a selected value with no matching item still has
 * to be drawn as something — without it the value is held and nothing appears,
 * which reads as "nothing is selected".
 *
 * The scalar is STRINGIFIED rather than passed through. `label` is rendered as
 * a React child, and React renders `true` and `false` as nothing: a select over
 * flags drew an empty chip with no accessible name — for exactly the values
 * this fallback is meant to cover. `0` survived only because React renders a
 * number.
 *
 * A structured value has no label form, so it gets none; `selectItemTooltip`
 * previews it on hover instead. Shared with the dropdown's own rows so the two
 * halves of one list cannot disagree about what an unlabelled item says.
 */
export const selectItemLabel = (
  item: Pick<TReqoreSelectItem, 'label'> & { value?: any }
): string | number | undefined => {
  if (item.label !== undefined && item.label !== null && item.label !== '') {
    return item.label;
  }

  const { value } = item;

  return value === undefined || value === null || typeof value === 'object' ?
      undefined
    : String(value);
};
