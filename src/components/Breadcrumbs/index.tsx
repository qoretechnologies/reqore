import { Icon, IconName } from '@blueprintjs/core';
import { isArray } from 'lodash';
import React from 'react';
import { useMeasure } from 'react-use';
import styled, { css } from 'styled-components';
import { ReqorePopover } from '../..';
import { IReqoreTheme } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';
import ReqoreMenu from '../Menu';
import ReqoreMenuItem from '../Menu/item';
import ReqoreBreadcrumbsItem, { IReqoreBreadcrumbItemProps } from './item';

export interface IReqoreBreadcrumbItem {
  tooltip?: JSX.Element | string;
  label?: string;
  icon?: IconName;
  active?: boolean;
  as?: any;
  props?: React.HTMLAttributes<HTMLDivElement>;
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

      > * {
        color: ${theme.breadcrumbs?.item?.color ||
        theme.breadcrumbs?.main ||
        getReadableColor(theme.main, undefined, undefined, true)};
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
          ) =>
            isArray(item) ? (
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
            ) : (
              <React.Fragment key={index}>
                {index !== 0 && (
                  <Icon
                    icon='chevron-right'
                    iconSize={12}
                    key={'icon' + index}
                  />
                )}
                <ReqoreBreadcrumbsItem {...item} key={index} />
              </React.Fragment>
            )
        )}
      </div>
      {rightElement && <div>{rightElement}</div>}
    </StyledReqoreBreadcrumbs>
  );
};

export default ReqoreBreadcrumbs;
