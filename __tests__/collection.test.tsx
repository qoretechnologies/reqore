import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { ReqoreCollection, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
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

test('<Collection /> can be sorted', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreCollection items={items} sortable />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const firstItem = document.querySelector('.reqore-collection-item');
  // Expect the title of the first item to be "Expandable item"
  expect(firstItem?.querySelector('h3')?.textContent).toBe(undefined);

  fireEvent.click(document.querySelectorAll('.reqore-button')[1]);

  const firstNewItem = document.querySelector('.reqore-collection-item');

  expect(firstNewItem?.querySelector('h3')?.textContent).toBe('This item is not flat');
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
  expect(document.querySelectorAll('.reqore-dropdown-control').length).toBe(1);
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
