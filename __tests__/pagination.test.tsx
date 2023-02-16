import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { ReqoreContent, ReqoreLayoutContent, ReqorePagination, ReqoreUIProvider } from '../src';
import { IReqorePaginationProps } from '../src/components/Paging';
import { IReqorePagingOptions, useReqorePaging } from '../src/hooks/usePaging';
import { tableData as data } from '../src/mock/tableData';

const Component = ({
  pagingOptions = { items: data },
  componentOptions,
}: {
  pagingOptions?: Partial<IReqorePagingOptions<any>>;
  componentOptions?: Partial<IReqorePaginationProps<any>>;
}) => {
  const paging = useReqorePaging<any>({ ...pagingOptions, items: data });

  return <ReqorePagination {...componentOptions} {...paging} />;
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

  expect(document.querySelectorAll('.reqore-button').length).toBe(104);
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

  expect(document.querySelectorAll('.reqore-button').length).toBe(9);
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
