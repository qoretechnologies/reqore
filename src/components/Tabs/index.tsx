import React, { ReactElement, useCallback, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { ReqoreErrorBoundary } from '../..';
import { TSizes } from '../../constants/sizes';
import { IReqoreCustomTheme, TReqoreIntent } from '../../constants/theme';
import { IReqoreComponent, IWithReqoreLoading } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { IReqoreButtonProps } from '../Button';
import { IReqoreMenuProps } from '../Menu';
import { IReqorePopoverProps } from '../Popover';
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

export interface IReqoreTabsProps extends IReqoreComponent, React.HTMLAttributes<HTMLDivElement> {
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
  /**
   * Props forwarded to the `ReqoreMenu` that hosts tabs which overflowed into
   * the `More` popover. Use this to override the viewport-safe default
   * `maxHeight`, add a `width`, tweak `size`, etc. Overrides the built-in
   * defaults when the same key is supplied.
   */
  overflowMenuProps?: Partial<IReqoreMenuProps>;
  /**
   * Props forwarded to the `ReqorePopover` that wraps the overflow `More`
   * menu. Use this to change `placement`, `handler`, `maxHeight`, etc. Cannot
   * replace the generated menu `content`, which is always derived from `tabs`.
   */
  overflowPopoverProps?: Partial<IReqorePopoverProps>;
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
  overflowMenuProps,
  overflowPopoverProps,
  errorBoundaryOptions,
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
    <ReqoreErrorBoundary {...errorBoundaryOptions}>
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
          overflowMenuProps={overflowMenuProps}
          overflowPopoverProps={overflowPopoverProps}
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
    </ReqoreErrorBoundary>
  );
};

export default ReqoreTabs;
