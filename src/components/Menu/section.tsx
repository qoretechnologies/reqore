import React, { useCallback, useEffect, useState } from 'react';
import { TReqoreIntent } from '../../constants/theme';
import { useCloneThroughFragments } from '../../hooks/useCloneThroughFragments';
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

  const { clone } = useCloneThroughFragments((props) => ({
    _insidePopover: props?._insidePopover ?? _insidePopover,
    _popoverId: props?._popoverId ?? _popoverId,
    customTheme: props?.customTheme || customTheme,
    wrap: 'wrap' in (props || {}) ? props.wrap : wrap,
    flat: 'flat' in (props || {}) ? props.flat : flat,
    minimal: 'minimal' in (props || {}) ? props.minimal : minimal,
  }));

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
          {clone(children)}
        </ReqoreControlGroup>
      ) : null}
    </ReqoreControlGroup>
  );
};
