import { cleanup, fireEvent, render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreSeverityRow,
  ReqoreTag,
  ReqoreUIProvider,
} from '../src';

test('Renders <SeverityRow /> with label', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Critical issue' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
  expect(document.querySelector('.reqore-severity-row-label')!.textContent).toContain(
    'Critical issue'
  );
});

test('Renders <SeverityRow /> with description', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Issue' description='Threshold exceeded' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-severity-row-description')!.textContent).toBe(
    'Threshold exceeded'
  );
});

test('Renders <SeverityRow /> with strip by default', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Issue' intent='danger' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row-strip').length).toBe(1);
});

test('Hides strip when showStrip is false', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Issue' intent='danger' showStrip={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row-strip').length).toBe(0);
});

test('Renders <SeverityRow /> with leading content', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow
            label='Issue'
            leading={<ReqoreTag size='tiny' label='Critical' />}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-severity-row-label')!.textContent).toContain('Critical');
});

test('Renders <SeverityRow /> with badge (string)', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Issue' badge='3 open' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-button-badge')!.textContent).toContain('3 open');
});

test('Renders <SeverityRow /> with badge array', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow
            label='Issue'
            badge={[3, { label: 'mad', intent: 'danger' }]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-button-badge').length).toBe(2);
});

test('Renders <SeverityRow /> with actions', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow
            label='Issue'
            actions={[{ label: 'Investigate' }, { icon: 'CloseLine' }]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row-actions').length).toBe(1);
  expect(document.querySelector('.reqore-severity-row-actions')!.textContent).toContain(
    'Investigate'
  );
});

test('Calls onClick when row is clicked', () => {
  const handleClick = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Issue' onClick={handleClick} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-severity-row')!);
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('Clicking an action does not also fire the row onClick', () => {
  const handleRowClick = vi.fn();
  const handleActionClick = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow
            label='Issue'
            onClick={handleRowClick}
            actions={[{ icon: 'ArrowDownSLine', onClick: handleActionClick }]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-severity-row-actions .reqore-button')!);

  // The action runs exactly once and the row underneath it does not run at
  // all. Both firing is what made a caret that toggled the same state as the
  // row look dead: two toggles, no net change.
  expect(handleActionClick).toHaveBeenCalledTimes(1);
  expect(handleRowClick).not.toHaveBeenCalled();
});

test('Clicking an action with no handler of its own does not fire the row onClick', () => {
  const handleRowClick = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Issue' onClick={handleRowClick} actions={[{ label: 'Inert' }]} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-severity-row-actions .reqore-button')!);
  expect(handleRowClick).not.toHaveBeenCalled();
});

test('Clicking the row body still fires onClick when actions are present', () => {
  const handleRowClick = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow
            label='Issue'
            onClick={handleRowClick}
            actions={[{ label: 'Investigate' }]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-severity-row-body')!);
  expect(handleRowClick).toHaveBeenCalledTimes(1);
});

test('Renders <SeverityRow /> with intents', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Info' intent='info' />
          <ReqoreSeverityRow label='Success' intent='success' />
          <ReqoreSeverityRow label='Warning' intent='warning' />
          <ReqoreSeverityRow label='Danger' intent='danger' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(4);
});

test('Renders <SeverityRow /> with different sizes', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Tiny' size='tiny' />
          <ReqoreSeverityRow label='Small' size='small' />
          <ReqoreSeverityRow label='Normal' size='normal' />
          <ReqoreSeverityRow label='Big' size='big' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(4);
});

test('Renders <SeverityRow /> bordered with flat={false}', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Bordered' intent='warning' flat={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
});

test('Renders <SeverityRow /> with rounded={false}', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Square' intent='info' rounded={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
});

test('Renders <SeverityRow /> with transparent background', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Transparent' intent='info' transparent />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
});

test('Renders <SeverityRow /> with effect/labelEffect/descriptionEffect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow
            label='With effects'
            description='Has description effect'
            intent='info'
            effect={{
              gradient: {
                colors: { 0: 'info:darken:5', 100: 'transparent' },
              },
            }}
            labelEffect={{ weight: 'bold', uppercase: true }}
            descriptionEffect={{ italic: true }}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
  expect(document.querySelectorAll('.reqore-severity-row-description').length).toBe(1);
});

test('Renders <SeverityRow /> disabled', () => {
  const handleClick = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Disabled' disabled onClick={handleClick} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
});

test('Does not render description when not provided', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Issue' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row-description').length).toBe(0);
});

test('Does not render actions when not provided', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Issue' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row-actions').length).toBe(0);
});

test('Renders <SeverityRow /> with wrap=false (single-line ellipsis)', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow
            label='Issue'
            description='Very long description that should ellipsize when wrap is false'
            wrap={false}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row-description').length).toBe(1);
});

test('Renders <SeverityRow /> with wrap=true by default', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Issue' description='wraps by default' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row-description').length).toBe(1);
});

test('Renders <SeverityRow /> with raised effect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Raised' raised />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
});

test('Renders <SeverityRow /> with padded=false', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Unpadded' padded={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
});

test('Renders <SeverityRow /> with padded="horizontal"', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Horizontal' padded='horizontal' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
});

test('Renders <SeverityRow /> with padded="vertical"', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Vertical' padded='vertical' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
});

test('Renders <SeverityRow /> with custom paddingSize', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Big size, small padding' size='big' paddingSize='small' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
});

/*
 * Narrow (below 640px of its own container), two or more actions are one menu button (qorus#646).
 */

class RowResizeObserver {
  static width = 400;
  readonly disconnect = vi.fn();
  constructor(readonly callback: ResizeObserverCallback) {}
  observe(target: Element) {
    this.callback(
      [{ target, contentRect: { width: RowResizeObserver.width } } as ResizeObserverEntry],
      this as unknown as ResizeObserver
    );
  }
}

const renderMeasured = (width: number, props: Record<string, unknown>) => {
  const original = globalThis.ResizeObserver;
  RowResizeObserver.width = width;
  (globalThis as Record<string, unknown>).ResizeObserver = RowResizeObserver;
  try {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreSeverityRow label='Issue' {...props} />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  } finally {
    globalThis.ResizeObserver = original;
  }
};

const TWO_ACTIONS = [{ label: 'Investigate' }, { icon: 'CloseLine', tooltip: 'Dismiss' }];

test('Folds two or more actions into one menu button below 640px of its container, with narrowActions="menu"', () => {
  renderMeasured(600, { actions: TWO_ACTIONS, narrowActions: 'menu' });

  const row = document.querySelector('.reqore-severity-row')!;
  expect(row.getAttribute('data-narrow')).toBe('true');
  expect(row.getAttribute('data-actions')).toBe('menu');
  const buttons = row.querySelectorAll('.reqore-severity-row-actions .reqore-button');
  expect(buttons).toHaveLength(1);
  expect(buttons[0].classList.contains('reqore-row-actions-menu-button')).toBe(true);
  expect(buttons[0].getAttribute('aria-label')).toBe('Actions: Issue');
});

test('Keeps a callout\'s actions in sight, stacked, by default and with narrowActions="stack"', () => {
  for (const props of [{}, { narrowActions: 'stack' as const }]) {
    renderMeasured(600, { actions: TWO_ACTIONS, ...props });

    const row = document.querySelector('.reqore-severity-row')!;
    expect(row.getAttribute('data-actions')).toBe('stack');
    expect(document.querySelectorAll('.reqore-row-actions-menu-button')).toHaveLength(0);
    expect(row.querySelectorAll('.reqore-severity-row-actions .reqore-button')).toHaveLength(2);
    cleanup();
  }
});

test('Keeps every action inline in a wide container, and a single one a button when narrow', () => {
  renderMeasured(800, { actions: TWO_ACTIONS });
  expect(document.querySelectorAll('.reqore-row-actions-menu-button')).toHaveLength(0);
  expect(document.querySelectorAll('.reqore-severity-row-actions .reqore-button')).toHaveLength(2);
  cleanup();

  renderMeasured(400, { actions: [{ label: 'Investigate' }] });
  expect(document.querySelectorAll('.reqore-row-actions-menu-button')).toHaveLength(0);
});

test('With narrowActions="menu", keeps one action a button at the end of the label\'s line (data-actions="end")', () => {
  renderMeasured(600, { actions: [{ label: 'Investigate' }], narrowActions: 'menu' });

  const row = document.querySelector('.reqore-severity-row')!;
  expect(row.getAttribute('data-narrow')).toBe('true');
  expect(row.getAttribute('data-actions')).toBe('end');
  const buttons = row.querySelectorAll('.reqore-severity-row-actions .reqore-button');
  expect(buttons).toHaveLength(1);
  expect(buttons[0].classList.contains('reqore-row-actions-menu-button')).toBe(false);
  expect(buttons[0].textContent).toContain('Investigate');
  cleanup();

  // an icon-only action stays its icon, as at full width and as the menu button is: it is not stacked, so its
  // tooltip is not written out as its label
  renderMeasured(400, {
    actions: [{ icon: 'CloseLine', tooltip: 'Dismiss' }],
    narrowActions: 'menu',
  });
  const iconOnly = document.querySelector('.reqore-severity-row')!;
  expect(iconOnly.getAttribute('data-actions')).toBe('end');
  expect(
    iconOnly.querySelector('.reqore-severity-row-actions .reqore-button')?.textContent
  ).not.toContain('Dismiss');
});

test('Leaves one action as it was by default, with "stack" and with "row", and wide with "menu"', () => {
  for (const [props, expected] of [
    [{}, 'stack'],
    [{ narrowActions: 'stack' as const }, 'stack'],
    [{ narrowActions: 'row' as const }, 'row'],
  ] as const) {
    renderMeasured(600, { actions: [{ icon: 'CloseLine', tooltip: 'Dismiss' }], ...props });
    const row = document.querySelector('.reqore-severity-row')!;
    expect(row.getAttribute('data-actions')).toBe(expected);
    cleanup();
  }

  renderMeasured(800, { actions: [{ label: 'Investigate' }], narrowActions: 'menu' });
  const wide = document.querySelector('.reqore-severity-row')!;
  expect(wide.getAttribute('data-narrow')).toBeNull();
  expect(wide.getAttribute('data-actions')).toBeNull();
});

test('Stacked, labels an action whose label is empty with its tooltip', () => {
  renderMeasured(400, {
    actions: [{ label: 'Investigate' }, { label: '', icon: 'CloseLine', tooltip: 'Dismiss' }],
  });

  const buttons = document.querySelectorAll('.reqore-severity-row-actions .reqore-button');
  expect(buttons).toHaveLength(2);
  expect(buttons[1].textContent).toContain('Dismiss');
});
