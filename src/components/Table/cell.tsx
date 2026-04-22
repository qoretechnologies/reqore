import { lighten, rgba } from 'polished';
import { forwardRef, memo, useCallback, useLayoutEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTableColumn } from '.';
import { TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColorFrom } from '../../helpers/colors';
import { alignToFlexAlign } from '../../helpers/utils';
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

export const StyledTableCell = styled.div<IReqoreTableCellStyle>`
  ${({ width, minWidth, maxWidth, grow }) =>
    css`
      width: ${width}px;
      min-width: ${minWidth}px;
      max-width: ${maxWidth}px;

      flex-grow: ${grow || (width ? undefined : 1)};
    `}

  ${({
    theme,
    align,
    interactive,
    interactiveCell,
    intent,
    size,
    flat,
    striped,
    even,
    selected,
    selectedIntent,
    disabled,
    hovered,
    padded,
    wrap,
    pin,
    pinOffset,
    pinEdge,
    maxHeight,
  }: IReqoreTableCellStyle) => {
    const getOriginalBackgroundColor = () => {
      let color = theme.main;
      // Is there any intent
      if (intent || (selected && selectedIntent)) {
        color = theme.intents[intent || selectedIntent];
      }

      return color;
    };

    const getBackgroundColor = (): TReqoreColor => {
      const color = getOriginalBackgroundColor();
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
      if (opacity === 0) {
        return pin ? theme.main : 'transparent';
      }

      return changeLightness(color, opacity);
    };

    const backgroundColor = getBackgroundColor();
    const displayedBackgroundColor =
      backgroundColor === 'transparent'
        ? theme.main
        : (rgba(backgroundColor, 0.3) as TReqoreHexColor);

    // Pinned cells need an opaque paint so non-pinned cells scrolling underneath don't show
    // through. We layer the semi-transparent displayed color over a solid theme.main base.
    const pinnedBackground = pin
      ? `linear-gradient(${displayedBackgroundColor}, ${displayedBackgroundColor}), ${theme.main}`
      : undefined;

    return css`
      display: flex;
      align-items: ${maxHeight ? 'flex-start' : 'center'};
      justify-content: ${align ? alignToFlexAlign(align) : 'flex-start'};
      flex-shrink: 0;
      align-self: stretch;
      border-bottom: ${!flat ? '1px solid ' : undefined};

      ${maxHeight &&
      css`
        position: relative;
        max-height: ${maxHeight}px;
        overflow: hidden;
      `}

      padding: ${!padded || padded === 'both' || padded === 'vertical' ? (wrap ? '6px' : 0) : undefined}
        ${!padded || padded === 'both' || padded === 'horizontal' ? '10px' : undefined};
      font-size: ${TEXT_FROM_SIZE[size]}px;
      background: ${pinnedBackground ??
      (backgroundColor === 'transparent' ? 'transparent' : displayedBackgroundColor)};
      color: ${getReadableColorFrom(getOriginalBackgroundColor(), !hovered)};
      border-color: ${changeLightness(displayedBackgroundColor, 0.1)};
      transition: background-color 0.2s ease-out;
      opacity: ${disabled ? 0.2 : 1};
      pointer-events: ${disabled ? 'none' : undefined};
      cursor: ${interactive || interactiveCell ? 'pointer' : 'default'};

      ${pin &&
      css`
        position: sticky;
        ${pin === 'left' ? `left: ${pinOffset || 0}px;` : `right: ${pinOffset || 0}px;`}
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
          /* Pinned cells rely on the layered background shorthand for their opaque base —
             overriding just background-color would lose theme.main and let the non-pinned
             cells scrolling underneath show through on hover. */
          ${pin
            ? css`
                background: linear-gradient(
                    ${lighten(0.1, displayedBackgroundColor)},
                    ${lighten(0.1, displayedBackgroundColor)}
                  ),
                  ${theme.main};
              `
            : css`
                background-color: ${lighten(0.1, displayedBackgroundColor)};
              `}
        }
      `}

      p.reqore-table-text {
        ${wrap
          ? css`
              white-space: normal;
              word-break: break-word;
              overflow-wrap: anywhere;
            `
          : css`
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            `}
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

      return (
        <ReqoreTooltipComponent
          Component={StyledTableCell}
          {...cellStyleProps}
          maxHeight={effectiveMaxHeight}
          ref={setRefs}
        >
          {children}
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
