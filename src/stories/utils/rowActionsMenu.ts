// Copyright 2026 Qore Technologies, s.r.o.
import { expect, waitFor } from 'storybook/test';

/**
 * The menu a narrow row folds its actions into (`ReqoreRowActionsMenu`, in a table, a severity row and
 * an entity row): its button in `root`, and the rows of the menu it opened.
 */
export const rowActionsMenuButtons = (root: ParentNode) =>
  Array.from(root.querySelectorAll<HTMLElement>('.reqore-row-actions-menu-button'));

/** The rows of the open menu: the menu is drawn in a popover, outside the row. */
export const openRowActionsMenuItems = () =>
  Array.from(document.querySelectorAll<HTMLElement>('.reqore-popover-content .reqore-menu-item'));

/** The open menu names each action in words - `labels`, in order - each with its icon. */
export const expectRowActionsMenuItems = async (labels: string[]) =>
  waitFor(() => {
    const items = openRowActionsMenuItems();
    expect(items.map((item) => item.textContent?.trim())).toEqual(labels);
    for (const item of items) {
      expect(item.querySelector('.reqore-icon')).toBeTruthy();
    }
  });

export const expectRowActionsMenuClosed = async () =>
  waitFor(() => expect(openRowActionsMenuItems()).toHaveLength(0));
