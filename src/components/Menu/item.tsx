import React, { forwardRef, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ReqoreButton, ReqoreControlGroup } from '../..';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import { IReqoreComponent } from '../../types/global';
import { IReqoreButtonProps } from '../Button';

export type TReqoreMenuItemEventHandler = (
  event: React.MouseEvent<HTMLElement>,
  itemId?: string,
  closePopover?: () => void
) => void;

export type TReqoreMenuItemActionEventHandler<
  Metadata extends Record<string, any> = Record<string, any>
> = (
  event: React.MouseEvent<HTMLElement>,
  itemId?: string,
  closePopover?: () => void,
  metadata?: Metadata
) => void;

export type TReqoreMenuItemAction<Metadata extends Record<string, any> = Record<string, any>> =
  Omit<IReqoreButtonProps, 'onClick'> & {
    onClick?: TReqoreMenuItemActionEventHandler<Metadata>;
  };

export interface IReqoreMenuItemProps<Metadata extends Record<string, any> = Record<string, any>>
  extends IReqoreComponent,
    IReqoreButtonProps {
  label?: string | number;
  selected?: boolean;
  itemId?: string;
  leftAction?: TReqoreMenuItemAction<Metadata>;
  rightAction?: TReqoreMenuItemAction<Metadata>;
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

      // Respect the global animations toggle from `ReqoreUIProvider` (popovers — menus are
      // rendered inside them) and the OS reduced-motion preference.
      const animations = useReqoreProperty('animations');
      const prefersReducedMotion = useMemo(
        () =>
          typeof window !== 'undefined' &&
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        []
      );
      const scrollBehavior: ScrollBehavior =
        animations?.popovers === false || prefersReducedMotion ? 'auto' : 'smooth';

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
          itemRef.scrollIntoView?.({
            // A smooth scroll is an animation, so the final offset depends on when the caller
            // looks. Honour the global toggle and the OS reduced-motion preference (same
            // pattern as CollapsibleContent) so consumers that turn animations off — snapshot
            // suites included — land on the settled position immediately and deterministically.
            behavior: scrollBehavior,
            block: 'center',
            // `nearest`, not `center`: this is a vertical list, and horizontally centring the
            // item scrolls the container sideways whenever any sibling is wider than the
            // viewport, which surfaces a horizontal scrollbar and shifts every row.
            inline: 'nearest',
          });
        }
      }, [itemRef, scrollIntoView, scrollBehavior]);

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
