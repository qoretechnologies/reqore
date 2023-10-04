import { size as count, isArray, last } from 'lodash';
import React, { useMemo } from 'react';
import { useMeasure } from 'react-use';
import styled, { css } from 'styled-components';
import { ReqoreDropdown } from '../..';
import { ICON_FROM_SIZE, MARGIN_FROM_SIZE, PADDING_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreBreadcrumbsTheme, IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { changeLightness, getReadableColor, getReadableColorFrom } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
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

export interface IReqoreBreadcrumbsProps extends React.HTMLAttributes<HTMLDivElement> {
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
  ...rest
}: IReqoreBreadcrumbsProps) => {
  const [ref, { width }] = useMeasure();
  const theme = useReqoreTheme('breadcrumbs', customTheme);
  const transformedItems = useMemo(
    () => (responsive ? getTransformedItems(items, _testWidth || width, size) : items),
    [items, width, _testWidth, size]
  );

  const renderItem = (item: IReqoreBreadcrumbItem | IReqoreBreadcrumbItem[], index: number) => {
    if (isArray(item)) {
      return (
        <React.Fragment key={index}>
          <ReqoreDropdown
            key={`dropdown-${index}`}
            icon={last(item)?.icon}
            handler='hoverStay'
            delay={500}
            badge={count(item)}
            items={item as IReqoreDropdownItem[]}
          >
            <ReqoreIcon icon='MoreLine' />
          </ReqoreDropdown>
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
      responsive={responsive}
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
