import { forwardRef, memo, useMemo, type CSSProperties, type ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { useReqoreProperty } from '../../hooks/useReqoreContext';

/** Shared timing for anything that folds. See `ReqoreCollapse`. */
export const REQORE_COLLAPSE_DURATION_MS = 250;
export const REQORE_COLLAPSE_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

/**
 * The transition to put on something that must move WITH a collapse but is not
 * itself one — a title's font-size, a spacer's height, a margin.
 *
 * Two folds on different durations read as a stutter rather than as one
 * movement, which is the whole reason this timing is shared rather than typed
 * out per call site.
 */
export const reqoreCollapseTransition = (...properties: string[]): string =>
  properties
    .map(
      (property) =>
        `${property} ${REQORE_COLLAPSE_DURATION_MS}ms ${REQORE_COLLAPSE_EASING}`
    )
    .join(', ');

export interface IReqoreCollapseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** When true the content folds away — height to zero, faded out. */
  collapsed: boolean;
  children: ReactNode;
  /**
   * Gap the host's flex/grid layout puts BELOW this block, in pixels.
   *
   * A folded block still costs its parent's `gap`, which leaves a hole exactly
   * where the content used to be. Pass the parent's gap and the fold pulls the
   * next row up by it, on the same curve — so the hole closes as part of the
   * same movement instead of snapping shut at the end.
   */
  hostGap?: number;
  /**
   * Animate the fold. Honoured only when the global `animations.dialogs` flag
   * is not disabled in the `ReqoreUIProvider` and the user is not in
   * `prefers-reduced-motion`; either of those makes the fold instant.
   * @default true
   */
  animated?: boolean;
  style?: CSSProperties;
}

const StyledCollapse = styled.div<{
  $collapsed: boolean;
  $hostGap: number;
  $animated: boolean;
}>`
  ${({ $collapsed, $hostGap, $animated }) => css`
    display: grid;
    /* CSS cannot transition an auto height, but it CAN transition a grid
       track: a one-row grid going 1fr to 0fr squeezes its child, so arbitrary
       content folds with no measurement, no ResizeObserver, and no pixel
       height that rots the moment the content changes. */
    grid-template-rows: ${$collapsed ? '0fr' : '1fr'};
    opacity: ${$collapsed ? 0 : 1};
    margin-bottom: ${$collapsed ? `${-$hostGap}px` : 0};
    overflow: hidden;
    ${$animated
      ? css`
          transition: ${reqoreCollapseTransition(
            'grid-template-rows',
            'opacity',
            'margin-bottom'
          )};
        `
      : ''}
  `}
`;

const StyledCollapseContent = styled.div<{ $collapsed: boolean; $animated: boolean }>`
  ${({ $collapsed, $animated }) => css`
    min-height: 0;
    overflow: hidden;
    /* Visibility takes folded content out of the tab order without
       unmounting it — a zero-height box is still focusable otherwise, so a
       keyboard user lands on controls they cannot see. Hiding waits for the
       fold to finish; showing is immediate, so the animation is never cut
       short at either end. */
    visibility: ${$collapsed ? 'hidden' : 'visible'};
    transition: visibility 0s linear
      ${$collapsed && $animated ? `${REQORE_COLLAPSE_DURATION_MS}ms` : '0s'};
  `}
`;

/**
 * A controlled, buttonless collapse for a block of content.
 *
 * The host decides, not the reader: page chrome that folds as a table scrolls,
 * a section that closes when a mode changes, a rail that gives up its room
 * when space runs short. There is deliberately no affordance of its own — if
 * the reader is the one deciding, `ReqoreCollapsibleContent` (a "Show more"
 * reveal, which ships its toggle) or `ReqorePanel`'s own collapse is the
 * component you want.
 *
 * What it adds over hiding the content outright is that the height ANIMATES,
 * so several pieces of chrome folding at once read as one movement rather than
 * as a stutter of things disappearing.
 */
export const ReqoreCollapse = memo(
  forwardRef<HTMLDivElement, IReqoreCollapseProps>(
    ({ collapsed, children, hostGap = 0, animated = true, style, ...rest }, ref) => {
      const animations = useReqoreProperty('animations');
      const prefersReducedMotion = useMemo(
        () =>
          typeof window !== 'undefined' &&
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        []
      );
      const animationsEnabled =
        animated && animations?.dialogs !== false && !prefersReducedMotion;

      return (
        <StyledCollapse
          {...rest}
          ref={ref}
          className={`${rest.className || ''} reqore-collapse`.trim()}
          // Folded content is gone as far as a screen reader is concerned;
          // leaving it exposed means a keyboard user meets a zero-height box.
          aria-hidden={collapsed}
          $collapsed={collapsed}
          $hostGap={hostGap}
          $animated={animationsEnabled}
          style={style}
        >
          <StyledCollapseContent
            className='reqore-collapse-content'
            $collapsed={collapsed}
            $animated={animationsEnabled}
          >
            {children}
          </StyledCollapseContent>
        </StyledCollapse>
      );
    }
  )
);

ReqoreCollapse.displayName = 'ReqoreCollapse';

export default ReqoreCollapse;
