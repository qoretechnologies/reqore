import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { ReqoreCollection, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import { IReqoreCollectionItemProps } from '../src/components/Collection/item';
import items, { bigCollection } from '../src/mock/collectionData';

test('Renders basic <Collection /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreCollection items={items} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-collection').length).toBe(1);
  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(9);
});

test('<Collection /> items can be filtered', () => {
  const fn = jest.fn();
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreCollection items={items} filterable onQueryChange={fn} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'I have' },
  });

  expect(fn).not.toHaveBeenCalled();

  act(() => {
    jest.advanceTimersByTime(500);
  });

  expect(fn).toHaveBeenCalledWith('I have');

  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(2);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'asg' },
  });

  act(() => {
    jest.runAllTimers();
  });

  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(0);
  expect(document.querySelectorAll('.reqore-message').length).toBe(1);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'secret' },
  });

  act(() => {
    jest.runAllTimers();
  });

  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(1);
  expect(document.querySelectorAll('.reqore-message').length).toBe(0);
});

test('<Collection /> filter is properly removed by the clear button', () => {
  const fn = jest.fn();
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreCollection items={items} filterable onQueryChange={fn} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(9);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'I have' },
  });

  expect(fn).not.toHaveBeenCalled();

  act(() => {
    jest.advanceTimersByTime(500);
  });

  expect(fn).toHaveBeenCalledWith('I have');

  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(2);

  fireEvent.click(document.querySelector('.reqore-clear-input-button')!);

  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(9);
  // Expect the input value to be empty
  expect(document.querySelector('.reqore-input')?.getAttribute('value')).toBe('');
});

test('<Collection /> filter is focused when a shortcut is pressed', () => {
  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreCollection
          items={items}
          filterable
          onQueryChange={fn}
          inputProps={{ focusRules: { type: 'keypress', shortcut: 'letters' } }}
        />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-input')).not.toHaveFocus();
  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(9);

  fireEvent.keyDown(document, {
    key: 'f',
    code: 102,
    charCode: 102,
  });

  expect(fn).not.toHaveBeenCalled();

  expect(document.querySelector('.reqore-input')).toHaveFocus();
});

test('<Collection /> shows no data message when empty', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreCollection items={[]} filterable />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-message').length).toBe(1);
});

test('<Collection /> has default paging', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreCollection items={bigCollection} paging='buttons' />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-pagination-wrapper').length).toBe(1);
});

test('<Collection /> has list paging', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreCollection items={bigCollection} paging='list' />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-pagination-wrapper').length).toBe(1);
  expect(document.querySelectorAll('.reqore-dropdown-control').length).toBe(2);
  expect(screen.getAllByText('1 / 10')).toBeTruthy();
});

test('<Collection /> has infinite paging', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreCollection items={bigCollection} paging='infinite' />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-pagination-wrapper').length).toBe(1);
  expect(document.querySelectorAll('.reqore-button').length).toBe(3);
  expect(screen.getAllByText('90')).toBeTruthy();

  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(10);

  fireEvent.click(document.querySelectorAll('.reqore-button')[1]);

  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(20);
});

test('<Collection /> has custom paging', () => {
  const onPageChange = jest.fn();
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreCollection
          items={bigCollection}
          paging={{
            itemsPerPage: 50,
            infinite: true,
            autoLoadMore: true,
            showLabels: true,
            loadMoreLabel: 'Scroll to load more',
            onPageChange,
          }}
        />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-pagination-wrapper').length).toBe(1);
  expect(document.querySelectorAll('.reqore-button').length).toBe(3);
  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(50);
  expect(screen.getAllByText('Scroll to load more')).toBeTruthy();
  expect(screen.getAllByText('50')).toBeTruthy();

  mockAllIsIntersecting(true);

  expect(onPageChange).toHaveBeenCalledWith(2, { isFirst: false, isLast: true });
  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(100);
});

test('<Collection /> has 2 paging controls', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreCollection
          items={bigCollection}
          paging={{
            itemsPerPage: 10,
            showPagesAs: 'list',
            pageControlsPosition: 'both',
          }}
        />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-pagination-wrapper').length).toBe(2);
  expect(document.querySelectorAll('.reqore-button').length).toBe(11);
  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(10);
});

test('<Collection /> renders every non-Ungrouped group inside a panel', () => {
  const groupedItems: IReqoreCollectionItemProps[] = [
    { label: 'In A', groups: ['Group A'] },
    { label: 'In B', groups: ['Group B'] },
    { label: 'No group' },
  ];

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreCollection items={groupedItems} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const groupPanels = document.querySelectorAll('.reqore-collection-group');
  expect(groupPanels.length).toBe(2);

  const labels = Array.from(groupPanels).map(
    (panel) => panel.querySelector('.reqore-panel-title-label-row')?.textContent?.trim()
  );
  expect(labels).toEqual(expect.arrayContaining(['Group A', 'Group B']));

  // All three items still render (Ungrouped item is not wrapped)
  expect(document.querySelectorAll('.reqore-collection-item').length).toBe(3);
});

test('<Collection /> applies group config (label, description, icon, collapsible)', () => {
  const groupedItems: IReqoreCollectionItemProps[] = [
    { label: 'Send Email', groups: ['Communication'] },
    { label: 'Run Query', groups: ['Database'] },
  ];

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreCollection
          items={groupedItems}
          groups={{
            Communication: {
              label: 'Communication channels',
              description: 'Email, chat and notification integrations',
              icon: 'ChatSmile2Line',
              collapsible: true,
            },
            Database: {
              label: 'Databases',
              icon: 'Database2Line',
              collapsible: true,
              isCollapsed: true,
            },
          }}
        />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const panels = document.querySelectorAll('.reqore-collection-group');
  expect(panels.length).toBe(2);

  // The configured `label` overrides the raw group name
  const labels = Array.from(panels).map(
    (panel) => panel.querySelector('.reqore-panel-title-label-row')?.textContent?.trim()
  );
  expect(labels).toEqual(expect.arrayContaining(['Communication channels', 'Databases']));

  // The description is rendered for the group that defined it
  const descriptions = Array.from(
    document.querySelectorAll('.reqore-collection-group .reqore-panel-title-description')
  ).map((el) => el.textContent);
  expect(descriptions).toEqual(
    expect.arrayContaining(['Email, chat and notification integrations'])
  );

  // Both configured groups render an icon in their header
  expect(
    document.querySelectorAll('.reqore-collection-group .reqore-panel-title-icon').length
  ).toBe(2);

  // The Database group is initially collapsed, so its item is not visible
  expect(screen.queryByText('Run Query')).not.toBeInTheDocument();
  // The other group is expanded
  expect(screen.getByText('Send Email')).toBeInTheDocument();
});

test('<Collection /> sortByGroupFirst=false sorts by custom field before group', () => {
  const groupedItems: IReqoreCollectionItemProps[] = [
    {
      label: 'Zendesk Exact Match',
      groups: ['Zendesk'],
      metadata: { relevance: 0 },
    },
    {
      label: 'AWS Partial Match',
      groups: ['AWS'],
      metadata: { relevance: 1 },
    },
    {
      label: 'AWS Exact Match',
      groups: ['AWS'],
      metadata: { relevance: 0 },
    },
    {
      label: 'Zendesk Weak Match',
      groups: ['Zendesk'],
      metadata: { relevance: 2 },
    },
  ];

  // With sortByGroupFirst=true (default): items grouped by group first
  const { unmount } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreCollection
          items={groupedItems}
          defaultSortBy='relevance'
          sortKeys={{ relevance: 'Relevance' }}
        />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const defaultLabels = Array.from(
    document.querySelectorAll('.reqore-collection-item .reqore-panel-title')
  ).map((el) => el.textContent);

  // Group sort first: AWS items come before Zendesk items (A < Z)
  expect(defaultLabels[0]).toBe('AWS Exact Match');
  expect(defaultLabels[1]).toBe('AWS Partial Match');

  unmount();

  // With sortByGroupFirst=false: items sorted by relevance first
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreCollection
          items={groupedItems}
          sortByGroupFirst={false}
          defaultSortBy='relevance'
          sortKeys={{ relevance: 'Relevance' }}
        />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const relevanceLabels = Array.from(
    document.querySelectorAll('.reqore-collection-item .reqore-panel-title')
  ).map((el) => el.textContent);

  // Relevance sort first: relevance=0 items before relevance=1 items
  // Items are rendered flat (not re-grouped), preserving relevance order
  expect(relevanceLabels[0]).toBe('Zendesk Exact Match');
  expect(relevanceLabels[1]).toBe('AWS Exact Match');
  expect(relevanceLabels[2]).toBe('AWS Partial Match');
  expect(relevanceLabels[3]).toBe('Zendesk Weak Match');
});
