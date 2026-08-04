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
    const isLast = item === leafItem;

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

    return (
      <React.Fragment key={key}>
        {!isFirst && renderArrow(`${key}-arrow`)}
        <ReqoreBreadcrumbsItem
          customTheme={theme}
          {...item}
          size={size}
          // The current page (last crumb) shrinks + ellipsises so it never
          // overruns the trail; ancestors collapse into the "…" menu instead.
          // A small `min-width` floor keeps its icon + an ellipsis legible even
          // in the tightest budget (the trail clips the overflow — it still
          // can't reach the fixed right element), so the current page never
          // vanishes entirely.
          style={isLast ? { minWidth: '2.75em', flexShrink: 1, ...(item.style || {}) } : item.style}
        />
      </React.Fragment>
    );
  };

  // The collapsed ancestors, folded into a single "…" dropdown at the start of
  // the trail. Its menu is the ancestor crumbs (newest last), with a badge for
  // how many are hidden.
  const renderOverflow = (overflowItems: IReqoreBreadcrumbItem[]) =>
    count(overflowItems) ? (
      <ReqoreDropdown
        key='reqore-breadcrumbs-overflow'
        handler='hoverStay'
        delay={500}
        size={size}
        showCaret={false}
        badge={count(overflowItems)}
        items={overflowItems as IReqoreDropdownItem[]}
      >
        <ReqoreIcon icon='MoreLine' effect={{ opacity: CONTROL_ICON_OPACITY }} />
      </ReqoreDropdown>
    ) : null;

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
              minVisibleItems={1}
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
