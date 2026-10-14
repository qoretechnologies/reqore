import { size as count } from 'lodash';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { css } from 'styled-components';
import styled from '../../helpers/styled';
import { ReqoreDropdown, ReqoreErrorBoundary } from '../..';
import { CONTROL_ICON_OPACITY } from '../../constants/colors';
import { MARGIN_FROM_SIZE, PADDING_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreBreadcrumbsTheme, IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeLightness,
  getDrawnColor,
  getReadableAlpha,
  getReadableColor,
  getReadableColorFrom,
  getThemeSurface,
  READABLE_ICON_CONTRAST,
} from '../../helpers/colors';
import { ReqoreSurfaceProvider, useReqoreSurface } from '../../context/SurfaceContext';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreComponent } from '../../types/global';
import { IReqoreButtonProps } from '../Button';
import { IReqoreDropdownItem } from '../Dropdown/list';
import ReqoreIcon from '../Icon';
import { IReqoreTabsListItem } from '../Tabs';
import { StyledTabListItem } from '../Tabs/item';
import ReqoreTabsList, { StyledReqoreTabsList, getTabsLength } from '../Tabs/list';
import ReqoreBreadcrumbsItem from './item';

export interface IReqoreBreadcrumbItemTabs {
  tabs: IReqoreTabsListItem[];
  onTabChange: (tabId: string | number) => any;
  activeTab: string;
  activeTabIntent?: TReqoreIntent;
}

export interface IReqoreBreadcrumbItem extends IReqoreButtonProps {
  label?: string;
  /**
   * Label to use ONLY when this crumb is shown inside the collapse ("…" / current
   * page) menu — not in the trail. Lets an icon-only trail crumb (e.g. a Home
   * that is just a house icon in the bar) still read as a proper labelled row in
   * the menu (e.g. "Home"). Falls back to `label` when unset.
   */
  menuLabel?: string;
  as?: any;
  props?: Record<string, any>;
  withTabs?: IReqoreBreadcrumbItemTabs;
}

export interface IReqoreBreadcrumbsProps
  extends IReqoreComponent,
    React.HTMLAttributes<HTMLDivElement> {
  items: IReqoreBreadcrumbItem[];
  rightElement?: JSX.Element;
  // Internal prop, ignore! (Kept for API compatibility — the trail width is now
  // measured live, so this no longer drives the collapse.)
  _testWidth?: number;
  customTheme?: IReqoreBreadcrumbsTheme;
  size?: TSizes;
  flat?: boolean;

  responsive?: boolean;

  padded?: boolean;
  margin?: 'top' | 'bottom' | 'both' | 'none';
}

interface IStyledBreadcrumbs extends Omit<IReqoreBreadcrumbsProps, 'items'> {
  theme: IReqoreTheme;
}

// The bar is a two-region flex row: a growable/clipping TRAIL and a fixed RIGHT
// element. There is deliberately NO `justify-content: space-between` — that is
// what let the two regions overlap when they didn't fit. Instead the right
// element never shrinks (`flex: 0 0 auto`) and the trail takes whatever is left
// (`flex: 1; min-width: 0; overflow: hidden`), so the two can never overlap at
// any width; the trail collapses/ellipsises to fit the space it's given.
const StyledReqoreBreadcrumbs = styled.div<IStyledBreadcrumbs>`
  ${({ theme, size, flat, padded = true, margin = 'both', responsive }: IStyledBreadcrumbs) => css`
    width: ${responsive ? '100%' : undefined};
    margin-top: ${margin === 'both' || margin === 'top' ? MARGIN_FROM_SIZE[size!] : 0}px;
    margin-bottom: ${margin === 'both' || margin === 'bottom' ? MARGIN_FROM_SIZE[size!] : 0}px;
    display: flex;
    align-items: center;
    padding: 0 ${padded ? PADDING_FROM_SIZE[size!] : 0}px;
    border-bottom: ${flat ? undefined : `1px solid ${changeLightness(theme.main, 0.05)}`};
    background-color: ${theme.breadcrumbs?.main || 'transparent'};

    ${StyledReqoreTabsList} {
      flex: 1;
    }
    ${StyledReqoreTabsList}, ${StyledTabListItem} {
      border-bottom: 0;
    }
  `}
`;

// The trail region — takes all the width the right element leaves and clips.
// `min-width: 0` lets it shrink below its content so the current page can
// ellipsise; `overflow: hidden` is the final safety net. Its single child (the
// folding row, or the static row) fills it, so the row's end is the end of the
// AVAILABLE width, not of its own content.
const StyledTrail = styled.div<{ $color: string }>`
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  color: ${({ $color }) => $color};

  > * {
    flex: 1 1 auto;
    min-width: 0;
  }

  /* The crumbs pick their own text colour, against what they are drawn on: the bar
     (handed to them as their surface) or their own colour, for a crumb with an intent.
     The bar's colour used to be forced onto every crumb, because a minimal crumb in a
     chromatic custom theme tinted its label near-white against the page rather than
     the bar - and it was forced onto a crumb with an intent of its own too, dark text
     on the warning orange. */
`;

// The right element NEVER shrinks — this is what makes overlap with the trail
// structurally impossible at any width.
const StyledRight = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  margin-left: 8px;
`;

const StyledStaticTrail = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
`;

// The responsive trail's row: its crumbs on one line, centred against the tallest
// (a crumb with a two-line description), and as wide as the trail, whatever they
// need - what does not fit is folded into the menu at its start.
const StyledFoldingTrail = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  min-width: 0;
`;

/**
 * Whether the crumb holding tabs is squeezed while a crumb before it could fold instead: it clips
 * the tabs it draws, or - at the end of the trail, where it takes the room the other parts leave -
 * it has less room than all its tabs need, so that some are in their "More" menu. That room is what
 * the tabs list itself compares its width with (`getTabsLength`, in `data-tabs-width`), not the
 * width of the tabs it draws now: once some are in "More", it draws narrower, and a trail made
 * wider again would otherwise unfold its crumbs first. When it is the first crumb shown, it is
 * squeezed rather than folded, and its tabs fold into their own menu.
 */
const tabsSqueezed = (part: Element): boolean => {
  if (
    !(part instanceof HTMLElement) ||
    !part.classList.contains('reqore-breadcrumbs-tabs') ||
    part.dataset.position === '0'
  ) {
    return false;
  }

  const list = part.querySelector('.reqore-tabs-list');
  // its layout width, as the tabs list measures it: a transform on an ancestor scales neither
  const room = list ? parseFloat(getComputedStyle(list).width) : NaN;

  return Number(part.dataset.tabsWidth) > room || part.scrollWidth > part.clientWidth + 0.5;
};

/**
 * Whether the trail draws more than it has room for: a part (a crumb, an arrow, the menu) reaches
 * past its end, or the crumb holding tabs is squeezed while a crumb before it could fold instead.
 */
const trailOverflows = (row: HTMLElement | null): boolean => {
  if (!row) {
    return false;
  }

  const end = row.getBoundingClientRect().right;

  return Array.from(row.children).some(
    (part) => part.getBoundingClientRect().right > end + 0.5 || tabsSqueezed(part)
  );
};

/**
 * Whether a part is as wide as the room the other parts leave it in the trail: the crumb holding
 * tabs at its end, the dropdown standing in for the current page. It gets narrower when the trail
 * does, which leaves no more room for anything else.
 */
const fillsTrail = (part: Element): boolean =>
  part.classList.contains('reqore-breadcrumbs-overflow-current') ||
  (part instanceof HTMLElement && part.dataset.fills === 'true');

/**
 * Whether two trails are drawn alike, so the second needs no measuring again: the same crumbs, each with the
 * same values. Handlers are left out (a page that passes new ones on every render still passes the same
 * trail), and an object value (`props`, an `effect`) is compared one level down.
 */
const sameTrail = (one: IReqoreBreadcrumbItem[], other: IReqoreBreadcrumbItem[]): boolean => {
  if (one === other) {
    return true;
  }

  if (one.length !== other.length) {
    return false;
  }

  const sameValue = (a: unknown, b: unknown): boolean => {
    if (a === b || (typeof a === 'function' && typeof b === 'function')) {
      return true;
    }

    if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || React.isValidElement(a)) {
      return false;
    }

    const keys = Object.keys(a);

    return (
      keys.length === Object.keys(b).length &&
      keys.every((key) => (a as Record<string, unknown>)[key] === (b as Record<string, unknown>)[key])
    );
  };

  return one.every((crumb, index) => {
    const keys = Object.keys(crumb);
    const otherCrumb = other[index] as Record<string, unknown>;

    return (
      keys.length === Object.keys(otherCrumb).length &&
      keys.every((key) => sameValue((crumb as Record<string, unknown>)[key], otherCrumb[key]))
    );
  });
};

/** How many crumbs the trail folds, and what it was measured for. */
interface IReqoreTrailFold {
  items: IReqoreBreadcrumbItem[];
  size: TSizes;
  folded: number;
  /** One fewer crumb folded at a time while everything still fits (more room, or a new trail). */
  unfolding: boolean;
}

// At the end of the trail, the crumb holding tabs takes all the room the other parts leave
// (`$fills`): the tabs list measures the room it is given, so a crumb only as wide as the tabs it
// draws would keep the ones it once put in "More" there however wide the trail got again.
const StyledBreadcrumbsTabsWrapper = styled.div<{ $fills?: boolean }>`
  display: flex;
  flex: ${({ $fills }) => ($fills ? '1 1 auto' : '0 1 auto')};
  align-items: center;
  overflow: hidden;
  min-width: 0;
`;

// The overflow dropdowns present the collapsed crumbs as a NAVIGATION MENU, so
// each crumb must render as a clean left-aligned menu row — not as the pill/chip
// it is in the trail. Strip the crumb's trail-only layout treatment (raised /
// active chips, the uppercase/spaced `effect`, the polymorphic `as` + its
// `props`, tab payloads, inline `style`, size overrides) and keep only what a
// menu row needs: icon, label, badge, intent, per-item theme, tooltip and the
// click handler. Without this a label-less crumb (e.g. an icon-only Home) shows
// up as a lone, centered icon and themed crumbs look like stacked pills.
const MENU_OMIT_KEYS = [
  'active',
  'raised',
  'flat',
  'minimal',
  'transparent',
  'effect',
  'as',
  'props',
  'withTabs',
  'style',
  'size',
  'fluid',
  'fixed',
  'menuLabel',
];
const toMenuItems = (crumbs: IReqoreBreadcrumbItem[]): IReqoreDropdownItem[] =>
  crumbs.map((crumb) => {
    const item: Record<string, any> = {};
    Object.keys(crumb).forEach((key) => {
      if (!MENU_OMIT_KEYS.includes(key)) {
        item[key] = (crumb as Record<string, any>)[key];
      }
    });
    // A crumb can carry a menu-only label (an icon-only trail crumb that should
    // still read as a labelled row here); prefer it over the trail `label`.
    if (crumb.menuLabel != null) {
      item.label = crumb.menuLabel;
    }
    return item as IReqoreDropdownItem;
  });

const ReqoreBreadcrumbs: React.FC<IReqoreBreadcrumbsProps> = ({
  items,
  rightElement,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _testWidth,
  customTheme,
  flat,
  size = 'normal',
  responsive = true,
  errorBoundaryOptions,
  ...rest
}: IReqoreBreadcrumbsProps) => {
  const theme = useReqoreTheme('breadcrumbs', customTheme, undefined);
  // What the trail is drawn on: the bar's own colour over what is under it, or that alone.
  const surface = useReqoreSurface();
  const barSurface = theme.breadcrumbs?.main
    ? getDrawnColor(theme.breadcrumbs.main, getThemeSurface(theme, surface))
    : getThemeSurface(theme, surface);
  const itemColor =
    theme.breadcrumbs?.item?.color ||
    (theme.breadcrumbs?.main
      ? getReadableColorFrom(barSurface, true)
      : getReadableColor(theme, undefined, undefined, true, barSurface));

  const leafItem = items[items.length - 1];

  /* The crumbs folded from the start of the trail into its menu: as many as it takes for every part the
     trail draws to lie inside it - the current page too, into one dropdown labelled with it, when even it
     does not fit. It is settled before the browser paints, so no frame ever draws a crumb past the trail
     (qorus#646: when the page changed its crumbs, the trail used to fold one crumb per frame, and a phone
     showed "… › New chat" running 79px past the trail for 50ms). After each render a layout effect
     measures the parts and folds one more crumb while one reaches past the trail (or the crumb holding
     tabs clips them, see `trailOverflows`), or one fewer while everything fits and the trail is
     unfolding; each step is a render React makes before the browser paints.

     What measures the trail again:
     - a new trail (`items`, unless it is drawn alike) or crumb size: from what is folded now, unfolding
       while everything fits;
     - the trail getting wider, or a part narrower: unfolding the same way;
     - the trail getting narrower, or a part wider (a badge arriving, padding animating after the page has
       loaded), so that a part reaches past it: folding.
     The last two come from a ResizeObserver, after the browser's layout and before its paint. It
     renders the new fold there and then (`flushSync`), so that frame is painted folded too. It lets
     go of every part first and takes them up again in the next frame: a size changed inside the
     observer's own callback would be left unreported, which the browser reports as an error. For
     the same reason the trail keeps its height until then: a crumb with a description is taller
     than the others, and the trail's height changed inside the callback would change the size of
     what holds it, which another observer may watch (a panel's, a page layout's).
     A part's width is taken when the trail draws it, not from the observer's first report, which
     can come after it has changed. The trail's own width is taken when it is first drawn and then
     as the observer reports it, so a render that made it wider (a narrower right element, a wider
     `maxWidth`) is reported too, and unfolds what fits. Widths are compared as
     `getBoundingClientRect()` gives them, as `trailOverflows` measures: the box the observer
     reports is not scaled by a transform on an ancestor, so under one every report would differ. */
  const rowRef = useRef<HTMLDivElement>(null);
  /* Whether the folded crumbs' menu is open: said on its button (`aria-expanded`), which a menu button
     announces, as the row actions menu does. A finger opens it with a tap (the dropdown's `opensOnTap`);
     a mouse, by hovering. */
  const [foldMenuOpen, setFoldMenuOpen] = useState(false);
  const [fold, setFold] = useState<IReqoreTrailFold>({ items, size, folded: 0, unfolding: false });
  const folded = Math.min(fold.folded, count(items));
  // as the trail last drew it, for the observer: with every crumb folded, none is left to fold
  const drawnFold = useRef({ folded, total: count(items) });

  if (fold.size !== size || !sameTrail(fold.items, items)) {
    // measured again during this render, so no frame shows the old fold over the new crumbs
    setFold({ items, size, folded, unfolding: folded > 0 });
  }

  // The width all of a crumb's tabs need, by the tabs list's own reckoning (see `tabsSqueezed`).
  const tabsWidths = useMemo(
    () =>
      items.map((item) =>
        item.withTabs
          ? getTabsLength(
              item.withTabs.tabs.filter((tab) => tab.show !== false),
              'width',
              item.withTabs.activeTab,
              size
            )
          : undefined
      ),
    [items, size]
  );

  useLayoutEffect(() => {
    if (!responsive) {
      return;
    }

    if (trailOverflows(rowRef.current)) {
      if (folded < count(items)) {
        setFold((current) => ({ ...current, folded: folded + 1, unfolding: false }));
      } else if (fold.unfolding) {
        setFold((current) => ({ ...current, unfolding: false }));
      }
    } else if (fold.unfolding) {
      setFold((current) =>
        folded > 0 ? { ...current, folded: folded - 1 } : { ...current, unfolding: false }
      );
    }
  });

  // The parts the observer watches, taken up after every render (see above).
  const watchParts = useRef<() => void>();

  useLayoutEffect(() => {
    if (!responsive || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    // what the observer watches, and the width each part was last measured at (see above)
    const watched = new Set<Element>();
    const widths = new Map<Element, number>();
    // the trail's height as the observer last reported it: its layout height, exact, which a
    // transform does not scale
    let rowHeight: number | undefined;
    let pinned: HTMLElement | undefined;
    let suspended = false;
    let frame = 0;

    const observer = new ResizeObserver((entries) => {
      const row = rowRef.current;

      if (!row || suspended) {
        return;
      }

      let unfold = false;

      for (const { target, borderBoxSize, contentRect } of entries) {
        const width = target.getBoundingClientRect().width;
        const was = widths.get(target);

        if (target === row) {
          rowHeight = borderBoxSize?.[0]?.blockSize ?? contentRect.height;
        }

        if (was !== undefined && Math.abs(width - was) >= 0.5) {
          widths.set(target, width);
          // the trail wider, or a part narrower: more may fit
          if (target === row ? width > was : width < was && !fillsTrail(target)) {
            unfold = true;
          }
        }
      }

      const { folded: drawn, total } = drawnFold.current;

      // a part past the end with every crumb folded (a trail narrower than the current page's
      // dropdown, which keeps a few characters of it) cannot be folded away
      if (!unfold && (drawn >= total || !trailOverflows(row))) {
        return;
      }

      observer.disconnect();
      watched.clear();
      suspended = true;
      if (rowHeight !== undefined) {
        pinned = row;
        row.style.height = `${rowHeight}px`;
      }
      try {
        flushSync(() =>
          setFold((current) => ({ ...current, unfolding: unfold || current.unfolding }))
        );
      } finally {
        frame = requestAnimationFrame(() => {
          frame = 0;
          suspended = false;
          pinned?.style.removeProperty('height');
          pinned = undefined;
          watchParts.current?.();
        });
      }
    });

    watchParts.current = () => {
      const row = rowRef.current;

      if (!row || suspended) {
        return;
      }

      const parts = [row, ...Array.from(row.children)];

      for (const element of Array.from(watched)) {
        if (!parts.includes(element)) {
          observer.unobserve(element);
          watched.delete(element);
        }
      }

      for (const element of Array.from(widths.keys())) {
        if (!parts.includes(element)) {
          widths.delete(element);
        }
      }

      for (const element of parts) {
        if (!watched.has(element)) {
          // the border box: a crumb that grows by its padding keeps its content box
          observer.observe(element, { box: 'border-box' });
          watched.add(element);
        }

        if (element !== row || !widths.has(row)) {
          widths.set(element, element.getBoundingClientRect().width);
        }
      }
    };
    watchParts.current();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      pinned?.style.removeProperty('height');
      watchParts.current = undefined;
    };
  }, [responsive]);

  useLayoutEffect(() => {
    drawnFold.current = { folded, total: count(items) };
    watchParts.current?.();
  });

  const renderArrow = (key: string) => (
    <ReqoreIcon
      icon='ArrowRightSLine'
      size={size}
      key={key}
      margin='both'
      color={itemColor}
      effect={{
        // fainter than the crumbs, as far as it stands out from the bar by 3:1
        opacity: getReadableAlpha(itemColor, barSurface, 0.5, READABLE_ICON_CONTRAST),
      }}
    />
  );

  // Draws every VISIBLE crumb (folded ones go to `renderOverflow` instead), by its
  // POSITION among them. The React key is the crumb's place in the WHOLE trail
  // (`folded + index`): a key by its place among the visible crumbs gave a folded
  // crumb's element to the next crumb along, which then animated from that
  // crumb's look to its own - and was measured while it did.
  //
  // The separator precedes every visible crumb except the one at position 0. When
  // ancestors collapse, `renderOverflow` emits the "…" group followed by its own
  // trailing "›", so the first visible crumb (position 0, no leading separator)
  // still connects to it.
  const renderItem = (item: IReqoreBreadcrumbItem, index: number, folded: number) => {
    const key = `crumb-${folded + index}`;

    if (item.withTabs) {
      // only at the end of a folding trail: a crumb after it would be pushed to the trail's end
      const fills = responsive && folded + index === count(items) - 1;

      return (
        <StyledBreadcrumbsTabsWrapper
          key={key}
          className='reqore-breadcrumbs-tabs'
          data-position={index}
          data-fills={fills || undefined}
          data-tabs-width={fills ? tabsWidths[folded + index] : undefined}
          $fills={fills}
        >
          {index !== 0 && renderArrow(`${key}-arrow`)}
          <ReqoreTabsList
            tabs={item.withTabs.tabs}
            onTabChange={item.withTabs.onTabChange}
            activeTab={item.withTabs.activeTab}
            activeTabIntent={item.withTabs.activeTabIntent}
            customTheme={customTheme}
            flat={flat}
            size={size}
          />
        </StyledBreadcrumbsTabsWrapper>
      );
    }

    // Every crumb (including the current page) keeps its natural width and does
    // NOT shrink — a crumb is either shown in full and readable, or it collapses
    // into the overflow dropdown. That is what stops the current page from being
    // squeezed down to an unreadable icon + single letter. When even the current
    // page can't fit, `renderOverflow` folds the whole trail into one dropdown
    // labelled with it (see below), so it's always legible somewhere.
    return (
      <React.Fragment key={key}>
        {index !== 0 && renderArrow(`${key}-arrow`)}
        {/* Pass the RAW breadcrumbs `customTheme` (e.g. `{ main: '#ff69b4' }`),
            not the fully-resolved theme. The crumb is a minimal-flat button that
            derives its readable text + intent shades from `theme.main`; handing
            it the resolved theme (whose `.main` is the base dark colour, not the
            breadcrumbs colour) turned the text white and shifted the pills. */}
        <ReqoreBreadcrumbsItem
          customTheme={customTheme}
          {...item}
          size={size}
        />
      </React.Fragment>
    );
  };

  // The collapsed crumbs, folded into a dropdown at the start of the trail.
  // Two shapes, because crumbs fold from the start:
  //
  //  - Only ancestors collapsed → a compact "…" with a hidden-count badge; the
  //    current page stays inline (in full) to its right.
  //  - The current page ALSO collapsed (there wasn't room for it either) → the
  //    whole trail becomes ONE dropdown LABELLED with the current page (icon +
  //    label, ellipsised to fit), with every crumb in its menu. This is the
  //    "one button that reads as the current page instead of just …" behaviour,
  //    and it guarantees the current page is always legible however tight it gets.
  const renderOverflow = (overflowItems: IReqoreBreadcrumbItem[]) => {
    if (!count(overflowItems)) {
      return null;
    }

    // everything folded: the menu stands in for the current page
    const isFullyCollapsed = count(overflowItems) >= count(items);

    if (isFullyCollapsed) {
      return (
        <ReqoreDropdown
          key='reqore-breadcrumbs-overflow'
          className='reqore-breadcrumbs-overflow-current'
          handler='hoverStay'
          delay={500}
          aria-haspopup='menu'
          aria-expanded={foldMenuOpen}
          onToggleChange={setFoldMenuOpen}
          size={size}
          // This button STANDS IN for the current-page crumb, so it must read as
          // that crumb: adopt the leaf's OWN customTheme + effect (e.g. an
          // uppercase/spaced treatment) + icon + badge, falling back to the
          // breadcrumbs-level customTheme when the leaf carries none. Otherwise a
          // per-item-themed trail (each crumb themed individually, no top-level
          // customTheme) collapses into an unthemed, plain-cased button.
          customTheme={leafItem?.customTheme ?? customTheme}
          effect={leafItem?.effect}
          fluid
          // Look like the current-page CRUMB itself: adopt its chip styling.
          // When the leaf is the active crumb (a solid, highlighted chip) the
          // collapsed button IS that same solid chip; a minimal leaf stays
          // minimal. Mirrors ReqoreBreadcrumbsItem (minimal + flat defaults,
          // overridden by the item's own active/minimal/flat).
          active={leafItem?.active}
          minimal={leafItem?.minimal ?? true}
          flat={leafItem?.flat ?? true}
          raised={leafItem?.raised}
          showCaret={false}
          icon={leafItem?.icon}
          rightIcon='ArrowDownSLine'
          intent={leafItem?.intent}
          label={leafItem?.label}
          badge={leafItem?.badge}
          // ...and is NAMED as that crumb is, in full: its label may be cut with an ellipsis to
          // fit, so a screen reader gets the whole name - the leaf's own, its label, or the label
          // its menu row has (an icon-only leaf, a Home that is just a house). No title of its
          // own: hovering opens the menu, which names every crumb in full, and a browser's tooltip
          // would sit on it (a phone shows none).
          aria-label={leafItem?.['aria-label'] ?? leafItem?.label ?? leafItem?.menuLabel}
          title={leafItem?.title}
          // A floor so the current page always keeps a few readable characters —
          // never just an icon — however tight the bar gets. This can't cause an
          // overlap: the trail is `min-width: 0; overflow: hidden`, so it clips
          // this button before it could ever reach the fixed right element.
          style={{ minWidth: '5em' }}
          items={toMenuItems(overflowItems)}
        />
      );
    }

    // Ancestors only: the compact "…" group, then its OWN trailing "›" so the
    // first still-visible crumb (which renders at position 0 with no leading
    // separator) connects to it as "… › current page".
    return (
      <React.Fragment key='reqore-breadcrumbs-overflow'>
        <ReqoreDropdown
          key='reqore-breadcrumbs-overflow-menu'
          className='reqore-breadcrumbs-overflow-menu'
          handler='hoverStay'
          delay={500}
          aria-haspopup='menu'
          aria-expanded={foldMenuOpen}
          onToggleChange={setFoldMenuOpen}
          size={size}
          customTheme={customTheme}
          showCaret={false}
          badge={count(overflowItems)}
          items={toMenuItems(overflowItems)}
        >
          <ReqoreIcon
            icon='MoreLine'
            color={itemColor}
            effect={{
              // as faint as a control's icon, as far as it stands out from the bar by 3:1
              opacity: getReadableAlpha(itemColor, barSurface, CONTROL_ICON_OPACITY, READABLE_ICON_CONTRAST),
            }}
          />
        </ReqoreDropdown>
        {renderArrow('reqore-breadcrumbs-overflow-arrow')}
      </React.Fragment>
    );
  };

  return (
    <ReqoreErrorBoundary {...errorBoundaryOptions}>
      <StyledReqoreBreadcrumbs
        {...rest}
        className={`${rest.className || ''} reqore-breadcrumbs-wrapper`}
        flat={flat}
        theme={theme}
        size={size}
        responsive={responsive}
      >
        <ReqoreSurfaceProvider color={barSurface}>
          <StyledTrail className='reqore-breadcrumbs-trail' $color={itemColor}>
            {responsive ? (
              // Every crumb may fold, the current page too: when even it does not fit, the trail is the one
              // dropdown labelled with it. Keeping the current page out of the fold is what used to leave it
              // squeezed to an unreadable stub.
              <StyledFoldingTrail ref={rowRef} className='reqore-breadcrumbs-overflow-list'>
                {renderOverflow(items.slice(0, folded))}
                {items.slice(folded).map((item, index) => renderItem(item, index, folded))}
              </StyledFoldingTrail>
            ) : (
              <StyledStaticTrail>{items.map((item, index) => renderItem(item, index, 0))}</StyledStaticTrail>
            )}
          </StyledTrail>
        </ReqoreSurfaceProvider>
        {rightElement && (
          <StyledRight className='reqore-breadcrumbs-right'>{rightElement}</StyledRight>
        )}
      </StyledReqoreBreadcrumbs>
    </ReqoreErrorBoundary>
  );
};

export default ReqoreBreadcrumbs;
