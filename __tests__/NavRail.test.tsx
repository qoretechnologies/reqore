import { fireEvent, render, screen } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreNavRail,
  ReqoreUIProvider,
} from '../src';
import { IReqoreNavRailItem } from '../src/components/NavRail';

const ITEMS: IReqoreNavRailItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'DashboardLine',
    items: [
      { id: 'overview', label: 'Overview', icon: 'InformationLine' },
      { id: 'activity', label: 'Activity', icon: 'RhythmLine' },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    icon: 'GroupLine',
    items: [{ id: 'members', label: 'Members', icon: 'User3Line' }],
  },
  { id: 'settings', label: 'Settings', icon: 'Settings3Line' },
];

const renderRail = (ui: React.ReactElement) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{ui}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

beforeAll(() => {
  // jsdom has no layout engine; the scroll helper must not throw.
  Element.prototype.scrollIntoView = vi.fn();
});

test('Renders <NavRail /> with the primary marks', () => {
  renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' />);

  expect(document.querySelectorAll('.reqore-nav-rail').length).toBe(1);
  expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Team' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
});

test('Nests the active item’s sections in a distinct sub-capsule', () => {
  renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' />);

  expect(screen.getByRole('group', { name: 'Dashboard sections' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Activity' })).toBeInTheDocument();
});

test('Navigating a primary item swaps the sub-capsule and fires onItemClick', () => {
  const onItemClick = vi.fn();
  renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' onItemClick={onItemClick} />);

  fireEvent.click(screen.getByRole('button', { name: 'Team' }));

  expect(onItemClick).toHaveBeenCalledWith('team', expect.objectContaining({ id: 'team' }));
  expect(screen.getByRole('group', { name: 'Team sections' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Members' })).toBeInTheDocument();
});

test('Selecting a sub-item fires onSubClick', () => {
  const onSubClick = vi.fn();
  renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' onSubClick={onSubClick} />);

  fireEvent.click(screen.getByRole('button', { name: 'Activity' }));

  expect(onSubClick).toHaveBeenCalledWith('activity', expect.objectContaining({ id: 'activity' }));
});

test('Honours a controlled activeId', () => {
  renderRail(<ReqoreNavRail items={ITEMS} activeId='team' />);

  expect(screen.getByRole('group', { name: 'Team sections' })).toBeInTheDocument();
  expect(screen.queryByRole('group', { name: 'Dashboard sections' })).not.toBeInTheDocument();
});

test('Renders with the standard prop contract (size/intent/effect/flat/raised/radiusSize)', () => {
  renderRail(
    <ReqoreNavRail
      items={ITEMS}
      defaultActiveId='dashboard'
      size='big'
      intent='success'
      flat
      raised
      radiusSize='small'
      padded='small'
      effect={{ gradient: { colors: { 0: '#222222', 100: '#000000' } } }}
    />
  );

  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Dashboard sections' })).toBeInTheDocument();
});

test('maxItems caps the visible primary marks and folds the rest into the ⋮ menu', () => {
  renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' maxItems={2} />);

  // Only the first two marks show; the third folds away behind the overflow.
  expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Team' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'More items' })).toBeInTheDocument();
});

test('maxItems keeps the active mark visible by windowing around it', () => {
  // Active 'settings' (index 2) is outside the first two — the window slides so
  // it stays visible and an earlier mark folds away instead.
  renderRail(<ReqoreNavRail items={ITEMS} activeId='settings' maxItems={2} />);

  expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Dashboard' })).not.toBeInTheDocument();
});

test('Clicking a sub-item with a scrollTargetId scrolls to that element', () => {
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  const items: IReqoreNavRailItem[] = [
    {
      id: 'a',
      label: 'A',
      icon: 'DashboardLine',
      items: [{ id: 's1', label: 'Section one', icon: 'InformationLine', scrollTargetId: 'target-s1' }],
    },
  ];

  renderRail(
    <>
      <div id='target-s1'>target</div>
      <ReqoreNavRail items={items} defaultActiveId='a' />
    </>
  );

  fireEvent.click(screen.getByRole('button', { name: 'Section one' }));

  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
});
