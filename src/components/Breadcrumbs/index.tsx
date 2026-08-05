import { size as count } from 'lodash';
import React from 'react';
import { OverflowList } from 'react-overflow-list';
import styled, { css } from 'styled-components';
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
  // measured live via `OverflowList`, so this no longer drives the collapse.)
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
// `OverflowList` row, or the static row) fills it so `OverflowList` measures the
// AVAILABLE width, not its own content.
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

  /* The OverflowList container sets only display/flexWrap/minWidth inline (no
     align-items), so without this its crumbs top-align against the tallest one
     — e.g. a crumb carrying a two-line description. Center them so the row
     reads as a single baseline, matching the static trail. */
  .reqore-breadcrumbs-overflow-list {
    align-items: center;
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
];
const toMenuItems = (crumbs: IReqoreBreadcrumbItem[]): IReqoreDropdownItem[] =>
  crumbs.map((crumb) => {
    const item: Record<string, any> = {};
    Object.keys(crumb).forEach((key) => {
      if (!MENU_OMIT_KEYS.includes(key)) {
        item[key] = (crumb as Record<string, any>)[key];
      }
    });
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

  const renderArrow = (key: string) => (
    <ReqoreIcon
      icon='ArrowRightSLine'
      size={size}
      key={key}
      margin='both'
      effect={{ opacity: 0.5 }}
    />
  );

  // `OverflowList` calls this for every VISIBLE crumb (collapsed ancestors go to
  // `renderOverflow` instead), passing the crumb's POSITION. Both the React key
  // and the separator are derived from that position — NOT from the item's
  // identity or `items.indexOf(item)`. This matters because on a re-render with a
  // new `items` array, OverflowList briefly maps over its previous (stale) item
  // objects; `indexOf` would return -1 for them, collapsing every crumb onto the
  // same key `crumb--1` and making React accumulate DOM (a new crumb appended on
  // every render). A positional key is always valid and unique.
  //
  // The separator precedes every visible crumb except the one at position 0. When
  // ancestors collapse, `renderOverflow` emits the "…" group followed by its own
  // trailing "›", so the first visible crumb (position 0, no leading separator)
  // still connects to it.
  const renderItem = (item: IReqoreBreadcrumbItem, index: number) => {
    const key = `crumb-${index}`;

    if (item.withTabs) {
      return (
        <StyledBreadcrumbsTabsWrapper key={key}>
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
        <ReqoreBreadcrumbsItem customTheme={customTheme} {...item} size={size} />
      </React.Fragment>
    );
  };

  // The collapsed crumbs, folded into a dropdown at the start of the trail.
  // Two shapes, because collapse happens from the start (`collapseFrom:'start'`):
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

    // Count-based, not identity-based: everything collapsed ⇒ the overflow holds
    // as many crumbs as the trail has. (Identity would break when OverflowList
    // maps over stale item objects during a re-render.)
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
            <OverflowList
              className='reqore-breadcrumbs-overflow-list'
              items={items}
              collapseFrom='start'
              // 0, not 1: when even the current page can't fit, it must be
              // allowed to collapse too so `renderOverflow` can fold the trail
              // into the single current-page-labelled dropdown. Keeping 1 here is
              // what forced the leaf to stay and shrink to an unreadable stub.
              minVisibleItems={0}
              itemRenderer={renderItem}
              overflowRenderer={renderOverflow}
            />
          ) : (
            <StyledStaticTrail>{items.map(renderItem)}</StyledStaticTrail>
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
