import { mix } from 'polished';
import React, {
  cloneElement,
  forwardRef,
  isValidElement,
  memo,
  ReactElement,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { css } from 'styled-components';
import { useContext } from 'use-context-selector';
import { GAP_FROM_SIZE, RADIUS_FROM_RADIUS_SIZE, TSizes } from '../../constants/sizes';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import CustomThemeContext from '../../context/CustomThemeContext';
import {
  getMainBackgroundColor,
  getOpaqueColor,
  getReadableAccentColor,
  getReadableColor,
  shouldDarken,
} from '../../helpers/colors';
import { getSwipeStep, SWIPE } from '../../helpers/gestures';
import { isTextEntry } from '../../helpers/utils';
import { NARROW_CONTAINER_BREAKPOINT_PX, useNarrowContainer } from '../../hooks/useNarrowContainer';
import { usePointerDrag } from '../../hooks/usePointerDrag';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreSize,
  IWithReqoreTooltip,
} from '../../types/global';
import ReqoreButton from '../Button';
import { TReqoreHexColor } from '../Effect';
import { ReqoreTooltipComponent } from '../TooltipComponent';
import type { IReqoreTierProps, TReqoreTierAppearance } from '.';

/** How a tier group lays its tiers out on a narrow container (see `mobileBreakpoint`). */
export type TReqoreTierGroupMobileLayout = 'columns' | 'stack';

export interface IReqoreTierGroupProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'>,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreSize,
    IWithReqoreTooltip {
  /** The tiers: `ReqoreTier` elements. Anything that is not an element is ignored. */
  children?: React.ReactNode;
  /** Default `appearance` for every tier in the group. A tier's own `appearance` wins. */
  appearance?: TReqoreTierAppearance;
  /** Narrowest a tier's column may get in the row. Default `'240px'`. */
  minColumnWidth?: string;
  /** Widest a tier's column may get in the row. Default `'1fr'` (the row fills the group). */
  maxColumnWidth?: string;
  /** Space between the tiers in the row, and between the stack and its controls. Default `'big'`. */
  gapSize?: TSizes;
  /**
   * The layout on a narrow container. `'columns'` (the default): the row wraps, down to one
   * tier per line. `'stack'`: one tier in front and its neighbours behind it on either side —
   * scaled down, dimmed and turned a little away — swiped (touch or a mouse drag), stepped
   * with the arrow keys, or chosen with the buttons and the dots under it.
   */
  mobileLayout?: TReqoreTierGroupMobileLayout;
  /**
   * The group's own width, in px, at or below which `mobileLayout` applies. Measured on the
   * group, not the viewport, so a group in a narrow column of a wide page stacks too. Default
   * 480, Reqore's mobile breakpoint.
   */
  mobileBreakpoint?: number;
  /** The tier in front of the stack (controlled). */
  activeIndex?: number;
  /** The tier in front at first (uncontrolled). Default: the first `highlight`ed tier, else 0. */
  defaultActiveIndex?: number;
  /** Called with the index of the tier the user brought to the front. */
  onActiveIndexChange?: (index: number) => void;
  /**
   * Whether the stack wraps round at its ends. Default `false`: the first and the last tier are
   * ends — the order of the tiers usually means something (cheapest to most expensive) — and a
   * swipe past an end gives a little and springs back.
   */
  loop?: boolean;
  /** Accessible name of the stack (a carousel). Default `'Plans'`. */
  stackLabel?: string;
  /** Accessible name of the button that brings the previous tier to the front. */
  previousLabel?: string;
  /** Accessible name of the button that brings the next tier to the front. */
  nextLabel?: string;
  /**
   * Accessible name of one tier in the stack, also announced when it comes to the front.
   * Default: `'Pro, 2 of 3'`.
   */
  stackItemLabel?: (name: string | undefined, index: number, count: number) => string;
}

/** How far a neighbour shows past the front tier, on either side, in px. */
export const TIER_GROUP_PEEK_FROM_SIZE: Record<TSizes, number> = {
  micro: 8,
  tiny: 10,
  small: 14,
  normal: 20,
  big: 24,
  huge: 28,
  massive: 32,
};

/** A dot's hit area, in px (the mark inside it is `TIER_GROUP_DOT_MARK_FROM_SIZE`). */
export const TIER_GROUP_DOT_FROM_SIZE: Record<TSizes, number> = {
  micro: 16,
  tiny: 20,
  small: 24,
  normal: 28,
  big: 32,
  huge: 36,
  massive: 40,
};

/** The dot itself, in px; the front tier's is a pill two and a half times as wide. */
export const TIER_GROUP_DOT_MARK_FROM_SIZE: Record<TSizes, number> = {
  micro: 4,
  tiny: 5,
  small: 6,
  normal: 8,
  big: 10,
  huge: 12,
  massive: 14,
};

/** How the stack looks and moves. */
export const TIER_STACK = {
  /** A neighbour's scale and turn (degrees: its outer edge comes forward, facing the front). */
  neighbourScale: 0.9,
  neighbourRotate: 12,
  /**
   * How bright a neighbour is drawn, on a dark and on a light theme. Dimmed by brightness, not
   * by opacity: a tier faded towards a page of nearly its own colour disappears, while a darker
   * (or, on a light page, greyer) one reads as standing in the front tier's shadow.
   */
  neighbourBrightness: { dark: 0.65, light: 0.9 },
  /** A tier two or more steps from the front: smaller still, and faded out. */
  hiddenScale: 0.8,
  /** Of the stack, for the turn: the distance to the viewer, in px. */
  perspective: 900,
  /** The switch: a curve that overshoots a little and settles, like a spring. */
  duration: 480,
  easing: 'cubic-bezier(0.22, 1.25, 0.36, 1)',
  /**
   * A swipe brings the next tier to the front past this share of the tier's width, or faster
   * than `swipeVelocity` (px per ms); a press is a click until it has moved `slop` px; a drag past
   * an end moves the stack by `resistance` of itself. The library's shared thresholds (`SWIPE`).
   */
  swipeDistance: SWIPE.distance,
  swipeVelocity: SWIPE.velocity,
  slop: SWIPE.slop,
  resistance: SWIPE.resistance,
} as const;

/** `index` wrapped round (`loop`) or held to the ends of `count` tiers. */
export const normalizeTierIndex = (index: number, count: number, loop?: boolean): number => {
  if (count <= 0) {
    return 0;
  }

  if (loop) {
    return ((index % count) + count) % count;
  }

  return Math.min(Math.max(index, 0), count - 1);
};

/**
 * Steps from the front tier to tier `index`: negative on the left, positive on the right. With
 * `loop`, the shorter way round (a tie goes to the right).
 */
export const getTierStackOffset = (
  index: number,
  front: number,
  count: number,
  loop?: boolean
): number => {
  const offset = index - front;

  if (!loop || count <= 1) {
    return offset;
  }

  const forward = ((offset % count) + count) % count;

  return forward > count / 2 ? forward - count : forward;
};

/**
 * The tier in front at first: `defaultIndex` when given (held to the ends), else the first
 * highlighted tier, else the first.
 */
export const getInitialTierIndex = (highlights: boolean[], defaultIndex?: number): number => {
  if (!highlights.length) {
    return 0;
  }

  if (typeof defaultIndex === 'number' && !Number.isNaN(defaultIndex)) {
    return normalizeTierIndex(Math.round(defaultIndex), highlights.length);
  }

  return Math.max(highlights.indexOf(true), 0);
};

/**
 * What a released swipe does: `1` brings the next tier to the front (the stack was dragged to
 * the left), `-1` the previous one, `0` puts the front tier back. A swipe counts when it went
 * far enough (`TIER_STACK.swipeDistance` of the tier's `width`) or was quick enough
 * (`TIER_STACK.swipeVelocity`, in the direction it went).
 */
export const getTierSwipeStep = (distance: number, velocity: number, width: number): -1 | 0 | 1 => {
  const step = getSwipeStep(distance, velocity, width, {
    distance: TIER_STACK.swipeDistance,
    velocity: TIER_STACK.swipeVelocity,
    slop: TIER_STACK.slop,
  });

  // The stack moves against the finger: dragged to the left, the NEXT tier comes to the front.
  return step === 0 ? 0 : step < 0 ? 1 : -1;
};

const round = (value: number) => Math.round(value * 1000) / 1000;

export interface IReqoreTierStackItemStyle {
  transform: string;
  filter?: string;
  opacity: number;
  zIndex: number;
}

export interface IReqoreTierStackItemStyleOptions {
  /** How far a neighbour shows past the front tier, in px. */
  peek: number;
  /** The neighbours' brightness (`TIER_STACK.neighbourBrightness`). Default 1: not dimmed. */
  brightness?: number;
  /** No turn: the stack lies flat. */
  reducedMotion?: boolean;
}

/**
 * Where a tier sits in the stack, `position` steps from the front (fractional while a swipe is
 * under way): the front tier at full size; a neighbour scaled to `TIER_STACK.neighbourScale`,
 * dimmed to `brightness`, turned a little and moved out so that `peek` px of it show past the
 * front tier's edge; and a tier further away smaller again and faded out. With `reducedMotion`
 * the neighbours are not turned.
 */
export const getTierStackItemStyle = (
  position: number,
  { peek, brightness = 1, reducedMotion }: IReqoreTierStackItemStyleOptions
): IReqoreTierStackItemStyle => {
  const { neighbourScale, neighbourRotate, hiddenScale } = TIER_STACK;
  const distance = Math.abs(position);
  const side = Math.sign(position);
  // From the front to a neighbour, then from a neighbour to a hidden tier.
  const near = Math.min(distance, 1);
  const far = Math.min(Math.max(distance - 1, 0), 1);
  const scale = 1 - near * (1 - neighbourScale) - far * (neighbourScale - hiddenScale);
  // A scaled tier is moved out by half the width it lost, plus the peek, so its outer edge
  // ends `peek` px past the front tier's (the percentage is of its own, unscaled width).
  const percent = near * (1 - neighbourScale) * 50 + far * (neighbourScale - hiddenScale) * 50;
  const pixels = (near + far) * peek;
  const rotate = reducedMotion ? 0 : -side * near * neighbourRotate;
  const dim = 1 - near * (1 - brightness);
  const translate = `translateX(calc(${round(side * percent)}% + ${round(side * pixels)}px))`;

  return {
    transform: `${translate} scale(${round(scale)})${rotate ? ` rotateY(${round(rotate)}deg)` : ''}`,
    filter: dim < 1 ? `brightness(${round(dim)})` : undefined,
    opacity: round(1 - far),
    zIndex: Math.max(1, 100 - Math.round(distance * 10)),
  };
};

const defaultStackItemLabel = (name: string | undefined, index: number, count: number) =>
  `${name ? `${name}, ` : ''}${index + 1} of ${count}`;

interface IStyledTierGroupProps {
  $stack: boolean;
  $focusColor: string;
  $gap: number;
  $minColumnWidth: string;
  $maxColumnWidth: string;
}

/** Layout only: the row (a grid of equal-height columns), or the stack above its controls. */
const StyledTierGroup = styled.div<IStyledTierGroupProps>`
  position: relative;
  min-width: 0;

  ${({ $stack, $focusColor, $gap, $minColumnWidth, $maxColumnWidth }) =>
    $stack
      ? css`
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: ${$gap}px;
          border-radius: ${RADIUS_FROM_RADIUS_SIZE.normal}px;
          outline: none;

          /* The stack takes the focus (it is the carousel the arrow keys move). */
          &:focus-visible {
            outline: 2px solid ${$focusColor};
            outline-offset: 4px;
          }
        `
      : css`
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(min(100%, ${$minColumnWidth}), ${$maxColumnWidth})
          );
          align-items: stretch;
          justify-content: center;
          gap: ${$gap}px;
        `}
`;

/**
 * The stack's frame: it takes the swipes and clips the neighbours at its sides, so a turned or
 * moving tier never widens the page. In the row it is not a box at all.
 */
const StyledTierGroupViewport = styled.div<{
  $stack: boolean;
  $dragging: boolean;
}>`
  ${({ $stack, $dragging }) =>
    $stack
      ? css`
          position: relative;
          /* Hidden where clip is not supported (which also clips the front tier's shadow). */
          overflow-x: hidden;
          overflow-x: clip;
          touch-action: pan-y;

          ${
            $dragging &&
            css`
              cursor: grabbing;
              user-select: none;
            `
          }
        `
      : css`
          display: contents;
        `}
`;

/** Every tier of the stack in one grid cell: the stack is as tall as its tallest tier. */
const StyledTierGroupTrack = styled.div<{ $stack: boolean }>`
  ${({ $stack }) =>
    $stack
      ? css`
          display: grid;
          perspective: ${TIER_STACK.perspective}px;
        `
      : css`
          display: contents;
        `}
`;

/** The switch: a tier glides on the spring curve; its dimming and fading settle sooner. */
const TIER_STACK_TRANSITION = [
  `transform ${TIER_STACK.duration}ms ${TIER_STACK.easing}`,
  `filter ${Math.round(TIER_STACK.duration * 0.6)}ms ease-out`,
  `opacity ${Math.round(TIER_STACK.duration * 0.6)}ms ease-out`,
].join(', ');

/** One tier's cell. A grid of one, so the tier fills it: every tier is as tall as its row. */
const StyledTierGroupItem = styled.div<{ $stack: boolean; $peek: number; $animate: boolean }>`
  display: grid;
  min-width: 0;

  ${({ $stack, $peek, $animate }) =>
    $stack &&
    css`
      position: relative;
      grid-area: 1 / 1;
      justify-self: center;
      width: calc(100% - ${$peek * 2}px);
      transform-origin: 50% 50%;
      will-change: transform, filter, opacity;
      transition: ${$animate ? TIER_STACK_TRANSITION : 'none'};
    `}
`;

/** Layout only: the previous button, the dots and the next button, centred under the stack. */
const StyledTierGroupControls = styled.div<{ $gap: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ $gap }) => $gap}px;

  .reqore-tier-group-dots {
    display: flex;
    align-items: center;
  }
`;

/**
 * A dot: which tier is in front, and a way to bring any of them there. A plain button rather
 * than a `ReqoreButton` — a pager's dot is a small mark with a finger-sized hit area round it,
 * and a Reqore button has no shape for that.
 */
const StyledTierGroupDot = styled.button<{
  $hit: number;
  $mark: number;
  $active: boolean;
  $animate: boolean;
  $color: string;
  $idleColor: string;
}>`
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $hit }) => $hit}px;
  height: ${({ $hit }) => $hit}px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: ${({ $hit }) => $hit}px;
  background: none;
  cursor: pointer;

  &::before {
    content: '';
    display: block;
    width: ${({ $mark, $active }) => ($active ? Math.round($mark * 2.5) : $mark)}px;
    height: ${({ $mark }) => $mark}px;
    border-radius: ${({ $mark }) => $mark}px;
    background-color: ${({ $active, $color, $idleColor }) => ($active ? $color : $idleColor)};
    transition: ${({ $animate }) =>
      $animate ? 'width 0.2s ease-out, background-color 0.2s ease-out' : 'none'};
  }

  &:focus-visible {
    outline: 2px solid ${({ $color }) => $color};
    outline-offset: -2px;
  }
`;

/** The front tier's name for a screen reader, said when it changes. Visually hidden. */
const StyledTierGroupStatus = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
`;

export const ReqoreTierGroup = memo(
  forwardRef<HTMLDivElement, IReqoreTierGroupProps>(
    (
      {
        children,
        appearance,
        size,
        intent,
        customTheme,
        inheritCustomTheme,
        tooltip,
        className,
        minColumnWidth = '240px',
        maxColumnWidth = '1fr',
        gapSize = 'big',
        mobileLayout = 'columns',
        mobileBreakpoint = NARROW_CONTAINER_BREAKPOINT_PX,
        activeIndex,
        defaultActiveIndex,
        onActiveIndexChange,
        loop = false,
        stackLabel = 'Plans',
        previousLabel = 'Previous plan',
        nextLabel = 'Next plan',
        stackItemLabel = defaultStackItemLabel,
        onKeyDown,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);
      const parentCustomTheme = useContext(CustomThemeContext);
      // The group's theme reaches its tiers and its controls; an inherited one is passed on.
      const cascadedCustomTheme =
        customTheme ?? (inheritCustomTheme === false ? undefined : parentCustomTheme);

      const tiers = useMemo(
        () =>
          React.Children.toArray(children).filter((child) =>
            isValidElement(child)
          ) as ReactElement<IReqoreTierProps>[],
        [children]
      );
      const count = tiers.length;
      const names = useMemo(() => tiers.map((tier) => tier.props.name), [tiers]);

      const [containerRef, isNarrow] = useNarrowContainer<HTMLDivElement>(mobileBreakpoint);
      const isStack = mobileLayout === 'stack' && isNarrow && count > 0;
      const reducedMotion = usePrefersReducedMotion();

      const highlights = useMemo(() => tiers.map((tier) => !!tier.props.highlight), [tiers]);
      // The tier the user brought to the front. Until they do, the front follows the tiers, so a
      // highlighted tier that arrives after the group mounted (the plans load) still starts there.
      const [chosenIndex, setChosenIndex] = useState<number | undefined>(undefined);
      const front = normalizeTierIndex(
        activeIndex ?? chosenIndex ?? getInitialTierIndex(highlights, defaultActiveIndex),
        count
      );

      const rootRef = useRef<HTMLDivElement | null>(null);
      const viewportRef = useRef<HTMLDivElement | null>(null);
      const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
      const [dragOffset, setDragOffset] = useState(0);

      const setRootRef = useCallback(
        (node: HTMLDivElement | null) => {
          rootRef.current = node;
          containerRef.current = node;

          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        },
        [ref, containerRef]
      );

      const resolvedSize = size ?? 'normal';
      const peek = TIER_GROUP_PEEK_FROM_SIZE[resolvedSize];
      const gap = GAP_FROM_SIZE[gapSize];

      const colors = useMemo(() => {
        const page = getOpaqueColor(getMainBackgroundColor(theme));
        const text = getOpaqueColor(getReadableColor(theme, undefined, undefined, true));
        const intentColor = intent ? theme.intents[intent] : undefined;
        const active = intentColor ? getReadableAccentColor(intentColor, page, 3) : text;

        return {
          active,
          idle: getReadableAccentColor(mix(0.4, text, page) as TReqoreHexColor, page, 3),
          neighbourBrightness: shouldDarken(page)
            ? TIER_STACK.neighbourBrightness.light
            : TIER_STACK.neighbourBrightness.dark,
        };
      }, [theme, intent]);

      const goTo = useCallback(
        (target: number) => {
          if (!count) {
            return;
          }

          const next = normalizeTierIndex(target, count, loop);

          if (next === front) {
            return;
          }

          if (activeIndex === undefined) {
            setChosenIndex(next);
          }

          onActiveIndexChange?.(next);
        },
        [count, loop, front, activeIndex, onActiveIndexChange]
      );

      // A card behind the front one is `inert`: out of the tab order, out of the accessibility
      // tree and out of the pointer's reach (a press on it reaches the stack, which brings it to
      // the front). Set on the element: React 18 has no prop for it.
      useLayoutEffect(() => {
        itemRefs.current.length = count;
        itemRefs.current.forEach((item, index) => {
          if (!item) {
            return;
          }

          if (isStack && index !== front) {
            item.setAttribute('inert', '');
          } else {
            item.removeAttribute('inert');
          }
        });
      }, [isStack, front, count]);

      // Focus inside the card that is leaving the front, or on a button that is about to be
      // disabled, would be lost: keep it on the stack.
      const keepFocusOnStack = useCallback(() => {
        const focused = document.activeElement;

        if (focused && focused !== rootRef.current && rootRef.current?.contains(focused)) {
          rootRef.current.focus({ preventScroll: true });
        }
      }, []);

      const getItemWidth = useCallback(() => {
        const viewport = viewportRef.current;

        return viewport ? Math.max(viewport.clientWidth - peek * 2, 0) : 0;
      }, [peek]);

      const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
          onKeyDown?.(event);

          if (
            !isStack ||
            event.defaultPrevented ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey
          ) {
            return;
          }

          const target = event.target as HTMLElement;

          // A key pressed in a portal (a popover a tier opened) bubbles here through React.
          if (!event.currentTarget.contains(target) || isTextEntry(target)) {
            return;
          }

          let next: number;

          switch (event.key) {
            case 'ArrowLeft':
              next = front - 1;
              break;
            case 'ArrowRight':
              next = front + 1;
              break;
            case 'Home':
              next = 0;
              break;
            case 'End':
              next = count - 1;
              break;
            default:
              return;
          }

          event.preventDefault();

          if (itemRefs.current[front]?.contains(document.activeElement)) {
            keepFocusOnStack();
          }

          goTo(next);
        },
        [onKeyDown, isStack, front, count, goTo, keepFocusOnStack]
      );

      // The swipe: the shared pointer drag (the same one a sheet is pushed away with), along
      // the x axis so a mostly vertical press stays the page's to scroll. The stack follows the
      // finger, gives a little past an end, and on release steps to the next or previous tier
      // when the swipe went far or fast enough (`getTierSwipeStep`).
      const { dragging: isDragging, handlers: dragHandlers } = usePointerDrag({
        enabled: isStack && count >= 2,
        axis: 'x',
        slop: TIER_STACK.slop,
        onMove: ({ dx }) => {
          // Past an end, the stack gives a little and springs back.
          const pastEnd = !loop && ((dx > 0 && front === 0) || (dx < 0 && front === count - 1));

          setDragOffset(pastEnd ? dx * TIER_STACK.resistance : dx);
        },
        onEnd: ({ dx, vx }, committed) => {
          setDragOffset(0);

          if (committed) {
            const step = getTierSwipeStep(dx, vx, getItemWidth());

            if (step) {
              goTo(front + step);
            }
          }
        },
      });

      // A press on a neighbour (inert, so it lands on the stack) brings it to the front.
      const handleViewportClick = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
          const frontItem = itemRefs.current[front];

          if (!isStack || !frontItem || frontItem.contains(event.target as Node)) {
            return;
          }

          const rect = frontItem.getBoundingClientRect();

          if (event.clientX < rect.left) {
            goTo(front - 1);
          } else if (event.clientX > rect.right) {
            goTo(front + 1);
          }
        },
        [isStack, front, goTo]
      );

      const handlePrevious = useCallback(() => {
        if (!loop && front - 1 <= 0) {
          keepFocusOnStack();
        }

        goTo(front - 1);
      }, [loop, front, goTo, keepFocusOnStack]);

      const handleNext = useCallback(() => {
        if (!loop && front + 1 >= count - 1) {
          keepFocusOnStack();
        }

        goTo(front + 1);
      }, [loop, front, count, goTo, keepFocusOnStack]);

      const itemWidth = isDragging ? getItemWidth() : 0;
      // The tiers follow the finger, unless the user asked for less motion: then a swipe still
      // switches them, at once, when it ends.
      const dragProgress =
        isDragging && !reducedMotion && itemWidth > 0 ? dragOffset / itemWidth : 0;

      const items = tiers.map((tier, index) => {
        const handed = {
          ...(appearance && !tier.props.appearance ? { appearance } : {}),
          ...(size && !tier.props.size ? { size } : {}),
        };
        const element = Object.keys(handed).length ? cloneElement(tier, handed) : tier;
        const offset = isStack ? getTierStackOffset(index, front, count, loop) : 0;
        const isFront = isStack && index === front;

        return (
          <StyledTierGroupItem
            key={tier.key ?? index}
            ref={(node: HTMLDivElement | null) => {
              itemRefs.current[index] = node;
            }}
            className={`reqore-tier-group-item${isFront ? ' reqore-tier-group-item-front' : ''}`}
            $stack={isStack}
            $peek={peek}
            $animate={!isDragging && !reducedMotion}
            {...(isStack
              ? {
                  role: 'group',
                  'aria-roledescription': 'slide',
                  'aria-label': stackItemLabel(names[index], index, count),
                  'data-offset': offset,
                  style: getTierStackItemStyle(offset + dragProgress, {
                    peek,
                    brightness: colors.neighbourBrightness,
                    reducedMotion,
                  }),
                }
              : {})}
          >
            {element}
          </StyledTierGroupItem>
        );
      });

      const root = (
        <ReqoreTooltipComponent
          {...rest}
          {...(isStack
            ? {
                role: 'region',
                'aria-roledescription': 'carousel',
                'aria-label': rest['aria-label'] ?? stackLabel,
                'data-active-index': front,
                tabIndex: rest.tabIndex ?? 0,
              }
            : {})}
          data-layout={isStack ? 'stack' : 'row'}
          Component={StyledTierGroup}
          ref={setRootRef}
          tooltip={tooltip}
          className={`${className || ''} reqore-tier-group`}
          onKeyDown={handleKeyDown}
          $stack={isStack}
          $focusColor={colors.active}
          $gap={gap}
          $minColumnWidth={minColumnWidth}
          $maxColumnWidth={maxColumnWidth}
        >
          <StyledTierGroupViewport
            ref={viewportRef}
            className='reqore-tier-group-viewport'
            $stack={isStack}
            $dragging={isDragging}
            {...(isStack ? { ...dragHandlers, onClick: handleViewportClick } : {})}
          >
            <StyledTierGroupTrack className='reqore-tier-group-track' $stack={isStack}>
              {items}
            </StyledTierGroupTrack>
          </StyledTierGroupViewport>
          {isStack && count > 1 ? (
            <StyledTierGroupControls className='reqore-tier-group-controls' $gap={gap}>
              <ReqoreButton
                className='reqore-tier-group-previous'
                icon='ArrowLeftSLine'
                aria-label={previousLabel}
                size={resolvedSize}
                intent={intent}
                circle
                disabled={!loop && front === 0}
                onClick={handlePrevious}
              />
              <div className='reqore-tier-group-dots'>
                {names.map((name, index) => (
                  <StyledTierGroupDot
                    key={tiers[index].key ?? index}
                    type='button'
                    className={`reqore-tier-group-dot${
                      index === front ? ' reqore-tier-group-dot-active' : ''
                    }`}
                    aria-label={name || stackItemLabel(name, index, count)}
                    aria-current={index === front ? 'true' : undefined}
                    $hit={TIER_GROUP_DOT_FROM_SIZE[resolvedSize]}
                    $mark={TIER_GROUP_DOT_MARK_FROM_SIZE[resolvedSize]}
                    $active={index === front}
                    $animate={!reducedMotion}
                    $color={colors.active}
                    $idleColor={colors.idle}
                    onClick={() => goTo(index)}
                  />
                ))}
              </div>
              <ReqoreButton
                className='reqore-tier-group-next'
                icon='ArrowRightSLine'
                aria-label={nextLabel}
                size={resolvedSize}
                intent={intent}
                circle
                disabled={!loop && front === count - 1}
                onClick={handleNext}
              />
            </StyledTierGroupControls>
          ) : null}
          {isStack ? (
            <StyledTierGroupStatus aria-live='polite' className='reqore-tier-group-status'>
              {stackItemLabel(names[front], front, count)}
            </StyledTierGroupStatus>
          ) : null}
        </ReqoreTooltipComponent>
      );

      return (
        <ReqoreThemeProvider theme={theme} customTheme={cascadedCustomTheme}>
          {root}
        </ReqoreThemeProvider>
      );
    }
  )
);

export default ReqoreTierGroup;
