/*
 * The rendered half of a structured value's preview: the block the string goes
 * into, and the tooltip built around it.
 *
 * Separate from `helpers/selectItem`, which holds the rules that decide what the
 * string SAYS. Those are shared with `Dropdown/item` and had to leave `Select`
 * to break a module cycle; this half is reached only from `ReqoreSelectItem` in
 * this same folder, so it can live here — which keeps `helpers/` free of React,
 * as it is documented to be, without reopening the cycle.
 */
import styled from 'styled-components';
import { MONO_FONT } from '../../constants/fonts';
import { TEXT_FROM_SIZE } from '../../constants/sizes';
import { structuredValueTooltip } from '../../helpers/selectItem';
import type { IReqoreTagProps } from '../Tag';
import type { TReqoreSelectItem, TReqoreSelectValue } from '.';

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
 *
 * `white-space: pre` never wraps, so what bounds this block's WIDTH is the
 * per-line cap in `structuredValueTooltip` and not anything here — see
 * `STRUCTURED_TOOLTIP_MAX_LINE_CHARS`. Wrapping instead would trade the width
 * problem for a height one, since a wrapped line spends several visual lines
 * against a cap that counts logical ones.
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
