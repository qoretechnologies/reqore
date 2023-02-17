import { renderHook } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { ReqoreUIProvider, useReqorePaging } from '../../src';
import { IReqorePagingOptions } from '../../src/hooks/usePaging';
import { tableData as data } from '../../src/mock/tableData';

test('useReqorePaging returns all pages', () => {
  const wrapper = ({ children }: any) => <ReqoreUIProvider>{children}</ReqoreUIProvider>;
  const { result } = renderHook(
    ({ items }) =>
      useReqorePaging({
        items,
      }),
    { wrapper, initialProps: { items: data } }
  );

  expect(result.current.pages.length).toEqual(100);
  expect(result.current.pageCount).toEqual(100);
  expect(result.current.renderControls).toEqual(true);
});

test('useReqorePaging with default start page', () => {
  const wrapper = ({ children }: any) => <ReqoreUIProvider>{children}</ReqoreUIProvider>;
  const { result } = renderHook(
    ({ items }) =>
      useReqorePaging({
        items,
        startPage: 11,
        pagesToShow: 5,
      }),
    { wrapper, initialProps: { items: data } }
  );

  expect(result.current.pageCount).toEqual(100);
  expect(result.current.currentPage).toEqual(11);
  expect(result.current.pages.length).toEqual(7);
  expect(result.current.pages[0]).toEqual(1);
  expect(result.current.pages[1]).toEqual(9);
  expect(result.current.pages[5]).toEqual(13);
  expect(result.current.pages[6]).toEqual(100);
});

test('useReqorePaging specified number of pages', () => {
  const wrapper = ({ children }: any) => <ReqoreUIProvider>{children}</ReqoreUIProvider>;
  const { result } = renderHook(
    ({ items }) =>
      useReqorePaging({
        items,
        pagesToShow: 5,
      }),
    { wrapper, initialProps: { items: data } }
  );

  expect(result.current.allPages.length).toEqual(100);
  expect(result.current.pages!.length).toEqual(6);
  expect(result.current.pages![0]).toEqual(1);
  expect(result.current.pages![4]).toEqual(5);

  act(() => {
    result.current.setPage(8);
  });

  expect(result.current.pages![1]).toEqual(6);
  expect(result.current.pages![5]).toEqual(10);

  act(() => {
    result.current.last();
  });

  expect(result.current.pages![1]).toEqual(96);
  expect(result.current.pages![5]).toEqual(100);
});

test('useReqorePaging returns 1 page when items are empty', () => {
  const wrapper = ({ children }: any) => <ReqoreUIProvider>{children}</ReqoreUIProvider>;
  const { result } = renderHook(
    ({ items }) =>
      useReqorePaging({
        items,
      }),
    { wrapper, initialProps: { items: [] } }
  );

  expect(result.current.pages.length).toEqual(1);
  expect(result.current.renderControls).toEqual(false);
});

test('useReqorePaging returns correct number of rounded pages', () => {
  const wrapper = ({ children }: any) => <ReqoreUIProvider>{children}</ReqoreUIProvider>;
  const { result } = renderHook(
    ({ itemsPerPage, items }) =>
      useReqorePaging({
        items,
        itemsPerPage,
      }),
    { wrapper, initialProps: { itemsPerPage: 13, items: data } }
  );

  expect(result.current.pages.length).toEqual(77);
});

test('useReqorePaging returns items per page', () => {
  const wrapper = ({ children }: any) => <ReqoreUIProvider>{children}</ReqoreUIProvider>;
  const { result } = renderHook(
    ({ itemsPerPage, items }) =>
      useReqorePaging({
        items,
        itemsPerPage,
      }),
    { wrapper, initialProps: { itemsPerPage: 10, items: data } }
  );

  expect(result.current.pages.length).toEqual(100);
  expect(result.current.items.length).toEqual(10);
});

test('useReqorePaging returns new items and pages when size of data change, current page is set to 1', () => {
  const wrapper = ({ children }: any) => <ReqoreUIProvider>{children}</ReqoreUIProvider>;
  const { result, rerender } = renderHook(
    ({ itemsPerPage, items }) =>
      useReqorePaging({
        items,
        itemsPerPage,
      }),
    { wrapper, initialProps: { itemsPerPage: 10, items: data } }
  );

  expect(result.current.pages.length).toEqual(100);
  expect(result.current.items.length).toEqual(10);

  act(() => {
    result.current.setPage(5);
  });

  expect(result.current.currentPage).toEqual(5);

  rerender({ itemsPerPage: 15, items: data.slice(0, 30) });

  expect(result.current.pages.length).toEqual(2);
  expect(result.current.items.length).toEqual(15);
  expect(result.current.currentPage).toEqual(1);
});

test('useReqorePaging does not return new items and pages when data change', () => {
  const wrapper = ({ children }: any) => <ReqoreUIProvider>{children}</ReqoreUIProvider>;
  const { result, rerender } = renderHook(
    ({ itemsPerPage, items }: IReqorePagingOptions<any>) =>
      useReqorePaging({
        items,
        itemsPerPage,
      }),
    { wrapper, initialProps: { itemsPerPage: 10, items: data } as IReqorePagingOptions<any> }
  );

  expect(result.current.pages.length).toEqual(100);
  expect(result.current.items.length).toEqual(10);

  act(() => {
    result.current.setPage(5);
  });

  rerender({ items: [...data] });

  expect(result.current.pages.length).toEqual(100);
  expect(result.current.items.length).toEqual(10);
  expect(result.current.currentPage).toEqual(5);
});

test('useReqorePaging page navigation works correctly', () => {
  const wrapper = ({ children }: any) => <ReqoreUIProvider>{children}</ReqoreUIProvider>;
  const { result } = renderHook(
    ({ itemsPerPage, items }: IReqorePagingOptions<any>) =>
      useReqorePaging({
        items,
        itemsPerPage,
        infinite: true,
      }),
    { wrapper, initialProps: { itemsPerPage: 10, items: data } as IReqorePagingOptions<any> }
  );

  expect(result.current.pages.length).toEqual(100);
  expect(result.current.items.length).toEqual(10);

  act(() => {
    result.current.setPage(2);
  });

  expect(result.current.currentPage).toEqual(2);

  act(() => {
    result.current.next();
  });

  expect(result.current.currentPage).toEqual(3);

  act(() => {
    result.current.last();
  });

  expect(result.current.isLastPage).toEqual(true);
  expect(result.current.currentPage).toEqual(100);

  act(() => {
    result.current.back();
  });

  expect(result.current.currentPage).toEqual(99);

  act(() => {
    result.current.first();
  });

  expect(result.current.isFirstPage).toEqual(true);
  expect(result.current.currentPage).toEqual(1);
});

test('useReqorePaging returns correct number of items with infinite loading', () => {
  const wrapper = ({ children }: any) => <ReqoreUIProvider>{children}</ReqoreUIProvider>;
  const { result } = renderHook(
    ({ itemsPerPage, items }: IReqorePagingOptions<any>) =>
      useReqorePaging({
        items,
        itemsPerPage,
        infinite: true,
      }),
    { wrapper, initialProps: { itemsPerPage: 10, items: data } as IReqorePagingOptions<any> }
  );

  expect(result.current.pages.length).toEqual(100);
  expect(result.current.items.length).toEqual(10);

  act(() => {
    result.current.setPage(2);
  });

  expect(result.current.pages.length).toEqual(100);
  expect(result.current.items.length).toEqual(20);

  act(() => {
    result.current.setPage(5);
  });

  expect(result.current.items.length).toEqual(50);
  expect(result.current.itemsLeft).toEqual(950);
  expect(result.current.renderControls).toEqual(true);

  act(() => {
    result.current.last();
  });

  expect(result.current.items.length).toEqual(1000);
  expect(result.current.itemsLeft).toEqual(0);
  expect(result.current.renderControls).toEqual(false);
});
