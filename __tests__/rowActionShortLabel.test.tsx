// Copyright 2026 Qore Technologies, s.r.o.
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import {
  ReqoreContent,
  ReqoreEntityRow,
  ReqoreLayoutContent,
  ReqoreSeverityRow,
  ReqoreTable,
  ReqoreUIProvider,
} from '../src';
import { getCompactRowAction } from '../src/components/RowActionsMenu';

/*
 * A row-end action on a narrow screen uses a short label (qorus#646, David: "the button takes up too much space on
 * a narrow screen; on a narrow screen it should read 'Test'"). Where reqore draws an action compactly - the one
 * action of a narrow `narrowActions='menu'` row whose container is wider than a phone, at the end of its label's
 * line; a narrow table's folded column -
 * an action's `shortLabel` is what it says, its label its tooltip and its accessible name. With none, an action
 * that has an icon and a tooltip is its icon alone; any other says its label, as before.
 */

/*
 * Every observer reports the width it is told. Installed before the components are imported: the table's
 * `useMeasure` settles at import time on a version that measures nothing where there is no ResizeObserver.
 */
const SizedResizeObserver = vi.hoisted(() => {
  class Observer {
    static width = 900;
    constructor(readonly callback: ResizeObserverCallback) {}
    observe(target: Element) {
      const width = Observer.width;
      this.callback(
        [
          {
            target,
            contentRect: { x: 0, y: 0, top: 0, left: 0, width, height: 400, right: width },
            contentBoxSize: [{ inlineSize: width, blockSize: 400 }],
          } as unknown as ResizeObserverEntry,
        ],
        this as unknown as ResizeObserver
      );
    }
    unobserve() {}
    disconnect() {}
  }

  (globalThis as Record<string, unknown>).ResizeObserver = Observer;

  return Observer;
});

const TEST_CONNECTION = {
  label: 'Test the connection',
  shortLabel: 'Test',
  icon: 'PulseLine' as const,
};

const renderIn = (width: number, node: React.ReactNode) => {
  SizedResizeObserver.width = width;
  return render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{node}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

const actionButtons = (selector: string) =>
  Array.from(document.querySelectorAll<HTMLElement>(`${selector} .reqore-button`));

/** What a button says: its text, without the copies a long label is scrolled with (aria-hidden). */
const says = (button?: HTMLElement | null): string | undefined => {
  if (!button) {
    return undefined;
  }
  const copy = button.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
  return copy.textContent ?? '';
};

describe('getCompactRowAction', () => {
  test('a short label is what the action says, its label its tooltip and its accessible name', () => {
    expect(getCompactRowAction(TEST_CONNECTION)).toEqual({
      label: 'Test',
      tooltip: 'Test the connection',
      'aria-label': 'Test the connection',
    });
  });

  test("the action's own tooltip and accessible name stand", () => {
    expect(
      getCompactRowAction({
        ...TEST_CONNECTION,
        tooltip: 'Checks the connection',
        'aria-label': 'Test orders-db',
      })
    ).toEqual({ label: 'Test', tooltip: 'Checks the connection', 'aria-label': 'Test orders-db' });
  });

  test('without one, an action with an icon and a tooltip is its icon alone, named by its label', () => {
    expect(
      getCompactRowAction({
        label: 'Open its settings',
        icon: 'Settings3Line',
        tooltip: 'Settings',
      })
    ).toEqual({ label: undefined, tooltip: 'Settings', 'aria-label': 'Open its settings' });
  });

  test('without one, any other action says its label, as before', () => {
    // an icon but no tooltip: its label is the only words it has on a touch screen
    expect(getCompactRowAction({ label: 'Run', icon: 'PlayLine' })).toEqual({
      label: 'Run',
      tooltip: undefined,
      'aria-label': undefined,
    });
    // a tooltip but no icon: there is nothing else to draw
    expect(getCompactRowAction({ label: 'Run', tooltip: 'Runs it now' })).toEqual({
      label: 'Run',
      tooltip: 'Runs it now',
      'aria-label': undefined,
    });
    // an icon-only action is as it was
    expect(getCompactRowAction({ icon: 'DeleteBinLine', tooltip: 'Remove' })).toEqual({
      label: undefined,
      tooltip: 'Remove',
      'aria-label': undefined,
    });
  });

  test('a blank short label is none', () => {
    expect(getCompactRowAction({ label: 'Run', shortLabel: '  ', icon: 'PlayLine' }).label).toBe(
      'Run'
    );
  });
});

describe.each([
  ['ReqoreEntityRow', ReqoreEntityRow, '.reqore-entity-row', '.reqore-entity-row-actions'],
  ['ReqoreSeverityRow', ReqoreSeverityRow, '.reqore-severity-row', '.reqore-severity-row-actions'],
] as const)('%s', (_name, Row, rowSelector, actionsSelector) => {
  const renderRow = (width: number, props: Record<string, unknown>) =>
    renderIn(width, <Row label='orders-db · PostgreSQL' fluid {...(props as any)} />);

  /* As narrow as a phone (480px, measured on the row's container), the one action of a 'menu' row is not drawn
     compactly at the end of the label's line: it goes under the label, on a line of its own the row's width, and
     says its label (qorus#646, David and Foxhoundn: Fitts's law). */
  test("as narrow as a phone, with narrowActions='menu' and one action, goes under the label and says its label", () => {
    renderRow(400, { narrowActions: 'menu', actions: [TEST_CONNECTION] });

    const row = document.querySelector(rowSelector);
    expect(row?.getAttribute('data-narrow')).toBe('true');
    expect(row?.getAttribute('data-actions')).not.toBe('end');
    const [button] = actionButtons(actionsSelector);
    expect(says(button)).toBe('Test the connection');
    expect(button.getAttribute('aria-label')).toBeNull();
  });

  test('wide, says its label', () => {
    renderRow(900, { narrowActions: 'menu', actions: [TEST_CONNECTION] });

    expect(document.querySelector(rowSelector)?.getAttribute('data-narrow')).toBeNull();
    const [button] = actionButtons(actionsSelector);
    expect(says(button)).toBe('Test the connection');
    expect(button.getAttribute('aria-label')).toBeNull();
  });

  test('narrow, stacked or in a row under the label, says its label: it has a line of its own', () => {
    for (const narrowActions of ['stack', 'row'] as const) {
      const { unmount } = renderRow(400, { narrowActions, actions: [TEST_CONNECTION] });

      expect(document.querySelector(rowSelector)?.getAttribute('data-actions')).toBe(narrowActions);
      expect(says(actionButtons(actionsSelector)[0])).toBe('Test the connection');
      unmount();
    }
  });
});

/* Narrow but wider than a phone - only a severity row, narrow below 640px, is - the one action of a 'menu' row
   stays at the end of the label's line, where the menu would be, and is drawn compactly there. */
describe('ReqoreSeverityRow wider than a phone', () => {
  const renderRow = (props: Record<string, unknown>) =>
    renderIn(560, <ReqoreSeverityRow label='orders-db · PostgreSQL' fluid {...(props as any)} />);

  test("with narrowActions='menu' and one action, says its short label at the end of the label's line", () => {
    renderRow({ narrowActions: 'menu', actions: [TEST_CONNECTION] });

    const row = document.querySelector('.reqore-severity-row');
    expect(row?.getAttribute('data-narrow')).toBe('true');
    expect(row?.getAttribute('data-actions')).toBe('end');
    const [button] = actionButtons('.reqore-severity-row-actions');
    expect(says(button)).toBe('Test');
    expect(button.getAttribute('aria-label')).toBe('Test the connection');
    // the short label is the row's to read, not an attribute of the button
    expect(button.outerHTML.toLowerCase()).not.toContain('shortlabel');
  });

  test('with no short label, at the end of the line: its icon alone when it has a tooltip, else its label', () => {
    const { unmount } = renderRow({
      narrowActions: 'menu',
      actions: [{ label: 'Open its settings', icon: 'Settings3Line', tooltip: 'Settings' }],
    });
    const [iconOnly] = actionButtons('.reqore-severity-row-actions');
    expect(says(iconOnly)).toBe('');
    expect(iconOnly.getAttribute('aria-label')).toBe('Open its settings');
    unmount();

    renderRow({ narrowActions: 'menu', actions: [{ label: 'Run', icon: 'PlayLine' }] });
    expect(says(actionButtons('.reqore-severity-row-actions')[0])).toBe('Run');
  });
});

describe("a narrow table's folded column", () => {
  const renderTable = (width: number, action: Record<string, unknown>) =>
    act(() => {
      renderIn(
        width,
        <ReqoreTable
          columns={[
            { dataId: 'name', header: { label: 'Name' }, width: 200 },
            {
              dataId: 'actions',
              header: { label: 'Actions' },
              cell: { actions: () => [action as any] },
            },
          ]}
          data={[{ name: 'orders-db' }]}
          fill
        />
      );
    });

  const cellButton = () =>
    document.querySelector<HTMLElement>(
      '.reqore-table-row [data-reqore-table-column-id="actions"] .reqore-button'
    );

  test('says the short label of an action that has no icon', () => {
    renderTable(400, { label: 'Test the connection', shortLabel: 'Test' });

    expect(says(cellButton())).toBe('Test');
    expect(cellButton()?.getAttribute('aria-label')).toBe('Test the connection');
    expect(cellButton()?.outerHTML.toLowerCase()).not.toContain('shortlabel');
  });

  test('keeps an action with an icon its icon alone, as before', () => {
    renderTable(400, TEST_CONNECTION);

    expect(says(cellButton())).toBe('');
    expect(cellButton()?.getAttribute('aria-label')).toBe('Test the connection');
  });

  test('wide, says the label', () => {
    renderTable(900, { label: 'Test the connection', shortLabel: 'Test' });

    expect(says(cellButton())).toBe('Test the connection');
  });
});
