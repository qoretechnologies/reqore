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

  const firstItem = items[0];
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
  // `renderOverflow` instead). The separator precedes every crumb except the
  // very first one still shown — identified by object identity, so a crumb that
  // becomes the first visible after its ancestors collapse still gets a "›"
  // after the "…" group.
  const renderItem = (item: IReqoreBreadcrumbItem) => {
    const key = `crumb-${items.indexOf(item)}`;
    const isFirst = item === firstItem;

    if (item.withTabs) {
      return (
        <StyledBreadcrumbsTabsWrapper key={key}>
          {!isFirst && renderArrow(`${key}-arrow`)}
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
        {!isFirst && renderArrow(`${key}-arrow`)}
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

    const isFullyCollapsed = overflowItems[overflowItems.length - 1] === leafItem;

    if (isFullyCollapsed) {
      return (
        <ReqoreDropdown
          key='reqore-breadcrumbs-overflow'
          className='reqore-breadcrumbs-overflow-current'
          handler='hoverStay'
          delay={500}
          size={size}
          customTheme={customTheme}
          fluid
          minimal
          flat
          showCaret={false}
          icon={leafItem?.icon}
          rightIcon='ArrowDownSLine'
          intent={leafItem?.intent}
          label={leafItem?.label}
          // A floor so the current page always keeps a few readable characters —
          // never just an icon — however tight the bar gets. This can't cause an
          // overlap: the trail is `min-width: 0; overflow: hidden`, so it clips
          // this button before it could ever reach the fixed right element.
          style={{ minWidth: '5em' }}
          items={overflowItems as IReqoreDropdownItem[]}
        />
      );
    }

    return (
      <ReqoreDropdown
        key='reqore-breadcrumbs-overflow'
        handler='hoverStay'
        delay={500}
        size={size}
        customTheme={customTheme}
        showCaret={false}
        badge={count(overflowItems)}
        items={overflowItems as IReqoreDropdownItem[]}
      >
        <ReqoreIcon icon='MoreLine' effect={{ opacity: CONTROL_ICON_OPACITY }} />
      </ReqoreDropdown>
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
