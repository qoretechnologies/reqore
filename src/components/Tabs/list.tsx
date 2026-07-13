import { isArray, isObject } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { useMeasure } from 'react-use';
import styled, { css } from 'styled-components';
import { IReqoreTabsListItem, IReqoreTabsProps } from '.';
import { ReqorePopover } from '../..';
import {
  CONTROL_TEXT_FROM_SIZE,
  GAP_FROM_SIZE,
  ICON_FROM_SIZE,
  PADDING_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreBreadcrumbsTheme, IReqoreCustomTheme, IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import {
  changeLightness,
  getColorFromMaybeString,
  getNthGradientColor,
} from '../../helpers/colors';
import { calculateStringSizeInPixels, getOneLessSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreBreadcrumbItem } from '../Breadcrumbs';
import { IReqoreButtonProps } from '../Button';
import { getPrimaryGradient, TReqoreHexColor } from '../Effect';
import ReqoreMenu from '../Menu';
import ReqoreMenuItem, { IReqoreMenuItemProps } from '../Menu/item';
import { StyledPopover } from '../Popover';
import { IReqoreTagProps } from '../Tag';
import ReqoreTabsListItem, { IReqoreTabListItemProps, StyledTabListItem } from './item';

export interface IReqoreTabsListProps
  extends IReqoreTabsProps,
    React.HTMLAttributes<HTMLDivElement> {
  onTabChange?: (tabId: string | number) => any;
  children?: any;
  customTheme?: IReqoreCustomTheme | IReqoreBreadcrumbsTheme;
}

export interface IReqoreTabsListStyle extends Omit<IReqoreTabsListProps, 'tabs'> {
  theme: IReqoreTheme;
}

export const StyledReqoreTabsList = styled.div<IReqoreTabsListStyle>`
  ${({ fill, vertical, size, padded, flat, currentTabColor, width }) => css`
    height: ${vertical ? '100%' : undefined};
    width: ${vertical ? width || '200px' : '100%'};
    flex-flow: ${vertical ? 'column' : 'row'};
    display: flex;
    align-items: center;

    gap: ${GAP_FROM_SIZE[size]}px;

    ${padded &&
    css`
      padding: 0 ${PADDING_FROM_SIZE[size]}px;
    `}

    ${!flat &&
    css`
    border-${vertical ? 'right' : 'bottom'}: 1px solid ${changeLightness(currentTabColor, 0.175)};
    `}


    ${fill &&
    css`
      justify-content: space-around;
    `}

    ${StyledPopover} {
      > ${StyledTabListItem} {
        height: 100%;
      }
    }
  `}
`;

/** Absolute ceiling so the overflow menu stays compact even on a tall monitor. */
const TABS_OVERFLOW_MENU_MAX_HEIGHT_PX = 520;
/**
 * Vertical space reserved above + below the menu so it never runs to the very
 * edges of the viewport — roughly a top bar + the tab strip + a small gap (for
 * scale, a `normal` tab is 40px and `big` 50px, see `TABS_SIZE_TO_PX`).
 *
 * NOTE: this is a heuristic, and the cap is viewport-relative, not
 * trigger-relative. Popper flips the popover's placement when there's no room,
 * but the height does not shrink to the exact space around the "More" button —
 * so a tab strip nested very low in a tall, scrolling page can still want a
 * taller menu than fits. Those cases should override via
 * `overflowMenuProps={{ maxHeight }}` (a fully dynamic cap would need a Popper
 * size modifier, which this component does not use).
 */
const TABS_OVERFLOW_MENU_VIEWPORT_MARGIN_PX = 96;

/**
 * Viewport-safe default height cap for the overflow `More` menu. Without it a
 * tab strip with many overflowed tabs renders a menu taller than the viewport,
 * pushing its lower items off-screen with no way to reach them. `min(...)`
 * keeps short menus compact while never exceeding the available height.
 */
export const DEFAULT_TABS_OVERFLOW_MENU_MAX_HEIGHT = `min(${TABS_OVERFLOW_MENU_MAX_HEIGHT_PX}px, calc(100vh - ${TABS_OVERFLOW_MENU_VIEWPORT_MARGIN_PX}px))`;

const isTabHidden = (items: IReqoreTabsListItem[], activeTab?: string | number) =>
  items.find((item) => item?.id === activeTab);

const getMoreLabel = (items: IReqoreTabsListItem[], activeTab?: string | number) => {
  if (isTabHidden(items, activeTab)) {
    return isTabHidden(items, activeTab)?.label;
  }

  return 'More';
};

const getBadgeLength = (badge: IReqoreButtonProps['badge'], tabsSize: TSizes = 'normal') => {
  if (!badge) {
    return 0;
  }

  if (isArray(badge)) {
    return badge.reduce((len, b) => len + getBadgeLength(b), 0);
  }

  if (isObject(badge)) {
    return getLabelLength(badge, undefined, getOneLessSize(tabsSize)) + PADDING_FROM_SIZE[tabsSize];
  }

  return (
    calculateStringSizeInPixels(
      badge.toString(),
      CONTROL_TEXT_FROM_SIZE[getOneLessSize(tabsSize)]
    ) + PADDING_FROM_SIZE[tabsSize]
  );
};

export const getLabelLength = (
  item: IReqoreBreadcrumbItem | IReqoreTabsListItem | IReqoreTabsListItem[] | IReqoreTagProps,
  activeTab?: string | number,
  tabsSize: TSizes = 'normal'
) => {
  if (!item) {
    return 0;
  }

  const label: string | number = isArray(item) ? getMoreLabel(item, activeTab) : item.label;
  const icon: number =
    isArray(item) || item.icon ? ICON_FROM_SIZE[tabsSize] + PADDING_FROM_SIZE[tabsSize] : 0;
  const rightIcon = (item as IReqoreTagProps).rightIcon
    ? ICON_FROM_SIZE[tabsSize] + PADDING_FROM_SIZE[tabsSize]
    : 0;
  const closeIconSize =
    isArray(item) ||
    !(item as IReqoreTabsListItem).onCloseClick ||
    !(item as IReqoreTagProps).onRemoveClick
      ? 0
      : ICON_FROM_SIZE[tabsSize] * 2;
  const badgeLength = isArray(item)
    ? 0
    : getBadgeLength((item as IReqoreTabsListItem).badge, tabsSize);
  const descriptionLength = isArray(item)
    ? 0
    : calculateStringSizeInPixels(
        (item as IReqoreBreadcrumbItem | IReqoreTabsListItem)?.description?.toString(),
        CONTROL_TEXT_FROM_SIZE[getOneLessSize(tabsSize)]
      );

  const topLabelLength =
    calculateStringSizeInPixels(
      label?.toString(),
      CONTROL_TEXT_FROM_SIZE[tabsSize],
      (item as IReqoreBreadcrumbItem).effect?.spaced
    ) +
    icon +
    rightIcon +
    closeIconSize +
    badgeLength;

  const maxWidth = isArray(item)
    ? 0
    : (item as IReqoreButtonProps)?.maxWidth
    ? parseInt((item as IReqoreButtonProps).maxWidth, 10)
    : 0;

  return maxWidth || Math.max(topLabelLength, descriptionLength);
};

/**
 * This function returns the total width or height of the tabs.
 * @param items the items that will be rendered in the tabs
 * @param type the type of calculation, either width or height
 * @param activeTab the currently active tab
 * @param tabsSize the size of the tabs
 * @returns the total width or height of the tabs
 */
export const getTabsLength = (
  items: (IReqoreTabsListItem | IReqoreTabsListItem[])[],
  type: 'width' | 'height' = 'width',
  activeTab?: string | number,
  tabsSize?: TSizes
): number =>
  items.reduce((len, item) => {
    if (type === 'height') {
      const rows = getLabelLength(item, activeTab, tabsSize) / 4 || 1;

      return len + rows * 15 + 10;
    }

    const labelLength: number =
      PADDING_FROM_SIZE[tabsSize] +
      GAP_FROM_SIZE[tabsSize] +
      getLabelLength(item, activeTab, tabsSize);

    return len + labelLength;
  }, 0);

const getTransformedItems = (
  items: (IReqoreTabsListItem | IReqoreTabsListItem[])[],
  size: number,
  type: 'width' | 'height' = 'width',
  activeTab?: string | number,
  tabsSize?: TSizes
): (IReqoreTabsListItem | IReqoreTabsListItem[])[] => {
  if (!size) {
    return items;
  }
  let newItems = [...items];

  while (getTabsLength(newItems, type, activeTab, tabsSize) > size && newItems.length > 1) {
    if (isArray(newItems[newItems.length - 1])) {
      (newItems[newItems.length - 1] as IReqoreTabsListItem[]).unshift(
        newItems[newItems.length - 2] as IReqoreTabsListItem
      );
      newItems[newItems.length - 2] = undefined!;
    } else {
      const lastItem = newItems[newItems.length - 1];
      (newItems[newItems.length - 1] as IReqoreTabsListItem[]) = [
        lastItem,
      ] as IReqoreTabsListItem[];
    }

    newItems = newItems.filter((i) => i);
  }

  return newItems.filter((i) => i);
};

type TReqoreTabListItemRendererProps = Pick<
  IReqoreTabListItemProps,
  | 'customTheme'
  | 'fill'
  | 'size'
  | 'flat'
  | 'padded'
  | 'activeIntent'
  | 'wrapTabNames'
  | 'loadingIconType'
  | 'useReactTransition'
  | 'vertical'
> & {
  item: IReqoreTabsListItem;
  active: IReqoreTabListItemProps['active'];
  onTabChange?: (tabId: string | number) => any;
};

/**
 * Renders a single (non-overflow) tab. Its click / close handlers are memoised
 * with `useCallback` so they keep a stable identity across renders — passing an
 * inline arrow straight to the memoised `ReqoreTabsListItem` would allocate a
 * new function every render and defeat its memoisation. Hooks can't run inside
 * the `.map()` in the list, hence a dedicated component per row.
 */
const ReqoreTabListItemRenderer = ({
  item,
  active,
  onTabChange,
  // Pulled out of `itemProps` so it can be applied AFTER `{...item}` below —
  // the tab-strip orientation is owned by the parent and must win over any
  // stray `vertical` on the item, matching the pre-refactor prop order.
  vertical,
  ...itemProps
}: TReqoreTabListItemRendererProps) => {
  const handleClick = useCallback(
    (event: React.MouseEvent<any>) => {
      if (!item.disabled) {
        onTabChange?.(item.id);

        if (item.props?.onClick) {
          item.props.onClick(event);
        }
      }
    },
    [item, onTabChange]
  );

  const handleCloseClick = useCallback(() => {
    item.onCloseClick?.(item.id);
  }, [item]);

  return (
    <ReqoreTabsListItem
      {...itemProps}
      {...item}
      vertical={vertical}
      active={active}
      onClick={handleClick}
      onCloseClick={item.onCloseClick ? handleCloseClick : undefined}
    />
  );
};

const ReqoreTabsList = ({
  tabs,
  onTabChange,
  activeTab,
  _testWidth,
  fill,
  vertical,
  activeTabIntent,
  customTheme,
  wrapTabNames,
  flat,
  size,
  intent,
  padded,
  loadingIconType,
  useReactTransition,
  overflowMenuProps,
  overflowPopoverProps,
  ...rest
}: IReqoreTabsListProps) => {
  const [ref, { width }] = useMeasure();
  const theme = useReqoreTheme('main', customTheme, intent);
  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const currentTabColor: TReqoreHexColor =
    activeTabIntent || activeTabData?.intent
      ? theme.intents[activeTabIntent || activeTabData.intent]
      : getNthGradientColor(theme, getPrimaryGradient(activeTabData?.effect?.gradient)?.colors) ||
        getColorFromMaybeString(theme, activeTabData?.customTheme?.main || theme.main);

  const filteredItems = tabs.filter((item) => item.show !== false);
  const transformedItems = useMemo(
    () =>
      vertical
        ? filteredItems
        : getTransformedItems(filteredItems, _testWidth || width, 'width', activeTab, size),
    [filteredItems, _testWidth, width, vertical, activeTab, size]
  );

  return (
    <ReqoreThemeProvider theme={theme} customTheme={customTheme}>
      <StyledReqoreTabsList
        {...rest}
        size={size}
        fill={fill}
        vertical={vertical}
        className={`${rest.className || ''} reqore-tabs-list`}
        ref={ref}
        flat={flat}
        theme={theme}
        currentTabColor={currentTabColor}
      >
        {transformedItems.map((item: IReqoreTabsListItem | IReqoreTabsListItem[], index: number) =>
          isArray(item) ? (
            <React.Fragment key={index}>
              <ReqorePopover
                key={index}
                component={ReqoreTabsListItem}
                componentProps={
                  {
                    icon: 'ArrowDownSLine',
                    id: 'showMore',
                    label: getMoreLabel(item, activeTab),
                    active: !!isTabHidden(item, activeTab),
                    activeIntent: activeTabIntent,
                    intent: !!isTabHidden(item, activeTab) ? activeTabData?.intent : undefined,
                    effect: !!isTabHidden(item, activeTab) ? activeTabData?.effect : undefined,
                    customTheme: !!isTabHidden(item, activeTab)
                      ? activeTabData?.customTheme
                      : theme,
                    vertical,
                    flat,
                    size,
                    padded,
                    className: 'reqore-tabs-list-item-menu',
                  } as IReqoreTabListItemProps
                }
                closeOnOutsideClick
                isReqoreComponent
                noWrapper
                handler='hoverStay'
                {...overflowPopoverProps}
                content={
                  <ReqoreMenu
                    customTheme={theme}
                    maxHeight={DEFAULT_TABS_OVERFLOW_MENU_MAX_HEIGHT}
                    {...overflowMenuProps}
                  >
                    {item.map(
                      ({
                        icon,
                        label,
                        as,
                        tooltip,
                        props,
                        disabled,
                        id,
                        onCloseClick,
                        intent,
                        activeIntent,
                        closeIcon,
                        ...rest
                      }) => (
                        <ReqoreMenuItem
                          {...({
                            ...props,
                            icon,
                            as,
                            intent: activeTab === id ? activeIntent || intent : intent,
                            disabled,
                            rightAction: onCloseClick
                              ? {
                                  disabled,
                                  icon: closeIcon || 'CloseLine',
                                  onClick: (_itemId, _event, closePopover) => {
                                    onCloseClick(id);
                                    closePopover?.();
                                  },
                                }
                              : undefined,
                            selected: activeTab === id,
                            onClick: (event: React.MouseEvent<any>, _itemId, closePopover) => {
                              if (!disabled) {
                                onTabChange?.(id);
                                closePopover?.();

                                if (props?.onClick) {
                                  props.onClick(event);
                                }
                              }
                            },
                          } as IReqoreMenuItemProps)}
                          tooltip={tooltip}
                          {...rest}
                          key={index + label?.toString()}
                        >
                          {label}
                        </ReqoreMenuItem>
                      )
                    )}
                  </ReqoreMenu>
                }
              />
            </React.Fragment>
          ) : (
            <React.Fragment key={index}>
              <ReqoreTabListItemRenderer
                item={item}
                active={activeTab === item.id || item.props?.active}
                onTabChange={onTabChange}
                customTheme={theme}
                fill={fill}
                size={size}
                flat={flat}
                padded={padded}
                activeIntent={activeTabIntent}
                wrapTabNames={wrapTabNames}
                loadingIconType={loadingIconType}
                useReactTransition={useReactTransition}
                vertical={vertical}
              />
            </React.Fragment>
          )
        )}
      </StyledReqoreTabsList>
    </ReqoreThemeProvider>
  );
};

export default ReqoreTabsList;
