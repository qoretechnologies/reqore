import React, { forwardRef, memo, useCallback, useEffect, useState } from 'react';
import { ReqoreButton, ReqoreControlGroup } from '../..';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { IReqoreComponent } from '../../types/global';
import { IReqoreButtonProps } from '../Button';

export interface IReqoreMenuItemProps extends IReqoreComponent, IReqoreButtonProps {
  label?: string | number;
  selected?: boolean;
  itemId?: string;
  onRightIconClick?: (
    itemId?: string,
    event?: React.MouseEvent<HTMLElement>,
    closePopover?: () => void
  ) => void;
  onClick?: (
    event: React.MouseEvent<HTMLElement>,
    itemId?: string,
    closePopover?: () => void
  ) => void;
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

const ReqoreMenuItem = memo(
  forwardRef<HTMLButtonElement, IReqoreMenuItemProps>(
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
        tooltip,
        intent,
        flat = true,
        scrollIntoView,
        closePopover,
        ...rest
      }: IReqoreMenuItemProps,
      ref
    ) => {
      const { targetRef } = useCombinedRefs<HTMLButtonElement>(ref);
      const [itemRef, setItemRef] = useState<HTMLButtonElement | null>(null);

      const handleClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
          event.persist();

          onClick?.(event, itemId, closePopover);
        },
        [itemId, onClick]
      );

      const handleRightIconClick = useCallback(
        (event: React.MouseEvent<HTMLSpanElement>) => {
          event.persist();
          event.stopPropagation();

          if (onRightIconClick) {
            onRightIconClick(itemId, event, closePopover);
          }
        },
        [itemId, onRightIconClick]
      );

      useEffect(() => {
        if (scrollIntoView && itemRef) {
          itemRef.scrollIntoView?.({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
      }, [itemRef, scrollIntoView]);

      return (
        <ReqoreControlGroup stack={!!onRightIconClick} fluid fill responsive={false}>
          <ReqoreButton
            as={as}
            transparent={!rest.effect}
            verticalPadding='small'
            compact
            {...rest}
            flat={flat}
            className={`${rest.className || ''} reqore-menu-item`}
            fluid
            onClick={handleClick}
            active={selected}
            ref={(ref) => {
              targetRef.current = ref || undefined;
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
              verticalPadding='small'
              fixed
              compact
              transparent={rest.transparent === false ? false : !rest.effect}
              minimal={rest.minimal}
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
  )
);

export default ReqoreMenuItem;
