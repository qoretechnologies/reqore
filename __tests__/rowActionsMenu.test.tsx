// Copyright 2026 Qore Technologies, s.r.o.
import { fireEvent, render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import ReqoreRowActionsMenu, { getRowActionLabel } from '../src/components/RowActionsMenu';

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
