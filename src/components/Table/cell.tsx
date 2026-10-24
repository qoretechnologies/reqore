import { lighten, rgba } from 'polished';
import { forwardRef, memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { css, useTheme } from 'styled-components';
import { IReqoreTableColumn } from '.';
import { TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import {
  changeLightness,
  getDrawnColor,
  getReadableColorFrom,
  getThemeSurface,
  TReqoreSurface,
} from '../../helpers/colors';
import { ReqoreSurfaceProvider, useReqoreSurface } from '../../context/SurfaceContext';
import styled, { omitStyleProps } from '../../helpers/styled';
import { alignToFlexAlign } from '../../helpers/utils';
import { TABLE_CELL_HORIZONTAL_PADDING_PX } from './helpers';
import { IWithReqoreTooltip } from '../../types/global';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import { TReqoreColor, TReqoreHexColor } from '../Effect';
import { ReqoreTooltipComponent } from '../TooltipComponent';
import { IReqoreTableCellStyle } from './row';

export interface IReqoreCustomTableBodyCellProps extends IReqoreTableBodyCellProps {}
export interface IReqoreCustomTableBodyCell extends React.FC<IReqoreCustomTableBodyCellProps> {}
export interface IReqoreTableBodyCellProps
  extends Partial<IReqoreTableColumn>,
    React.HTMLAttributes<HTMLDivElement>,
    IWithReqoreTooltip {
  children?: React.ReactNode;
  padded?: IReqoreTableColumn['cell']['padded'];
  wrap?: boolean;
  pinOffset?: number;
  pinEdge?: boolean;
  maxHeight?: number;
  size?: TSizes;
  expandHeightButtonProps?: Partial<IReqoreButtonProps>;
}

/** What decides a cell's paint. */
type TReqoreTableCellPaintProps = Pick<
  IReqoreTableCellStyle,
  'theme' | 'intent' | 'selected' | 'selectedIntent' | 'striped' | 'even' | 'hovered' | 'pin'
>;

/** A cell's paint: what it is painted in, and that as it is drawn (see `getTableCellPaint`). */
interface IReqoreTableCellPaint {
  backgroundColor: TReqoreColor;
  displayedBackgroundColor: TReqoreHexColor;
}

/** What the cell component has already worked out for its styles, once per change rather than per style. */
interface IStyledTableCellPaint {
  /** The column's narrowest and widest. */
  minWidth?: number;
  maxWidth?: number;
  /** What the table is drawn on (`useReqoreSurface`). */
  $surface?: TReqoreSurface;
  /** The cell's paint (`getTableCellPaint`). */
  $paint?: IReqoreTableCellPaint;
  /** The cell's text color, read on the cell as it is drawn. */
  $color?: TReqoreHexColor;
}

/**
 * A cell's paint: its color (the theme's, or the row's intent), lightened for each of what the row is - an
 * intent's, striped and odd, selected, hovered - and drawn at 30%; `transparent` when it is none of them (an
 * unpinned cell). A pinned cell is opaque: the paint over the theme's main.
 */
const getTableCellPaint = ({
  theme,
  intent,
  selected,
  selectedIntent,
  striped,
  even,
  hovered,
  pin,
}: TReqoreTableCellPaintProps): IReqoreTableCellPaint => {
  const color =
    intent || (selected && selectedIntent)
      ? theme.intents[intent || selectedIntent]
      : theme.main;
  let opacity = 0;
  // Is there any intent
  if (intent || (selected && selectedIntent)) {
    opacity += 0.02;
  }
  // Is the table striped and this row odd
  if (striped && !even) {
    opacity += 0.05;
  }
  // Is this row selected
  if (selected) {
    opacity += 0.02;
  }
  // Is this row hovered
  if (hovered) {
    opacity += 0.08;
  }

  // Pinned cells must paint opaque — otherwise non-pinned cells scrolling underneath show through
  const backgroundColor: TReqoreColor =
    opacity === 0 ? (pin ? theme.main : 'transparent') : changeLightness(color, opacity);

  return {
    backgroundColor,
    displayedBackgroundColor:
      backgroundColor === 'transparent'
        ? theme.main
        : (rgba(backgroundColor, 0.3) as TReqoreHexColor),
  };
};

/**
 * A cell as it is drawn: its paint over what the table is drawn on (a pinned one over the theme's main), or
 * what the table is drawn on alone when it paints nothing.
 */
const getTableCellBackground = (
  { theme, pin }: Pick<TReqoreTableCellPaintProps, 'theme' | 'pin'>,
  { backgroundColor, displayedBackgroundColor }: IReqoreTableCellPaint,
  surface?: TReqoreSurface
): TReqoreHexColor => {
  const under = pin ? getDrawnColor(theme.main) : getThemeSurface(theme, surface);

  return backgroundColor === 'transparent' ? under : getDrawnColor(displayedBackgroundColor, under);
};

/** A length in px, for a CSS variable: none for a value that is not a number, which CSS drops. */
const toPx = (value?: number): string | undefined =>
  Number.isFinite(value) ? `${value}px` : undefined;

/** A cell's flex-grow: its column's, else 1 for a column with no width; none for a column that has one. */
const getTableCellGrow = ({ grow, width }: Pick<IReqoreTableCellStyle, 'grow' | 'width'>) =>
  grow || (width ? undefined : 1);

/**
 * What a cell is drawn with that differs from one cell to the next - its column's widths, its pin offset and height
 * cap, and its colors - as CSS variables on the cell, which its styles read. Written into the styles, every width
 * and color made a class of its own (over 200 in one table story, and styled-components warned); the styles now
 * differ only in what a cell is (pinned, wrapping, padded, interactive, ...). A variable a cell has no value for is
 * not set, and its styles do not read it, as they left out a declaration with no value.
 */
const getTableCellVariables = ({
  width,
  minWidth,
  maxWidth,
  pin,
  pinOffset,
  maxHeight,
  interactiveCell,
  theme,
  intent,
  selected,
  selectedIntent,
  striped,
  even,
  hovered,
  $surface,
  $paint,
  $color,
}: IReqoreTableCellStyle & IStyledTableCellPaint): Record<`--${string}`, string | undefined> => {
  // the component's, when it has worked them out
  const paint =
    $paint ??
    getTableCellPaint({ theme, intent, selected, selectedIntent, striped, even, hovered, pin });
  const { backgroundColor, displayedBackgroundColor } = paint;
  const hover = interactiveCell ? lighten(0.1, displayedBackgroundColor) : undefined;

  return {
    '--reqore-table-cell-width': toPx(width),
    '--reqore-table-cell-min-width': toPx(minWidth),
    '--reqore-table-cell-max-width': toPx(maxWidth),
    '--reqore-table-cell-pin-offset': pin ? `${pinOffset || 0}px` : undefined,
    '--reqore-table-cell-max-height': maxHeight ? `${maxHeight}px` : undefined,
    // Pinned cells need an opaque paint so non-pinned cells scrolling underneath don't show
    // through. We layer the semi-transparent displayed color over a solid theme.main base.
    '--reqore-table-cell-background': pin
      ? `linear-gradient(${displayedBackgroundColor}, ${displayedBackgroundColor}), ${theme.main}`
      : backgroundColor === 'transparent'
      ? 'transparent'
      : displayedBackgroundColor,
    /* Read against the cell as it is drawn - its wash over what the table is drawn on - not
       against the colour the wash is made from. */
    '--reqore-table-cell-color':
      $color ??
      getReadableColorFrom(getTableCellBackground({ theme, pin }, paint, $surface), !hovered),
    '--reqore-table-cell-border-color': changeLightness(displayedBackgroundColor, 0.1),
    /* Pinned cells rely on the layered background shorthand for their opaque base — overriding
       just background-color would lose theme.main and let the non-pinned cells scrolling
       underneath show through on hover. */
    '--reqore-table-cell-hover-background':
      hover && pin ? `linear-gradient(${hover}, ${hover}), ${theme.main}` : hover,
  };
};

export const StyledTableCell = styled.div
  .withConfig({
    // `wrap` drives the cell's white-space rule and `width` its CSS width; neither is a DOM
    // attribute of a `div`.
    shouldForwardProp: omitStyleProps('wrap', 'width'),
  })
  .attrs((props: IReqoreTableCellStyle & IStyledTableCellPaint) => ({
    style: getTableCellVariables(props) as React.CSSProperties,
  }))<IReqoreTableCellStyle & IStyledTableCellPaint>`
  ${({ width, minWidth, maxWidth, grow }) =>
    css`
      ${toPx(width) && 'width: var(--reqore-table-cell-width);'}
      ${toPx(minWidth) && 'min-width: var(--reqore-table-cell-min-width);'}
      ${toPx(maxWidth) && 'max-width: var(--reqore-table-cell-max-width);'}

      flex-grow: ${getTableCellGrow({ grow, width })};
    `}

  ${({
    align,
    interactive,
    interactiveCell,
    size,
    flat,
    disabled,
    padded,
    wrap,
    pin,
    pinEdge,
    maxHeight,
  }: IReqoreTableCellStyle & IStyledTableCellPaint) => {
    return css`
      box-sizing: border-box;
      display: flex;
      align-items: ${maxHeight ? 'flex-start' : 'center'};
      justify-content: ${align ? alignToFlexAlign(align) : 'flex-start'};
      flex-shrink: 0;
      align-self: stretch;
      border-bottom: ${!flat ? '1px solid ' : undefined};

      ${maxHeight &&
      css`
        position: relative;
        max-height: var(--reqore-table-cell-max-height);
        overflow: hidden;
      `}

      padding: ${!padded || padded === 'both' || padded === 'vertical' ? (wrap ? '6px' : 0) : undefined}
        ${
        !padded || padded === 'both' || padded === 'horizontal'
          ? `${TABLE_CELL_HORIZONTAL_PADDING_PX}px`
          : undefined
      };
      font-size: ${TEXT_FROM_SIZE[size]}px;
      background: var(--reqore-table-cell-background);
      color: var(--reqore-table-cell-color);
      border-color: var(--reqore-table-cell-border-color);
      transition: background-color 0.2s ease-out;
      opacity: ${disabled ? 0.2 : 1};
      pointer-events: ${disabled ? 'none' : undefined};
      cursor: ${interactive || interactiveCell ? 'pointer' : 'default'};

      ${pin &&
      css`
        position: sticky;
        ${pin === 'left'
          ? 'left: var(--reqore-table-cell-pin-offset);'
          : 'right: var(--reqore-table-cell-pin-offset);'}
        z-index: 2;
        ${pinEdge &&
        css`
          /* Use a pseudo-element instead of box-shadow so the shadow is strictly bounded to
             the cell's height — a blurred box-shadow bleeds vertically and stacks across
             neighboring pinned cells, producing dark bands between rows. */
          &::after {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            width: 12px;
            pointer-events: none;
            ${pin === 'left' ? 'right: -12px;' : 'left: -12px;'}
            background: linear-gradient(
              to ${pin === 'left' ? 'right' : 'left'},
              rgba(0, 0, 0, 0.35),
              rgba(0, 0, 0, 0)
            );
          }
        `}
      `}

      ${interactiveCell &&
      css`
        &:hover {
          ${pin
            ? 'background: var(--reqore-table-cell-hover-background);'
            : 'background-color: var(--reqore-table-cell-hover-background);'}
        }
      `}

      /* ------------------------------------------------------------------
         A cell contains what it is given.

         These rules used to name p.reqore-table-text — the paragraph the
         table's own 'text' / 'number' / 'time-ago' cell renderers produce — so
         they reached exactly the content the table had written itself.
         Everything else got nothing: the 'title' renderer (a heading), the
         'tag' renderer, and every element a caller's own cell content function
         returns, which is how a real table fills a cell. Those elements laid
         themselves out at their natural size, and since a body row is drawn at
         ONE height — decided before any of this is laid out, because a
         virtualised list has to know it up front — a paragraph of prose simply
         painted over the rows beneath it. Two and three descriptions
         overprinted each other and none of them could be read.

         So the rules are about the cell's content, whatever that content is:

         - min-width 0, because a flex item's automatic minimum size is its
           MIN-CONTENT width, which for one long unbreakable token (a URL, an
           id) is the whole token. That minimum beats max-width, which is why
           capping a link's width at the call site did not hold it: the address
           of one row printed across the next column's chips.
         - max-width and max-height of 100%, so the content is bounded by the
           box it is in, on both axes, whatever it is.
         - and, when the cell does not wrap, one line ending in an ellipsis.

         Wrapping is the other honest answer: wrap turns virtualisation off (see
         IReqoreTableProps), every row is then drawn at the height of its own
         content, and the whole value is on screen instead of a line of it. A
         wrapped cell still needs a break opportunity inside a long token, or it
         overflows sideways for the same reason as above. ----------------- */
      > * {
        min-width: 0;
        max-width: 100%;
      }

      ${!maxHeight &&
      css`
        /* Bound the content to the cell's own height.

           Left to a cell that clips itself — the maxHeight clamp above — this
           would take its job away rather than help: that clamp shows a Show
           more button, and it knows to show it by asking whether its content is
           TALLER than it is. Content pre-shrunk to fit is content with nothing
           more to show, so the button never appeared and the rest of the value
           became unreachable.

           Everywhere else the bound is what holds a cell's content to its row.
           It is inert while wrapping does what it says, because the row is then
           as tall as its tallest cell and that cell's content is already
           exactly that tall. It bites where wrapping CANNOT make the row taller
           — wrap together with an explicit virtualized, which the table warns
           about — and in the ordinary case below, where it holds anything the
           ellipsis does not reach: a group of chips that wrapped, an image. */
        > * {
          max-height: 100%;
          overflow: hidden;
        }
      `}

      ${wrap
        ? css`
            > * {
              word-break: break-word;
              overflow-wrap: anywhere;
            }

            p.reqore-table-text {
              white-space: normal;
            }
          `
        : css`
            > * {
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
            }
          `}

      p.reqore-table-text {
        margin: 0;
        padding: 0;
      }
    `;
  }}
`;

const StyledCellExpandOverlay = styled.div<{
  theme: IReqoreTheme;
}>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 4px 6px;
  pointer-events: none;
  z-index: 1;
  height: 36px;
  background: ${({ theme }) =>
    `linear-gradient(to bottom, ${rgba(theme.main, 0)} 0%, ${theme.main} 80%)`};

  > * {
    pointer-events: auto;
  }
`;

export const ReqoreTableBodyCell = memo(
  forwardRef<HTMLDivElement, IReqoreTableBodyCellProps>(
    (props: IReqoreTableBodyCellProps, ref) => {
      const { expandHeightButtonProps, ...cellStyleProps } = props;
      const { maxHeight, children, size } = cellStyleProps;
      const [expanded, setExpanded] = useState(false);
      const [isOverflowing, setIsOverflowing] = useState(false);
      const localRef = useRef<HTMLDivElement | null>(null);

      const setRefs = useCallback(
        (el: HTMLDivElement | null) => {
          localRef.current = el;
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
          }
        },
        [ref]
      );

      // Expansion is a one-way action, so once expanded the overlay hides and the cell grows
      // naturally — no need to keep measuring.
      useLayoutEffect(() => {
        if (!maxHeight || expanded) {
          setIsOverflowing(false);
          return undefined;
        }
        const el = localRef.current;
        if (!el) {
          return undefined;
        }

        const check = () => {
          setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
        };

        check();
        const observer = new ResizeObserver(check);
        observer.observe(el);
        return () => observer.disconnect();
      }, [maxHeight, expanded, children]);

      const effectiveMaxHeight = expanded ? undefined : maxHeight;
      const showOverlay = !!maxHeight && !expanded && isOverflowing;
      const surface = useReqoreSurface();
      const contextTheme = useTheme() as IReqoreTheme;
      const { theme: themeProp, intent, selected, selectedIntent, striped, even, hovered, pin } =
        cellStyleProps as IReqoreTableCellStyle;
      // The theme its styles are given: its own, when it is handed one, else the table's.
      const theme = themeProp || contextTheme;
      /* Its paint, what it is drawn in and its text color, worked out once for as long as what decides them
         holds - not on every render, nor again in its styles. What the cell holds is drawn on the cell. */
      const paint = useMemo(
        () =>
          theme?.main
            ? getTableCellPaint({ theme, intent, selected, selectedIntent, striped, even, hovered, pin })
            : undefined,
        [theme, intent, selected, selectedIntent, striped, even, hovered, pin]
      );
      const cellSurface = useMemo(
        () => (paint ? getTableCellBackground({ theme, pin }, paint, surface) : surface),
        [paint, theme, pin, surface]
      );
      const cellText = useMemo(
        () =>
          paint ? getReadableColorFrom(cellSurface as TReqoreHexColor, !hovered) : undefined,
        [paint, cellSurface, hovered]
      );

      return (
        <ReqoreTooltipComponent
          Component={StyledTableCell}
          {...cellStyleProps}
          // a disabled row's cells are faded; they say they are disabled too
          aria-disabled={
            (cellStyleProps as IReqoreTableCellStyle).disabled
              ? true
              : cellStyleProps['aria-disabled']
          }
          $surface={surface}
          $paint={paint}
          $color={cellText}
          maxHeight={effectiveMaxHeight}
          ref={setRefs}
        >
          <ReqoreSurfaceProvider color={cellSurface}>{children}</ReqoreSurfaceProvider>
          {showOverlay && (
            <StyledCellExpandOverlay
              className='reqore-table-cell-expand'
              onClick={(e) => e.stopPropagation()}
            >
              <ReqoreButton
                compact
                size={size === 'micro' || size === 'tiny' ? 'tiny' : 'small'}
                rightIcon='ArrowDownSLine'
                {...expandHeightButtonProps}
                onClick={(e) => {
                  e.stopPropagation();
                  expandHeightButtonProps?.onClick?.(e);
                  setExpanded(true);
                }}
              >
                {expandHeightButtonProps?.children ?? 'Show more'}
              </ReqoreButton>
            </StyledCellExpandOverlay>
          )}
        </ReqoreTooltipComponent>
      );
    }
  )
);
