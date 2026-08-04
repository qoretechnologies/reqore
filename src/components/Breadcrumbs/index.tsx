import { size as count, isArray, last } from 'lodash';
import React, { useMemo } from 'react';
import { useMeasure } from 'react-use';
import styled, { css } from 'styled-components';
import { ReqoreDropdown, ReqoreErrorBoundary } from '../..';
import { CONTROL_ICON_OPACITY } from '../../constants/colors';
import { ICON_FROM_SIZE, MARGIN_FROM_SIZE, PADDING_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreBreadcrumbsTheme, IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { changeLightness, getReadableColor, getReadableColorFrom } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreComponent } from '../../types/global';
import { IReqoreButtonProps } from '../Button';
import { IReqoreDropdownItem } from '../Dropdown/list';
import ReqoreIcon from '../Icon';
import { IReqoreTabsListItem } from '../Tabs';
import { StyledTabListItem } from '../Tabs/item';
import ReqoreTabsList, { StyledReqoreTabsList, getLabelLength, getTabsLength } from '../Tabs/list';
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
  // Internal prop, ignore!
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

const StyledReqoreBreadcrumbs = styled.div<IStyledBreadcrumbs>`
  ${({ theme, size, flat, padded = true, margin = 'both', responsive }: IStyledBreadcrumbs) => css`
    width: ${responsive ? '100%' : undefined};
    margin-top: ${margin === 'both' || margin === 'top' ? MARGIN_FROM_SIZE[size!] : 0}px;
    margin-bottom: $ ${margin === 'both' || margin === 'bottom' ? MARGIN_FROM_SIZE[size!] : 0}px;
    display: flex;
    padding: 0 ${padded ? PADDING_FROM_SIZE[size!] : 0}px;
    justify-content: space-between;
    border-bottom: ${flat ? undefined : `1px solid ${changeLightness(theme.main, 0.05)}`};
    background-color: ${({ theme }: { theme: IReqoreTheme }) =>
      theme.breadcrumbs?.main || 'transparent'};

    > div {
      height: 100%;
      display: flex;
      align-items: center;

      > * {
        color: ${theme.breadcrumbs?.item?.color ||
        (theme.breadcrumbs?.main
          ? getReadableColorFrom(theme.breadcrumbs.main, true)
          : getReadableColor(theme, undefined, undefined, true))};
      }

      ${StyledReqoreTabsList} {
        flex: 1;
      }

      ${StyledReqoreTabsList}, ${StyledTabListItem} {
        border-bottom: 0;
      }

      &:first-child {
        overflow: hidden;
        flex: 1;
      }
    }
  `}
`;

const StyledBreadcrumbsTabsWrapper = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
  width: 100%;
`;

const arrowSize = 50;
// Space kept between the collapsing item row and a right-hand element so they
// never touch when the row is reserved its budget.
const RIGHT_ELEMENT_GAP = 16;
// The last crumb never truncates below this, so its icon + a few characters +
// badge always stay legible even in the tightest reserved budget.
const MIN_LEAF_WIDTH = 80;
// Below this the leaf can't show enough of its label to be useful, so instead
// of a one-character stub we fold the WHOLE trail into a single dropdown
// labelled with the current page (ancestors move into its menu).
const MIN_READABLE_LEAF = 150;

const getBreadcrumbsLength = (
  items: (IReqoreBreadcrumbItem | IReqoreBreadcrumbItem[])[],
  size: TSizes
): number =>
  items.reduce((len, item) => {
    if (isArray(item)) {
      return len + 120;
    }

    if (item.withTabs) {
      return (
        len +
        PADDING_FROM_SIZE[size] +
        arrowSize +
        getTabsLength(item.withTabs.tabs, 'width', item.withTabs.activeTab, size)
      );
    }

    return (
      len +
      PADDING_FROM_SIZE[size] * 2 +
      ICON_FROM_SIZE[size] +
      getLabelLength(item, undefined, size)
    );
  }, 0);

const getTransformedItems = (
  items: (IReqoreBreadcrumbItem | IReqoreBreadcrumbItem[])[],
  width: number,
  size: TSizes
): (IReqoreBreadcrumbItem | IReqoreBreadcrumbItem[])[] => {
  if (!width) {
    return items;
  }

  let stop = false;
  let newItems = [...items];

  while (getBreadcrumbsLength(newItems, size) > width && !stop) {
    // Never fold the last (leaf) crumb away — it's the current page. Once only
    // the collapsed group + the leaf remain, stop collapsing; the leaf then
    // truncates with an ellipsis (see the leaf `maxWidth` in the component)
    // instead of disappearing into the "…" group.
    if (newItems.length <= 2) {
      break;
    }

    if (isArray(newItems[0])) {
      newItems[0].push(newItems[1] as IReqoreBreadcrumbItem);
      newItems[1] = undefined!;
    } else {
      const secondItem = newItems[0];
      newItems[0] = [secondItem];
    }

    newItems = newItems.filter((i) => i);

    if (!newItems[1] || (newItems[1] as IReqoreBreadcrumbItem).withTabs) {
      stop = true;
    }
  }

  return newItems;
};

const ReqoreBreadcrumbs: React.FC<IReqoreBreadcrumbsProps> = ({
  items,
  rightElement,
  _testWidth,
  customTheme,
  flat,
  size = 'normal',
  responsive = true,
  errorBoundaryOptions,
  ...rest
}: IReqoreBreadcrumbsProps) => {
  const [ref, { width }] = useMeasure();
  // Measure the right-hand element so the responsive collapse can RESERVE room
  // for it. Without this the items are laid out as if they owned the full bar
  // width, so the last crumb overruns / clips mid-word into the right element
  // (e.g. a page's action rail).
  const [rightRef, { width: rightWidth }] = useMeasure();
  const theme = useReqoreTheme('breadcrumbs', customTheme, undefined);

  const measuredWidth = _testWidth || width;
  // The budget the item row actually gets once the right element (+ a small gap)
  // is reserved — this is what drives how aggressively ancestors collapse.
  const itemsWidth =
    measuredWidth && rightElement
      ? Math.max(0, measuredWidth - rightWidth - RIGHT_ELEMENT_GAP)
      : measuredWidth;

  const transformedItems = useMemo(
    () => (responsive ? getTransformedItems(items, itemsWidth, size) : items),
    [items, itemsWidth, size, responsive]
  );

  // Cap the last (leaf) crumb so a long label truncates with an ellipsis inside
  // the reserved budget instead of clipping into the right element — the leaf is
  // the one item the collapse never folds, so it's the only one that can overrun.
  // Icon + badge stay; only the text ellipsises. Self-adjusting: when there's
  // room the cap is large enough never to bite. Only applied when a right
  // element is actually reserving space.
  const lastIndex = transformedItems.length - 1;
  // Width already taken by everything BEFORE the leaf (the collapsed "…" group
  // and/or any still-shown ancestors). `getBreadcrumbsLength` already estimates
  // those generously (a collapsed group counts as 120px, which covers its
  // trailing arrow too), so we do NOT subtract `arrowSize` again — doing so
  // double-counted the separator and forced the leaf down to its floor width.
  const nonLeafWidth =
    lastIndex > 0 ? getBreadcrumbsLength(transformedItems.slice(0, lastIndex), size) : 0;
  const leafMaxWidth =
    responsive && rightElement && measuredWidth && lastIndex >= 0
      ? Math.max(MIN_LEAF_WIDTH, (itemsWidth || 0) - nonLeafWidth)
      : undefined;

  // When even the reserved budget can't show the current-page (leaf) label
  // readably next to a collapsed "…" group, fold the WHOLE trail into a single
  // dropdown labelled with the current page — its ancestors move into the menu.
  // Keeps the user's location legible instead of degrading to a one-character
  // stub, and reads well beside a wide right-hand action rail.
  const trueLeaf = items.length ? (items[items.length - 1] as IReqoreBreadcrumbItem) : undefined;
  const collapseAllToLeaf =
    responsive &&
    !!rightElement &&
    !!measuredWidth &&
    lastIndex >= 1 &&
    !isArray(transformedItems[lastIndex]) &&
    !(transformedItems[lastIndex] as IReqoreBreadcrumbItem)?.withTabs &&
    leafMaxWidth != null &&
    leafMaxWidth < MIN_READABLE_LEAF;

  const displayItems: (IReqoreBreadcrumbItem | IReqoreBreadcrumbItem[])[] = collapseAllToLeaf
    ? [transformedItems.flatMap((entry) => (isArray(entry) ? entry : [entry]))]
    : transformedItems;

  // The label cap for that single collapsed current-page dropdown: the whole
  // reserved budget minus room for its icon + caret + hidden-count badge.
  const collapsedLeafMaxWidth = Math.max(MIN_LEAF_WIDTH, (itemsWidth || 0) - 72);

  const renderItem = (
    itemOrItems: IReqoreBreadcrumbItem | IReqoreBreadcrumbItem[],
    index: number
  ) => {
    if (isArray(itemOrItems) && count(itemOrItems) > 1) {
      const groupLeaf = last(itemOrItems);
      // Full-trail collapse: this group ends with the real current page, so the
      // dropdown reads as "<current page> ⌄" (label + caret) with the ancestors
      // in its menu and a small badge for how many are hidden — rather than a
      // bare "…" that hides where the user is.
      const isCurrentPageCollapse = collapseAllToLeaf && groupLeaf === trueLeaf;
      if (isCurrentPageCollapse) {
        // Single "current page" dropdown: the leaf's icon + label (truncating
        // with an ellipsis via `buttonStyle` — `maxWidth` on the dropdown sizes
        // the MENU, not the trigger), a badge for how many ancestors are hidden,
        // and the whole trail in its menu. `caretPosition='left'` + no caret
        // keeps `icon` as the trigger's left content icon rather than a chevron.
        return (
          <React.Fragment key={index}>
            <ReqoreDropdown
              key={`dropdown-${index}`}
              icon={groupLeaf?.icon}
              leftIconProps={groupLeaf?.leftIconProps}
              caretPosition='left'
              showCaret={false}
              label={groupLeaf?.label}
              buttonStyle={{ maxWidth: `${collapsedLeafMaxWidth}px`, minWidth: 0 }}
              handler='hoverStay'
              delay={500}
              size={size}
              badge={[count(itemOrItems) - 1]}
              items={itemOrItems as IReqoreDropdownItem[]}
            />
          </React.Fragment>
        );
      }
      return (
        <React.Fragment key={index}>
          <ReqoreDropdown
            key={`dropdown-${index}`}
            icon={last(itemOrItems)?.icon}
            leftIconProps={last(itemOrItems)?.leftIconProps}
            handler='hoverStay'
            delay={500}
            size={size}
            badge={count(itemOrItems)}
            items={itemOrItems as IReqoreDropdownItem[]}
          >
            <ReqoreIcon
              icon='MoreLine'
              effect={{
                opacity: CONTROL_ICON_OPACITY,
              }}
            />
          </ReqoreDropdown>
        </React.Fragment>
      );
    }

    const item: IReqoreBreadcrumbItem = (
      isArray(itemOrItems) && count(itemOrItems) === 1
        ? {
            ...itemOrItems[0],
            label: <ReqoreIcon icon='MoreLine' />,
          }
        : itemOrItems
    ) as IReqoreBreadcrumbItem;

    if (item.withTabs) {
      return (
        <StyledBreadcrumbsTabsWrapper key={index}>
          <ReqoreIcon
            icon='ArrowRightSLine'
            size={size}
            key={'icon' + index}
            margin='both'
            effect={{ opacity: 0.5 }}
          />
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
      <React.Fragment key={index}>
        {index !== 0 && (
          <ReqoreIcon
            icon='ArrowRightSLine'
            size={size}
            key={'icon' + index}
            margin='both'
            effect={{ opacity: 0.5 }}
          />
        )}
        <ReqoreBreadcrumbsItem
          customTheme={customTheme}
          {...item}
          {...(index === lastIndex && leafMaxWidth != null
            ? { maxWidth: `${leafMaxWidth}px` }
            : {})}
          key={index}
          size={size}
        />
      </React.Fragment>
    );
  };

  return (
    <ReqoreErrorBoundary {...errorBoundaryOptions}>
      <StyledReqoreBreadcrumbs
        {...rest}
        className={`${rest.className || ''} reqore-breadcrumbs-wrapper`}
        ref={ref}
        flat={flat}
        theme={theme}
        size={size}
        responsive={responsive}
      >
        <div key='reqore-breadcrumbs-left-wrapper'>
          {displayItems.map(
            (item: IReqoreBreadcrumbItem | IReqoreBreadcrumbItem[], index: number) =>
              renderItem(item, index)
          )}
        </div>
        {rightElement && <div ref={rightRef}>{rightElement}</div>}
      </StyledReqoreBreadcrumbs>
    </ReqoreErrorBoundary>
  );
};

export default ReqoreBreadcrumbs;
