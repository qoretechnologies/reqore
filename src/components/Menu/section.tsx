import React, { useCallback, useEffect, useState } from 'react';
import { TReqoreIntent } from '../../constants/theme';
import { IReqoreComponent } from '../../types/global';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import ReqoreControlGroup from '../ControlGroup';

export interface IReqoreMenuSectionProps extends IReqoreComponent, IReqoreButtonProps {
  children: any;
  collapsible?: boolean;
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  activeIntent?: TReqoreIntent;
}

export const ReqoreMenuSection = ({
  children,
  _insidePopover,
  _popoverId,
  customTheme,
  wrap,
  flat,
  minimal,
  collapsible = true,
  isCollapsed,
  activeIntent,
  onCollapseChange,
  ...rest
}: IReqoreMenuSectionProps) => {
  const [_isCollapsed, setIsCollapsed] = useState(isCollapsed);

  useEffect(() => {
    setIsCollapsed(isCollapsed);
  }, [isCollapsed]);

  const handleCollapseChange = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (collapsible) {
        setIsCollapsed(!_isCollapsed);
        onCollapseChange?.(!_isCollapsed);
      }

      rest.onClick?.(event);
    },
    [_isCollapsed, onCollapseChange, collapsible, rest.onClick]
  );

  return (
    <ReqoreControlGroup vertical fluid className='reqore-menu-section'>
      <ReqoreButton
        wrap={wrap}
        flat={flat}
        minimal={minimal}
        active={collapsible && !_isCollapsed}
        {...rest}
        className={`${rest.className || ''} reqore-menu-section-toggle`}
        intent={collapsible && !_isCollapsed ? activeIntent : rest.intent}
        fluid
        onClick={handleCollapseChange}
        rightIcon={rest.rightIcon || (collapsible ? 'ArrowRightSLine' : 'ArrowDownSLine')}
        rightIconProps={{
          rotation: collapsible && !_isCollapsed ? 90 : 0,
        }}
      />
      {!_isCollapsed || !collapsible ? (
        <ReqoreControlGroup vertical fluid style={{ paddingLeft: '10px' }}>
          {React.Children.map(children, (child) => {
            return child
              ? React.cloneElement(child, {
                  _insidePopover: child.props?._insidePopover ?? _insidePopover,
                  _popoverId: child.props?._popoverId ?? _popoverId,
                  customTheme: child.props?.customTheme || customTheme,
                  wrap: 'wrap' in (child.props || {}) ? child.props.wrap : wrap,
                  flat: 'flat' in (child.props || {}) ? child.props.flat : flat,
                  minimal: 'minimal' in (child.props || {}) ? child.props.minimal : minimal,
                })
              : null;
          })}
        </ReqoreControlGroup>
      ) : null}
    </ReqoreControlGroup>
  );
};
