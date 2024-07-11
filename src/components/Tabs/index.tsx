import React, { ReactElement, useCallback, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { TSizes } from '../../constants/sizes';
import { IReqoreCustomTheme, TReqoreIntent } from '../../constants/theme';
import { IWithReqoreLoading } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { IReqoreButtonProps } from '../Button';
import { TReqoreTabsContentPadding } from './content';
import ReqoreTabsList from './list';

export interface IReqoreTabsListItem extends Omit<IReqoreButtonProps, 'id'> {
  label?: string | number;
  as?: any;
  id: string | number;
  props?: Record<string, any>;
  onClick?: (event: any) => any;
  onCloseClick?: (id: string | number) => any;
  activeIntent?: TReqoreIntent;
  closeIcon?: IReqoreIconName;
  loadingIconType?: IWithReqoreLoading['loadingIconType'];
  show?: boolean;
}

export interface IReqoreTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: IReqoreTabsListItem[];
  activeTab?: string | number;
  onTabChange?: (tabId: string | number) => any;
  children?: ReactElement<any>[] | ReactElement<any>;
  fill?: boolean;
  fillParent?: boolean;
  vertical?: boolean;
  activeTabIntent?: TReqoreIntent;
  padded?: boolean;
  tabsPadding?: TReqoreTabsContentPadding;
  wrapTabNames?: boolean;
  flat?: boolean;
  size?: TSizes;
  width?: string;
  customTheme?: IReqoreCustomTheme;
  intent?: TReqoreIntent;
  unMountOnTabChange?: boolean;
  loadingIconType?: IWithReqoreLoading['loadingIconType'];
  useReactTransition?: boolean;
  // Internal prop, ignore!
  _testWidth?: number;
}

const StyledTabs = styled.div<Partial<IReqoreTabsProps>>`
  display: flex;
  ${({ vertical, fillParent, width }) => css`
    width: ${width ? `${width}px` : '100%'};
    height: ${fillParent ? '100%' : undefined};
    flex-flow: ${vertical ? 'row' : 'column'};
  `}
`;

const ReqoreTabs = ({
  tabs,
  activeTab,
  children,
  className,
  onTabChange,
  fill,
  _testWidth,
  vertical,
  activeTabIntent,
  flat = true,
  size = 'normal',
  width,
  wrapTabNames,
  customTheme,
  intent,
  padded,
  tabsPadding,
  unMountOnTabChange = true,
  loadingIconType,
  useReactTransition = true,
  ...rest
}: IReqoreTabsProps) => {
  const [_activeTab, setActiveTab] = useState<string | number>(activeTab || tabs[0].id);

  useUpdateEffect(() => {
    if (activeTab || activeTab === 0) {
      setActiveTab(activeTab);

      if (onTabChange) {
        onTabChange(activeTab);
      }
    }
  }, [activeTab]);

  const handleTabChange = useCallback(
    (tabId: string | number) => {
      setActiveTab(tabId);

      if (onTabChange) {
        onTabChange(tabId);
      }
    },
    [onTabChange]
  );

  return (
    <StyledTabs
      {...rest}
      width={width}
      vertical={vertical}
      className={`${className || ''} reqore-tabs`}
    >
      <ReqoreTabsList
        tabs={tabs}
        padded={padded}
        flat={flat}
        fill={fill}
        size={size}
        width={width}
        vertical={vertical}
        _testWidth={_testWidth}
        activeTab={_activeTab}
        wrapTabNames={wrapTabNames}
        activeTabIntent={activeTabIntent}
        customTheme={customTheme}
        intent={intent}
        onTabChange={handleTabChange}
        loadingIconType={loadingIconType}
        useReactTransition={useReactTransition}
      />
      {React.Children.map(children, (child) =>
        child &&
        tabs.find((tab) => tab.id === child.props?.tabId)?.show !== false &&
        (child.props?.tabId === _activeTab || !unMountOnTabChange)
          ? React.cloneElement(child, {
              padded: child.props?.padded || tabsPadding,
              key: child.props?.tabId,
              style:
                child.props?.tabId === _activeTab
                  ? child.props.style
                  : { ...(child.props.style || {}), display: 'none' },
            })
          : null
      )}
    </StyledTabs>
  );
};

export default ReqoreTabs;
