// Copyright 2026 Qore Technologies, s.r.o.
import { fireEvent, render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import ReqoreRowActionsMenu, {
  getRowActionLabel,
  hasRowActionLabel,
} from '../src/components/RowActionsMenu';

/*
 * The menu a narrow row folds its actions into (qorus#646): each action named in words, with its icon,
 * and a click in it is the menu's, not the row's.
 */

test('An action is named by its label, or else by its tooltip when that is text', () => {
  expect(getRowActionLabel({ label: 'Edit', tooltip: 'Open in the editor' })).toBe('Edit');
  expect(getRowActionLabel({ label: 3 })).toBe('3');
  expect(getRowActionLabel({ tooltip: 'Remove' })).toBe('Remove');
  expect(getRowActionLabel({ tooltip: { content: 'Dismiss' } })).toBe('Dismiss');
  expect(getRowActionLabel({ tooltip: '' })).toBeUndefined();
  expect(getRowActionLabel({ tooltip: { content: <b>Dismiss</b> } })).toBeUndefined();
  expect(getRowActionLabel({})).toBeUndefined();
});

test('A label empty, blank or not text gives way to the tooltip, then the aria-label', () => {
  expect(getRowActionLabel({ label: '', tooltip: 'Remove' })).toBe('Remove');
  expect(getRowActionLabel({ label: '  ', tooltip: { content: 'Dismiss' } })).toBe('Dismiss');
  expect(getRowActionLabel({ label: <b>Open</b>, tooltip: 'Open the row' })).toBe('Open the row');
  expect(getRowActionLabel({ label: '', 'aria-label': 'Delete' })).toBe('Delete');
  expect(getRowActionLabel({ label: 0 })).toBe('0');
  expect(getRowActionLabel({ label: '' })).toBeUndefined();

  expect(hasRowActionLabel('Open')).toBe(true);
  expect(hasRowActionLabel(0)).toBe(true);
  expect(hasRowActionLabel(<b>Open</b>)).toBe(true);
  expect(hasRowActionLabel('')).toBe(false);
  expect(hasRowActionLabel(' ')).toBe(false);
  expect(hasRowActionLabel(undefined)).toBe(false);
  expect(hasRowActionLabel(false)).toBe(false);
});

test('Opens a menu naming each action with its icon; the one picked runs, the row underneath does not', () => {
  vi.useFakeTimers();
  const onRowClick = vi.fn();
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  try {
    act(() => {
      render(
        <ReqoreUIProvider>
          <ReqoreLayoutContent>
            <ReqoreContent>
              <div onClick={onRowClick}>
                <ReqoreRowActionsMenu
                  label='Row actions'
                  actions={[
                    { icon: 'EditLine', label: 'Edit', onClick: onEdit },
                    { icon: 'DeleteBinLine', tooltip: 'Delete', intent: 'danger', onClick: onDelete },
                  ]}
                />
              </div>
            </ReqoreContent>
          </ReqoreLayoutContent>
        </ReqoreUIProvider>
      );
    });

    const button = document.querySelector('.reqore-row-actions-menu-button') as HTMLElement;
    expect(button.getAttribute('aria-label')).toBe('Row actions');
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(button.getAttribute('aria-expanded')).toBe('true');

    const items = Array.from(
      document.querySelectorAll<HTMLElement>('.reqore-popover-content .reqore-menu-item')
    );
    // an animated button draws its label three times: shown, animated in, and hidden to hold its width
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain('Edit');
    expect(items[1].textContent).toContain('Delete');
    for (const item of items) {
      expect(item.querySelector('.reqore-icon')).toBeTruthy();
    }

    fireEvent.click(items[1]);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onEdit).not.toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
    expect(document.querySelectorAll('.reqore-popover-content .reqore-menu-item')).toHaveLength(0);
  } finally {
    vi.useRealTimers();
  }
});

const renderMenu = (actions: React.ComponentProps<typeof ReqoreRowActionsMenu>['actions']) =>
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreRowActionsMenu label='Row actions' actions={actions} />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

const tick = () =>
  act(() => {
    vi.advanceTimersByTime(1);
  });

test('The open list is a menu the button controls; the arrow keys move the focus in it', () => {
  vi.useFakeTimers();
  const onDelete = vi.fn();

  try {
    renderMenu([
      { icon: 'EditLine', label: 'Edit' },
      { icon: 'DeleteBinLine', tooltip: 'Delete', onClick: onDelete },
    ]);

    const button = document.querySelector('.reqore-row-actions-menu-button') as HTMLElement;
    expect(button.getAttribute('aria-controls')).toBeNull();

    button.focus();
    fireEvent.click(button);
    tick();

    // the button names the list it opened, and the list is a menu of menu items, named
    const menuId = button.getAttribute('aria-controls');
    expect(menuId).toBeTruthy();
    const menu = document.getElementById(menuId!) as HTMLElement;
    expect(menu.getAttribute('role')).toBe('menu');
    expect(menu.getAttribute('aria-label')).toBe('Row actions');
    const items = Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining('Edit'),
      expect.stringContaining('Delete'),
    ]);

    // the arrow keys move the focus from item to item, so a screen reader reads the one it is on
    fireEvent.keyDown(button, { key: 'ArrowDown' });
    tick();
    expect(document.activeElement).toBe(items[0]);
    expect(document.activeElement?.getAttribute('role')).toBe('menuitem');

    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    tick();
    expect(document.activeElement).toBe(items[1]);
    expect(document.activeElement?.textContent).toContain('Delete');

    // Enter runs it, closes the menu and gives the button the focus back
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    tick();
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll('.reqore-popover-content .reqore-menu-item')).toHaveLength(0);
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute('aria-controls')).toBeNull();

    // Escape from inside the menu puts it away, the focus back on the button too
    fireEvent.click(button);
    tick();
    fireEvent.keyDown(button, { key: 'ArrowDown' });
    tick();
    expect(document.activeElement?.getAttribute('role')).toBe('menuitem');
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    tick();
    expect(document.querySelectorAll('.reqore-popover-content .reqore-menu-item')).toHaveLength(0);
    expect(document.activeElement).toBe(button);
  } finally {
    vi.useRealTimers();
  }
});

test('A panel action drawn as its own component is named, and clicked, by its props', () => {
  vi.useFakeTimers();
  const onToggle = vi.fn();
  const Toggle = () => null;

  try {
    renderMenu([
      { icon: 'EditLine', label: 'Edit' },
      { as: Toggle, props: { label: 'Enabled', icon: 'ToggleLine', onClick: onToggle } },
    ]);

    const button = document.querySelector('.reqore-row-actions-menu-button') as HTMLElement;
    fireEvent.click(button);
    tick();

    const items = Array.from(
      document.querySelectorAll<HTMLElement>('.reqore-popover-content .reqore-menu-item')
    );
    expect(items).toHaveLength(2);
    expect(items[1].textContent).toContain('Enabled');
    expect(items[1].querySelector('.reqore-icon')).toBeTruthy();

    fireEvent.click(items[1]);
    tick();
    expect(onToggle).toHaveBeenCalledTimes(1);
  } finally {
    vi.useRealTimers();
  }
});
