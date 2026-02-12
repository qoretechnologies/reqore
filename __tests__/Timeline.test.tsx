import { fireEvent, render, screen } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreTimeline,
  ReqoreUIProvider,
} from '../src';

test('Renders <Timeline /> with items properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            items={[
              { title: 'First', content: 'First content' },
              { title: 'Second', content: 'Second content' },
              { title: 'Third', content: 'Third content' },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-timeline').length).toBe(1);
  expect(document.querySelectorAll('.reqore-timeline-item').length).toBe(3);
});

test('Renders <Timeline /> with icons properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            items={[
              { title: 'First', icon: 'StarLine' },
              { title: 'Second', icon: 'HeartLine' },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-icon').length).toBe(2);
});

test('Renders <Timeline /> with title and content using ReqoreSpan and ReqoreP', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            items={[{ title: 'My Title', content: 'My Content' }]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(screen.getByText('My Title')).toBeTruthy();
  expect(screen.getByText('My Content')).toBeTruthy();
  expect(document.querySelectorAll('.reqore-timeline-title').length).toBe(1);
  expect(document.querySelectorAll('.reqore-timeline-content').length).toBe(1);
});

test('Renders <Timeline /> with timestamp', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            items={[{ title: 'Event', timestamp: 'Jan 1, 2024' }]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(screen.getByText('Jan 1, 2024')).toBeTruthy();
  expect(document.querySelectorAll('.reqore-timeline-timestamp').length).toBe(1);
});

test('Renders <Timeline /> with relative time via TimeAgo', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            items={[
              {
                title: 'Recent event',
                timestamp: Date.now() - 1000 * 60 * 5,
                relativeTime: true,
              },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-timeline-timestamp').length).toBe(1);
  // TimeAgo should render something like "5 minutes ago"
  const timestamp = document.querySelector('.reqore-timeline-timestamp');
  expect(timestamp?.textContent).toBeTruthy();
});

test('Renders <Timeline /> with different sizes', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            size="small"
            items={[{ title: 'Small timeline item' }]}
          />
          <ReqoreTimeline
            size="big"
            items={[{ title: 'Big timeline item' }]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-timeline').length).toBe(2);
});

test('Renders <Timeline /> with intent', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            intent="success"
            items={[
              { title: 'Success item' },
              { title: 'Another item' },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-timeline-item').length).toBe(2);
});

test('Renders <Timeline /> with item-level intents', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            items={[
              { title: 'Info', intent: 'info' },
              { title: 'Success', intent: 'success' },
              { title: 'Warning', intent: 'warning' },
              { title: 'Danger', intent: 'danger' },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-timeline-item').length).toBe(4);
});

test('Handles onClick on timeline items', () => {
  const onClick = jest.fn();
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            items={[{ title: 'Clickable', onClick }]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-timeline-item')!);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('Does not call onClick when item is disabled', () => {
  const onClick = jest.fn();
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            items={[{ title: 'Disabled', onClick, disabled: true }]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-timeline-item')!);
  expect(onClick).not.toHaveBeenCalled();
});

test('Handles keyboard interaction on clickable items', () => {
  const onClick = jest.fn();
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            items={[{ title: 'Clickable', onClick }]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const item = document.querySelector('.reqore-timeline-item')!;
  fireEvent.keyDown(item, { key: 'Enter' });
  expect(onClick).toHaveBeenCalledTimes(1);

  fireEvent.keyDown(item, { key: ' ' });
  expect(onClick).toHaveBeenCalledTimes(2);
});

test('Renders <Timeline /> with fluid prop', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            fluid
            items={[{ title: 'Fluid item' }]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-timeline').length).toBe(1);
});

test('Renders <Timeline /> with single item (no trailing line)', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            items={[{ title: 'Only item' }]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-timeline-item').length).toBe(1);
});

test('Renders <Timeline /> without icons (uses dots)', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            items={[
              { title: 'No icon 1' },
              { title: 'No icon 2' },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-icon').length).toBe(0);
  expect(document.querySelectorAll('.reqore-timeline-item').length).toBe(2);
});

test('Renders <Timeline /> with badges on items', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            items={[
              { title: 'With string badge', badge: 'v1.0' },
              { title: 'With number badge', badge: 42 },
              { title: 'With multiple badges', badge: ['A', 'B'] },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // 1 + 1 + 2 = 4 badges total
  expect(document.querySelectorAll('.reqore-timeline-badge').length).toBe(4);
});

test('Renders <Timeline /> with collapsible items', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            items={[
              {
                title: 'Collapsible expanded',
                content: 'Visible content',
                collapsible: true,
              },
              {
                title: 'Collapsible collapsed',
                content: 'Hidden content',
                collapsible: true,
                isCollapsed: true,
              },
              {
                title: 'Not collapsible',
                content: 'Always visible',
              },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // Collapse toggle icons should be present for collapsible items
  expect(document.querySelectorAll('.reqore-timeline-collapse').length).toBe(2);
});

test('Toggling collapse on a collapsible item', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            items={[
              {
                title: 'Toggle me',
                content: 'Some content',
                collapsible: true,
              },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const collapseButton = document.querySelector('.reqore-timeline-collapse')!;
  expect(collapseButton).toBeTruthy();

  // Click to collapse
  fireEvent.click(collapseButton);

  // Click again to expand
  fireEvent.click(collapseButton);

  // Item should still be there
  expect(document.querySelectorAll('.reqore-timeline-item').length).toBe(1);
});

test('Renders <Timeline /> title-only items with connecting lines', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTimeline
            items={[
              { title: 'First', icon: 'FlagLine' },
              { title: 'Second', icon: 'RocketLine' },
              { title: 'Third', icon: 'TrophyLine' },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-timeline-item').length).toBe(3);
  expect(document.querySelectorAll('.reqore-icon').length).toBe(3);
});
