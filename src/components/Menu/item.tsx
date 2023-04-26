import React, { forwardRef, useEffect, useState } from 'react';
import { useContext } from 'use-context-selector';
import { ReqoreButton, ReqoreControlGroup } from '../..';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import PopoverContext from '../../context/PopoverContext';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
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
  scrollIntoView?: boolean;
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

const ReqoreMenuItem = forwardRef<HTMLButtonElement, IReqoreMenuItemProps>(
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
      scrollIntoView,
      ...rest
    }: IReqoreMenuItemProps,
    ref
  ) => {
    const { removePopover } = useContext(PopoverContext);
    const { targetRef } = useCombinedRefs<HTMLButtonElement>(ref);
    const [itemRef, setItemRef] = useState<HTMLButtonElement>(undefined);

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

    useEffect(() => {
      if (scrollIntoView && itemRef) {
        itemRef.scrollIntoView?.({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }, [itemRef, scrollIntoView]);

    return (
      <ReqoreControlGroup stack={!!onRightIconClick} fluid fill>
        <ReqoreButton
          //@ts-ignore
          as={as}
          {...rest}
          flat={flat}
          className={`${rest.className || ''} reqore-menu-item`}
          fluid
          onClick={handleClick}
          active={selected}
          ref={(ref) => {
            targetRef.current = ref;
            setItemRef(ref);
          }}
          disabled={disabled}
          intent={intent}
          icon={icon}
          rightIcon={onRightIconClick ? undefined : rightIcon}
          tooltip={tooltip}
        >
          {label || children}
        </ReqoreButton>
        {rightIcon && onRightIconClick ? (
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
        ) : null}
      </ReqoreControlGroup>
    );
  }
);

export default ReqoreMenuItem;
