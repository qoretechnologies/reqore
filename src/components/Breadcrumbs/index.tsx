import { isArray } from 'lodash';
import React, { useMemo } from 'react';
import { useMeasure } from 'react-use';
import styled, { css } from 'styled-components';
import { ReqorePopover } from '../..';
import { IReqoreBreadcrumbsTheme, IReqoreIntent, IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor, getReadableColorFrom } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreIconName } from '../../types/icons';
import ReqoreIcon from '../Icon';
import ReqoreMenu from '../Menu';
import ReqoreMenuItem from '../Menu/item';
import { IReqoreTabsListItem } from '../Tabs';
import ReqoreTabsList, { getTabsLength, StyledReqoreTabsList } from '../Tabs/list';
import ReqoreBreadcrumbsItem, { IReqoreBreadcrumbItemProps } from './item';

export interface IReqoreBreadcrumbItem {
  tooltip?: JSX.Element | string;
  label?: string;
  icon?: IReqoreIconName;
  active?: boolean;
  as?: any;
  props?: React.HTMLAttributes<any>;
  withTabs?: {
    tabs: IReqoreTabsListItem[];
    onTabChange: (tabId: string) => any;
    activeTab: string;
    activeTabIntent?: IReqoreIntent;
  };
  customTheme?: IReqoreBreadcrumbsTheme;
}

export interface IReqoreBreadcrumbsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: IReqoreBreadcrumbItem[];
  rightElement?: JSX.Element;
  // Internal prop, ignore!
  _testWidth?: number;
  customTheme?: IReqoreBreadcrumbsTheme;
  flat?: boolean;
}

const StyledReqoreBreadcrumbs = styled.div<{ theme: IReqoreTheme; flat?: boolean }>`
  ${({ theme, flat }: { theme: IReqoreTheme; flat?: boolean }) => css`
    width: 100%;
    height: 40px;
    display: flex;
    padding: 0 10px;
    justify-content: space-between;
    border-bottom: ${flat ? 0 : `1px solid ${changeLightness(theme.main, 0.05)}`};
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
        border-bottom: 0;
      }

      &:first-child {
        overflow: hidden;
        flex: 1;
      }
    }
  `}
`;

const getBreadcrumbsLength = (items: (IReqoreBreadcrumbItem | IReqoreBreadcrumbItem[])[]): number =>
  items.reduce((len, item) => {
    if (isArray(item)) {
      return len + 70;
    }

    if (item.withTabs) {
      return len + getTabsLength(item.withTabs.tabs, 'width', item.withTabs.activeTab);
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

  let stop = false;
  let newItems = [...items];

  while (getBreadcrumbsLength(newItems) > width && !stop) {
    if (isArray(newItems[1])) {
      newItems[1].push(newItems[2] as IReqoreBreadcrumbItem);
      newItems[2] = undefined;
    } else {
      const secondItem = newItems[1];
      newItems[1] = [secondItem];
    }

    newItems = newItems.filter((i) => i);

    if (!newItems[2] || (newItems[2] as IReqoreBreadcrumbItem).withTabs) {
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
  ...rest
}: IReqoreBreadcrumbsProps) => {
  const [ref, { width }] = useMeasure();
  const theme = useReqoreTheme('breadcrumbs', customTheme);
  const transformedItems = useMemo(
    () => getTransformedItems(items, _testWidth || width),
    [items, width, _testWidth]
  );

  const renderItem = (item: IReqoreBreadcrumbItem | IReqoreBreadcrumbItem[], index: number) => {
    if (isArray(item)) {
      return (
        <React.Fragment key={index}>
          <ReqoreIcon icon='ArrowRightSLine' size='15px' key={'icon' + index} />
          <ReqorePopover
            key={index}
            component={ReqoreBreadcrumbsItem}
            componentProps={
              {
                icon: 'MoreFill',
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
          <ReqoreIcon icon='ArrowRightSLine' size='15px' key={'icon' + index} />
          <ReqoreTabsList
            tabs={item.withTabs.tabs}
            onTabChange={item.withTabs.onTabChange}
            activeTab={item.withTabs.activeTab}
            activeTabIntent={item.withTabs.activeTabIntent}
            parentBackground={theme.breadcrumbs?.main}
            flat={flat}
          />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={index}>
        {index !== 0 && <ReqoreIcon icon='ArrowRightSLine' size='15px' key={'icon' + index} />}
        <ReqoreBreadcrumbsItem {...item} key={index} customTheme={customTheme} />
      </React.Fragment>
    );
  };

  return (
    <StyledReqoreBreadcrumbs
      {...rest}
      className={`${rest.className || ''} reqore-breadcrumbs-wrapper`}
      ref={ref}
      flat={flat}
      theme={theme}
    >
      <div key='reqore-breadcrumbs-left-wrapper'>
        {transformedItems.map(
          (item: IReqoreBreadcrumbItem | IReqoreBreadcrumbItem[], index: number) =>
            renderItem(item, index)
        )}
      </div>
      {rightElement && <div>{rightElement}</div>}
    </StyledReqoreBreadcrumbs>
  );
};

export default ReqoreBreadcrumbs;
