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
import { getOneLessSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { RaisedElement } from '../../styles';
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
import ReqoreButton from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { IReqoreEffect, StyledEffect } from '../Effect';
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
  /** Tints this mark when active (falls back to the rail's `intent`, then `info`). */
  intent?: TReqoreIntent;
  disabled?: boolean;
  /** Paints this mark with its own gradient/effect regardless of active state —
   *  for a "special" destination that should always stand out. Marks ARE
   *  `ReqoreButton`s, so this is the button's `effect`. Takes precedence over the
   *  rail's `activeEffect` when the item is active. */
  effect?: IReqoreEffect;
  /** Draw a separator after this mark — extra vertical space plus a short line —
   *  to group items with breathing room. Only applies to shown primary marks
   *  (not ones folded into the `⋮` menu). */
  dividerAfter?: boolean;
  /** Sub-items shown nested directly beneath this item while it is active. */
  items?: IReqoreNavRailSubItem[];
  onClick?: () => void;
}

export interface IReqoreNavRailSubItem {
  id: string;
  label: string;
  icon?: IReqoreIconName;
  intent?: TReqoreIntent;
  disabled?: boolean;
  /** DOM id of the element this sub-item scrolls to / is tracked against.
   *  With `scrollSpy` the active sub-item follows the scroll position. */
  scrollTargetId?: string;
  onClick?: () => void;
}

export type TReqoreNavRailPosition = 'left' | 'right' | 'static';

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
  /** Rendered above the items (e.g. an open-sidebar control or a logo). */
  header?: ReactNode;
  /** Rendered below the items. */
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// ── Styled surface ────────────────────────────────────────────────────────────

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
}

const NavRailSurface = styled(StyledEffect)<ISurfaceStyle>`
  display: inline-flex;
  flex-flow: column nowrap;
  align-items: center;
  width: fit-content;
  gap: ${({ $gap }) => $gap}px;
  padding: ${({ $padding }) => $padding}px;
  border-radius: ${({ $pill, $radius }) => ($pill ? '9999px' : `${$radius}px`)};

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
  ${({ $raised, $flat }) => $raised && $flat && RaisedElement}

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

  ${({ $revealMode, $shown, $restOpacity }) =>
    $revealMode &&
    css`
      opacity: ${$shown ? 1 : $restOpacity};
      /* Only truly-hidden (revealOnScroll, restOpacity 0) blocks pointer events;
         a dimmed idle rail must stay hoverable so it can reveal itself. */
      pointer-events: ${$shown || $restOpacity > 0 ? 'auto' : 'none'};
      transition: opacity 220ms ease;
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
  box-shadow: inset 0 0 0 1px ${({ $ring }) => $ring};
`;

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
  onSelect: (id: string) => void;
  onOpenChange: (open: boolean) => void;
}

const NavRailOverflow = memo(
  ({ items, size, placement, ariaLabel, onSelect, onOpenChange }: IOverflowProps) => {
    // Memoised so the memo'd ReqorePopover/ReqoreMenuItem children get stable
    // props (no new object/closure per render).
    const componentProps = useMemo(
      () => ({
        icon: 'More2Line' as IReqoreIconName,
        size,
        flat: true,
        minimal: true,
        circle: true,
        raised: true,
        'aria-label': ariaLabel,
        className: 'reqore-nav-rail-overflow',
        tooltip: { content: `${items.length} more`, placement },
      }),
      [size, ariaLabel, placement, items.length]
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

// ── Mark (page / section) ────────────────────────────────────────────────────

interface INavRailMarkProps {
  id: string;
  label: string;
  icon?: IReqoreIconName;
  size: TSizes;
  intent?: TReqoreIntent;
  effect?: IReqoreEffect;
  disabled?: boolean;
  tipSide: 'left' | 'right';
  className: string;
  ariaCurrent?: 'page' | 'location';
  onSelect: (id: string) => void;
}

// One circular mark. Kept as its own memo'd component so its `tooltip` object
// and `onClick` closure are stabilised (useMemo/useCallback) rather than created
// inline in a `.map()` and passed to the memo'd ReqoreButton every render.
const NavRailMark = memo(
  ({ id, label, icon, size, intent, effect, disabled, tipSide, className, ariaCurrent, onSelect }: INavRailMarkProps) => {
    const tooltip = useMemo(
      () => ({ content: label, placement: tipSide }) as TReqoreTooltipProp,
      [label, tipSide]
    );
    const handleClick = useCallback(() => onSelect(id), [onSelect, id]);
    return (
      <ReqoreButton
        circle
        size={size}
        icon={icon}
        flat
        minimal
        raised
        disabled={disabled}
        intent={intent}
        effect={effect as IReqoreEffect}
        className={className}
        aria-label={label}
        aria-current={ariaCurrent}
        tooltip={tooltip}
        onClick={handleClick}
      />
    );
  }
);

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * A compact navigation rail: a thin column of circular marks for primary
 * destinations, with the active destination's sub-items nested directly beneath
 * it in a distinct sub-capsule. Overflow folds into a `⋮` flyout; it can pin to
 * a gutter and rest dimmed until approached (or, for mobile, stay hidden and
 * appear only while scrolling); and its sub-items can drive and follow page
 * scroll via `scrollSpy` + `scrollTargetId`.
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
  }: IReqoreNavRailProps) => {
    // NB: `intent` is deliberately NOT fed to the theme here — it must not
    // recolour the whole rail surface; it only drives the active accent + the
    // active group's tint (see `activeIntent` / `renderActiveGroup`).
    const theme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);
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

    const [hovered, setHovered] = useState(false);
    const [scrolling, setScrolling] = useState(false);
    const [openMenus, setOpenMenus] = useState(0);
    const onMenuToggle = useCallback(
      (open: boolean) => setOpenMenus((c) => Math.max(0, c + (open ? 1 : -1))),
      []
    );

    const railRef = useRef<HTMLDivElement>(null);
    const budgetOn = !!floating || typeof maxHeight === 'number';
    const availHeight = useAncestorHeight(budgetOn, maxHeight, railRef);

    // Idle-reveal hover uses NATIVE mouseenter/leave on the rail element, not
    // React's — React routes enter/leave through the React tree, so a portalled
    // child (a mark's tooltip) counts as "inside" and the leave never fires when
    // a tooltip is up. Native DOM events use real subtree containment instead.
    useEffect(() => {
      if (!idleReveal) return undefined;
      const el = railRef.current;
      if (!el) return undefined;
      const enter = () => setHovered(true);
      const leave = () => setHovered(false);
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      return () => {
        el.removeEventListener('mouseenter', enter);
        el.removeEventListener('mouseleave', leave);
      };
    }, [idleReveal]);

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

    const { shown: itemsShown, hidden: itemsHidden } = splitAroundActive(items, activeItemId, itemMax);
    const { shown: subsShown, hidden: subsHidden } = splitAroundActive(subItems, activeSubItemId, subMax);
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

    const renderItem = (item: IReqoreNavRailItem) => {
      const active = item.id === activeItemId;
      return (
        <NavRailMark
          key={item.id}
          id={item.id}
          label={item.label}
          icon={item.icon}
          size={size}
          disabled={item.disabled}
          // A per-item effect (a "special" mark) wins and always paints; else the
          // active mark takes the shared activeEffect, inactive marks none.
          effect={item.effect ?? (active ? activeEffect : undefined)}
          intent={active ? item.intent ?? activeIntent : item.intent}
          className='reqore-nav-rail-item'
          ariaCurrent={active ? 'page' : undefined}
          tipSide={tipSide}
          onSelect={onItemSelect}
        />
      );
    };

    // A neutral separator drawn after a mark (item.dividerAfter) to give groups
    // of items breathing room: extra vertical space (≈2.5× the mark gap) with a
    // short centred line so the break reads as intentional, not as a glitch or an
    // accidental gap. Untinted; the rail never widens for it.
    const renderDivider = (key: string) => (
      <ReqoreVerticalSpacer
        key={`${key}-divider`}
        height={Math.round(GAP_FROM_SIZE[size] * 2.5)}
        width={`${Math.round(SIZE_TO_PX[size] * 0.66)}px`}
        lineSize='small'
      />
    );

    // A primary mark plus its optional trailing divider (React flattens the
    // returned array; every child carries a key).
    const renderPrimary = (item: IReqoreNavRailItem) =>
      item.dividerAfter ? [renderItem(item), renderDivider(item.id)] : renderItem(item);

    const renderSub = (sub: IReqoreNavRailSubItem) => {
      const active = sub.id === activeSubItemId;
      return (
        <NavRailMark
          key={sub.id}
          id={sub.id}
          label={sub.label}
          icon={sub.icon}
          size={subSize}
          disabled={sub.disabled}
          effect={active ? activeEffect : undefined}
          intent={active ? sub.intent ?? activeIntent : sub.intent}
          className='reqore-nav-rail-subitem'
          ariaCurrent={active ? 'location' : undefined}
          tipSide={tipSide}
          onSelect={onSubSelect}
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
          aria-label={`${item.label} sections`}
          className='reqore-nav-rail-active'
          theme={theme}
          $gap={GAP_FROM_SIZE[subSize]}
          $padBottom={2}
          $radiusTop={pill ? Math.round(SIZE_TO_PX[size] / 2) : radius}
          $radiusBottom={pill ? Math.round(SIZE_TO_PX[subSize] / 2) : radius}
          $ring={rgba(groupColor, 0.42)}
          $tint={activeEffect?.gradient ? undefined : rgba(groupColor, 0.16)}
        >
          {renderItem(item)}
          <ReqoreVerticalSpacer
            height={GAP_FROM_SIZE[size]}
            width={`${Math.round(SIZE_TO_PX[subSize] * 0.5)}px`}
            lineSize='tiny'
            intent={item.intent ?? activeIntent}
          />
          {subsShown.map(renderSub)}
          {subsHidden.length ? (
            <NavRailOverflow
              items={subsHidden.map((s) => ({
                id: s.id,
                label: s.label,
                icon: s.icon,
                active: s.id === activeSubItemId,
              }))}
              size={subSize}
              placement={tipSide}
              ariaLabel='More sections'
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
          className={`${className ?? ''} reqore-nav-rail`.trim()}
          style={style}
          theme={theme}
          $gap={GAP_FROM_SIZE[size]}
          $padding={pad}
          $radius={radius}
          $pill={pill}
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
        >
          <ReqoreControlGroup vertical gapSize={size} horizontalAlign='center'>
            {header}
            {before.map(renderPrimary)}
            {activeAt >= 0 && activeItem ? renderActiveGroup(activeItem) : null}
            {after.map(renderPrimary)}
            {itemsHidden.length ? (
              <NavRailOverflow
                items={itemsHidden.map((i) => ({ id: i.id, label: i.label, icon: i.icon }))}
                size={size}
                placement={tipSide}
                ariaLabel='More items'
                onSelect={onItemSelect}
                onOpenChange={onMenuToggle}
              />
            ) : null}
            {footer}
          </ReqoreControlGroup>
        </NavRailSurface>
      </ReqoreThemeProvider>
    );
  }
);

export default ReqoreNavRail;
