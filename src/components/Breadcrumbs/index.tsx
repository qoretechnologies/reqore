import { Icon, IconName } from '@blueprintjs/core';
import { isArray } from 'lodash';
import React from 'react';
import { useMeasure } from 'react-use';
import styled, { css } from 'styled-components';
import { ReqorePopover } from '../..';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import ReqoreMenu from '../Menu';
import ReqoreMenuItem from '../Menu/item';
import { IReqoreTabsListItem } from '../Tabs';
import { StyledTabListItem } from '../Tabs/item';
import ReqoreTabsList, {
  getTabsLength,
  StyledReqoreTabsList,
} from '../Tabs/list';
import ReqoreBreadcrumbsItem, { IReqoreBreadcrumbItemProps } from './item';

export interface IReqoreBreadcrumbItem {
  tooltip?: JSX.Element | string;
  label?: string;
  icon?: IconName;
  active?: boolean;
  as?: any;
  props?: React.HTMLAttributes<any>;
  withTabs?: {
    tabs: IReqoreTabsListItem[];
    onTabChange: (tabId: string) => any;
    activeTab: string;
  };
}

export interface IReqoreBreadcrumbsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: IReqoreBreadcrumbItem[];
  rightElement?: JSX.Element;
  // Internal prop, ignore!
  _testWidth?: number;
}

const StyledReqoreBreadcrumbs = styled.div<{ theme: IReqoreTheme }>`
  ${({ theme }) => css`
    width: 100%;
    height: 50px;
    display: flex;
    padding: 0 15px;
    justify-content: space-between;

    > div {
      height: 100%;
      display: flex;
      align-items: center;

      > *,
      ${StyledReqoreTabsList} > *,
      ${StyledTabListItem} * {
        color: ${theme.breadcrumbs?.item?.color ||
        theme.breadcrumbs?.main ||
        getReadableColor(theme.main, undefined, undefined, true)};
      }

      ${StyledReqoreTabsList} {
        flex: 1;
      }

      ${StyledTabListItem} {
        &:not(:last-child) {
          border-right: 1px solid
            ${changeLightness(
              theme.breadcrumbs?.item?.color ||
                theme.breadcrumbs?.main ||
                getReadableColor(theme.main, undefined, undefined, true),
              0.65
            )};
        }
      }

      &:first-child {
        overflow: hidden;
        flex: 1;
      }
    }
  `}
`;

const getBreadcrumbsLength = (
  items: (IReqoreBreadcrumbItem | IReqoreBreadcrumbItem[])[]
): number =>
  items.reduce((len, item) => {
    if (isArray(item)) {
      return len + 50;
    }

    if (item.withTabs) {
      return len + getTabsLength(item.withTabs.tabs);
    }

    return len + 27 + item.label.length * 10 + 35;
  }, 0);

const getTransformedItems = (
  items: (IReqoreBreadcrumbItem | IReqoreBreadcrumbItem[])[],
  width: number
): (IReqoreBreadcrumbItem | IReqoreBreadcrumbItem[])[] => {
  if (!width) {
    return items;
  }
  let newItems = [...items];

  while (getBreadcrumbsLength(newItems) > width) {
    if (isArray(newItems[1])) {
      newItems[1].push(newItems[2] as IReqoreBreadcrumbItem);
      newItems[2] = undefined;
    } else {
      const secondItem = newItems[1];
      newItems[1] = [secondItem];
    }

    newItems = newItems.filter((i) => i);
  }

  return newItems;
};

const ReqoreBreadcrumbs = ({
  items,
  rightElement,
  _testWidth,
  ...rest
}: IReqoreBreadcrumbsProps) => {
  const [ref, { width }] = useMeasure();

  const transformedItems = getTransformedItems(items, _testWidth || width);

  const renderItem = (
    item: IReqoreBreadcrumbItem | IReqoreBreadcrumbItem[],
    index: number
  ) => {
    if (isArray(item)) {
      return (
        <React.Fragment key={index}>
          <Icon icon='chevron-right' iconSize={12} key={'icon' + index} />
          <ReqorePopover
            key={index}
            component={ReqoreBreadcrumbsItem}
            componentProps={
              {
                icon: 'more',
                tooltip: 'Show more...',
                interactive: true,
              } as IReqoreBreadcrumbItemProps
            }
            handler='click'
            content={
              <ReqoreMenu>
                {item.map(({ icon, label, as, tooltip, props }) => (
                  <ReqorePopover
                    component={ReqoreMenuItem}
                    componentProps={{
                      icon,
                      as,
                      ...props,
                    }}
                    placement='right'
                    isReqoreComponent
                    content={tooltip}
                    key={index + label}
                  >
                    {label}
                  </ReqorePopover>
                ))}
              </ReqoreMenu>
            }
          />
        </React.Fragment>
      );
    }

    if (item.withTabs) {
      return (
        <React.Fragment key={index}>
          <Icon icon='chevron-right' iconSize={12} key={'icon' + index} />
          <ReqoreTabsList
            tabs={item.withTabs.tabs}
            onTabChange={item.withTabs.onTabChange}
            activeTab={item.withTabs.activeTab}
          />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={index}>
        {index !== 0 && (
          <Icon icon='chevron-right' iconSize={12} key={'icon' + index} />
        )}
        <ReqoreBreadcrumbsItem {...item} key={index} />
      </React.Fragment>
    );
  };

  return (
    <StyledReqoreBreadcrumbs
      {...rest}
      className={`${rest.className || ''} reqore-breadcrumbs-wrapper`}
      ref={ref}
    >
      <div key='reqore-breadcrumbs-left-wrapper'>
        {transformedItems.map(
          (
            item: IReqoreBreadcrumbItem | IReqoreBreadcrumbItem[],
            index: number
          ) => renderItem(item, index)
        )}
      </div>
      {rightElement && <div>{rightElement}</div>}
    </StyledReqoreBreadcrumbs>
  );
};

export default ReqoreBreadcrumbs;
