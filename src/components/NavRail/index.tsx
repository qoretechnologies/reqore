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
import { GAP_FROM_SIZE, RADIUS_FROM_SIZE, SIZE_TO_PX, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { changeLightness, getMainBackgroundColor } from '../../helpers/colors';
import { getOneLessSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  IReqoreComponent,
  IWithReqoreCustomTheme,
  IWithReqoreSize,
  TReqoreTooltipProp,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreMenu from '../Menu';
import ReqoreMenuItem from '../Menu/item';
import { ReqorePopover } from '../Popover';
import ReqoreThemeProvider from '../../containers/ThemeProvider';

// ── Types ───────────────────────────────────────────────────────────────────

export interface IReqoreNavRailItem {
  /** Stable id used for active-state matching and callbacks. */
  id: string;
  /** Human label — the tooltip on the mark and the text in the overflow menu. */
  label: string;
  icon?: IReqoreIconName;
  /** Tints the mark when active (defaults to `info`). */
  intent?: TReqoreIntent;
  disabled?: boolean;
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
    IWithReqoreCustomTheme {
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
  /** Distance from the gutter edge when floating. */
  offset?: number;
  /** Scroll container the sub-items scroll within / are observed against. */
  scrollContainer?: RefObject<HTMLElement | null>;
  /** Track the active sub-item from scroll position (needs `scrollTargetId`s). */
  scrollSpy?: boolean;
  /** Cap used to fold overflow into the `⋮` menu. A number is taken as px; when
   *  omitted and `floating`, the positioned ancestor's height is measured. */
  maxHeight?: number;
  /** Rendered above the items (e.g. an open-sidebar control or a logo). */
  header?: ReactNode;
  /** Rendered below the items. */
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// ── Styled ──────────────────────────────────────────────────────────────────

interface IStyledRail {
  theme: IReqoreTheme;
  $position: TReqoreNavRailPosition;
  $floating?: boolean;
  $reveal?: boolean;
  $shown?: boolean;
  $idleOpacity: number;
  $offset: number;
  $gap: number;
  $radius: number;
}

const StyledNavRail = styled.div<IStyledRail>`
  display: inline-flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: ${({ $gap }) => $gap}px;
  padding: 5px;
  border-radius: ${({ $radius }) => $radius}px;
  background: ${({ theme }) => rgba(getMainBackgroundColor(theme), 0.92)};
  border: 1px solid ${({ theme }) => rgba(changeLightness(getMainBackgroundColor(theme), 0.12), 0.7)};
  backdrop-filter: blur(4px);

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

  ${({ $reveal, $shown, $idleOpacity }) =>
    $reveal &&
    css`
      opacity: ${$shown ? 1 : $idleOpacity};
      transition: opacity 200ms ease;
    `}
`;

const StyledNavRailSub = styled.div<{ theme: IReqoreTheme; $gap: number; $radius: number }>`
  align-self: stretch;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: ${({ $gap }) => $gap}px;
  padding: 5px 2px;
  border-radius: ${({ $radius }) => $radius}px;
  background: ${({ theme }) => rgba(changeLightness(getMainBackgroundColor(theme), 0.16), 0.9)};
  border: 1px solid ${({ theme }) => rgba(changeLightness(getMainBackgroundColor(theme), 0.32), 0.75)};
`;

const StyledConnector = styled.div<{ theme: IReqoreTheme }>`
  width: 2px;
  height: 7px;
  border-radius: 2px;
  background: ${({ theme }) => rgba(changeLightness(getMainBackgroundColor(theme), 0.4), 0.85)};
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
  ({ items, size, placement, ariaLabel, onSelect, onOpenChange }: IOverflowProps) => (
    <ReqorePopover
      component={ReqoreButton}
      componentProps={{
        icon: 'More2Line' as IReqoreIconName,
        size,
        flat: true,
        minimal: true,
        circle: true,
        'aria-label': ariaLabel,
        className: 'reqore-nav-rail-overflow',
        tooltip: { content: `${items.length} more`, placement },
      }}
      handler='click'
      placement={placement}
      closeOnInsideClick
      noArrow
      onToggleChange={onOpenChange}
      content={
        <ReqoreMenu rounded padded width='210px'>
          {items.map((it) => (
            <ReqoreMenuItem
              key={it.id}
              icon={it.icon}
              selected={it.active}
              intent={it.active ? 'info' : undefined}
              onClick={() => onSelect(it.id)}
            >
              {it.label}
            </ReqoreMenuItem>
          ))}
        </ReqoreMenu>
      }
    />
  )
);

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * A compact navigation rail: a thin column of circular marks for primary
 * destinations, with the active destination's sub-items nested directly beneath
 * it in a distinct sub-capsule. Overflow folds into a `⋮` flyout; it can pin to
 * a gutter and rest dimmed until approached; and its sub-items can drive (and
 * follow) page scroll via `scrollSpy` + `scrollTargetId`.
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
    offset = 14,
    scrollContainer,
    scrollSpy,
    maxHeight,
    header,
    footer,
    size = 'small',
    customTheme,
    inheritCustomTheme,
    className,
    style,
  }: IReqoreNavRailProps) => {
    const theme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);
    const subSize = getOneLessSize(size);
    const tipSide: 'left' | 'right' = position === 'right' ? 'left' : 'right';

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
    const [openMenus, setOpenMenus] = useState(0);
    const onMenuToggle = useCallback(
      (open: boolean) => setOpenMenus((c) => Math.max(0, c + (open ? 1 : -1))),
      []
    );

    const railRef = useRef<HTMLDivElement>(null);
    const budgetOn = !!floating || typeof maxHeight === 'number';
    const availHeight = useAncestorHeight(budgetOn, maxHeight, railRef);

    // Budget marks to the height; sections get ~40% (min 2), pages the rest.
    const markH = SIZE_TO_PX[size] + GAP_FROM_SIZE[size];
    const reserve = markH * 2 + 44; // header/footer/sub-tray chrome
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

    const { shown: itemsShown, hidden: itemsHidden } = splitAroundActive(items, activeItemId, itemMax);
    const { shown: subsShown, hidden: subsHidden } = splitAroundActive(subItems, activeSubItemId, subMax);
    const activeAt = itemsShown.findIndex((i) => i.id === activeItemId);
    const before = itemsShown.slice(0, activeAt + 1); // includes the active item
    const after = itemsShown.slice(activeAt + 1);

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

    // Scroll-spy: follow the scroll position when the sub-item isn't controlled.
    useEffect(() => {
      if (!scrollSpy || activeSubId !== undefined) return undefined;
      const pairs = subItems
        .map((s) => (s.scrollTargetId ? [document.getElementById(s.scrollTargetId), s.id] : null))
        .filter((p): p is [HTMLElement, string] => !!p && !!p[0]);
      if (!pairs.length) return undefined;
      const byEl = new Map(pairs);
      const io = new IntersectionObserver(
        (entries) => {
          const top = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          const id = top && byEl.get(top.target as HTMLElement);
          if (id) setInternalSubId(id);
        },
        { root: scrollContainer?.current ?? null, rootMargin: '0px 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] }
      );
      pairs.forEach(([el]) => io.observe(el));
      return () => io.disconnect();
    }, [scrollSpy, activeSubId, subItems, scrollContainer]);

    const shown = !idleReveal || hovered || openMenus > 0;

    const renderItem = (item: IReqoreNavRailItem) => {
      const active = item.id === activeItemId;
      return (
        <ReqoreButton
          key={item.id}
          circle
          size={size}
          icon={item.icon}
          flat
          minimal={!active}
          active={active}
          disabled={item.disabled}
          intent={active ? item.intent ?? 'info' : item.intent}
          className='reqore-nav-rail-item'
          aria-label={item.label}
          tooltip={{ content: item.label, placement: tipSide } as TReqoreTooltipProp}
          onClick={() => selectItem(item)}
        />
      );
    };

    const renderSub = (sub: IReqoreNavRailSubItem) => {
      const active = sub.id === activeSubItemId;
      return (
        <ReqoreButton
          key={sub.id}
          circle
          size={subSize}
          icon={sub.icon}
          flat
          minimal={!active}
          active={active}
          disabled={sub.disabled}
          intent={active ? sub.intent ?? 'info' : sub.intent}
          className='reqore-nav-rail-subitem'
          aria-label={sub.label}
          tooltip={{ content: sub.label, placement: tipSide } as TReqoreTooltipProp}
          onClick={() => selectSub(sub)}
        />
      );
    };

    return (
      <ReqoreThemeProvider theme={theme} customTheme={customTheme}>
        <StyledNavRail
          ref={railRef}
          role='navigation'
          className={`${className ?? ''} reqore-nav-rail`.trim()}
          style={style}
          theme={theme}
          $position={position}
          $floating={floating}
          $reveal={idleReveal}
          $shown={shown}
          $idleOpacity={idleOpacity}
          $offset={offset}
          $gap={GAP_FROM_SIZE[size]}
          $radius={RADIUS_FROM_SIZE[size]}
          onMouseEnter={idleReveal ? () => setHovered(true) : undefined}
          onMouseLeave={idleReveal ? () => setHovered(false) : undefined}
        >
          <ReqoreControlGroup vertical gapSize={size} horizontalAlign='center'>
            {header}
            {before.map(renderItem)}

            {subsShown.length ? (
              <>
                <StyledConnector aria-hidden theme={theme} />
                <StyledNavRailSub
                  role='group'
                  aria-label={activeItem ? `${activeItem.label} sections` : 'Sections'}
                  className='reqore-nav-rail-sub'
                  theme={theme}
                  $gap={GAP_FROM_SIZE[subSize]}
                  $radius={RADIUS_FROM_SIZE[size]}
                >
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
                      onSelect={(id) => {
                        const sub = subItems.find((s) => s.id === id);
                        if (sub) selectSub(sub);
                      }}
                      onOpenChange={onMenuToggle}
                    />
                  ) : null}
                </StyledNavRailSub>
              </>
            ) : null}

            {after.map(renderItem)}
            {itemsHidden.length ? (
              <NavRailOverflow
                items={itemsHidden.map((i) => ({ id: i.id, label: i.label, icon: i.icon }))}
                size={size}
                placement={tipSide}
                ariaLabel='More items'
                onSelect={(id) => {
                  const item = items.find((i) => i.id === id);
                  if (item) selectItem(item);
                }}
                onOpenChange={onMenuToggle}
              />
            ) : null}
            {footer}
          </ReqoreControlGroup>
        </StyledNavRail>
      </ReqoreThemeProvider>
    );
  }
);

export default ReqoreNavRail;
