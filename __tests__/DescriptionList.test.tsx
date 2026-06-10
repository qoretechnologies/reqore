import { render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreDescriptionList,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';

const baseItems = [
  { key: 'created', label: 'Created', content: '5/16/2026, 11:00 PM' },
  { key: 'started', label: 'Started', content: '5/16/2026, 11:00 PM' },
  { key: 'completed', label: 'Completed', content: '5/17/2026, 12:00 AM' },
];

const renderList = (
  props: Partial<React.ComponentProps<typeof ReqoreDescriptionList>> = {}
) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreDescriptionList items={baseItems} {...props} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

test('renders the root with the .reqore-description-list class hook', () => {
  renderList();
  expect(
    document.querySelectorAll('.reqore-description-list').length
  ).toBeGreaterThanOrEqual(1);
});

test('renders one row per item with the .reqore-description-list-row hook', () => {
  renderList();
  expect(
    document.querySelectorAll('.reqore-description-list-row').length
  ).toBe(baseItems.length);
});

test('renders each label inside .reqore-description-list-label', () => {
  renderList();
  const labels = Array.from(
    document.querySelectorAll('.reqore-description-list-label')
  ).map((el) => el.textContent);
  expect(labels).toEqual(
    expect.arrayContaining(['Created', 'Started', 'Completed'])
  );
});

test('renders each content cell inside .reqore-description-list-content', () => {
  renderList();
  const contents = Array.from(
    document.querySelectorAll('.reqore-description-list-content')
  ).map((el) => el.textContent);
  expect(contents).toEqual(
    expect.arrayContaining(['5/16/2026, 11:00 PM', '5/17/2026, 12:00 AM'])
  );
});

test('reserves the intent-icon gutter on every row when any row has an intent', () => {
  renderList({
    items: [
      ...baseItems,
      {
        key: 'duration',
        label: 'Duration',
        content: '1h',
        intent: 'danger' as const,
      },
    ],
  });
  // When any row carries an intent, every row reserves the icon slot
  // (hidden via visibility on non-intent rows) so the label column
  // stays flush-aligned across the list.
  expect(
    document.querySelectorAll('.reqore-description-list-intent-icon').length
  ).toBe(4);
});

test('omits the intent-icon gutter when no row has an intent', () => {
  renderList();
  expect(
    document.querySelectorAll('.reqore-description-list-intent-icon').length
  ).toBe(0);
});

test('renders a row without a label when label is omitted', () => {
  renderList({
    items: [
      { key: 'a', label: 'With label', content: '1' },
      { key: 'b', content: 'No label' },
    ],
  });
  // Two rows total, but only one label cell.
  expect(
    document.querySelectorAll('.reqore-description-list-row').length
  ).toBe(2);
  expect(
    document.querySelectorAll('.reqore-description-list-label').length
  ).toBe(1);
});

test('forwards the panel label to the wrapping ReqorePanel', () => {
  renderList({ label: 'Lifecycle' });
  // ReqorePanel's label lives outside the description list body —
  // search the whole tree, not just inside the list.
  expect(document.body.textContent).toContain('Lifecycle');
});

test('renders with each intent on the wrapping panel', () => {
  (['info', 'success', 'warning', 'danger', 'pending', 'muted'] as const).forEach(
    (intent) => {
      const { unmount } = renderList({ intent });
      expect(
        document.querySelectorAll('.reqore-description-list').length
      ).toBeGreaterThanOrEqual(1);
      unmount();
    }
  );
});

test('renders with each size without crashing', () => {
  (['tiny', 'small', 'normal', 'big'] as const).forEach((size) => {
    const { unmount } = renderList({ size });
    expect(
      document.querySelectorAll('.reqore-description-list').length
    ).toBeGreaterThanOrEqual(1);
    unmount();
  });
});

test('renders bordered (flat={false}) without crashing', () => {
  renderList({ flat: false });
  expect(
    document.querySelectorAll('.reqore-description-list').length
  ).toBeGreaterThanOrEqual(1);
});

test('renders rounded={false} without crashing', () => {
  renderList({ rounded: false });
  expect(
    document.querySelectorAll('.reqore-description-list').length
  ).toBeGreaterThanOrEqual(1);
});

test('renders transparent without crashing', () => {
  renderList({ transparent: true, flat: true });
  expect(
    document.querySelectorAll('.reqore-description-list').length
  ).toBeGreaterThanOrEqual(1);
});

test('renders raised without crashing', () => {
  renderList({ raised: true, flat: true });
  expect(
    document.querySelectorAll('.reqore-description-list').length
  ).toBeGreaterThanOrEqual(1);
});

test('honours customTheme on the wrapping panel', () => {
  renderList({ customTheme: { main: '#1c1c2b' } });
  expect(
    document.querySelectorAll('.reqore-description-list').length
  ).toBeGreaterThanOrEqual(1);
});

test('renders content effects', () => {
  renderList({
    contentEffect: {
      gradient: {
        colors: { 0: '#222', 100: '#0d0d0d' },
      },
    },
  });
  expect(
    document.querySelectorAll('.reqore-description-list').length
  ).toBeGreaterThanOrEqual(1);
});

test('renders an empty list when items is empty', () => {
  renderList({ items: [] });
  expect(
    document.querySelectorAll('.reqore-description-list-row').length
  ).toBe(0);
});

test('renders panel badge when supplied', () => {
  renderList({ label: 'Lifecycle', badge: { label: '4 events' } });
  expect(document.body.textContent).toContain('4 events');
});

test('per-row uppercaseLabel overrides the component default', () => {
  renderList({
    uppercaseLabels: false,
    items: [
      { key: 'a', label: 'Plain label', content: '1' },
      {
        key: 'b',
        label: 'Eyebrow label',
        content: '2',
        uppercaseLabel: true,
      },
    ],
  });
  // The component renders two label cells; the test guards that the
  // override codepath runs without crashing. Visual styling is the
  // CSS layer's responsibility.
  expect(
    document.querySelectorAll('.reqore-description-list-label').length
  ).toBe(2);
});
