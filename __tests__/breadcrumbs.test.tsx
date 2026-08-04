import { act, fireEvent, render } from '@testing-library/react';
import { ReqoreBreadcrumbs, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

// jsdom has no layout, so `OverflowList`'s measured trail width is 0 and it
// collapses everything except the current page (minVisibleItems=1) into the "…"
// menu. The width-driven collapse across real widths — and the no-overlap
// invariant next to a right element — is covered by the Breadcrumbs stories,
// which run in a real browser. These tests cover what jsdom CAN see: the current
// page always stays a visible crumb, ancestors fold into one "…" menu, the right
// element stays in its own region, and tooltips work.

const PAGES = [
  { label: 'Page 1', icon: 'Home3Line' as const },
  { label: 'Page 2', icon: 'Home3Line' as const },
  { label: 'Page 3', icon: 'Home3Line' as const },
  { label: 'Page 4', icon: 'Home3Line' as const },
  { label: 'Page 5', icon: 'Home3Line' as const },
];

test('Renders <Breadcrumbs /> with the current page visible and ancestors folded', () => {
  act(() => {
    render(
      <div style={{ width: '1000px' }}>
        <ReqoreUIProvider>
          <ReqoreLayoutContent>
            <ReqoreBreadcrumbs items={PAGES} />
          </ReqoreLayoutContent>
        </ReqoreUIProvider>
      </div>
    );
  });

  expect(document.querySelectorAll('.reqore-breadcrumbs-wrapper').length).toBe(1);
  // The current page (last crumb) is always a standalone, visible crumb.
  expect(document.querySelectorAll('.reqore-breadcrumbs-item').length).toBe(1);
  expect(document.body.textContent).toContain('Page 5');
  // Its ancestors fold into a single "…" overflow menu.
  expect(document.querySelectorAll('.reqore-dropdown-control').length).toBe(1);
});

test('Never collapses the last (leaf) crumb away', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreBreadcrumbs
            items={[
              { label: 'Ancestor 1', icon: 'Home3Line' },
              { label: 'Ancestor 2', icon: 'Home3Line' },
              { label: 'The Current Page', icon: 'Home3Line' },
            ]}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  expect(document.querySelectorAll('.reqore-breadcrumbs-item').length).toBe(1);
  expect(document.querySelectorAll('.reqore-dropdown-control').length).toBe(1);
  expect(document.body.textContent).toContain('The Current Page');
});

test('Renders the right element in its own region, separate from the trail', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreBreadcrumbs items={PAGES} rightElement={<div>rail-actions</div>} />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  const right = document.querySelector('.reqore-breadcrumbs-right');
  expect(right).toBeTruthy();
  expect(right?.textContent).toContain('rail-actions');
  // The current page still shows next to it.
  expect(document.body.textContent).toContain('Page 5');
});

test('Tooltip on the current-page crumb works', () => {
  vi.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <ReqoreBreadcrumbs
        items={[
          { label: 'Page 1', icon: 'Home3Line' },
          { label: 'Page 2', icon: 'Home3Line' },
          { label: 'Current', icon: 'Home3Line', tooltip: 'Tooltip' },
        ]}
      />
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.mouseEnter(document.querySelectorAll('.reqore-breadcrumbs-item')[0]);
  vi.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
});
