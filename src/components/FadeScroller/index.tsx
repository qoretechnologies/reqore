import {
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { GAP_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { TReqoreHexColor } from '../Effect';
import { getMainBackgroundColor } from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreFluid,
  IWithReqoreTooltip,
} from '../../types/global';
import { ReqoreTooltipComponent } from '../TooltipComponent';

/**
 * Width of the edge fade, in pixels. Wide enough to read as a gradient rather than
 * a hard edge, narrow enough not to obscure a whole item.
 */
const FADE_WIDTH = 36;

export interface IReqoreFadeScrollerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreFluid,
    IWithReqoreTooltip {
  /** The row's contents. Laid out horizontally and never wrapped. */
  children: ReactNode;
  /**
   * Gap between children, on the standard size scale.
   * @default normal
   */
  gapSize?: TSizes;
  /**
   * Cross-axis alignment of the row.
   * @default center
   */
  verticalAlign?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  /**
   * Keep children at their natural width (`flex: 0 0 auto`) so they overflow into
   * the scroll area instead of being squashed. Right for text, tags and chips.
   * Pass `false` for a row of self-sizing grow-tiles (a stat rail) whose own
   * `flex` should win.
   * @default true
   */
  rigid?: boolean;
  /**
   * Edge fade colour. Defaults to the surface the row sits on — the resolved
   * `intent` colour when one is set, otherwise the main background — so the fade
   * reads as the content dissolving into its surface rather than as a grey smudge.
   * Set it explicitly when the row sits on something neither of those describes.
   */
  fadeColor?: TReqoreHexColor;
  /**
   * Show a fade on an edge that has content scrolled out of view.
   * @default true
   */
  fade?: boolean;
  /**
   * Let the row be scrolled by grabbing it and pulling sideways.
   *
   * A mouse has no horizontal axis, so a row that overflows is reachable only by
   * shift+wheel or a trackpad gesture — neither discoverable, and the first
   * unavailable on a plain wheel mouse. Dragging is the gesture a rail of peers
   * already looks like it should accept.
   *
   * Selecting text inside the row is preserved rather than traded away: hold
   * **Shift** and drag to select on a pointer device, and on touch the drag
   * never engages at all, so native panning and long-press-to-select both apply
   * unchanged.
   *
   * Opt-in, because it changes what a press-and-move does on an existing row.
   * @default false
   */
  dragToScroll?: boolean;
}

/**
 * How far the pointer must travel before a press becomes a drag.
 *
 * Zero would make every click a one-pixel drag and swallow it; too large and the
 * row feels stuck before it moves. Four pixels is the usual hysteresis for
 * distinguishing a click from a drag.
 */
const DRAG_THRESHOLD = 4;

/**
 * Elements a drag must never start on.
 *
 * Deliberately NOT "anything interactive". The rows this is built for are made
 * OF interactive things — a rail of clickable KPI tiles is the motivating case —
 * so excluding buttons would leave nowhere to grab and the feature would do
 * nothing. Their clicks are protected instead by suppressing the click that
 * follows a real drag, which is what makes press-and-release still activate a
 * tile while press-and-pull scrolls past it.
 *
 * What IS excluded is text entry, where a press-and-move already means
 * "select within this value" and there is no other way to ask for it.
 */
const NON_DRAGGABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

interface IStyledFadeScrollerProps {
  $fadeLeft?: boolean;
  $fadeRight?: boolean;
  $fadeColor: string;
  $fluid?: boolean;
  theme: IReqoreTheme;
}

/*
 * The fades are overlay gradients on the wrapper rather than a mask on the scroller,
 * so they sit above the content without entering the scroll flow — a `::before` inside
 * the scrolling element would scroll away with everything else. `pointer-events: none`
 * keeps them from swallowing clicks on the items underneath.
 */
const StyledFadeScrollerWrapper = styled.div<IStyledFadeScrollerProps>`
  position: relative;
  /* Fluid fills its container (a rail spanning a panel). Non-fluid sizes to its
     content, so the row can sit BESIDE something in a flex layout — a forced 100%
     makes a wrapping flex parent break it onto its own line. */
  width: ${({ $fluid }) => ($fluid ? '100%' : 'auto')};
  max-width: 100%;
  min-width: 0;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: ${FADE_WIDTH}px;
    pointer-events: none;
    z-index: 2;
    transition: opacity 0.15s ease-out;
  }

  &::before {
    left: 0;
    background: linear-gradient(to right, ${({ $fadeColor }) => $fadeColor}, transparent);
    opacity: ${({ $fadeLeft }) => ($fadeLeft ? 1 : 0)};
  }

  &::after {
    right: 0;
    background: linear-gradient(to left, ${({ $fadeColor }) => $fadeColor}, transparent);
    opacity: ${({ $fadeRight }) => ($fadeRight ? 1 : 0)};
  }
`;

interface IStyledScrollProps {
  $gap: number;
  $verticalAlign: string;
  $rigid: boolean;
  $fluid?: boolean;
}

/*
 * The scrollbar is hidden on purpose: the fade IS the affordance, and a native
 * horizontal bar under a single row of chips is thicker than the row it describes.
 * The row stays scrollable by wheel, trackpad, touch and keyboard regardless.
 */
const StyledFadeScrollerContent = styled.div<IStyledScrollProps>`
  display: flex;
  flex-wrap: nowrap;
  align-items: ${({ $verticalAlign }) => $verticalAlign};
  gap: ${({ $gap }) => $gap}px;
  width: ${({ $fluid }) => ($fluid ? '100%' : 'auto')};
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  /* Keeps a focus ring on the last item from being clipped by the overflow box. */
  padding-bottom: 2px;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }

  ${({ $rigid }) =>
    $rigid &&
    `
    & > * {
      flex: 0 0 auto;
    }
  `}

  /* Drag state is carried by CLASSES, not by props, because it is not React
     state: a drag is a transient pointer interaction, and routing it through
     setState would re-render every child on every drag — on the rail this was
     built for, that is a whole row of memoized tiles, mid-gesture.

     The grab cursor appears only when there is somewhere to go: an idle "grab"
     on a row that already fits is a promise the row cannot keep. The class is
     toggled by the same measurement that draws the fades, so the cursor and the
     fade can never disagree about whether the row overflows. */
  &.reqore-fade-scroller-draggable {
    cursor: grab;
  }

  /* While dragging, the whole row is the control: suppress selection so pulling
     across a tile drags it instead of highlighting its label, and keep the
     grabbing cursor even as the pointer passes over children that set their own
     (a clickable tile sets the pointer cursor). */
  &.reqore-fade-scroller-dragging {
    cursor: grabbing;
    user-select: none;
    -webkit-user-select: none;

    & * {
      cursor: grabbing !important;
      user-select: none !important;
      -webkit-user-select: none !important;
    }
  }
`;

/**
 * A single-line horizontal scroller that fades whichever edge has content out of
 * view — for chip strips, tag rows, stat rails, breadcrumb trails and any other row
 * of peers that would otherwise wrap into a ragged block on a narrow screen.
 *
 * Wrapping is the wrong answer for a row of equal-weight items: on a phone five
 * tiles become five lines and push the page's actual content below the fold. One
 * swipeable band keeps the row one row. The fade is what makes the overflow
 * discoverable — without it a clipped row looks like a complete one.
 *
 * @example
 * <ReqoreFadeScroller gapSize='small'>
 *   {tags.map((tag) => <ReqoreTag key={tag} label={tag} />)}
 * </ReqoreFadeScroller>
 */
export const ReqoreFadeScroller = memo(
  forwardRef<HTMLDivElement, IReqoreFadeScrollerProps>(
    (
      {
        children,
        gapSize = 'normal',
        verticalAlign = 'center',
        rigid = true,
        fadeColor,
        fade = true,
        dragToScroll = false,
        fluid = true,
        intent,
        customTheme,
        tooltip,
        className,
        ...rest
      }: IReqoreFadeScrollerProps,
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent);
      const scrollRef = useRef<HTMLDivElement>(null);
      const { targetRef } = useCombinedRefs<HTMLDivElement>(ref);
      const [edges, setEdges] = useState<{ left: boolean; right: boolean }>({
        left: false,
        right: false,
      });

      // Read inside `update`, which is deliberately dependency-free so it can be
      // handed to listeners and observers once and never rebuilt.
      const dragToScrollRef = useRef(dragToScroll);
      dragToScrollRef.current = dragToScroll;

      const update = useCallback(() => {
        const element = scrollRef.current;

        if (!element) {
          return;
        }

        const left = element.scrollLeft > 1;
        const right = element.scrollLeft + element.clientWidth < element.scrollWidth - 1;

        // The cursor follows the measurement, not the render: toggling a class
        // here keeps "can this be dragged?" answered by the same pass that
        // decides which edges fade, without a state round-trip.
        element.classList.toggle(
          'reqore-fade-scroller-draggable',
          dragToScrollRef.current && element.scrollWidth > element.clientWidth
        );

        // Only commit a real change — this runs after every render (below), and an
        // unconditional setState would loop.
        setEdges((current) =>
          current.left === left && current.right === right ? current : { left, right }
        );
      }, []);

      // After every render, because the children can change width without the
      // scroller resizing (a chip's label loads, an item is removed).
      useLayoutEffect(update);

      useEffect(() => {
        const element = scrollRef.current;

        if (!element) {
          return undefined;
        }

        element.addEventListener('scroll', update, { passive: true });

        const observer =
          typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update);

        observer?.observe(element);

        return () => {
          element.removeEventListener('scroll', update);
          observer?.disconnect();
        };
      }, [update]);

      useEffect(() => {
        const element = scrollRef.current;

        if (!dragToScroll || !element) {
          return undefined;
        }

        let activePointer: number | undefined;
        let startX = 0;
        let startScrollLeft = 0;
        let engaged = false;
        // Set when a drag actually moved the row, and consumed by the click that
        // the browser fires next. Without it, pulling the row sideways and
        // letting go on top of a clickable tile ALSO activates that tile.
        let swallowNextClick = false;

        const onPointerDown = (event: PointerEvent) => {
          // Touch already pans natively and long-press already selects; taking
          // the gesture over would replace two working behaviours with one.
          if (event.pointerType === 'touch') {
            return;
          }
          // Middle/right are paste and context menu.
          if (event.button !== 0) {
            return;
          }
          // Shift is the documented escape hatch to "select instead of drag".
          if (event.shiftKey) {
            return;
          }
          if ((event.target as HTMLElement | null)?.closest?.(NON_DRAGGABLE)) {
            return;
          }
          // Nothing to scroll: leave the press alone entirely so a click on a
          // row that happens to fit behaves exactly as it did before.
          if (element.scrollWidth <= element.clientWidth) {
            return;
          }

          activePointer = event.pointerId;
          startX = event.clientX;
          startScrollLeft = element.scrollLeft;
          engaged = false;
        };

        const onPointerMove = (event: PointerEvent) => {
          if (activePointer === undefined || event.pointerId !== activePointer) {
            return;
          }

          const distance = event.clientX - startX;

          if (!engaged) {
            // Below the threshold this is still a click, so do nothing at all —
            // not even preventDefault, which would break focus on the target.
            if (Math.abs(distance) < DRAG_THRESHOLD) {
              return;
            }
            engaged = true;
            swallowNextClick = true;
            element.classList.add('reqore-fade-scroller-dragging');
            // Capture so the drag survives the pointer leaving the row, which it
            // does constantly at the edges — that is where you are pulling to.
            try {
              element.setPointerCapture(event.pointerId);
            } catch {
              // Capture is a nicety; without it the drag simply ends at the edge.
            }
          }

          // Stops the browser starting a native text/image drag mid-pull.
          event.preventDefault();
          element.scrollLeft = startScrollLeft - distance;
        };

        const endDrag = (event: PointerEvent) => {
          if (activePointer === undefined || event.pointerId !== activePointer) {
            return;
          }
          if (element.hasPointerCapture?.(event.pointerId)) {
            element.releasePointerCapture(event.pointerId);
          }
          activePointer = undefined;
          if (engaged) {
            engaged = false;
            element.classList.remove('reqore-fade-scroller-dragging');
          }
        };

        const onClickCapture = (event: MouseEvent) => {
          if (!swallowNextClick) {
            return;
          }
          swallowNextClick = false;
          event.preventDefault();
          event.stopPropagation();
        };

        // A native drag beats pointer events to the punch on links and images.
        const onDragStart = (event: DragEvent) => {
          if (engaged) {
            event.preventDefault();
          }
        };

        element.addEventListener('pointerdown', onPointerDown);
        element.addEventListener('pointermove', onPointerMove);
        element.addEventListener('pointerup', endDrag);
        element.addEventListener('pointercancel', endDrag);
        element.addEventListener('dragstart', onDragStart);
        // Capture phase: the click has to be stopped before it reaches the tile.
        element.addEventListener('click', onClickCapture, true);

        return () => {
          element.removeEventListener('pointerdown', onPointerDown);
          element.removeEventListener('pointermove', onPointerMove);
          element.removeEventListener('pointerup', endDrag);
          element.removeEventListener('pointercancel', endDrag);
          element.removeEventListener('dragstart', onDragStart);
          element.removeEventListener('click', onClickCapture, true);
          element.classList.remove('reqore-fade-scroller-dragging');
          element.classList.remove('reqore-fade-scroller-draggable');
        };
      }, [dragToScroll]);

      /* An intent tints the fade, because the fade IS this component's only
         surface — there is no border or background for an intent to colour
         instead. Without this, `intent` would type-check and paint nothing. */
      const resolvedFadeColor = useMemo(
        () => fadeColor ?? (intent ? theme.intents[intent] : getMainBackgroundColor(theme)),
        [fadeColor, intent, theme]
      );

      return (
        <ReqoreTooltipComponent
          {...rest}
          Component={StyledFadeScrollerWrapper}
          tooltip={tooltip}
          ref={targetRef}
          theme={theme}
          className={`${className || ''} reqore-fade-scroller`.trim()}
          $fadeColor={resolvedFadeColor}
          $fadeLeft={fade && edges.left}
          $fadeRight={fade && edges.right}
          $fluid={fluid}
        >
          <StyledFadeScrollerContent
            ref={scrollRef}
            className='reqore-fade-scroller-content'
            $gap={GAP_FROM_SIZE[gapSize]}
            $verticalAlign={verticalAlign}
            $rigid={rigid}
            $fluid={fluid}
          >
            {children}
          </StyledFadeScrollerContent>
        </ReqoreTooltipComponent>
      );
    }
  )
);

ReqoreFadeScroller.displayName = 'ReqoreFadeScroller';

export default ReqoreFadeScroller;
