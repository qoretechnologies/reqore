/*
 * The two rules that decide what a select ITEM shows, and the preview one of
 * them hangs a tooltip on.
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
 */
import styled from 'styled-components';
import { MONO_FONT } from '../constants/fonts';
import { TEXT_FROM_SIZE } from '../constants/sizes';
import type { TReqoreSelectItem, TReqoreSelectValue } from '../components/Select';
import type { IReqoreTagProps } from '../components/Tag';

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
 * And a cap on LINES, which is the one that actually bounds the popover.
 *
 * The character cap alone does not: pretty-printed JSON is mostly short lines, so 600
 * characters of a nested hash is roughly forty of them — around 700px, most of a laptop
 * screen, for something the reader triggered by pointing at it. Height is what makes a
 * tooltip oppressive, and height is a count of lines, so that is what to count.
 *
 * There is no scrolling to fall back on: `InternalPopover` clamps its width to the
 * viewport but sets no default max-height, and a hover popover closes when the pointer
 * leaves the trigger, so anything past the fold could be neither seen nor reached. Better
 * to stop early and say so with the ellipsis than to render a wall and clip it silently.
 *
 * Twelve because a tooltip is a glance. Past that the reader is better served by opening
 * the value properly, which is the consumer's surface and not this one.
 */
const STRUCTURED_TOOLTIP_MAX_LINES = 12;

export const structuredValueTooltip = (value: unknown): string | undefined => {
  if (value === null || typeof value !== 'object') {
    return undefined;
  }

  try {
    const preview = JSON.stringify(value, null, 2);

    if (!preview) {
      return undefined;
    }

    const lines = preview.split('\n');
    const tooTall = lines.length > STRUCTURED_TOOLTIP_MAX_LINES;
    const capped = tooTall ? lines.slice(0, STRUCTURED_TOOLTIP_MAX_LINES).join('\n') : preview;
    const tooLong = capped.length > STRUCTURED_TOOLTIP_MAX;

    // One ellipsis however many caps applied — two would read as part of the value.
    return tooTall || tooLong
      ? `${tooLong ? capped.slice(0, STRUCTURED_TOOLTIP_MAX) : capped}\n…`
      : capped;
  } catch {
    return undefined;
  }
};

/**
 * The preview block itself.
 *
 * A value is data, so it is set in the platform's own monospace — the stack
 * `ReqoreDataView` uses for the same reason — and its whitespace is preserved,
 * because the indentation IS the structure. Rendered as pre-formatted text
 * rather than through `ReqoreDataView`: that component is a panel with
 * collapsible sections, which is the right way to READ a value and the wrong
 * thing to put inside a hover tooltip (a 236px interactive tree that vanishes
 * when the pointer leaves).
 */
const StyledValuePreview = styled.span`
  display: block;
  font-family: ${MONO_FONT};
  /* The scale, not the number it currently resolves to. 12px IS
     TEXT_FROM_SIZE.small, so writing the literal changes nothing today and
     silently stops tracking the day the scale moves. */
  font-size: ${TEXT_FROM_SIZE.small}px;
  white-space: pre;
`;

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

/**
 * What the chip offers on hover.
 *
 * An item's own tooltip always wins: a consumer that says what the value means
 * knows better than a dump of it. The preview only fills the gap where a
 * structured value would otherwise be invisible behind its label.
 */
export const selectItemTooltip = (
  item: TReqoreSelectItem<TReqoreSelectValue>
): IReqoreTagProps['tooltip'] => {
  if (item.tooltip) {
    return item.tooltip;
  }

  const preview = structuredValueTooltip(item.value);

  return preview ?
      {
        content: (
          <StyledValuePreview className='reqore-select-item-value-preview'>
            {preview}
          </StyledValuePreview>
        ),
      }
    : undefined;
};
