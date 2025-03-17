import React, { forwardRef, memo, useCallback, useEffect, useState } from 'react';
import { ReqoreButton, ReqoreControlGroup } from '../..';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { IReqoreComponent } from '../../types/global';
import { IReqoreButtonProps } from '../Button';

export type TReqoreMenuItemEventHandler = (
  event: React.MouseEvent<HTMLElement>,
  itemId?: string,
  closePopover?: () => void
) => void;

export type TReqoreMenuItemAction = Omit<IReqoreButtonProps, 'onClick'> & {
  onClick?: TReqoreMenuItemEventHandler;
};

export interface IReqoreMenuItemProps extends IReqoreComponent, IReqoreButtonProps {
  label?: string | number;
  selected?: boolean;
  itemId?: string;
  leftAction?: TReqoreMenuItemAction;
  rightAction?: TReqoreMenuItemAction;
  stackWithActions?: boolean;
  onClick?: TReqoreMenuItemEventHandler;
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
        rightAction,
        leftAction,
        disabled,
        itemId,
        tooltip,
        intent,
        flat = true,
        stackWithActions = true,
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

      const handleRightActionClick = useCallback(
        (event: React.MouseEvent<HTMLSpanElement>) => {
          event.persist();
          event.stopPropagation();

          rightAction?.onClick?.(event, itemId, closePopover);
        },
        [itemId, rightAction?.onClick]
      );

      const handleLeftActionClick = useCallback(
        (event: React.MouseEvent<HTMLSpanElement>) => {
          event.persist();
          event.stopPropagation();

          leftAction?.onClick?.(event, itemId, closePopover);
        },
        [itemId, leftAction?.onClick]
      );

      useEffect(() => {
        if (scrollIntoView && itemRef) {
          itemRef.scrollIntoView?.({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
      }, [itemRef, scrollIntoView]);

      return (
        <ReqoreControlGroup stack={stackWithActions} fluid fill responsive={false}>
          {leftAction ? (
            <ReqoreButton
              flat={flat}
              verticalPadding='small'
              fixed
              compact
              transparent={rest.transparent === false ? false : !rest.effect}
              minimal={rest.minimal}
              customTheme={rest.customTheme}
              className='reqore-menu-item-left-action'
              intent={intent}
              active={selected}
              {...leftAction}
              onClick={handleLeftActionClick}
            />
          ) : null}
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
            rightIcon={rightIcon}
            tooltip={tooltip}
          >
            {label || children}
          </ReqoreButton>
          {rightAction ? (
            <ReqoreButton
              flat={flat}
              verticalPadding='small'
              fixed
              compact
              transparent={rest.transparent === false ? false : !rest.effect}
              minimal={rest.minimal}
              customTheme={rest.customTheme}
              className='reqore-menu-item-right-action'
              intent={intent}
              active={selected}
              {...rightAction}
              onClick={handleRightActionClick}
            />
          ) : null}
        </ReqoreControlGroup>
      );
    }
  )
);

export default ReqoreMenuItem;
