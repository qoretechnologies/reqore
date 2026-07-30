import React, { forwardRef, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ReqoreButton, ReqoreControlGroup, ReqoreDropdown } from '../..';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import { IReqoreComponent } from '../../types/global';
import { IReqoreButtonProps } from '../Button';
// Type-only imports — erased at build time, so the Menu ↔ Dropdown reference
// (Dropdown already imports Menu types) stays a type-level cycle, never a
// runtime one. The `ReqoreDropdown` value comes from the same `../..` barrel
// `ReqoreButton` already does, and is only touched at render time.
import type { IReqoreDropdownProps } from '../Dropdown';
import type { TReqoreDropdownItems } from '../Dropdown/list';

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
    /**
     * Turns the action into a dropdown: clicking it opens a popover menu of
     * these items — supporting `divider` items to group them — instead of
     * firing `onClick`. Lets a menu row offer a cluster of related shortcuts
     * (e.g. "Show all / Create / …") without leaving the row.
     */
    actions?: TReqoreDropdownItems;
    /**
     * Extra props forwarded to the underlying `ReqoreDropdown` when `actions`
     * is set — e.g. `placement`, `showCaret`, `filterable`, `label`.
     */
    actionsProps?: Partial<IReqoreDropdownProps>;
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

      // Render a left/right action either as a plain button or, when it carries
      // `actions`, as a ReqoreDropdown whose control button keeps the exact same
      // styling. Shared by both slots so the two stay in lockstep.
      const renderAction = (
        action: TReqoreMenuItemAction | undefined,
        className: string,
        handleActionClick: (event: React.MouseEvent<HTMLSpanElement>) => void
      ) => {
        if (!action) return null;

        const { actions, actionsProps, onClick: _onClick, ...buttonProps } = action;
        const transparent = rest.transparent === false ? false : !rest.effect;

        if (actions?.length) {
          return (
            <ReqoreDropdown
              component={ReqoreButton}
              flat={flat}
              verticalPadding='small'
              fixed
              compact
              transparent={transparent}
              minimal={rest.minimal}
              customTheme={rest.customTheme}
              className={className}
              intent={intent}
              active={selected}
              // A menu row's action opens beside the row, not over the list
              // below it; consumers can override via `actionsProps`. No caret so
              // the control keeps the action's own icon (e.g. a bare `+`).
              showCaret={false}
              placement='right-start'
              {...buttonProps}
              items={actions}
              {...actionsProps}
            />
          );
        }

        return (
          <ReqoreButton
            flat={flat}
            verticalPadding='small'
            fixed
            compact
            transparent={transparent}
            minimal={rest.minimal}
            customTheme={rest.customTheme}
            className={className}
            intent={intent}
            active={selected}
            {...buttonProps}
            onClick={handleActionClick}
          />
        );
      };

      return (
        <ReqoreControlGroup stack={stackWithActions} fluid fill responsive={false}>
          {renderAction(leftAction, 'reqore-menu-item-left-action', handleLeftActionClick)}
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
          {renderAction(rightAction, 'reqore-menu-item-right-action', handleRightActionClick)}
        </ReqoreControlGroup>
      );
    }
  )
);

export default ReqoreMenuItem;
