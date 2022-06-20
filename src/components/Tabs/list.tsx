import { isArray } from 'lodash';
import React from 'react';
import { useMeasure } from 'react-use';
import styled, { css } from 'styled-components';
import { IReqoreTabsListItem, IReqoreTabsProps } from '.';
import { ReqorePopover } from '../..';
import { TABS_SIZE_TO_PX } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import ReqoreMenu from '../Menu';
import ReqoreMenuItem, { IReqoreMenuItemProps } from '../Menu/item';
import { StyledPopover } from '../Popover';
import ReqoreTabsListItem, { IReqoreTabListItemProps, StyledTabListItem } from './item';

export interface IReqoreTabsListProps
  extends IReqoreTabsProps,
    React.HTMLAttributes<HTMLDivElement> {
  onTabChange?: (tabId: string | number) => any;
  children?: any;
  parentBackground?: string;
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
  items.find((item) => item.id === activeTab);

const getMoreLabel = (items: IReqoreTabsListItem[], activeTab?: string | number) => {
  if (isTabHidden(items, activeTab)) {
    return isTabHidden(items, activeTab)?.label;
  }

  return 'More';
};

const getLabel = (
  item: IReqoreTabsListItem | IReqoreTabsListItem[],
  activeTab?: string | number
) => {
  if (!isArray(item)) {
    return item.label?.length || 0;
  }

  return getMoreLabel(item, activeTab)?.length || 0;
};

export const getTabsLength = (
  items: (IReqoreTabsListItem | IReqoreTabsListItem[])[],
  type: 'width' | 'height' = 'width',
  activeTab?: string | number
): number =>
  items.reduce((len, item) => {
    if (type === 'height') {
      const rows = getLabel(item, activeTab) / 4 || 1;

      return len + rows * 15 + 10;
    }

    return len + 27 + getLabel(item, activeTab) * 10 + 45;
  }, 0);

const getTransformedItems = (
  items: (IReqoreTabsListItem | IReqoreTabsListItem[])[],
  size: number,
  type: 'width' | 'height' = 'width',
  activeTab?: string | number
): (IReqoreTabsListItem | IReqoreTabsListItem[])[] => {
  if (!size) {
    return items;
  }
  let newItems = [...items];

  while (getTabsLength(newItems, type, activeTab) > size && newItems.length > 1) {
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

  return newItems;
};

const ReqoreTabsList = ({
  tabs,
  onTabChange,
  activeTab,
  _testWidth,
  fill,
  vertical,
  activeTabIntent,
  parentBackground,
  wrapTabNames,
  flat,
  size,
  ...rest
}: IReqoreTabsListProps) => {
  const [ref, { width, height }] = useMeasure();

  const transformedItems = getTransformedItems(
    tabs,
    vertical ? height : _testWidth || width,
    vertical ? 'height' : 'width',
    activeTab
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
                  parentBackground,
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
              flat={flat}
              activeIntent={activeTabIntent}
              parentBackground={parentBackground}
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
