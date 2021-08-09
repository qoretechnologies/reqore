import React, { ReactElement, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreIntent } from '../../constants/theme';
import { IReqoreIconName } from '../../types/icons';
import ReqoreTabsList from './list';

export interface IReqoreTabsListItem {
  label: string;
  icon?: IReqoreIconName;
  as?: any;
  disabled?: boolean;
  id: string;
  tooltip?: string;
  props?: React.HTMLAttributes<any>;
  onClick?: (event: any) => any;
  onCloseClick?: (id: string | number) => any;
  activeIntent?: IReqoreIntent;
}

export interface IReqoreTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: IReqoreTabsListItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => any;
  children?: ReactElement<any>[] | ReactElement<any>;
  fill?: boolean;
  vertical?: boolean;
  activeTabIntent?: IReqoreIntent;
  flat?: boolean;

  // Internal prop, ignore!
  _testWidth?: number;
}

const StyledTabs = styled.div<{ vertical?: boolean }>`
  display: flex;
  ${({ vertical }) => css`
    min-height: 100px;
    width: 100%;
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
  flat,
  ...rest
}: IReqoreTabsProps) => {
  const [_activeTab, setActiveTab] = useState<string>(activeTab || tabs[0].id);

  useEffect(() => {
    if (activeTab) {
      setActiveTab(activeTab);

      if (onTabChange) {
        onTabChange(activeTab);
      }
    }
  }, [activeTab]);

  return (
    <StyledTabs {...rest} vertical={vertical} className={`${className || ''} reqore-tabs`}>
      <ReqoreTabsList
        tabs={tabs}
        flat={flat}
        fill={fill}
        vertical={vertical}
        _testWidth={_testWidth}
        activeTab={_activeTab}
        activeTabIntent={activeTabIntent}
        onTabChange={(tabId: string) => {
          setActiveTab(tabId);

          if (onTabChange) {
            onTabChange(tabId);
          }
        }}
      />
      {React.Children.map(children, (child) =>
        child && child.props?.id === _activeTab ? child : null
      )}
    </StyledTabs>
  );
};

export default ReqoreTabs;
