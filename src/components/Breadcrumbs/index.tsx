import { isArray } from 'lodash';
import React, { useMemo } from 'react';
import { useMeasure } from 'react-use';
import styled, { css } from 'styled-components';
import { ReqorePopover } from '../..';
import {
  ICON_FROM_SIZE,
  MARGIN_FROM_SIZE,
  PADDING_FROM_SIZE,
  TABS_SIZE_TO_PX,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreBreadcrumbsTheme, IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { changeLightness, getReadableColor, getReadableColorFrom } from '../../helpers/colors';
import { calculateStringSizeInPixels } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreButtonProps } from '../Button';
import ReqoreIcon from '../Icon';
import ReqoreMenu from '../Menu';
import ReqoreMenuItem from '../Menu/item';
import { IReqoreTabsListItem } from '../Tabs';
import { StyledTabListItem } from '../Tabs/item';
import ReqoreTabsList, { StyledReqoreTabsList, getTabsLength } from '../Tabs/list';
import ReqoreBreadcrumbsItem, { IReqoreBreadcrumbItemProps } from './item';

export interface IReqoreBreadcrumbItemTabs {
  tabs: IReqoreTabsListItem[];
  onTabChange: (tabId: string | number) => any;
  activeTab: string;
  activeTabIntent?: TReqoreIntent;
}

export interface IReqoreBreadcrumbItem extends IReqoreButtonProps {
  label?: string;
  as?: any;
  props?: React.HTMLAttributes<any>;
  withTabs?: IReqoreBreadcrumbItemTabs;
}

export interface IReqoreBreadcrumbsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: IReqoreBreadcrumbItem[];
  rightElement?: JSX.Element;
  // Internal prop, ignore!
  _testWidth?: number;
  customTheme?: IReqoreBreadcrumbsTheme;
  size?: TSizes;
  flat?: boolean;
}

interface IStyledBreadcrumbs extends Omit<IReqoreBreadcrumbsProps, 'items'> {
  theme: IReqoreTheme;
}

const StyledReqoreBreadcrumbs = styled.div<IStyledBreadcrumbs>`
  ${({ theme, size, flat }: IStyledBreadcrumbs) => css`
    width: 100%;
    min-height: ${TABS_SIZE_TO_PX[size!]}px;
    margin: ${MARGIN_FROM_SIZE[size!]}px 0;
    display: flex;
    padding: 0 ${PADDING_FROM_SIZE[size!]}px;
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

const getBreadcrumbsLength = (
  items: (IReqoreBreadcrumbItem | IReqoreBreadcrumbItem[])[],
  size: TSizes
): number =>
  items.reduce((len, item) => {
    if (isArray(item)) {
      return len + 70;
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
      PADDING_FROM_SIZE[size] +
      ICON_FROM_SIZE[size] +
      arrowSize +
      calculateStringSizeInPixels(item.label || '', TEXT_FROM_SIZE[size])
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
    if (isArray(newItems[1])) {
      newItems[1].push(newItems[2] as IReqoreBreadcrumbItem);
      newItems[2] = undefined!;
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
  size = 'normal',
  ...rest
}: IReqoreBreadcrumbsProps) => {
  const [ref, { width }] = useMeasure();
  const theme = useReqoreTheme('breadcrumbs', customTheme);
  const transformedItems = useMemo(
    () => getTransformedItems(items, _testWidth || width, size),
    [items, width, _testWidth]
  );

  const renderItem = (item: IReqoreBreadcrumbItem | IReqoreBreadcrumbItem[], index: number) => {
    if (isArray(item)) {
      return (
        <React.Fragment key={index}>
          <ReqoreIcon icon='ArrowRightSLine' size={size} key={'icon' + index} margin='both' />
          <ReqorePopover
            key={index}
            component={ReqoreBreadcrumbsItem}
            isReqoreComponent
            componentProps={
              {
                icon: 'MoreFill',
                interactive: true,
              } as IReqoreBreadcrumbItemProps
            }
            handler='hoverStay'
            delay={500}
            content={
              <ReqoreMenu>
                {item.map(({ icon, label, as, tooltip, props }) => (
                  <ReqoreMenuItem
                    {...props}
                    icon={icon}
                    as={as}
                    onClick={(_itemId, event) => {
                      props?.onClick?.(event);
                    }}
                    tooltip={tooltip}
                    key={index + (label || icon || '')}
                  >
                    {label}
                  </ReqoreMenuItem>
                ))}
              </ReqoreMenu>
            }
          />
        </React.Fragment>
      );
    }

    if (item.withTabs) {
      return (
        <StyledBreadcrumbsTabsWrapper key={index}>
          <ReqoreIcon icon='ArrowRightSLine' size={size} key={'icon' + index} margin='both' />
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
          <ReqoreIcon icon='ArrowRightSLine' size={size} key={'icon' + index} margin='both' />
        )}
        <ReqoreBreadcrumbsItem {...item} key={index} customTheme={customTheme} size={size} />
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
      size={size}
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
