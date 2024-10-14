import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { useMount } from 'react-use';
import {
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreLayoutContent,
  ReqorePagination,
  ReqoreTag,
  ReqoreUIProvider,
} from '../src';
import { IReqorePaginationProps } from '../src/components/Paging';
import { IReqorePagingOptions, useReqorePaging } from '../src/hooks/usePaging';
import { tableData as data } from '../src/mock/tableData';

const Component = ({
  pagingOptions = { items: data },
  componentOptions,
  items,
}: {
  pagingOptions?: Partial<IReqorePagingOptions<any>>;
  componentOptions?: Partial<IReqorePaginationProps<any>>;
  items?: any[];
}) => {
  const paging = useReqorePaging<any>({ ...pagingOptions, items: items || data });
  const [scrollContainer, setScrollContainer] = useState<any>(undefined);

  useMount(() => {
    setScrollContainer(document.querySelector('.reqore-content')!);
  });

  return (
    <ReqoreControlGroup vertical fluid>
      {paging.items.map((item) => (
        <ReqoreTag fixed='key' labelKey={item.id} label={`${item.firstName} ${item.lastName}`} />
      ))}
      <ReqorePagination {...componentOptions} {...paging} scrollContainer={scrollContainer} />
    </ReqoreControlGroup>
  );
};

test('Renders default <Pagination />', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Component />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-pagination-wrapper').length).toBe(1);
  expect(document.querySelectorAll('.reqore-button')[0]?.getAttribute('disabled')).toBe('');
  expect(document.querySelectorAll('.reqore-button').length).toBe(102);

  fireEvent.click(document.querySelectorAll('.reqore-button')[100]);
  expect(screen.getAllByText('Rodd Solly')).toBeTruthy();
  expect(document.querySelectorAll('.reqore-button')[101]?.getAttribute('disabled')).toBe('');
});

test('Renders <Pagination /> with only 5 page buttons', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Component pagingOptions={{ pagesToShow: 5 }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-button').length).toBe(8);
});

test('Renders no <Pagination /> if only one page exists', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Component pagingOptions={{ pagesToShow: 5 }} items={data.slice(0, 5)} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-pagination-wrapper').length).toBe(0);
  expect(document.querySelectorAll('.reqore-button').length).toBe(0);
});

test('Renders no <Pagination /> if no items exist', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Component pagingOptions={{ pagesToShow: 5 }} items={[]} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-pagination-wrapper').length).toBe(0);
  expect(document.querySelectorAll('.reqore-button').length).toBe(0);
});

test('Renders <Pagination /> without control buttons', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Component componentOptions={{ showControls: false }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-button').length).toBe(100);
});

test('Renders <Pagination /> without page buttons', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Component componentOptions={{ showPages: false }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-button').length).toBe(4);
});

test('Renders <Pagination /> with labels', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Component componentOptions={{ showLabels: true, showPages: false }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(screen.getAllByText('First')).toBeTruthy();
  expect(screen.getAllByText('Back')).toBeTruthy();
  expect(screen.getAllByText('Next')).toBeTruthy();
  expect(screen.getAllByText('Last')).toBeTruthy();
});

test('Renders <Pagination /> with custom labels', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Component
            componentOptions={{
              showLabels: true,
              showPages: false,
              firstPageLabel: 'Prvni',
              lastPageLabel: 'Posledni',
              nextPageLabel: 'Dalsi',
              previousPageLabel: 'Predchozi',
            }}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(screen.getAllByText('Prvni')).toBeTruthy();
  expect(screen.getAllByText('Predchozi')).toBeTruthy();
  expect(screen.getAllByText('Dalsi')).toBeTruthy();
  expect(screen.getAllByText('Posledni')).toBeTruthy();
});

test('Renders list <Pagination /> with labels', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Component
            componentOptions={{
              showLabels: true,
              showPagesAs: 'list',
              firstPageLabel: 'Prvni',
              lastPageLabel: 'Posledni',
            }}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(screen.getAllByText('Page 1 / 100')).toBeTruthy();
  expect(screen.getAllByText('Prvni')).toBeTruthy();
  expect(screen.getAllByText('Back')).toBeTruthy();
  expect(screen.getAllByText('Next')).toBeTruthy();
  expect(screen.getAllByText('Posledni')).toBeTruthy();
});

test('Renders <Pagination /> with only 5 page buttons and start page 11', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Component pagingOptions={{ pagesToShow: 5, startPage: 11 }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-button').length).toBe(9);
  expect(document.querySelectorAll('.reqore-button')[2].textContent).toBe('999');
  expect(screen.getAllByText('Eva Kilrow')).toBeTruthy();
});

test('Renders <Pagination /> with custom number of items per page', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Component pagingOptions={{ itemsPerPage: 27 }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-button').length).toBe(40);
  fireEvent.click(document.querySelectorAll('.reqore-button')[20]);
  expect(screen.getAllByText('Lesley Riglar')).toBeTruthy();
});

test('Renders <Pagination /> as a list', () => {
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Component componentOptions={{ showPagesAs: 'list' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  mockAllIsIntersecting(true);

  expect(document.querySelectorAll('.reqore-dropdown-control').length).toBe(1);

  fireEvent.click(document.querySelectorAll('.reqore-dropdown-control')[0]!);

  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-button').length).toBe(105);
});

test('Renders <Pagination /> with load more button and no load all button', () => {
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Component
            pagingOptions={{ infinite: true }}
            componentOptions={{ showLoadAllButton: false }}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  mockAllIsIntersecting(true);

  expect(document.querySelectorAll('.reqore-button').length).toBe(1);
  // 11 because of the badge on the button
  expect(document.querySelectorAll('.reqore-tag').length).toBe(11);

  fireEvent.click(document.querySelectorAll('.reqore-button')[0]!);

  jest.advanceTimersByTime(1);
  // 21 because of the badge on the button
  expect(document.querySelectorAll('.reqore-tag').length).toBe(21);
  // Pagination should still be there
  expect(document.querySelectorAll('.reqore-pagination-wrapper').length).toBe(1);
});

test('Renders <Pagination /> with load all button', () => {
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Component pagingOptions={{ infinite: true }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  mockAllIsIntersecting(true);

  expect(document.querySelectorAll('.reqore-button').length).toBe(2);
  // 12 because of the badge on the buttons
  expect(document.querySelectorAll('.reqore-tag').length).toBe(12);

  fireEvent.click(document.querySelectorAll('.reqore-button')[1]!);

  jest.advanceTimersByTime(1);
  // 21 because of the badge on the button
  expect(document.querySelectorAll('.reqore-tag').length).toBe(1000);
  // Pagination should still be there
  expect(document.querySelectorAll('.reqore-pagination-wrapper').length).toBe(0);
});

test('Renders <Pagination /> with load more button and auto load', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Component
            pagingOptions={{ infinite: true, itemsPerPage: 500 }}
            componentOptions={{ autoLoadMore: true }}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-button').length).toBe(2);
  // 11 because of the badge on the button
  expect(document.querySelectorAll('.reqore-tag').length).toBe(502);

  mockAllIsIntersecting(true);

  // 21 because of the badge on the button
  expect(document.querySelectorAll('.reqore-tag').length).toBe(1000);
  // Pagination should be removed
  expect(document.querySelectorAll('.reqore-pagination-wrapper').length).toBe(0);
});

test('Renders <Pagination /> and changes pages with vertical scroll', () => {
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Component componentOptions={{ changePageOnScroll: 'vertical' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(screen.getAllByText('Rob Pooley')).toBeTruthy();

  fireEvent.wheel(document.querySelector('.reqore-content')!, {
    deltaY: 1,
  });

  act(() => {
    jest.advanceTimersByTime(100);
  });

  expect(screen.getAllByText('Rob Pooley')).toBeTruthy();

  fireEvent.wheel(document.querySelector('.reqore-content')!, {
    deltaY: 21,
  });

  act(() => {
    jest.advanceTimersByTime(100);
  });

  expect(screen.getAllByText('Claudian Klosterman')).toBeTruthy();

  fireEvent.wheel(document.querySelector('.reqore-content')!, {
    deltaY: -21,
  });

  act(() => {
    jest.advanceTimersByTime(100);
  });

  expect(screen.getAllByText('Rob Pooley')).toBeTruthy();
});

test('Renders <Pagination /> and changes pages with horizontal scroll', () => {
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Component componentOptions={{ changePageOnScroll: 'horizontal' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(screen.getAllByText('Rob Pooley')).toBeTruthy();

  fireEvent.wheel(document.querySelector('.reqore-content')!, {
    shiftKey: true,
    deltaX: 1,
  });

  act(() => {
    jest.advanceTimersByTime(100);
  });

  expect(screen.getAllByText('Rob Pooley')).toBeTruthy();

  fireEvent.wheel(document.querySelector('.reqore-content')!, {
    shiftKey: true,
    deltaX: 21,
  });

  act(() => {
    jest.advanceTimersByTime(100);
  });

  expect(screen.getAllByText('Claudian Klosterman')).toBeTruthy();

  fireEvent.wheel(document.querySelector('.reqore-content')!, {
    shiftKey: true,
    deltaX: -21,
  });

  act(() => {
    jest.advanceTimersByTime(100);
  });

  expect(screen.getAllByText('Rob Pooley')).toBeTruthy();
});
