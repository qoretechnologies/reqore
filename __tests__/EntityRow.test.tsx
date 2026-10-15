import { act, cleanup, fireEvent, render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreEntityRow,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';

test('Renders <EntityRow /> with label', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Process Incoming Order' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row').length).toBe(1);
  expect(document.querySelector('.reqore-entity-row-label')!.textContent).toContain(
    'Process Incoming Order'
  );
});

test('Renders <EntityRow /> with description and metadata', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow
            label='Process Incoming Order'
            description='Routes Shopify orders'
            metadata='Last run: success · just now'
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-entity-row-description')!.textContent).toBe(
    'Routes Shopify orders'
  );
  expect(document.querySelector('.reqore-entity-row-metadata')!.textContent).toBe(
    'Last run: success · just now'
  );
});

test('Renders <EntityRow /> with icon tile', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Issue' icon='PlayCircleLine' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row-icon-tile').length).toBe(1);
});

test('Does not render icon tile without icon or image', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Title only' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row-icon-tile').length).toBe(0);
});

test('Renders <EntityRow /> with badge (object)', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow
            label='Reconcile Payments'
            badge={{ label: 'Failed', intent: 'danger' }}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-entity-row-label')!.textContent).toContain('Failed');
});

test('Renders <EntityRow /> with badge array', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow
            label='Process Order'
            badge={['v2', { label: 'on-demand', intent: 'info' }]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-button-badge').length).toBe(2);
});

test('Renders <EntityRow /> with actions', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Qog' actions={[{ label: 'Run' }]} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row-actions').length).toBe(1);
  expect(document.querySelector('.reqore-entity-row-actions')!.textContent).toContain('Run');
});

test('Calls onClick when row is clicked', () => {
  const handleClick = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Qog' onClick={handleClick} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-entity-row')!);
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('Renders <EntityRow /> with intents', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Info' icon='InformationLine' intent='info' />
          <ReqoreEntityRow label='Success' icon='CheckLine' intent='success' />
          <ReqoreEntityRow label='Warning' icon='AlertLine' intent='warning' />
          <ReqoreEntityRow label='Danger' icon='ErrorWarningLine' intent='danger' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row').length).toBe(4);
});

test('Renders <EntityRow /> with different sizes', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Tiny' size='tiny' />
          <ReqoreEntityRow label='Small' size='small' />
          <ReqoreEntityRow label='Normal' size='normal' />
          <ReqoreEntityRow label='Big' size='big' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row').length).toBe(4);
});

test('Renders <EntityRow /> bordered with flat={false}', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Bordered' intent='info' flat={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row').length).toBe(1);
});

test('Renders <EntityRow /> with rounded={false}', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Square' intent='success' rounded={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row').length).toBe(1);
});

test('Renders <EntityRow /> with transparent background', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Transparent' intent='info' transparent />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row').length).toBe(1);
});

test('Renders <EntityRow /> with effect / labelEffect / descriptionEffect / metadataEffect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow
            label='With effects'
            description='Description'
            metadata='Metadata'
            icon='SparklingLine'
            intent='info'
            effect={{
              gradient: {
                colors: { 0: 'info:darken:5', 100: 'transparent' },
              },
            }}
            labelEffect={{ weight: 'bold', uppercase: true }}
            descriptionEffect={{ italic: true }}
            metadataEffect={{ uppercase: true }}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row').length).toBe(1);
  expect(document.querySelectorAll('.reqore-entity-row-description').length).toBe(1);
  expect(document.querySelectorAll('.reqore-entity-row-metadata').length).toBe(1);
});

test('Renders <EntityRow /> with iconImage', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Stripe' iconImage='https://stripe.com/img/v3/home/social.png' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row-icon-tile').length).toBe(1);
});

test('Does not render description/metadata when not provided', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Title' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row-description').length).toBe(0);
  expect(document.querySelectorAll('.reqore-entity-row-metadata').length).toBe(0);
});

test('Renders <EntityRow /> with wrap=false (single-line ellipsis)', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow
            label='Title'
            description='Very long description that should ellipsize when wrap is false'
            metadata='Long metadata too'
            wrap={false}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row-description').length).toBe(1);
  expect(document.querySelectorAll('.reqore-entity-row-metadata').length).toBe(1);
});

test('Renders <EntityRow /> with wrap=true by default', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Title' description='wraps by default' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row-description').length).toBe(1);
});

test('Hides the icon tile by default when transparent', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Transparent' icon='PlayCircleLine' transparent />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // No tinted tile in transparent mode by default
  expect(document.querySelectorAll('.reqore-entity-row-icon-tile').length).toBe(0);
  // Bare icon is still rendered
  expect(document.querySelectorAll('.reqore-entity-row-icon').length).toBe(1);
});

test('Shows the icon tile on a transparent row when iconHasBackground={true}', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow
            label='Transparent + tile'
            icon='PlayCircleLine'
            transparent
            iconHasBackground
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row-icon-tile').length).toBe(1);
});

test('Renders <EntityRow /> with iconHasBackground=false (bare icon, no tile)', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Bare' icon='PlayCircleLine' iconHasBackground={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row-icon-tile').length).toBe(0);
  expect(document.querySelectorAll('.reqore-entity-row-icon').length).toBe(1);
});

test('Renders <EntityRow /> with padded=false', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Unpadded' padded={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row').length).toBe(1);
});

test('Renders <EntityRow /> with padded="horizontal"', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Horizontal only' padded='horizontal' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row').length).toBe(1);
});

test('Renders <EntityRow /> with padded="vertical"', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Vertical only' padded='vertical' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row').length).toBe(1);
});

test('Renders <EntityRow /> with custom paddingSize', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Big content, small padding' size='big' paddingSize='small' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row').length).toBe(1);
});

test('Renders <EntityRow /> with iconHasBackground=true by default (tile shown)', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Tiled' icon='PlayCircleLine' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row-icon-tile').length).toBe(1);
});

test('Renders <EntityRow /> with raised effect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Raised' raised />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-entity-row').length).toBe(1);
});

test('Renders an action with sub-actions as an overflow menu, not a button', () => {
  const onRowClick = vi.fn();
  const onShowInChat = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow
            label='order-sync:1.0'
            onClick={onRowClick}
            actions={[
              {
                icon: 'More2Line',
                actions: [
                  { label: 'Show in chat', onClick: onShowInChat },
                  { label: 'Hidden entry', show: false },
                ],
              },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // closed menu: the items do not exist yet
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(0);

  fireEvent.click(document.querySelector('.reqore-entity-row-actions .reqore-button')!);

  // `show: false` entries are dropped, so only the one item is offered
  const items = document.querySelectorAll('.reqore-menu-item');
  expect(items.length).toBe(1);
  expect(items[0].textContent).toContain('Show in chat');

  // opening the menu must not also trigger the (clickable) row
  expect(onRowClick).not.toHaveBeenCalled();

  fireEvent.click(items[0]);
  expect(onShowInChat).toHaveBeenCalledTimes(1);
});

/*
 * An action lives INSIDE a row that is commonly clickable itself, so without a
 * guard both handlers run. Where the two do the same thing — the "row and its
 * caret toggle one disclosure" shape — they cancel and the action reads as dead.
 * Matches ReqoreSeverityRow.
 */

const renderRowWithActions = (props: Record<string, unknown>) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEntityRow label='Process Incoming Order' {...props} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const firstActionButton = () =>
  document.querySelector('.reqore-entity-row-actions .reqore-button') as HTMLElement;

test('Clicking an action does not also fire the row onClick', () => {
  const handleRowClick = vi.fn();
  const handleActionClick = vi.fn();

  renderRowWithActions({
    onClick: handleRowClick,
    actions: [{ icon: 'ArrowDownSLine', onClick: handleActionClick }],
  });

  fireEvent.click(firstActionButton());

  // The action runs exactly once and the row underneath does not run at all.
  expect(handleActionClick).toHaveBeenCalledTimes(1);
  expect(handleRowClick).not.toHaveBeenCalled();
});

test('Clicking an action with no handler of its own does not fire the row onClick', () => {
  const handleRowClick = vi.fn();

  renderRowWithActions({ onClick: handleRowClick, actions: [{ label: 'Inert' }] });
  fireEvent.click(firstActionButton());

  // An action button is a control: a click landing on one never reads as a click
  // on the row, even when the action does nothing itself.
  expect(handleRowClick).not.toHaveBeenCalled();
});

test('Clicking a sub-action menu does not fire the row onClick', () => {
  const handleRowClick = vi.fn();

  renderRowWithActions({
    onClick: handleRowClick,
    actions: [{ label: 'Menu', actions: [{ label: 'One' }] }],
  });
  fireEvent.click(firstActionButton());

  expect(handleRowClick).not.toHaveBeenCalled();
});

/*
 * Narrow containers. The row measures its own wrapper, not the viewport, so a
 * narrow drawer on a wide screen wraps its actions under the label.
 */

class NarrowResizeObserver {
  static width = 400;
  readonly disconnect = vi.fn();
  constructor(readonly callback: ResizeObserverCallback) {}
  observe(target: Element) {
    this.callback(
      [{ target, contentRect: { width: NarrowResizeObserver.width } } as ResizeObserverEntry],
      this as unknown as ResizeObserver
    );
  }
}

const withResizeObserver = (impl: unknown, run: () => void) => {
  const original = globalThis.ResizeObserver;
  (globalThis as Record<string, unknown>).ResizeObserver = impl;
  try {
    run();
  } finally {
    globalThis.ResizeObserver = original;
  }
};

test('Wraps its actions under the label in a narrow container', () => {
  withResizeObserver(NarrowResizeObserver, () => {
    NarrowResizeObserver.width = 400;
    renderRowWithActions({ actions: [{ label: 'Investigate' }] });

    // The attribute is the whole mechanism: an attribute selector on the row
    // rewrites the grid so the actions take their own row.
    expect(document.querySelector('.reqore-entity-row')!.getAttribute('data-narrow')).toBe('true');
  });
});

test('Keeps its actions beside the label in a wide container', () => {
  withResizeObserver(NarrowResizeObserver, () => {
    NarrowResizeObserver.width = 900;
    renderRowWithActions({ actions: [{ label: 'Investigate' }] });

    expect(document.querySelector('.reqore-entity-row')!.getAttribute('data-narrow')).toBeNull();
  });
});

test('Renders without a ResizeObserver implementation', () => {
  const original = globalThis.ResizeObserver;
  // Deliberately removed to exercise the guard.
  delete (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;

  try {
    renderRowWithActions({ actions: [{ label: 'Investigate' }] });

    // Degrades to the wide layout rather than guessing.
    expect(document.querySelectorAll('.reqore-entity-row').length).toBe(1);
    expect(document.querySelector('.reqore-entity-row')!.getAttribute('data-narrow')).toBeNull();
  } finally {
    globalThis.ResizeObserver = original;
  }
});

/*
 * Narrow, two or more actions are one menu button (qorus#646): the label keeps the row's width.
 */

const menuButtons = () => document.querySelectorAll('.reqore-row-actions-menu-button');

test('Folds two or more actions into one menu button in a narrow container', () => {
  withResizeObserver(NarrowResizeObserver, () => {
    NarrowResizeObserver.width = 400;
    renderRowWithActions({ actions: [{ label: 'Run' }, { icon: 'DeleteBinLine', tooltip: 'Remove' }] });

    const row = document.querySelector('.reqore-entity-row')!;
    expect(row.getAttribute('data-actions')).toBe('menu');
    expect(menuButtons()).toHaveLength(1);
    expect(menuButtons()[0].getAttribute('aria-label')).toBe('Actions: Process Incoming Order');
    expect(row.querySelectorAll('.reqore-entity-row-actions .reqore-button')).toHaveLength(1);
  });
});

test('Names the menu button with actionsMenuLabel', () => {
  withResizeObserver(NarrowResizeObserver, () => {
    NarrowResizeObserver.width = 400;
    renderRowWithActions({
      actionsMenuLabel: 'Akce',
      actions: [{ label: 'Run' }, { label: 'Stop' }],
    });

    expect(menuButtons()[0].getAttribute('aria-label')).toBe('Akce: Process Incoming Order');
  });
});

test('Names the menu button for a row whose label is words, and "Actions" for one that is not', () => {
  withResizeObserver(NarrowResizeObserver, () => {
    NarrowResizeObserver.width = 400;
    renderRowWithActions({
      label: <b>Process Incoming Order</b>,
      actions: [{ label: 'Run' }, { label: 'Stop' }],
    });

    expect(menuButtons()[0].getAttribute('aria-label')).toBe('Actions');
  });
});

test('Folded, each action keeps its own accessible name', () => {
  vi.useFakeTimers();
  try {
    withResizeObserver(NarrowResizeObserver, () => {
      NarrowResizeObserver.width = 400;
      renderRowWithActions({
        actions: [
          { label: 'Run', 'aria-label': 'Run Process Incoming Order' },
          {
            icon: 'DeleteBinLine',
            tooltip: 'Remove',
            'aria-label': 'Remove Process Incoming Order',
          },
        ],
      });
    });
    fireEvent.click(menuButtons()[0]);
    act(() => {
      vi.advanceTimersByTime(1);
    });

    const items = Array.from(
      document.querySelectorAll('.reqore-popover-content [role="menuitem"]')
    ).map((item) => item.getAttribute('aria-label'));
    expect(items).toEqual(['Run Process Incoming Order', 'Remove Process Incoming Order']);
  } finally {
    vi.useRealTimers();
  }
});

test('Keeps the actions in sight, stacked, with narrowActions="stack"', () => {
  withResizeObserver(NarrowResizeObserver, () => {
    NarrowResizeObserver.width = 400;
    renderRowWithActions({ narrowActions: 'stack', actions: [{ label: 'Run' }, { label: 'Stop' }] });

    const row = document.querySelector('.reqore-entity-row')!;
    expect(row.getAttribute('data-narrow')).toBe('true');
    expect(row.getAttribute('data-actions')).toBeNull();
    expect(menuButtons()).toHaveLength(0);
    expect(row.querySelectorAll('.reqore-entity-row-actions .reqore-button')).toHaveLength(2);
  });
});

test('Stacked, labels an icon-only action that is a menu with its tooltip', () => {
  withResizeObserver(NarrowResizeObserver, () => {
    NarrowResizeObserver.width = 400;
    renderRowWithActions({
      narrowActions: 'stack',
      actions: [
        { label: 'Run' },
        { icon: 'More2Line', tooltip: 'More actions', actions: [{ label: 'Show in chat' }] },
      ],
    });

    const [, more] = Array.from(
      document.querySelector('.reqore-entity-row-actions')!.children
    ) as HTMLElement[];
    expect(more.textContent).toContain('More actions');
  });
});

test('Keeps a single action a button when narrow, and every action inline when wide', () => {
  withResizeObserver(NarrowResizeObserver, () => {
    NarrowResizeObserver.width = 400;
    renderRowWithActions({ actions: [{ label: 'Run' }] });
    expect(menuButtons()).toHaveLength(0);
    cleanup();

    NarrowResizeObserver.width = 900;
    renderRowWithActions({ actions: [{ label: 'Run' }, { label: 'Stop' }] });
    expect(menuButtons()).toHaveLength(0);
    expect(document.querySelectorAll('.reqore-entity-row-actions .reqore-button')).toHaveLength(2);
  });
});

test('Stacked, labels an action whose label is empty with its tooltip, a menu too', () => {
  withResizeObserver(NarrowResizeObserver, () => {
    NarrowResizeObserver.width = 400;
    renderRowWithActions({
      narrowActions: 'stack',
      actions: [
        { label: '', icon: 'DeleteBinLine', tooltip: 'Remove' },
        {
          label: '',
          icon: 'More2Line',
          tooltip: 'More actions',
          actions: [{ label: 'Show in chat' }],
        },
      ],
    });

    const [remove, more] = Array.from(
      document.querySelector('.reqore-entity-row-actions')!.children
    ) as HTMLElement[];
    expect(remove.textContent).toContain('Remove');
    expect(more.textContent).toContain('More actions');
  });
});
