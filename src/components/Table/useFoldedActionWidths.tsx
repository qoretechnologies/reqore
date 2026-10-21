// Copyright 2026 Qore Technologies, s.r.o.
import { isEqual, pick } from 'lodash';
import { ReactElement, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TSizes } from '../../constants/sizes';
import styled from '../../helpers/styled';
import ReqoreButton from '../Button';
import { IReqoreTableColumn, IReqoreTableRowData, TReqoreTableCellAction } from './index';
import { getFoldedActionTexts } from './helpers';

/**
 * Rounding slack, in px: canvas text metrics and layout disagree by a fraction, and a text measured a
 * hair narrower than it is drawn would be cut to an ellipsis.
 */
const FOLDED_TEXT_SLACK_PX = 1;

/** An action's props that change how much its button draws around its words. */
const PROBE_STYLE_PROPS: (keyof TReqoreTableCellAction)[] = [
  'size',
  'flat',
  'compact',
  'square',
  'minimal',
  'badge',
  'labelEffect',
  'verticalPadding',
];

/**
 * Out of sight and out of the way: a box of no size that clips what it holds, so nothing in it reaches
 * past the table or makes anything scroll, and inside it the buttons laid out at their own width, so
 * each draws nothing but itself.
 */
const StyledFoldedActionsProbe = styled.div`
  position: relative;
  flex: none;
  width: 0;
  height: 0;
  overflow: hidden;
  visibility: hidden;
  pointer-events: none;

  > div {
    position: absolute;
    top: 0;
    left: 0;
    width: max-content;
    display: flex;
    flex-flow: column;
    align-items: flex-start;
  }
`;

let canvas: HTMLCanvasElement | undefined;

/** One canvas for every measurement: allocating it is the expensive part. */
const getCanvasContext = (): CanvasRenderingContext2D | null => {
  try {
    canvas = canvas ?? document.createElement('canvas');

    return canvas.getContext('2d');
  } catch {
    return null;
  }
};

export interface IUseFoldedActionWidths {
  /** Each folded column's width for its words, by column id; `Infinity` where they cannot be measured. */
  widths: Readonly<Record<string, number>>;
  /** Rendered in the table: the buttons the words are measured in, out of sight. */
  probe: ReactElement | null;
}

/**
 * How wide each folded actions column must be for its cells' words (qorus#646): a row's one action with
 * no icon says its `shortLabel`, or its label, and a column folded to the menu button's square cut it
 * to "T…". Over the rows given (the table's rows, so the width holds as they scroll and page), the
 * widest of a column's words is measured with the browser's text metrics in the font of a button drawn
 * as the cell draws it, plus what that button draws around its words.
 *
 * Measured again when the words change and when a font finishes loading (`document.fonts`
 * `loadingdone`): a fallback face measured before the page's font arrived would cut the words once it
 * did.
 */
export const useFoldedActionWidths = (
  columns: IReqoreTableColumn[],
  foldedIds: readonly string[],
  rows: IReqoreTableRowData[],
  size: TSizes
): IUseFoldedActionWidths => {
  const texts = useMemo(
    () => getFoldedActionTexts(columns, foldedIds, rows),
    [columns, foldedIds, rows]
  );
  const probeRef = useRef<HTMLDivElement>(null);
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [fontsLoaded, setFontsLoaded] = useState(0);
  const hasTexts = Object.keys(texts).length > 0;

  useEffect(() => {
    const fonts = typeof document === 'undefined' ? undefined : document.fonts;

    if (!hasTexts || !fonts?.addEventListener) {
      return undefined;
    }

    const measureAgain = () => setFontsLoaded((count) => count + 1);

    fonts.addEventListener('loadingdone', measureAgain);

    return () => fonts.removeEventListener('loadingdone', measureAgain);
  }, [hasTexts]);

  useLayoutEffect(() => {
    const next: Record<string, number> = {};
    // each column's probe, by its id: read off the element, so no id has to be written as a selector
    const probes = new Map(
      Array.from(probeRef.current?.children ?? []).map((element) => [
        element.getAttribute('data-reqore-folded-probe'),
        element,
      ])
    );

    for (const [dataId, { texts: words, unmeasurable }] of Object.entries(texts)) {
      const button = probes.get(dataId)?.querySelector<HTMLElement>('.reqore-button');
      const text = button?.querySelector<HTMLElement>(
        '.reqore-button-text-content:not([aria-hidden])'
      );
      const context = !unmeasurable && text ? getCanvasContext() : null;

      if (!button || !text || !context) {
        next[dataId] = Infinity;
        continue;
      }

      // the font of the element that paints the words; letter-spacing is not in the canvas font
      const style = getComputedStyle(text);
      context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const spacing = parseFloat(style.letterSpacing) || 0;
      // what the button draws around its words: padding, border, the spacers beside them
      const around = button.getBoundingClientRect().width - text.getBoundingClientRect().width;
      const widest = Math.max(
        ...words.map((word) => context.measureText(word).width + spacing * word.length)
      );

      next[dataId] = Math.ceil(widest + around + FOLDED_TEXT_SLACK_PX);
    }

    setWidths((current) => (isEqual(current, next) ? current : next));
  }, [texts, fontsLoaded]);

  const probe = hasTexts ? (
    <StyledFoldedActionsProbe aria-hidden className='reqore-table-folded-probe'>
      <div ref={probeRef}>
        {Object.entries(texts).map(([dataId, { texts: words, action }]) =>
          words.length ? (
            <div key={dataId} data-reqore-folded-probe={dataId}>
              <ReqoreButton
                rounded={false}
                flat
                size={size}
                tabIndex={-1}
                {...pick(action, PROBE_STYLE_PROPS)}
                label={words[0]}
              />
            </div>
          ) : null
        )}
      </div>
    </StyledFoldedActionsProbe>
  ) : null;

  return { widths, probe };
};
