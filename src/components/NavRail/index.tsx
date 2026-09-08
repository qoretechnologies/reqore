import { rgba } from 'polished';
import {
  CSSProperties,
  memo,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { css } from 'styled-components';
import {
  GAP_FROM_SIZE,
  HALF_PADDING_FROM_SIZE,
  resolveRadius,
  SIZE_TO_PX,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { changeLightness, getColorFromMaybeString, getMainBackgroundColor } from '../../helpers/colors';
import { omitStyleProps } from '../../helpers/styled';
import { getOneLessSize } from '../../helpers/utils';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import { useScrollFade } from '../../hooks/useScrollFade';
import { useReqoreTheme } from '../../hooks/useTheme';
import { RAISED_SHADOWS } from '../../styles';
import {
  IReqoreComponent,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFlat,
  IWithReqoreMinimal,
  IWithReqoreSize,
  IWithReqoreTransparent,
  TReqoreTooltipProp,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { getGlowBoxShadow, IReqoreEffect, StyledEffect, TReqoreHexColor } from '../Effect';
import ReqoreMenu from '../Menu';
import ReqoreMenuItem, { TReqoreMenuItemEventHandler } from '../Menu/item';
import { ReqorePopover } from '../Popover';
import { ReqoreVerticalSpacer } from '../Spacer';
import ReqoreThemeProvider from '../../containers/ThemeProvider';

// ── Types ───────────────────────────────────────────────────────────────────

export interface IReqoreNavRailItem {
  /** Stable id used for active-state matching and callbacks. */
  id: string;
  /** Human label — the tooltip on the mark and the text in the overflow menu. */
  label: string;
  icon?: IReqoreIconName;
  /** Render an image (any `img` src — a URL, a `data:` URI, an imported asset) in
   *  the mark instead of a font `icon` — e.g. a product/brand logo. Shortcut for
   *  `props={{ leftIconProps: { image } }}`. */
  iconImage?: string;
  /** Tints this mark when active (falls back to the rail's `intent`, then `info`). */
  intent?: TReqoreIntent;
  disabled?: boolean;
  /** Escape hatch — extra `ReqoreButton` props merged onto the mark (marks ARE
   *  `ReqoreButton`s), so anything the button accepts (badge, `customTheme`,
   *  `leftIconProps`, `wrap`, …) is reachable. The rail's own structural /
   *  behavioural props (circle shape, selection `onClick`, tooltip, active
   *  effect, aria) still take precedence, so a mark can't break the rail. */
  props?: Partial<IReqoreButtonProps>;
  /** Paints this mark with its own gradient/effect regardless of active state —
   *  for a "special" destination that should always stand out. Marks ARE
   *  `ReqoreButton`s, so this is the button's `effect`. Takes precedence over the
   *  rail's `activeEffect` when the item is active. */
  effect?: IReqoreEffect;
  /** Draw a separator after this mark to group items with breathing room. Only
   *  applies to shown primary marks (not ones folded into the `⋮` menu):
   *  - `true` / `'line'` — extra vertical space plus a short line.
   *  - `'space'` — the breathing room only, no line (a quieter break). */
  dividerAfter?: boolean | 'line' | 'space';
  /** Sub-items shown nested directly beneath this item while it is active. */
  items?: IReqoreNavRailSubItem[];
  onClick?: () => void;
}

export interface IReqoreNavRailSubItem {
  id: string;
  label: string;
  icon?: IReqoreIconName;
  /** Render an image in the sub-mark instead of a font `icon` (see the primary
   *  item's `iconImage`). */
  iconImage?: string;
  intent?: TReqoreIntent;
  disabled?: boolean;
  /** DOM id of the element this sub-item scrolls to / is tracked against.
   *  With `scrollSpy` the active sub-item follows the scroll position. */
  scrollTargetId?: string;
  /** Extra `ReqoreButton` props merged onto the sub-mark (see the primary item's
   *  `props`). */
  props?: Partial<IReqoreButtonProps>;
  onClick?: () => void;
}

export type TReqoreNavRailPosition = 'left' | 'right' | 'static';

/** What the rail tells its `header` / `footer` about itself. */
export interface IReqoreNavRailSlotState {
  /** The marks are spelling out their labels — `showLabels`, or the hover
   *  dwell has elapsed. */
  labelled: boolean;
  /** The rail is expanded (`expandable`). */
  expanded: boolean;
}

/** A `header` / `footer`: a node, or a function of the rail's slot state — so a
 *  control can follow the marks (a labelled pill while they are labelled). */
export type TReqoreNavRailSlot = ReactNode | ((state: IReqoreNavRailSlotState) => ReactNode);

export interface IReqoreNavRailProps
  extends IReqoreComponent,
    IWithReqoreSize,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreFlat,
    IWithReqoreMinimal,
    IWithReqoreTransparent,
    IReqoreIntent {
  /** Primary destinations (the "master" rail). */
  items: IReqoreNavRailItem[];
  /** Controlled active primary item. Omit to run uncontrolled. */
  activeId?: string;
  /** Controlled active sub-item. Omit to run uncontrolled / scroll-spy driven. */
  activeSubId?: string;
  /** Uncontrolled initial values. */
  defaultActiveId?: string;
  defaultActiveSubId?: string;
  onItemClick?: (id: string, item: IReqoreNavRailItem) => void;
  onSubClick?: (id: string, item: IReqoreNavRailSubItem) => void;
  /** Gutter to pin to (with `floating`) or `static` to render inline. */
  position?: TReqoreNavRailPosition;
  /** Absolutely pin to the chosen gutter of the nearest positioned ancestor. */
  floating?: boolean;
  /** Rest at `idleOpacity` and fade fully in on approach (or while a menu is open). */
  idleReveal?: boolean;
  idleOpacity?: number;
  /** Mobile pattern: stay hidden, appear while the user scrolls, hide when they
   *  stop (after `scrollHideDelay`). Takes precedence over `idleReveal`. */
  revealOnScroll?: boolean;
  scrollHideDelay?: number;
  /** Distance from the gutter edge when floating. */
  offset?: number;
  /** Scroll container the sub-items scroll within / are observed against. */
  scrollContainer?: RefObject<HTMLElement | null>;
  /** Track the active sub-item from scroll position (needs `scrollTargetId`s). */
  scrollSpy?: boolean;
  /** Cap used to fold overflow into the `⋮` menu. A number is taken as px; when
   *  omitted and `floating`, the positioned ancestor's height is measured. */
  maxHeight?: number;
  /** Hard cap on the number of primary marks shown at once — the rest fold into
   *  the `⋮` menu regardless of available height. Combines with `maxHeight`
   *  (the lower of the two wins), so a short viewport can still show fewer. Does
   *  not cap the active page's sub-items. */
  maxItems?: number;
  /**
   * Fold hidden destinations behind an expand toggle that grows the rail in
   * place, instead of the `⋮` flyout. Collapsed, the rail shows what the height
   * budget and `maxItems` allow; expanded, it shows EVERY item and section,
   * growing up to `expandedMaxHeight` and scrolling past that — with the
   * scrollbar hidden and a vignette on whichever edge still has marks out of
   * view. The toggle is the rail's only overflow affordance in this mode: the
   * active page's hidden sections fold behind it too, not into a `⋮`.
   */
  expandable?: boolean;
  /** Controlled expanded state (with `expandable`). Omit to run uncontrolled. */
  expanded?: boolean;
  /**
   * Uncontrolled initial expanded state.
   * @default false
   */
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * Tallest the expanded rail may grow before it scrolls. A number is taken as
   * px; a string is any CSS length. A `floating` rail is additionally capped by
   * its positioned ancestor, whichever is shorter.
   * @default '95vh'
   */
  expandedMaxHeight?: number | string;
  /**
   * Colour of the vignette at the scrolling edges of an expanded rail. Defaults
   * to the rail's own surface, so the marks read as dissolving into it; set it
   * when a surface `effect` paints something the default cannot match.
   */
  fadeColor?: TReqoreHexColor;
  /**
   * Show each mark's label beside its icon, widening the rail — to the right for
   * a left / static rail, to the left for a right one:
   * - `true` — always: a labelled rail.
   * - `'hover'` — icons only until the pointer has rested on the rail for
   *   `showLabelsDelay`; the labels hide again once it leaves. Pointer devices
   *   only: on a touch screen there is no hover to dwell in, so the rail stays
   *   icon-only (as a rail on a tablet should) and the marks keep their
   *   tooltips.
   * Labelled marks drop their tooltips — the label IS the tooltip — and the
   * `header` / `footer` align to the rail's leading edge.
   */
  showLabels?: boolean | 'hover';
  /**
   * How long the pointer must rest on the rail before `showLabels='hover'`
   * reveals the labels, in ms.
   * @default 1500
   */
  showLabelsDelay?: number;
  /** Surface radius. Round (pill, matching the circular marks) by default;
   *  `radiusSize` overrides with a fixed size; `rounded={false}` squares it. */
  rounded?: boolean;
  radiusSize?: TSizes;
  /** Inner padding. */
  padded?: boolean | TSizes;
  /** Subtle 3D "raised" surface (paired with `flat`). */
  raised?: boolean;
  opacity?: number;
  blur?: number;
  /** Effect applied to the active page's group container AND its active marks
   *  (e.g. a coordinated gradient to pair with the rail's own `effect`). Falls
   *  back to the intent tint when omitted. */
  activeEffect?: IReqoreEffect;
  /** Rendered above the items (e.g. an open-sidebar control or a logo). A
   *  function receives the rail's slot state — `labelled`, `expanded` — so the
   *  control can match the marks (a labelled pill while the rail is labelled). */
  header?: TReqoreNavRailSlot;
  /** Rendered below the items — pinned under the scroll region, never folded
   *  away. A function receives the slot state like `header`. */
  footer?: TReqoreNavRailSlot;
  className?: string;
  style?: CSSProperties;

  /**
   * ARIA label for the overflow (`⋮`) trigger that folds hidden primary
   * destinations. Defaults to `'More items'`.
   */
  moreItemsLabel?: string;
  /**
   * ARIA label for the overflow (`⋮`) trigger that folds hidden sub-items of
   * the active destination. Defaults to `'More sections'`.
   */
  moreSectionsLabel?: string;
  /**
   * Suffix used to build the overflow-trigger tooltip content — rendered as
   * `${hidden.length} ${overflowTooltipSuffix}`. Defaults to `'more'`. With
   * `expandable`, the same string is the collapsed toggle's tooltip (and, on a
   * labelled rail, its text).
   */
  overflowTooltipSuffix?: string;
  /**
   * Suffix used to label the active destination's expanded group container,
   * rendered as `${activeItem.label} ${activeGroupAriaLabelSuffix}` on the
   * grouping element's `aria-label`. Defaults to `'sections'`.
   */
  activeGroupAriaLabelSuffix?: string;
  /**
   * ARIA label of the expand toggle while the rail is collapsed (its tooltip
   * is the hidden count). Defaults to `'Show all items'`.
   */
  expandLabel?: string;
  /**
   * ARIA label, tooltip and (on a labelled rail) text of the expand toggle
   * while the rail is expanded. Defaults to `'Show fewer items'`.
   */
  collapseLabel?: string;
}

// ── Styled surface ────────────────────────────────────────────────────────────

/**
 * `box-shadow` rules for a surface that paints shadow layers of its own (the
 * raised highlight, the active group's ring) AND may carry an effect glow. The
 * later `box-shadow` declaration would win — a raised rail could never cast a
 * glow or drop shadow — so the two are composed into one, under the glow's own
 * trigger state when it has one.
 */
const withGlow = (theme: IReqoreTheme, effect: IReqoreEffect | undefined, own: string) => {
  const base = css`
    box-shadow: ${own};
  `;

  if (!effect?.glow) {
    return base;
  }

  const both = css`
    box-shadow: ${getGlowBoxShadow(theme, effect.glow)}, ${own};
  `;

  switch (effect.glow.when) {
    case 'hover':
      return css`
        ${base}
        &:hover {
          ${both}
        }
      `;
    case 'focus':
      return css`
        ${base}
        &:focus {
          ${both}
        }
      `;
    case 'active':
      return css`
        ${base}
        &:active {
          ${both}
        }
      `;
    default:
      return both;
  }
};

interface ISurfaceStyle {
  theme: IReqoreTheme;
  $gap: number;
  $padding: number;
  $radius: number;
  $pill: boolean;
  $flat: boolean;
  $raised: boolean;
  $transparent: boolean;
  $opacity: number;
  $blur: number;
  $bgLightness: number;
  $borderLightness: number;
  // Positioning / reveal (outer surface only)
  $position?: TReqoreNavRailPosition;
  $floating?: boolean;
  $offset?: number;
  $revealMode?: boolean;
  $shown?: boolean;
  $restOpacity?: number;
  /** Cap on the expanded rail's height (any CSS length); it scrolls past it. */
  $maxHeight?: string;
}

const NavRailSurface = styled(StyledEffect)<ISurfaceStyle>`
  display: inline-flex;
  flex-flow: column nowrap;
  align-items: center;
  width: fit-content;
  gap: ${({ $gap }) => $gap}px;
  padding: ${({ $padding }) => $padding}px;
  border-radius: ${({ $pill, $radius }) => ($pill ? '9999px' : `${$radius}px`)};
  /* Labels widen the rail (a hover dwell, a menu closing): let a browser that can
     interpolate \`fit-content\` slide it open rather than snap. Elsewhere this is
     ignored and the rail simply resizes. */
  interpolate-size: allow-keywords;
  transition: width 0.2s ease-out;

  background-color: ${({ theme, $transparent, $opacity, $bgLightness }) =>
    $transparent
      ? 'transparent'
      : rgba(changeLightness(getMainBackgroundColor(theme), $bgLightness), $opacity)};
  border: ${({ $flat, theme, $borderLightness }) =>
    $flat
      ? 'none'
      : `1px solid ${rgba(changeLightness(getMainBackgroundColor(theme), $borderLightness), 0.7)}`};
  ${({ $blur, $opacity }) =>
    $blur && $opacity < 1 &&
    css`
      backdrop-filter: blur(${$blur}px);
    `}
  ${({ $raised, $flat, effect, theme }) =>
    $raised && $flat && withGlow(theme, effect as IReqoreEffect | undefined, RAISED_SHADOWS)}

  ${({ $floating, $position, $offset }) =>
    $floating &&
    $position !== 'static' &&
    css`
      position: absolute;
      top: 50%;
      ${$position}: ${$offset}px;
      transform: translateY(-50%);
      z-index: 8;
      max-height: calc(100% - 8px);
    `}

  /* Expanded: cap the rail and let the scroll box inside shrink to fit — a
     floating rail also stays inside its positioned ancestor. */
  ${({ $maxHeight, $floating, $position }) =>
    $maxHeight &&
    css`
      box-sizing: border-box;
      max-height: ${$floating && $position !== 'static'
        ? `min(${$maxHeight}, calc(100% - 8px))`
        : $maxHeight};
    `}

  ${({ $revealMode, $shown, $restOpacity }) =>
    $revealMode &&
    css`
      opacity: ${$shown ? 1 : $restOpacity};
      /* Only truly-hidden (revealOnScroll, restOpacity 0) blocks pointer events;
         a dimmed idle rail must stay hoverable so it can reveal itself. */
      pointer-events: ${$shown || $restOpacity > 0 ? 'auto' : 'none'};
      transition: opacity 220ms ease, width 0.2s ease-out;
    `}
`;

// The active page's "expanded" container. Built on StyledEffect so an
// `activeEffect` gradient paints it (like the outer rail); the intent tint is
// the fallback when no gradient is given.
const ActiveGroupSurface = styled(StyledEffect)<{
  theme: IReqoreTheme;
  $gap: number;
  $padBottom: number;
  $radiusTop: number;
  $radiusBottom: number;
  $ring: string;
  $tint?: string;
  $labelled?: boolean;
}>`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: ${({ $gap }) => $gap}px;
  padding: 0 0 ${({ $padBottom }) => $padBottom}px;
  /* Top cap hugs the (larger) page mark, bottom cap hugs the (smaller) section
     mark — so both ends sit flush instead of the bottom bulging. */
  border-radius: ${({ $radiusTop, $radiusBottom }) =>
    `${$radiusTop}px ${$radiusTop}px ${$radiusBottom}px ${$radiusBottom}px`};
  ${({ $tint }) =>
    $tint &&
    css`
      background-color: ${$tint};
    `}
  /* The ring is a shadow layer too — composed with the active effect's glow. */
  ${({ $ring, effect, theme }) =>
    withGlow(theme, effect as IReqoreEffect | undefined, `inset 0 0 0 1px ${$ring}`)}
  /* A labelled group spans the rail so its (fluid) marks can fill the width;
     the section divider inside stays centred by the group's own alignment. */
  ${({ $labelled }) =>
    $labelled &&
    css`
      align-self: stretch;
    `}
`;

/* The scroll region of the rail. Inert unless the rail is expanded: no overflow
   (so a mark's glow can still bleed past its edge), no visible fades, no
   layout of its own — the marks sit exactly where they did.

   Expanded, the wrapper carries the vignette: overlay gradients on THIS
   element rather than inside the scroll box, where they would scroll away with
   the marks. Which edges fade is a measurement carried by classes (see
   `useScrollFade` for why it is never state). The fades reach into the rail's
   padding — the box below bleeds by the same amount — so the vignette spans the
   surface edge to edge, and they take the surface's inner radius so the corners
   never poke out of the pill. `pointer-events: none` keeps them from swallowing
   a click on the mark beneath. */
const NavRailScroll = styled.div.withConfig({
  // A control group hands every non-intrinsic child its own props; none of them
  // belong on this div.
  shouldForwardProp: omitStyleProps(
    'size',
    'intent',
    'fluid',
    'fixed',
    'fill',
    'flat',
    'minimal',
    'stack',
    'spaceBetween',
    'customTheme'
  ),
})<{
  $fadeFrom: string;
  $fadeTo: string;
  $fadeSize: number;
  $fadeRadius: number;
  $bleed: number;
  $scrollable: boolean;
  $labelled: boolean;
}>`
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  min-height: 0;

  ${({ $scrollable }) =>
    $scrollable &&
    css`
      flex: 1 1 auto;
    `}

  /* A labelled rail's marks span the column, so the region must too. */
  ${({ $labelled }) =>
    $labelled &&
    css`
      align-self: stretch;
    `}

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: ${({ $bleed }) => -$bleed}px;
    right: ${({ $bleed }) => -$bleed}px;
    height: ${({ $fadeSize }) => $fadeSize}px;
    pointer-events: none;
    z-index: 2;
    opacity: 0;
    transition: opacity 0.15s ease-out;
  }

  &::before {
    top: 0;
    border-radius: ${({ $fadeRadius }) => `${$fadeRadius}px ${$fadeRadius}px 0 0`};
    background: linear-gradient(
      to bottom,
      ${({ $fadeFrom }) => $fadeFrom},
      ${({ $fadeTo }) => $fadeTo}
    );
  }

  &::after {
    bottom: 0;
    border-radius: ${({ $fadeRadius }) => `0 0 ${$fadeRadius}px ${$fadeRadius}px`};
    background: linear-gradient(
      to top,
      ${({ $fadeFrom }) => $fadeFrom},
      ${({ $fadeTo }) => $fadeTo}
    );
  }

  &.reqore-nav-rail-fade-top::before {
    opacity: 1;
  }

  &.reqore-nav-rail-fade-bottom::after {
    opacity: 1;
  }
`;

/* The box that actually scrolls. The scrollbar is hidden on purpose: the
   vignette IS the affordance, and a native bar is wider than the gap between
   marks. Wheel, trackpad, touch and keyboard still scroll it. The negative
   margin / padding pair widens the clip box into the rail's padding without
   moving the marks, so a glow or raised shadow is clipped at the surface, not
   at the mark. */
const NavRailScrollBox = styled.div<{ $scrollable: boolean; $bleed: number }>`
  display: flex;
  flex-flow: column nowrap;
  min-height: 0;

  ${({ $scrollable, $bleed }) =>
    $scrollable &&
    css`
      overflow-y: auto;
      overflow-x: hidden;
      margin: 0 ${-$bleed}px;
      padding: 0 ${$bleed}px;
      scrollbar-width: none;
      -ms-overflow-style: none;

      &::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;
      }
    `}
`;

// Hoisted so the memo'd control group / spacer children see stable objects.
const EXPANDED_GROUP_STYLE: CSSProperties = { minHeight: 0, flex: '1 1 auto' };
// A labelled rail aligns its column to the leading edge (so fluid marks can
// stretch); a divider has a fixed width and must be re-centred by hand.
const LABELLED_DIVIDER_STYLE: CSSProperties = { alignSelf: 'center' };

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Keep the active item inside the shown window, folding the rest to overflow. */
function splitAroundActive<T extends { id: string }>(
  list: T[],
  activeId: string | undefined,
  max: number
): { shown: T[]; hidden: T[] } {
  if (max >= list.length || max <= 0) return { shown: list, hidden: [] };
  const activeIdx = Math.max(0, list.findIndex((x) => x.id === activeId));
  const start = activeIdx >= max ? activeIdx - max + 1 : 0;
  const shown = list.slice(start, start + max);
  const ids = new Set(shown.map((x) => x.id));
  return { shown, hidden: list.filter((x) => !ids.has(x.id)) };
}

/** Measure the positioned ancestor's height (for overflow budgeting). */
function useAncestorHeight(
  enabled: boolean,
  maxHeight: number | undefined,
  ref: RefObject<HTMLElement | null>
): number | undefined {
  const [height, setHeight] = useState<number | undefined>(maxHeight);
  useEffect(() => {
    if (typeof maxHeight === 'number') {
      setHeight(maxHeight);
      return undefined;
    }
    if (!enabled || !ref.current) return undefined;
    const parent = ref.current.offsetParent as HTMLElement | null;
    if (!parent) return undefined;
    const update = () => setHeight(parent.clientHeight);
    const ro = new ResizeObserver(update);
    ro.observe(parent);
    update();
    return () => ro.disconnect();
  }, [enabled, maxHeight, ref]);
  return height;
}

const resolvePadding = (padded: boolean | TSizes | undefined, size: TSizes): number => {
  if (padded === false) return 0;
  if (padded === undefined || padded === true) return HALF_PADDING_FROM_SIZE[size];
  return HALF_PADDING_FROM_SIZE[padded];
};

// ── Overflow flyout ─────────────────────────────────────────────────────────

interface IOverflowProps {
  items: { id: string; label: string; icon?: IReqoreIconName; active?: boolean }[];
  size: TSizes;
  placement: 'left' | 'right';
  ariaLabel: string;
  /**
   * Suffix appended to the overflow tooltip content — rendered as
   * `${items.length} ${tooltipSuffix}`. Defaults to `'more'`.
   */
  tooltipSuffix?: string;
  /** On a labelled rail the trigger is a pill reading `${items.length} ${tooltipSuffix}`. */
  labelled?: boolean;
  onSelect: (id: string) => void;
  onOpenChange: (open: boolean) => void;
}

const NavRailOverflow = memo(
  ({
    items,
    size,
    placement,
    ariaLabel,
    tooltipSuffix = 'more',
    labelled,
    onSelect,
    onOpenChange,
  }: IOverflowProps) => {
    // Memoised so the memo'd ReqorePopover/ReqoreMenuItem children get stable
    // props (no new object/closure per render).
    const componentProps = useMemo(
      () => ({
        icon: 'More2Line' as IReqoreIconName,
        size,
        flat: true,
        minimal: true,
        circle: !labelled,
        pill: !!labelled,
        fluid: !!labelled,
        raised: true,
        'aria-label': ariaLabel,
        className: 'reqore-nav-rail-overflow',
        tooltip: labelled ? undefined : { content: `${items.length} ${tooltipSuffix}`, placement },
        label: labelled ? `${items.length} ${tooltipSuffix}` : undefined,
      }),
      [size, ariaLabel, placement, items.length, tooltipSuffix, labelled]
    );
    const handleItemClick = useCallback<TReqoreMenuItemEventHandler>(
      (_event, itemId) => {
        if (itemId) onSelect(itemId);
      },
      [onSelect]
    );
    // Height-capped so a long overflow list (many hidden pages) never runs off
    // the viewport — sensible on mobile too (70vh, never past 480px); it scrolls
    // past that (ReqoreMenu is overflow-y:auto).
    const content = useMemo(
      () => (
        <ReqoreMenu rounded padded width='210px' maxHeight='min(70vh, 480px)'>
          {items.map((it) => (
            <ReqoreMenuItem
              key={it.id}
              itemId={it.id}
              icon={it.icon}
              selected={it.active}
              intent={it.active ? 'info' : undefined}
              onClick={handleItemClick}
            >
              {it.label}
            </ReqoreMenuItem>
          ))}
        </ReqoreMenu>
      ),
      [items, handleItemClick]
    );
    return (
      <ReqorePopover
        component={ReqoreButton}
        componentProps={componentProps}
        // The trigger IS the mark: rendered directly, not boxed in the popover's
        // wrapper span — that span would be the flex child in the mark's place
        // (so a labelled, fluid trigger could never stretch to the rail's width)
        // and its overflow:hidden would clip the mark's raised shadow.
        isReqoreComponent
        handler='click'
        placement={placement}
        closeOnInsideClick
        noArrow
        noWrapper
        onToggleChange={onOpenChange}
        content={content}
      />
    );
  }
);

// ── Expand toggle ───────────────────────────────────────────────────────────

interface IExpandToggleProps {
  expanded: boolean;
  /** Marks (items + sections) a collapsed rail folds away. */
  hiddenCount: number;
  size: TSizes;
  tipSide: 'left' | 'right';
  labelled?: boolean;
  expandLabel: string;
  collapseLabel: string;
  tooltipSuffix: string;
  onToggle: () => void;
}

// The one overflow affordance of an `expandable` rail. Shaped like a mark
// (circle, or a fluid pill on a labelled rail) so it reads as part of the
// column, with a chevron pointing the way the rail will grow.
const NavRailExpandToggle = memo(
  ({
    expanded,
    hiddenCount,
    size,
    tipSide,
    labelled,
    expandLabel,
    collapseLabel,
    tooltipSuffix,
    onToggle,
  }: IExpandToggleProps) => {
    const text = expanded ? collapseLabel : `${hiddenCount} ${tooltipSuffix}`;
    const tooltip = useMemo(
      () => ({ content: text, placement: tipSide }) as TReqoreTooltipProp,
      [text, tipSide]
    );
    return (
      <ReqoreButton
        icon={expanded ? 'ArrowUpSLine' : 'ArrowDownSLine'}
        size={size}
        flat
        minimal
        raised
        circle={!labelled}
        pill={!!labelled}
        fluid={!!labelled}
        aria-label={expanded ? collapseLabel : expandLabel}
        aria-expanded={expanded}
        className='reqore-nav-rail-expand'
        tooltip={labelled ? undefined : tooltip}
        label={labelled ? text : undefined}
        onClick={onToggle}
      />
    );
  }
);

// ── Mark (page / section) ────────────────────────────────────────────────────

interface INavRailMarkProps {
  id: string;
  label: string;
  icon?: IReqoreIconName;
  iconImage?: string;
  size: TSizes;
  intent?: TReqoreIntent;
  effect?: IReqoreEffect;
  disabled?: boolean;
  /** The current mark. Rendered solid + `active` (a lifted, highlighted pill)
   *  instead of the ghost/minimal resting state, so "you are here" reads clearly
   *  even against the active group's own tinted surface. */
  active?: boolean;
  /** Show the label beside the icon: the mark becomes a fluid pill (spanning the
   *  rail) and drops its tooltip, which would only repeat the label. */
  labelled?: boolean;
  tipSide: 'left' | 'right';
  className: string;
  ariaCurrent?: 'page' | 'location';
  onSelect: (id: string) => void;
  buttonProps?: Partial<IReqoreButtonProps>;
}

// One circular mark. Kept as its own memo'd component so its `tooltip` object
// and `onClick` closure are stabilised (useMemo/useCallback) rather than created
// inline in a `.map()` and passed to the memo'd ReqoreButton every render.
const NavRailMark = memo(
  ({
    id,
    label,
    icon,
    iconImage,
    size,
    intent,
    effect,
    disabled,
    active,
    labelled,
    tipSide,
    className,
    ariaCurrent,
    onSelect,
    buttonProps,
  }: INavRailMarkProps) => {
    const tooltip = useMemo(
      () => ({ content: label, placement: tipSide }) as TReqoreTooltipProp,
      [label, tipSide]
    );
    const handleClick = useCallback(() => onSelect(id), [onSelect, id]);
    // An image mark renders through the button's left-icon slot; merge with any
    // caller-supplied leftIconProps so `iconImage` and `props.leftIconProps`
    // coexist (the image wins the `image` key).
    const leftIconProps = useMemo(
      () =>
        iconImage
          ? { ...buttonProps?.leftIconProps, image: iconImage }
          : buttonProps?.leftIconProps,
      [iconImage, buttonProps]
    );
    return (
      <ReqoreButton
        // Escape hatch first, so the rail's own structural / behavioural props
        // below always win (the mark can be tuned but never broken).
        {...buttonProps}
        circle={!labelled}
        pill={labelled || buttonProps?.pill}
        fluid={labelled || buttonProps?.fluid}
        size={size}
        icon={icon}
        leftIconProps={leftIconProps}
        flat
        // Active marks fill in (solid + the `active` highlight) so they lift out
        // of the rail / the active group's surface; resting marks stay minimal.
        minimal={!active}
        active={active}
        raised
        disabled={disabled}
        intent={intent}
        effect={effect as IReqoreEffect}
        className={className}
        aria-label={label}
        aria-current={ariaCurrent}
        tooltip={labelled ? undefined : tooltip}
        label={labelled ? label : undefined}
        onClick={handleClick}
      />
    );
  }
);

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * A compact navigation rail: a thin column of circular marks for primary
 * destinations, with the active destination's sub-items nested directly beneath
 * it in a distinct sub-capsule. Overflow folds into a `⋮` flyout — or, with
 * `expandable`, behind a toggle that grows the rail in place (capped, then
 * scrolling behind a vignette). It can pin to a gutter and rest dimmed until
 * approached (or, for mobile, stay hidden and appear only while scrolling); its
 * sub-items can drive and follow page scroll via `scrollSpy` + `scrollTargetId`;
 * and `showLabels` widens it into a labelled rail — always, or after the pointer
 * has rested on it for a moment.
 */
export const ReqoreNavRail = memo(
  ({
    items,
    activeId,
    activeSubId,
    defaultActiveId,
    defaultActiveSubId,
    onItemClick,
    onSubClick,
    position = 'left',
    floating,
    idleReveal,
    idleOpacity = 0.34,
    revealOnScroll,
    scrollHideDelay = 1100,
    offset = 14,
    scrollContainer,
    scrollSpy,
    maxHeight,
    maxItems,
    expandable,
    expanded,
    defaultExpanded = false,
    onExpandedChange,
    expandedMaxHeight = '95vh',
    fadeColor,
    showLabels,
    showLabelsDelay = 1500,
    size = 'small',
    intent,
    effect,
    activeEffect,
    flat = false,
    minimal,
    transparent,
    rounded = true,
    radiusSize,
    padded = true,
    raised,
    opacity = 1,
    blur = 4,
    customTheme,
    inheritCustomTheme,
    header,
    footer,
    className,
    style,
    moreItemsLabel = 'More items',
    moreSectionsLabel = 'More sections',
    overflowTooltipSuffix = 'more',
    activeGroupAriaLabelSuffix = 'sections',
    expandLabel = 'Show all items',
    collapseLabel = 'Show fewer items',
  }: IReqoreNavRailProps) => {
    // NB: `intent` is deliberately NOT fed to the theme here — it must not
    // recolour the whole rail surface; it only drives the active accent + the
    // active group's tint (see `activeIntent` / `renderActiveGroup`).
    const theme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);
    const isHoverCapable = useReqoreProperty('isHoverCapable');
    const subSize = getOneLessSize(size);
    const tipSide: 'left' | 'right' = position === 'right' ? 'left' : 'right';
    const activeIntent: TReqoreIntent = intent ?? 'info';
    const isTransparent = !!(transparent || minimal);
    const isFlat = !!(flat || minimal);

    const [internalId, setInternalId] = useState(defaultActiveId ?? items[0]?.id);
    const activeItemId = activeId ?? internalId;
    const activeItem = useMemo(
      () => items.find((i) => i.id === activeItemId),
      [items, activeItemId]
    );
    const subItems = useMemo(() => activeItem?.items ?? [], [activeItem]);

    const [internalSubId, setInternalSubId] = useState(defaultActiveSubId);
    const activeSubItemId = activeSubId ?? internalSubId ?? subItems[0]?.id;

    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
    const isExpanded = !!expandable && (expanded ?? internalExpanded);
    const toggleExpanded = useCallback(() => {
      const next = !(expanded ?? internalExpanded);
      if (expanded === undefined) setInternalExpanded(next);
      onExpandedChange?.(next);
    }, [expanded, internalExpanded, onExpandedChange]);

    // Labels on a dwell are a pointer nicety: on a touch screen there is no
    // hover to rest in, so the rail stays icon-only (with its tooltips and
    // overflow names) rather than half-working. `isHoverCapable` defaults to
    // capable where the query cannot be evaluated.
    const hoverLabels = showLabels === 'hover' && isHoverCapable !== false;
    const [dwellLabels, setDwellLabels] = useState(false);
    const labelled = showLabels === true || (hoverLabels && dwellLabels);
    // What the header / footer are told, so a control can follow the marks.
    const slotState = useMemo<IReqoreNavRailSlotState>(
      () => ({ labelled, expanded: isExpanded }),
      [labelled, isExpanded]
    );
    const renderSlot = (slot: TReqoreNavRailSlot): ReactNode =>
      typeof slot === 'function' ? slot(slotState) : slot;

    const [hovered, setHovered] = useState(false);
    const [scrolling, setScrolling] = useState(false);
    const [openMenus, setOpenMenus] = useState(0);
    const onMenuToggle = useCallback(
      (open: boolean) => setOpenMenus((c) => Math.max(0, c + (open ? 1 : -1))),
      []
    );
    // Read by the native pointer handlers below, which are bound once.
    const hoveredRef = useRef(false);
    const openMenusRef = useRef(0);

    const railRef = useRef<HTMLDivElement>(null);
    const budgetOn = !!floating || typeof maxHeight === 'number';
    const availHeight = useAncestorHeight(budgetOn, maxHeight, railRef);

    // Idle-reveal hover and the label dwell use NATIVE mouseenter/leave on the
    // rail element, not React's — React routes enter/leave through the React
    // tree, so a portalled child (a mark's tooltip) counts as "inside" and the
    // leave never fires when a tooltip is up. Native DOM events use real subtree
    // containment instead.
    useEffect(() => {
      if (!idleReveal && !hoverLabels) return undefined;
      const el = railRef.current;
      if (!el) return undefined;
      let dwell: ReturnType<typeof setTimeout> | undefined;
      const enter = () => {
        hoveredRef.current = true;
        if (idleReveal) setHovered(true);
        if (hoverLabels) {
          clearTimeout(dwell);
          dwell = setTimeout(() => setDwellLabels(true), showLabelsDelay);
        }
      };
      const leave = () => {
        hoveredRef.current = false;
        clearTimeout(dwell);
        if (idleReveal) setHovered(false);
        // While a flyout opened from the rail is up the pointer is in the menu,
        // and narrowing the rail would move the menu's anchor: keep the labels
        // until the menu closes (see the effect on `openMenus`).
        if (hoverLabels && openMenusRef.current === 0) setDwellLabels(false);
      };
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      return () => {
        clearTimeout(dwell);
        el.removeEventListener('mouseenter', enter);
        el.removeEventListener('mouseleave', leave);
      };
    }, [idleReveal, hoverLabels, showLabelsDelay]);

    // The last menu closing with the pointer already gone is the deferred
    // "leave" from above.
    useEffect(() => {
      openMenusRef.current = openMenus;
      if (openMenus === 0 && !hoveredRef.current) setDwellLabels(false);
    }, [openMenus]);

    // Budget marks to the height; sections get ~40% (min 2), pages the rest.
    const markH = SIZE_TO_PX[size] + GAP_FROM_SIZE[size];
    const reserve = markH * 2 + 44; // header/footer/sub-capsule chrome
    const slots =
      availHeight === undefined
        ? Number.POSITIVE_INFINITY
        : Math.max(4, Math.floor((availHeight - reserve) / markH));
    let subMax = Number.isFinite(slots)
      ? Math.min(subItems.length, Math.max(2, Math.round(slots * 0.4)))
      : subItems.length;
    let itemMax = Number.isFinite(slots) ? Math.max(2, slots - subMax) : items.length;
    if (itemMax > items.length) {
      itemMax = items.length;
      subMax = Number.isFinite(slots)
        ? Math.min(subItems.length, Math.max(2, slots - itemMax))
        : subItems.length;
    }
    // Hard count cap: the lower of the height budget and `maxItems` wins, so a
    // short viewport can still show fewer than the cap.
    if (typeof maxItems === 'number') {
      itemMax = Math.min(itemMax, Math.max(1, Math.floor(maxItems)));
    }

    // What a COLLAPSED rail shows is always computed: expanded shows everything,
    // and the toggle is offered only when collapsing would actually fold
    // something — so an expanded rail nothing would hide never offers a "show
    // fewer" that changes nothing.
    const collapsedItems = splitAroundActive(items, activeItemId, itemMax);
    const collapsedSubs = splitAroundActive(subItems, activeSubItemId, subMax);
    const hiddenWhenCollapsed = collapsedItems.hidden.length + collapsedSubs.hidden.length;
    const { shown: itemsShown, hidden: itemsHidden } = isExpanded
      ? { shown: items, hidden: [] as IReqoreNavRailItem[] }
      : collapsedItems;
    const { shown: subsShown, hidden: subsHidden } = isExpanded
      ? { shown: subItems, hidden: [] as IReqoreNavRailSubItem[] }
      : collapsedSubs;
    const activeAt = itemsShown.findIndex((i) => i.id === activeItemId);
    const before = activeAt >= 0 ? itemsShown.slice(0, activeAt) : itemsShown; // before active
    const after = activeAt >= 0 ? itemsShown.slice(activeAt + 1) : []; // after active

    const selectItem = useCallback(
      (item: IReqoreNavRailItem) => {
        if (item.disabled) return;
        if (activeId === undefined) {
          setInternalId(item.id);
          setInternalSubId(undefined);
        }
        item.onClick?.();
        onItemClick?.(item.id, item);
      },
      [activeId, onItemClick]
    );

    const selectSub = useCallback(
      (sub: IReqoreNavRailSubItem) => {
        if (sub.disabled) return;
        if (sub.scrollTargetId) {
          document
            .getElementById(sub.scrollTargetId)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (activeSubId === undefined) setInternalSubId(sub.id);
        sub.onClick?.();
        onSubClick?.(sub.id, sub);
      },
      [activeSubId, onSubClick]
    );

    // Stable id-based select callbacks so the memo'd mark / overflow children
    // don't receive a fresh closure each render.
    const onItemSelect = useCallback(
      (id: string) => {
        const item = items.find((i) => i.id === id);
        if (item) selectItem(item);
      },
      [items, selectItem]
    );
    const onSubSelect = useCallback(
      (id: string) => {
        const sub = subItems.find((s) => s.id === id);
        if (sub) selectSub(sub);
      },
      [subItems, selectSub]
    );

    // Scroll-spy: as the user scrolls, highlight the last section whose top has
    // passed a threshold below the container's top (when the sub-item isn't
    // controlled). A plain scroll listener + getBoundingClientRect is used
    // rather than IntersectionObserver, whose callback only reports the entries
    // that *changed* — unreliable for "which section is current right now".
    useEffect(() => {
      if (!scrollSpy || activeSubId !== undefined) return undefined;
      const targeted = subItems.filter((s) => s.scrollTargetId);
      if (!targeted.length) return undefined;
      const container = scrollContainer?.current ?? null;
      const scrollTarget: HTMLElement | Window = container ?? window;
      const compute = () => {
        const containerTop = container ? container.getBoundingClientRect().top : 0;
        const viewport = container ? container.clientHeight : window.innerHeight;
        const threshold = containerTop + Math.min(viewport * 0.3, 140);
        let current = targeted[0].id;
        for (const s of targeted) {
          const el = document.getElementById(s.scrollTargetId as string);
          if (!el) continue;
          if (el.getBoundingClientRect().top <= threshold) current = s.id;
          else break;
        }
        setInternalSubId(current);
      };
      compute();
      scrollTarget.addEventListener('scroll', compute, { passive: true });
      return () => scrollTarget.removeEventListener('scroll', compute);
    }, [scrollSpy, activeSubId, subItems, scrollContainer]);

    // Reveal-on-scroll (mobile): show while scrolling, hide after a quiet delay.
    useEffect(() => {
      if (!revealOnScroll) return undefined;
      const target: HTMLElement | Window = scrollContainer?.current ?? window;
      let timer: ReturnType<typeof setTimeout>;
      const onScroll = () => {
        setScrolling(true);
        clearTimeout(timer);
        timer = setTimeout(() => setScrolling(false), scrollHideDelay);
      };
      target.addEventListener('scroll', onScroll, { passive: true });
      return () => {
        target.removeEventListener('scroll', onScroll);
        clearTimeout(timer);
      };
    }, [revealOnScroll, scrollContainer, scrollHideDelay]);

    // The vignette follows the scroll box's edges; off (classes cleared) while
    // the rail is collapsed and nothing scrolls.
    const scrollWrapRef = useRef<HTMLDivElement>(null);
    const scrollBoxRef = useRef<HTMLDivElement>(null);
    useScrollFade({
      scrollRef: scrollBoxRef,
      targetRef: scrollWrapRef,
      axis: 'y',
      enabled: isExpanded,
      startClassName: 'reqore-nav-rail-fade-top',
      endClassName: 'reqore-nav-rail-fade-bottom',
    });

    const revealMode = !!idleReveal || !!revealOnScroll;
    const shown = revealOnScroll
      ? scrolling || openMenus > 0
      : idleReveal
        ? hovered || openMenus > 0
        : true;
    const restOpacity = revealOnScroll ? 0 : idleOpacity;

    const pill = rounded && !radiusSize;
    const radius = resolveRadius(size, radiusSize);
    const pad = resolvePadding(padded, size);
    // A labelled rail is wide: a 9999px radius would round its caps into
    // semicircles. Keep the curvature of the icon-only pill instead, so the
    // rail reads as the same object, just wider.
    const pillRadius = Math.round(SIZE_TO_PX[size] / 2 + pad + 1);
    const surfacePill = pill && !labelled;
    const surfaceRadius = pill && labelled ? pillRadius : radius;
    // The fade dissolves the marks into the rail's own surface (or, on a
    // transparent rail, into the page behind it).
    const fadeBase =
      fadeColor ??
      (isTransparent
        ? getMainBackgroundColor(theme)
        : changeLightness(getMainBackgroundColor(theme), 0.02));
    const fadeFrom = rgba(fadeBase, isTransparent ? 1 : opacity);
    const fadeTo = rgba(fadeBase, 0);
    const expandedCap = isExpanded
      ? typeof expandedMaxHeight === 'number'
        ? `${expandedMaxHeight}px`
        : expandedMaxHeight
      : undefined;
    // Labelled marks are fluid pills that must span the column, so the column
    // aligns to its leading edge instead of centring (and handing every child
    // the auto side-margins that would keep it at its own width).
    const columnAlign = labelled ? 'flex-start' : 'center';

    const renderItem = (item: IReqoreNavRailItem) => {
      const active = item.id === activeItemId;
      return (
        <NavRailMark
          key={item.id}
          id={item.id}
          label={item.label}
          icon={item.icon}
          iconImage={item.iconImage}
          size={size}
          disabled={item.disabled}
          active={active}
          labelled={labelled}
          // A per-item effect (a "special" mark) wins and always paints; else the
          // active mark takes the shared activeEffect, inactive marks none.
          effect={item.effect ?? (active ? activeEffect : undefined)}
          intent={active ? item.intent ?? activeIntent : item.intent}
          className='reqore-nav-rail-item'
          ariaCurrent={active ? 'page' : undefined}
          tipSide={tipSide}
          onSelect={onItemSelect}
          buttonProps={item.props}
        />
      );
    };

    // A neutral separator drawn after a mark (item.dividerAfter) to give groups
    // of items breathing room: extra vertical space (≈2.5× the mark gap), with a
    // short centred line (`withLine`) so the break reads as intentional, or just
    // the space (`'space'`) for a quieter break. Untinted; the rail never widens.
    const renderDivider = (key: string, withLine: boolean) => (
      <ReqoreVerticalSpacer
        key={`${key}-divider`}
        // A line-less break needs a touch more space to register on its own.
        height={Math.round(GAP_FROM_SIZE[size] * (withLine ? 2.5 : 3.5))}
        width={`${Math.round(SIZE_TO_PX[size] * 0.66)}px`}
        lineSize={withLine ? 'small' : 'none'}
        style={labelled ? LABELLED_DIVIDER_STYLE : undefined}
      />
    );

    // A primary mark plus its optional trailing divider (React flattens the
    // returned array; every child carries a key). `'space'` draws no line.
    const renderPrimary = (item: IReqoreNavRailItem) =>
      item.dividerAfter
        ? [renderItem(item), renderDivider(item.id, item.dividerAfter !== 'space')]
        : renderItem(item);

    const renderSub = (sub: IReqoreNavRailSubItem) => {
      const active = sub.id === activeSubItemId;
      return (
        <NavRailMark
          key={sub.id}
          id={sub.id}
          label={sub.label}
          icon={sub.icon}
          iconImage={sub.iconImage}
          size={subSize}
          disabled={sub.disabled}
          active={active}
          labelled={labelled}
          effect={active ? activeEffect : undefined}
          intent={active ? sub.intent ?? activeIntent : sub.intent}
          className='reqore-nav-rail-subitem'
          ariaCurrent={active ? 'location' : undefined}
          tipSide={tipSide}
          onSelect={onSubSelect}
          buttonProps={sub.props}
        />
      );
    };

    // The active page's mark "expands" into the sub-rail: its own icon, a line
    // separator, then its section marks — all inside one grouped container.
    const renderActiveGroup = (item: IReqoreNavRailItem) => {
      if (!subsShown.length) return renderItem(item);
      // Tint the wrapping container with the active mark's own intent colour so
      // the sub-rail reads as one coloured "you are here" unit.
      const groupColor = getColorFromMaybeString(theme, item.intent ?? activeIntent);
      // One mark wide (inset-shadow "border", no horizontal padding) so the rail
      // never changes width; the top mark sits flush in the pill cap and a little
      // bottom padding keeps the last section off the edge.
      return (
        <ActiveGroupSurface
          as='div'
          effect={activeEffect as IReqoreEffect}
          key={item.id}
          role='group'
          aria-label={`${item.label} ${activeGroupAriaLabelSuffix}`}
          className='reqore-nav-rail-active'
          theme={theme}
          $gap={GAP_FROM_SIZE[subSize]}
          $padBottom={2}
          $radiusTop={pill ? Math.round(SIZE_TO_PX[size] / 2) : radius}
          $radiusBottom={pill ? Math.round(SIZE_TO_PX[subSize] / 2) : radius}
          $ring={rgba(groupColor, 0.42)}
          $tint={activeEffect?.gradient ? undefined : rgba(groupColor, 0.16)}
          $labelled={labelled}
        >
          {renderItem(item)}
          <ReqoreVerticalSpacer
            height={GAP_FROM_SIZE[size]}
            width={`${Math.round(SIZE_TO_PX[subSize] * 0.5)}px`}
            lineSize='tiny'
            intent={item.intent ?? activeIntent}
          />
          {subsShown.map(renderSub)}
          {!expandable && subsHidden.length ? (
            <NavRailOverflow
              items={subsHidden.map((s) => ({
                id: s.id,
                label: s.label,
                icon: s.icon,
                active: s.id === activeSubItemId,
              }))}
              size={subSize}
              placement={tipSide}
              ariaLabel={moreSectionsLabel}
              tooltipSuffix={overflowTooltipSuffix}
              labelled={labelled}
              onSelect={onSubSelect}
              onOpenChange={onMenuToggle}
            />
          ) : null}
        </ActiveGroupSurface>
      );
    };

    return (
      <ReqoreThemeProvider theme={theme} customTheme={customTheme}>
        <NavRailSurface
          as='nav'
          ref={railRef}
          effect={effect as IReqoreEffect}
          role='navigation'
          className={[
            className,
            'reqore-nav-rail',
            labelled && 'reqore-nav-rail-labelled',
            isExpanded && 'reqore-nav-rail-expanded',
          ]
            .filter(Boolean)
            .join(' ')}
          style={style}
          theme={theme}
          $gap={GAP_FROM_SIZE[size]}
          $padding={pad}
          $radius={surfaceRadius}
          $pill={surfacePill}
          $flat={isFlat}
          $raised={!!raised}
          $transparent={isTransparent}
          $opacity={opacity}
          $blur={blur}
          $bgLightness={0.02}
          $borderLightness={0.14}
          $position={position}
          $floating={floating}
          $offset={offset}
          $revealMode={revealMode}
          $shown={shown}
          $restOpacity={restOpacity}
          $maxHeight={expandedCap}
        >
          <ReqoreControlGroup
            vertical
            gapSize={size}
            horizontalAlign={columnAlign}
            // Expanded, the column must be allowed to shrink so the scroll
            // region inside it (not the header / toggle / footer) takes the cut.
            style={isExpanded ? EXPANDED_GROUP_STYLE : undefined}
          >
            {renderSlot(header)}
            <NavRailScroll
              ref={scrollWrapRef}
              className='reqore-nav-rail-scroll'
              $fadeFrom={fadeFrom}
              $fadeTo={fadeTo}
              $fadeSize={SIZE_TO_PX[size]}
              $fadeRadius={pill ? Math.round(SIZE_TO_PX[size] / 2) + pad : Math.max(0, radius - 1)}
              $bleed={pad}
              $scrollable={isExpanded}
              $labelled={labelled}
            >
              <NavRailScrollBox
                ref={scrollBoxRef}
                className='reqore-nav-rail-scroll-box'
                $scrollable={isExpanded}
                $bleed={pad}
              >
                <ReqoreControlGroup vertical gapSize={size} horizontalAlign={columnAlign}>
                  {before.map(renderPrimary)}
                  {activeAt >= 0 && activeItem ? renderActiveGroup(activeItem) : null}
                  {after.map(renderPrimary)}
                  {!expandable && itemsHidden.length ? (
                    <NavRailOverflow
                      items={itemsHidden.map((i) => ({ id: i.id, label: i.label, icon: i.icon }))}
                      size={size}
                      placement={tipSide}
                      ariaLabel={moreItemsLabel}
                      tooltipSuffix={overflowTooltipSuffix}
                      labelled={labelled}
                      onSelect={onItemSelect}
                      onOpenChange={onMenuToggle}
                    />
                  ) : null}
                </ReqoreControlGroup>
              </NavRailScrollBox>
            </NavRailScroll>
            {expandable && hiddenWhenCollapsed > 0 ? (
              <NavRailExpandToggle
                expanded={isExpanded}
                hiddenCount={hiddenWhenCollapsed}
                size={size}
                tipSide={tipSide}
                labelled={labelled}
                expandLabel={expandLabel}
                collapseLabel={collapseLabel}
                tooltipSuffix={overflowTooltipSuffix}
                onToggle={toggleExpanded}
              />
            ) : null}
            {renderSlot(footer)}
          </ReqoreControlGroup>
        </NavRailSurface>
      </ReqoreThemeProvider>
    );
  }
);

export default ReqoreNavRail;
