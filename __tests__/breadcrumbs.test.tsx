import { act, fireEvent, render } from '@testing-library/react';
import { ReqoreBreadcrumbs, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

// jsdom has no layout, so `OverflowList` measures a width of 0 and collapses the
// WHOLE trail (minVisibleItems=0). That fully-collapsed shape — ONE dropdown
// LABELLED with the current page, every crumb in its menu, never an unreadable
// stub and never a bare "…" — is exactly what these tests pin down. The
// width-driven intermediate states (full trail, "… > current page") and the
// no-overlap invariant next to a right element are covered by the Breadcrumbs
// stories, which run in a real browser. The static (`responsive={false}`) trail
// is used where a test needs every crumb rendered (e.g. tooltips).

const PAGES = [
  { label: 'Page 1', icon: 'Home3Line' as const },
  { label: 'Page 2', icon: 'Home3Line' as const },
  { label: 'Page 3', icon: 'Home3Line' as const },
  { label: 'Page 4', icon: 'Home3Line' as const },
  { label: 'Page 5', icon: 'Home3Line' as const },
];

test('Collapses the whole trail into one dropdown labelled with the current page', () => {
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
  // Nothing is left as a bare crumb — the trail folded completely.
  expect(document.querySelectorAll('.reqore-breadcrumbs-item').length).toBe(0);
  // Exactly one dropdown, and it is the current-page-labelled one (not a "…").
  expect(document.querySelectorAll('.reqore-dropdown-control').length).toBe(1);
  expect(document.querySelector('.reqore-breadcrumbs-overflow-current')).toBeTruthy();
  // Labelled with the current page — always legible, never just "…".
  expect(document.body.textContent).toContain('Page 5');
});

test('Never drops the current page, however much has to collapse', () => {
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

  // The current page becomes the label of the single collapsed dropdown — it is
  // never the thing that gets hidden.
  expect(document.querySelector('.reqore-breadcrumbs-overflow-current')).toBeTruthy();
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
  // The current page is still reachable next to it.
  expect(document.body.textContent).toContain('Page 5');
});

test('Static (non-responsive) trail renders every crumb, with working tooltips', () => {
  vi.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <ReqoreBreadcrumbs
        responsive={false}
        items={[
          { label: 'Page 1', icon: 'Home3Line' },
          { label: 'Page 2', icon: 'Home3Line' },
          { label: 'Current', icon: 'Home3Line', tooltip: 'Tooltip' },
        ]}
      />
    </ReqoreUIProvider>
  );

  // No collapse in the static path — every crumb is a visible item.
  expect(document.querySelectorAll('.reqore-breadcrumbs-item').length).toBe(3);
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.mouseEnter(document.querySelectorAll('.reqore-breadcrumbs-item')[2]);
  vi.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
});
