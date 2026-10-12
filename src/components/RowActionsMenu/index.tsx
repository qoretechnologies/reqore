// Copyright 2026 Qore Technologies, s.r.o.
import React, { memo, useCallback, useMemo, useState } from 'react';
import { TOUCH_TARGET_PX, TSizes } from '../../constants/sizes';
import styled from '../../helpers/styled';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import { TReqoreTooltipProp } from '../../types/global';
import { IReqoreButtonProps } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreDropdown from '../Dropdown';
import { IReqoreDropdownItem } from '../Dropdown/list';
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
}

const tooltipText = (tooltip?: TReqoreTooltipProp): string | undefined => {
  if (typeof tooltip === 'string') {
    return tooltip || undefined;
  }

  return typeof tooltip?.content === 'string' ? tooltip.content || undefined : undefined;
};

/**
 * The words an action is called by where it has no room for its icon to speak for it - a menu row, a
 * stacked button on a phone, a screen reader: its label, or else its tooltip when that is text. A
 * finger gets no tooltip, so on a touch screen this is the only place those words are read.
 */
export const getRowActionLabel = (action: {
  label?: React.ReactNode;
  tooltip?: TReqoreTooltipProp;
}): string | undefined =>
  typeof action.label === 'string' || typeof action.label === 'number'
    ? String(action.label)
    : tooltipText(action.tooltip);

const toMenuItem = (action: IReqoreRowMenuAction, touch: boolean): IReqoreDropdownItem => {
  const subActions = action.actions?.filter(({ show }) => show !== false);
  const label = getRowActionLabel(action);

  return {
    label,
    icon: action.icon,
    intent: action.intent,
    // a finger's height, where the pointer is one
    ...(touch ? { size: 'big' as const } : {}),
    disabled: action.disabled,
    readOnly: action.readOnly,
    className: action.className,
    ...(subActions?.length
      ? { items: subActions }
      : {
          // Every row closes the menu when chosen, an action with no handler of its own too: a row that
          // left the menu open when it was picked would read as one that did nothing.
          onClick: (_item, event) =>
            action.onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>),
        }),
  };
};

/* A click inside the menu - its button, or a row of the list it opens, which React counts as inside
   it although the list is drawn elsewhere - is the menu's, not the row's it sits in. Without this a
   clickable row opened, or navigated away, under the menu that was being used. */
const stopRowClick = (event: React.MouseEvent<HTMLElement>) => event.stopPropagation();

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
 * A row's actions as one button that opens a menu of them: what a row offers where it is too narrow to
 * show them side by side. The button is reached with Tab and opened with Enter or Space; the arrow keys
 * walk the menu, Enter runs the action, and Escape puts the menu away with the focus still on the
 * button. Under a coarse pointer the button and the menu's rows are a finger's size.
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
        className='reqore-row-actions-menu-button'
        onToggleChange={handleToggle}
        items={items}
      />
    );

    return (
      <StyledRowActionsMenu
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
            style={{ height: '100%' }}
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
