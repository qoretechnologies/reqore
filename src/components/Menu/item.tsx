import React, { forwardRef, useContext } from 'react';
import { ReqoreButton, ReqoreControlGroup } from '../..';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import PopoverContext from '../../context/PopoverContext';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useTooltip } from '../../hooks/useTooltip';
import { IReqoreComponent } from '../../types/global';
import { IReqoreButtonProps } from '../Button';

// @ts-ignore
export interface IReqoreMenuItemProps
  extends IReqoreComponent,
    React.HTMLAttributes<HTMLElement>,
    IReqoreButtonProps {
  label?: string | number;
  as?: JSX.Element | React.ElementType | never;
  selected?: boolean;
  itemId?: string;
  onRightIconClick?: (itemId?: string, event?: React.MouseEvent<HTMLElement>) => void;
  onClick?: (itemId?: string, event?: React.MouseEvent<HTMLElement>) => void;
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

const ReqoreMenuItem: React.FC<IReqoreMenuItemProps> = forwardRef<
  HTMLDivElement,
  IReqoreMenuItemProps
>(
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
      itemId,
      _insidePopover,
      _popoverId,
      tooltip,
      intent,
      flat = true,
      ...rest
    },
    ref: any
  ) => {
    const { removePopover } = useContext(PopoverContext);
    const { targetRef } = useCombinedRefs(ref);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.persist();

      onClick?.(itemId, event);

      if (_insidePopover && _popoverId) {
        removePopover!(_popoverId);
      }
    };

    const handleRightIconClick = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.persist();
      event.stopPropagation();

      if (onRightIconClick) {
        onRightIconClick(itemId, event);

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
          flat={flat}
          className='reqore-menu-item'
          fluid
          onClick={handleClick}
          active={selected}
          ref={targetRef}
          disabled={disabled}
          intent={intent}
          icon={icon}
        >
          {label || children}
        </ReqoreButton>
        {rightIcon && (
          <ReqoreButton
            icon={rightIcon}
            flat={flat}
            fixed
            minimal={!onRightIconClick}
            customTheme={rest.customTheme}
            className='reqore-menu-item-right-icon'
            onClick={handleRightIconClick}
            readOnly={!onRightIconClick}
            intent={intent}
            active={selected && !!onRightIconClick}
          />
        )}
      </ReqoreControlGroup>
    );
  }
);

export default ReqoreMenuItem;
