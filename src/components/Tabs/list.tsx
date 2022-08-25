import { isArray } from 'lodash';
import React from 'react';
import { useMeasure } from 'react-use';
import styled, { css } from 'styled-components';
import { IReqoreTabsListItem, IReqoreTabsProps } from '.';
import { ReqorePopover } from '../..';
import { TABS_SIZE_TO_PX, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreBreadcrumbsTheme, IReqoreCustomTheme, IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { calculateStringSizeInPixels } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import ReqoreMenu from '../Menu';
import ReqoreMenuItem, { IReqoreMenuItemProps } from '../Menu/item';
import { StyledPopover } from '../Popover';
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
  ${({ theme, fill, vertical, size, width }) => css`
    height: ${vertical ? '100%' : `${TABS_SIZE_TO_PX[size]}px`};
    width: ${vertical ? width || '200px' : '100%'};
    flex-flow: ${vertical ? 'column' : 'row'};
    display: flex;
    align-items: center;
    border-${vertical ? 'right' : 'bottom'}: 1px solid ${changeLightness(theme.main, 0.05)};

    ${
      fill &&
      css`
        justify-content: space-around;
      `
    }

    ${StyledPopover} {
      min-height: ${TABS_SIZE_TO_PX[size]}px;

      > ${StyledTabListItem} {
        height: 100%;
      }
    }

    > *,
    ${StyledPopover} > * {
      color: ${getReadableColor(theme, undefined, undefined, true)};
      ${vertical ? 'width' : 'height'}: 100%;
      ${
        vertical
          ? css`
              height: ${fill ? '100%' : 'auto'};
            `
          : css`
              white-space: nowrap;
            `
      };

      justify-content: ${vertical ? 'flex-start' : 'space-evenly'};


      ${
        fill &&
        !vertical &&
        css`
          width: 100%;
          justify-content: center;
        `
      }
    }
  `}
`;

const isTabHidden = (items: IReqoreTabsListItem[], activeTab?: string | number) =>
  items.find((item) => item?.id === activeTab);

const getMoreLabel = (items: IReqoreTabsListItem[], activeTab?: string | number) => {
  if (isTabHidden(items, activeTab)) {
    return isTabHidden(items, activeTab)?.label;
  }

  return 'More';
};

const getLabel = (
  item: IReqoreTabsListItem | IReqoreTabsListItem[],
  activeTab?: string | number,
  tabsSize: TSizes = 'normal'
) => {
  if (!item) {
    return 0;
  }

  const label: string = isArray(item) ? getMoreLabel(item, activeTab) : item.label;
  const icon: number = isArray(item) || item.icon ? TEXT_FROM_SIZE[tabsSize] : 0;

  return calculateStringSizeInPixels(label, TEXT_FROM_SIZE[tabsSize]) + icon;
};

export const getTabsLength = (
  items: (IReqoreTabsListItem | IReqoreTabsListItem[])[],
  type: 'width' | 'height' = 'width',
  activeTab?: string | number,
  tabsSize?: TSizes
): number =>
  items.reduce((len, item) => {
    if (type === 'height') {
      const rows = getLabel(item, activeTab, tabsSize) / 4 || 1;

      return len + rows * 15 + 10;
    }

    return len + 26 + getLabel(item, activeTab, tabsSize);
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
  ...rest
}: IReqoreTabsListProps) => {
  const [ref, { width, height }] = useMeasure();
  const theme = useReqoreTheme('main', customTheme);

  const transformedItems = getTransformedItems(
    tabs,
    vertical ? height : _testWidth || width,
    vertical ? 'height' : 'width',
    activeTab,
    size
  );

  return (
    <StyledReqoreTabsList
      {...rest}
      size={size}
      fill={fill}
      vertical={vertical}
      className={`${rest.className || ''} reqore-tabs-list`}
      ref={ref}
      flat={flat}
      theme={theme}
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
                  customTheme,
                  vertical,
                  flat,
                  size,
                } as IReqoreTabListItemProps
              }
              closeOnOutsideClick
              handler='hoverStay'
              content={
                <ReqoreMenu>
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
                    }) => (
                      <ReqoreMenuItem
                        {...({
                          ...props,
                          icon,
                          as,
                          intent: activeTab === id ? activeIntent || intent : intent,
                          disabled,
                          rightIcon: onCloseClick ? closeIcon || 'CloseLine' : undefined,
                          onRightIconClick: onCloseClick
                            ? () => {
                                onCloseClick(id);
                              }
                            : undefined,
                          selected: activeTab === id,
                          onClick: (_id, event: React.MouseEvent<any>) => {
                            if (!disabled) {
                              onTabChange?.(id);

                              if (props?.onClick) {
                                props.onClick(event);
                              }
                            }
                          },
                        } as IReqoreMenuItemProps)}
                        tooltip={tooltip}
                        key={index + label}
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
            <ReqoreTabsListItem
              {...item}
              size={size}
              activeIntent={activeTabIntent}
              customTheme={customTheme}
              wrapTabNames={wrapTabNames}
              key={index}
              vertical={vertical}
              active={activeTab === item.id}
              onClick={(event: React.MouseEvent<any>) => {
                if (!item.disabled) {
                  onTabChange?.(item.id);

                  if (item.props?.onClick) {
                    item.props.onClick(event);
                  }
                }
              }}
              onCloseClick={
                item.onCloseClick
                  ? () => {
                      item.onCloseClick?.(item.id);
                    }
                  : undefined
              }
            />
          </React.Fragment>
        )
      )}
    </StyledReqoreTabsList>
  );
};

export default ReqoreTabsList;
