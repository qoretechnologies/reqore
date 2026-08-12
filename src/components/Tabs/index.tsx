import React, { ReactElement, useCallback, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { ReqoreErrorBoundary } from '../..';
import { TSizes } from '../../constants/sizes';
import { IReqoreCustomTheme, TReqoreIntent } from '../../constants/theme';
import { IReqoreComponent, IWithReqoreLoading } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { IReqoreButtonProps } from '../Button';
import { TReqoreEffectColor } from '../Effect';
import { IReqoreMenuProps } from '../Menu';
import { IReqorePopoverProps } from '../Popover';
import { TReqoreTabsContentPadding } from './content';
import ReqoreTabsList from './list';

export type TReqoreTabsActiveMarker = 'fill' | 'line';

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
  /**
   * How the active tab is marked. `fill` (the default) tints the whole tab, the
   * way Reqore tabs have always looked. `line` leaves the tab transparent and
   * draws a bar along the list's edge instead — the quieter "underline" tab
   * treatment, for dense surfaces where a filled tab would shout.
   */
  activeTabMarker?: TReqoreTabsActiveMarker;
  /**
   * Colour of the `line` marker. Defaults to the active intent's colour, and
   * failing that the tab's own text colour — set this when the bar should carry
   * an accent the label doesn't, which is the usual underline-tab treatment.
   */
  activeTabMarkerColor?: TReqoreEffectColor;
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
   * defaults when the same key is supplied. `children` is omitted because the
   * overflow menu content is always generated from `tabs`.
   */
  overflowMenuProps?: Partial<Omit<IReqoreMenuProps, 'children'>>;
  /**
   * Props forwarded to the `ReqorePopover` that wraps the overflow `More`
   * menu. Use this to change `placement`, `handler`, `maxHeight`, etc. The
   * structural props are omitted (`content`, `component`, `componentProps`)
   * because the popover always renders the menu generated from `tabs`.
   */
  overflowPopoverProps?: Partial<Omit<IReqorePopoverProps, 'content' | 'component' | 'componentProps'>>;
  /**
   * Label shown on the "More" overflow tab when some tabs don't fit. Defaults
   * to `'More'`. Override to translate (e.g. `'Plus'`, `'Mehr'`). Only applies
   * when the currently active tab is visible in the strip — an overflowed
   * active tab keeps showing its own label so the user can see which tab is
   * selected.
   */
  overflowLabel?: string | number;
  /**
   * When true the tab strip is not rendered at all — the tabs component
   * behaves as a bare content switcher driven only by `activeTab`. Use this
   * for preview / read-only surfaces that reuse a full ReqoreTabs
   * configuration (with all its tab metadata and validation intents) but
   * want to display only one tab's content without the user-facing
   * navigation chrome. Consumers previously reached the same effect by
   * `display: none` on the `.reqore-tabs-list` selector — that violated
   * Reqore's "never hide built-in chrome via CSS" contract.
   */
  hideTabsList?: boolean;
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
  activeTabMarker = 'fill',
  activeTabMarkerColor,
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
  overflowLabel,
  hideTabsList,
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
        {hideTabsList ? null : (
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
            activeTabMarker={activeTabMarker}
            activeTabMarkerColor={activeTabMarkerColor}
            customTheme={customTheme}
            intent={intent}
            onTabChange={handleTabChange}
            loadingIconType={loadingIconType}
            useReactTransition={useReactTransition}
            overflowMenuProps={overflowMenuProps}
            overflowPopoverProps={overflowPopoverProps}
            overflowLabel={overflowLabel}
          />
        )}
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
