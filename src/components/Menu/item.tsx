import React, { forwardRef, useContext } from 'react';
import { ReqoreButton, ReqoreControlGroup } from '../..';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import PopoverContext from '../../context/PopoverContext';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useTooltip } from '../../hooks/useTooltip';
import { IReqoreComponent, IWithReqoreCustomTheme, TReqoreTooltipProp } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';

// @ts-ignore
export interface IReqoreMenuItemProps
  extends IReqoreComponent,
    React.HTMLAttributes<HTMLElement>,
    IWithReqoreCustomTheme {
  children?: string;
  label?: string | number;
  icon?: IReqoreIconName;
  rightIcon?: IReqoreIconName;
  as?: JSX.Element | React.ElementType | never;
  selected?: boolean;
  disabled?: boolean;
  onClick?: (itemId?: string, event?: React.MouseEvent<HTMLElement>) => void;
  onRightIconClick?: (itemId?: string, event?: React.MouseEvent<HTMLElement>) => void;
  tooltip?: TReqoreTooltipProp;
  intent?: TReqoreIntent;
  wrapText?: boolean;
}

export interface IReqoreMenuItemStyle {
  theme: IReqoreTheme;
  selected: boolean;
  disabled: boolean;
  intent?: TReqoreIntent;
}

export interface IReqoreMenuItemRightIconStyle {
  theme: IReqoreTheme;
  interactive?: boolean;
  intent?: TReqoreIntent;
}

const ReqoreMenuItem: React.FC<IReqoreMenuItemProps> = forwardRef(
  (
    {
      children,
      label,
      icon,
      rightIcon,
      as,
      selected,
      onClick,
      onRightIconClick,
      disabled,
      id,
      _insidePopover,
      _popoverId,
      tooltip,
      intent,
      wrapText,
      ...rest
    },
    ref: any
  ) => {
    const { removePopover } = useContext(PopoverContext);
    const { targetRef } = useCombinedRefs(ref);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.persist();

      onClick?.(id, event);

      if (_insidePopover && _popoverId) {
        removePopover!(_popoverId);
      }
    };

    const handleRightIconClick = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.persist();
      event.stopPropagation();

      if (onRightIconClick) {
        onRightIconClick(id, event);

        if (_insidePopover && _popoverId) {
          removePopover!(_popoverId);
        }
      }
    };

    useTooltip(targetRef.current, tooltip);

    return (
      <ReqoreControlGroup stack={!!onRightIconClick} fluid>
        <ReqoreButton
          //@ts-ignore
          as={as}
          {...rest}
          flat
          className='reqore-menu-item'
          fluid
          onClick={handleClick}
          active={selected}
          ref={targetRef}
          disabled={disabled}
          intent={intent}
          icon={icon}
          wrap={wrapText}
        >
          {label || children}
        </ReqoreButton>
        {rightIcon && (
          <ReqoreButton
            icon={rightIcon}
            flat
            fixed
            minimal={!onRightIconClick}
            customTheme={rest.customTheme}
            className='reqore-menu-item-right-icon'
            onClick={handleRightIconClick}
            readOnly={!onRightIconClick}
            intent={intent}
            active={selected && !!onRightIconClick}
            wrap={wrapText}
          />
        )}
      </ReqoreControlGroup>
    );
  }
);

export default ReqoreMenuItem;
