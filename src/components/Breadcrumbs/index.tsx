import { size as count } from 'lodash';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { css } from 'styled-components';
import styled from '../../helpers/styled';
import { ReqoreDropdown, ReqoreErrorBoundary } from '../..';
import { CONTROL_ICON_OPACITY } from '../../constants/colors';
import { MARGIN_FROM_SIZE, PADDING_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreBreadcrumbsTheme, IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { changeLightness, getReadableColor, getReadableColorFrom } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreComponent } from '../../types/global';
import { IReqoreButtonProps } from '../Button';
import { IReqoreDropdownItem } from '../Dropdown/list';
import ReqoreIcon from '../Icon';
import { IReqoreTabsListItem } from '../Tabs';
import { StyledTabListItem } from '../Tabs/item';
import ReqoreTabsList, { StyledReqoreTabsList } from '../Tabs/list';
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

  /* Force the readable item colour onto the crumbs + collapsed dropdowns, as the
     original did with a descendant selector. A minimal/flat button sets its OWN
     text colour directly on the element — for a chromatic custom theme that
     resolves to a near-white tint (saturate(tint(0.8, main))) — which beats the
     trail's merely-inherited colour. Overriding it here keeps the labels legible
     (readable-dark on a light themed bar) instead of washing out to white. */
  .reqore-breadcrumbs-item,
  .reqore-dropdown-control {
    color: ${({ $color }) => $color};
  }
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
 * Whether the trail draws more than it has room for: a part (a crumb, an arrow, the menu) reaches past its end,
 * or the crumb holding tabs is squeezed so that it clips them while a crumb before it could fold instead. When
 * it is the first crumb shown, it is squeezed rather than folded, and its tabs fold into their own menu.
 */
const trailOverflows = (row: HTMLElement | null): boolean => {
  if (!row) {
    return false;
  }

  const end = row.getBoundingClientRect().right;

  return Array.from(row.children).some(
    (part) =>
      part.getBoundingClientRect().right > end + 0.5 ||
      (part instanceof HTMLElement &&
        part.classList.contains('reqore-breadcrumbs-tabs') &&
        part.dataset.position !== '0' &&
        part.scrollWidth > part.clientWidth + 0.5)
  );
};

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

const StyledBreadcrumbsTabsWrapper = styled.div`
  display: flex;
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
  const itemColor =
    theme.breadcrumbs?.item?.color ||
    (theme.breadcrumbs?.main
      ? getReadableColorFrom(theme.breadcrumbs.main, true)
      : getReadableColor(theme, undefined, undefined, true));

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
     The last two come from a ResizeObserver, after the browser's layout and before its paint. It renders
     the new fold there and then (`flushSync`), so that frame is painted folded too. It lets go of every
     part first and takes them up again in the next frame: a size changed inside the observer's own
     callback would be left unreported, which the browser reports as an error. A part's width is taken
     when the trail draws it, not from the observer's first report, which can come after it has changed. */
  const rowRef = useRef<HTMLDivElement>(null);
  const [fold, setFold] = useState<IReqoreTrailFold>({ items, size, folded: 0, unfolding: false });
  const folded = Math.min(fold.folded, count(items));

  if (fold.size !== size || !sameTrail(fold.items, items)) {
    // measured again during this render, so no frame shows the old fold over the new crumbs
    setFold({ items, size, folded, unfolding: folded > 0 });
  }

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

    const widths = new Map<Element, number>();
    let suspended = false;
    let frame = 0;

    const observer = new ResizeObserver((entries) => {
      const row = rowRef.current;

      if (!row || suspended) {
        return;
      }

      let unfold = false;

      for (const entry of entries) {
        const width = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
        const was = widths.get(entry.target);

        if (was !== undefined && Math.abs(width - was) >= 0.5) {
          widths.set(entry.target, width);
          // the trail wider, or a part narrower: more may fit
          if (entry.target === row ? width > was : width < was) {
            unfold = true;
          }
        }
      }

      if (!unfold && !trailOverflows(row)) {
        return;
      }

      observer.disconnect();
      widths.clear();
      suspended = true;
      try {
        flushSync(() => setFold((current) => ({ ...current, unfolding: unfold || current.unfolding })));
      } finally {
        frame = requestAnimationFrame(() => {
          frame = 0;
          suspended = false;
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

      for (const element of Array.from(widths.keys())) {
        if (!parts.includes(element)) {
          observer.unobserve(element);
          widths.delete(element);
        }
      }

      for (const element of parts) {
        if (!widths.has(element)) {
          // the border box: a crumb that grows by its padding keeps its content box
          observer.observe(element, { box: 'border-box' });
        }

        widths.set(element, element.getBoundingClientRect().width);
      }
    };
    watchParts.current();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      watchParts.current = undefined;
    };
  }, [responsive]);

  useLayoutEffect(() => {
    watchParts.current?.();
  });

  const renderArrow = (key: string) => (
    <ReqoreIcon
      icon='ArrowRightSLine'
      size={size}
      key={key}
      margin='both'
      effect={{ opacity: 0.5 }}
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
      return (
        <StyledBreadcrumbsTabsWrapper key={key} className='reqore-breadcrumbs-tabs' data-position={index}>
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
          // ...and is NAMED as that crumb is, in full: its label may be cut with an ellipsis to fit, so a
          // screen reader and a long press get the whole name from these - the leaf's own, or its label
          aria-label={leafItem?.['aria-label'] ?? leafItem?.label}
          title={leafItem?.title ?? leafItem?.label}
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
          handler='hoverStay'
          delay={500}
          size={size}
          customTheme={customTheme}
          showCaret={false}
          badge={count(overflowItems)}
          items={toMenuItems(overflowItems)}
        >
          <ReqoreIcon icon='MoreLine' effect={{ opacity: CONTROL_ICON_OPACITY }} />
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
        {rightElement && (
          <StyledRight className='reqore-breadcrumbs-right'>{rightElement}</StyledRight>
        )}
      </StyledReqoreBreadcrumbs>
    </ReqoreErrorBoundary>
  );
};

export default ReqoreBreadcrumbs;
