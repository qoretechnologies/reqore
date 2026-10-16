// Copyright 2026 Qore Technologies, s.r.o.
import React, { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { TOUCH_TARGET_PX, TSizes } from '../../constants/sizes';
import styled from '../../helpers/styled';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import { TReqoreTooltipProp } from '../../types/global';
import { IReqoreButtonProps } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreDropdown from '../Dropdown';
import { IDropdownKeyboardControls, IReqoreDropdownItem } from '../Dropdown/list';
import { IReqorePanelSubAction } from '../Panel';

/** What the menu button is called, for a screen reader and in its tooltip, where the host gives no word. */
export const DEFAULT_ACTIONS_MENU_LABEL = 'Actions';

/**
 * How a row shows two or more actions where it is narrow.
 * - `'menu'`: one menu button, at the end of the label's line, opening a menu that names each action.
 *   The content keeps its width, and a list of rows does not grow by a line per action.
 * - `'stack'`: under the label, one to a line, each the row's width with its label whole. For a
 *   callout whose actions are what it is there for ("Try again"), which a menu would hide.
 */
export type TReqoreNarrowRowActions = 'menu' | 'stack';

/** An action a row offers: a button's props, a label, and - for a menu of its own - sub-actions. */
export interface IReqoreRowMenuAction
  extends Omit<IReqoreButtonProps, 'children' | 'label' | 'onClick'> {
  label?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** An action that is itself a menu (`ReqoreEntityRow`): its entries are a submenu here. */
  actions?: IReqorePanelSubAction[];
  /**
   * The props of a panel action drawn as a component of its own (`as`, e.g. an enable toggle): in
   * the menu it is a row named by them (`label`, `tooltip` or `aria-label`) that does what a click
   * on the component does (`onClick`).
   */
  props?: { [key: string]: any };
}

const tooltipText = (tooltip?: TReqoreTooltipProp): string | undefined => {
  if (typeof tooltip === 'string') {
    return tooltip || undefined;
  }

  return typeof tooltip?.content === 'string' ? tooltip.content || undefined : undefined;
};

/** Whether an action's `label` draws anything: not missing, empty or blank text, or a boolean. */
export const hasRowActionLabel = (label: React.ReactNode): boolean =>
  label !== undefined &&
  label !== null &&
  typeof label !== 'boolean' &&
  !(typeof label === 'string' && !label.trim());

/**
 * The words an action is called by where it has no room for its icon to speak for it - a menu row, a
 * stacked button on a phone, a screen reader: its label when that is text or a number, or else its
 * tooltip when that is text, or else its `aria-label`. A label that is empty, blank or an element
 * gives way to the others. A finger gets no tooltip, so on a touch screen this is the only place
 * those words are read.
 */
export const getRowActionLabel = (action: {
  label?: React.ReactNode;
  tooltip?: TReqoreTooltipProp;
  'aria-label'?: string;
}): string | undefined => {
  const { label } = action;

  if (typeof label === 'number' || (typeof label === 'string' && label.trim())) {
    return String(label);
  }

  return tooltipText(action.tooltip) ?? (action['aria-label']?.trim() || undefined);
};

/** A row of a menu, to assistive technology; reached with the arrow keys, not Tab. */
const MENU_ITEM_PROPS = { role: 'menuitem', tabIndex: -1 } as const;

/** A submenu's entries are menu items too, and one that opens a menu of its own says so. */
const toSubMenuItems = (items: IReqoreDropdownItem[]): IReqoreDropdownItem[] =>
  items.map((item) =>
    item.items?.length
      ? { ...item, ...MENU_ITEM_PROPS, 'aria-haspopup': 'menu', items: toSubMenuItems(item.items) }
      : { ...item, ...MENU_ITEM_PROPS }
  );

const toMenuItem = (action: IReqoreRowMenuAction, touch: boolean): IReqoreDropdownItem => {
  const subActions = action.actions?.filter(({ show }) => show !== false);
  // A panel action drawn as a component of its own keeps its name and its handler in `props`.
  const custom = action.props;
  const onClick = action.onClick ?? custom?.onClick;

  return {
    label: getRowActionLabel(action) ?? (custom ? getRowActionLabel(custom) : undefined),
    icon: action.icon ?? custom?.icon,
    intent: action.intent ?? custom?.intent,
    // a finger's height, where the pointer is one
    ...(touch ? { size: 'big' as const } : {}),
    disabled: action.disabled ?? custom?.disabled,
    readOnly: action.readOnly ?? custom?.readOnly,
    className: action.className,
    ...MENU_ITEM_PROPS,
    ...(subActions?.length
      ? { 'aria-haspopup': 'menu', items: toSubMenuItems(subActions) }
      : {
          // Every row closes the menu when chosen, an action with no handler of its own too: a row that
          // left the menu open when it was picked would read as one that did nothing.
          onClick: (_item, event) =>
            onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>),
        }),
  };
};

/* A click inside the menu - its button, or a row of the list it opens, which React counts as inside
   it although the list is drawn elsewhere - is the menu's, not the row's it sits in. Without this a
   clickable row opened, or navigated away, under the menu that was being used. */
const stopRowClick = (event: React.MouseEvent<HTMLElement>) => event.stopPropagation();

/** The filled group's style: one object for every render, so the memoised group is not drawn again for it. */
const FILL_GROUP_STYLE = { height: '100%' } as const;

const StyledRowActionsMenu = styled.div<{ $fill?: boolean }>`
  display: flex;
  flex: 0 0 auto;
  ${({ $fill }) => ($fill ? 'width: 100%; height: 100%;' : '')}

  /* a finger's target, where the pointer is one */
  @media (pointer: coarse) {
    .reqore-row-actions-menu-button {
      min-width: ${TOUCH_TARGET_PX}px;
      min-height: ${TOUCH_TARGET_PX}px;
    }
  }
`;

export interface IReqoreRowActionsMenuProps {
  /** The row's actions; each becomes a row of the menu, named in words, with its icon. */
  actions: IReqoreRowMenuAction[];
  size?: TSizes;
  /** What the menu button is called (its accessible name and tooltip). Defaults to "Actions". */
  label?: string;
  /** Take the whole box it is drawn in - a table cell - as the inline actions there do. */
  fill?: boolean;
  intent?: IReqoreButtonProps['intent'];
  className?: string;
}

/**
 * A row's actions as one button that opens a menu of them: what a row offers where it is too narrow
 * to show them side by side. The button is reached with Tab and opened with Enter or Space; the
 * arrow keys move the focus through the menu's items, Enter runs the action, and Escape puts the
 * menu away with the focus back on the button. To assistive technology the button controls a
 * `menu` (`aria-controls`, while it is open) whose rows are `menuitem`s, each named in words, so
 * the item the arrow keys are on is the one that is read. Under a coarse pointer the button and the
 * menu's rows are a finger's size.
 *
 * Internal: `ReqoreTable`, `ReqoreSeverityRow` and `ReqoreEntityRow` fold their actions into it.
 */
export const ReqoreRowActionsMenu = memo(
  ({
    actions,
    size,
    label = DEFAULT_ACTIONS_MENU_LABEL,
    fill,
    intent,
    className,
  }: IReqoreRowActionsMenuProps) => {
    const [open, setOpen] = useState(false);
    const touch = useReqoreProperty('isHoverCapable') === false;
    const items = useMemo(
      () => actions.map((action) => toMenuItem(action, touch)),
      [actions, touch]
    );
    const handleToggle = useCallback((isOpen: boolean) => setOpen(isOpen), []);

    const rootRef = useRef<HTMLDivElement>(null);
    // The list's rows are `${listId}-option-${index}`; the menu around them is `menuId`.
    const listId = `reqore-row-actions-${useId()}`;
    const menuId = `${listId}-menu`;
    // Set once the focus is moved into the menu, so closing it gives the button the focus back.
    const focusInMenu = useRef(false);
    const openRef = useRef(open);
    openRef.current = open;

    const focusButton = useCallback(() => {
      rootRef.current?.querySelector<HTMLElement>('.reqore-row-actions-menu-button')?.focus();
    }, []);

    /* The list says which row the arrow keys are on (`passKeyHandler`), and the focus goes there:
       a row a screen reader is on is the one it reads. Focus left on the button with only a
       highlight moving in the list said nothing to it. Where that row goes away while the menu is
       open (a submenu entered) the focus goes back to the button, which the arrow keys then walk
       the new rows from. */
    const handleKeyControls = useCallback(
      ({ focusedItemId }: IDropdownKeyboardControls) => {
        if (!openRef.current) {
          return;
        }

        const item = focusedItemId ? document.getElementById(focusedItemId) : null;

        if (item) {
          focusInMenu.current = true;
          item.focus({ preventScroll: true });
        } else if (focusInMenu.current && document.activeElement === document.body) {
          focusButton();
        }
      },
      [focusButton]
    );

    // Closed (an action chosen, Escape) with the focus in it or lost with it: the button takes it.
    useEffect(() => {
      if (open || !focusInMenu.current) {
        return;
      }

      focusInMenu.current = false;
      const active = document.activeElement;

      const inMenu = !!active && !!document.getElementById(menuId)?.contains(active);

      if (!active || active === document.body || inMenu) {
        focusButton();
      }
    }, [open, menuId, focusButton]);

    const wrapperProps = useMemo(
      () => ({ id: menuId, role: 'menu', 'aria-label': label }),
      [menuId, label]
    );

    const menu = (
      <ReqoreDropdown<IReqoreButtonProps & React.AriaAttributes>
        icon='More2Line'
        showCaret={false}
        size={size}
        intent={intent}
        flat
        minimal={!fill}
        fixed={!fill}
        fluid={fill}
        rounded={fill ? false : undefined}
        tooltip={label}
        aria-label={label}
        aria-haspopup='menu'
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className='reqore-row-actions-menu-button'
        onToggleChange={handleToggle}
        items={items}
        listId={listId}
        passKeyHandler={handleKeyControls}
        wrapperProps={wrapperProps}
      />
    );

    return (
      <StyledRowActionsMenu
        ref={rootRef}
        $fill={fill}
        className={`reqore-row-actions-menu ${className || ''}`.trim()}
        onClick={stopRowClick}
      >
        {fill ? (
          // the same box the inline actions are drawn in, so a narrow table's rows keep their look
          <ReqoreControlGroup
            size={size}
            stack
            fill
            fluid
            style={FILL_GROUP_STYLE}
            rounded={false}
          >
            {menu}
          </ReqoreControlGroup>
        ) : (
          menu
        )}
      </StyledRowActionsMenu>
    );
  }
);

export default ReqoreRowActionsMenu;
