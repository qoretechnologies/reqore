import { merge, size } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useUpdateEffect } from 'react-use';
import usePagination, { usePaginationReturn } from 'react-use-pagination-hook';

export interface IReqorePageChangeData {
  isFirst?: boolean;
  isLast?: boolean;
}

export interface IReqorePagingOptions<T> {
  items: T[];
  startPage?: number;
  pagesToShow?: number;
  itemsPerPage?: number;
  infinite?: boolean;
  enabled?: boolean;
  onPageChange?: (page: number, info: IReqorePageChangeData) => void;
}

export interface IReqorePagingResult<T>
  extends Pick<usePaginationReturn, 'setPage' | 'currentPage'> {
  pages: number[];
  allPages: number[];
  items: T[];
  itemsPerPage: number;
  itemsLeft: number;
  isLastPage: boolean;
  isFirstPage: boolean;
  next: usePaginationReturn['goNext'];
  back: usePaginationReturn['goBefore'];
  first: () => void;
  last: () => void;
  pageCount: number;
  infinite: boolean;
  renderControls: boolean;
}

export const defaultPagingOptions: IReqorePagingOptions<any> = {
  items: [],
  itemsPerPage: 10,
  infinite: false,
};

export const useReqorePaging = <T>(
  options: IReqorePagingOptions<T> = defaultPagingOptions
): IReqorePagingResult<T> => {
  const {
    items,
    itemsPerPage,
    infinite,
    pagesToShow,
    startPage,
    enabled = true,
    onPageChange,
  }: IReqorePagingOptions<T> = merge({}, defaultPagingOptions, options);
  const allPageCount = useMemo(() => Math.ceil(size(items) / itemsPerPage), [items, itemsPerPage]);
  const { pagelist, currentPage, setPage, setTotalPage, goNext, goBefore } = usePagination({
    numOfPage: allPageCount,
    totalPage: allPageCount,
  });

  useEffect(() => {
    setPage(startPage || 1);
  }, [startPage]);

  useUpdateEffect(() => {
    onPageChange?.(currentPage, {
      isFirst: currentPage === 1,
      isLast: currentPage === allPageCount,
    });
  }, [currentPage]);

  useUpdateEffect(() => {
    setPage(1);
    setTotalPage(Math.ceil(size(items) / itemsPerPage));
  }, [size(items)]);

  const slicedItems: T[] = useMemo(() => {
    return items.slice(infinite ? 0 : (currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [items, currentPage, itemsPerPage, infinite]);

  const pages: number[] = useMemo(() => {
    if (!pagesToShow || pagesToShow >= allPageCount) {
      return pagelist;
    }
    // Get the middle of the desired page count
    const middle = Math.ceil(pagesToShow / 2);
    // Get the start number of the pages to show
    // If the current page is the last page, we need to subtract the number of pages to show from the total number of pages
    const start =
      currentPage === allPageCount ? allPageCount - pagesToShow : Math.max(currentPage - middle, 0);
    // Get the end number of the pages to show
    // If the start number is 0, we need to add the number of pages to show to the total number of pages
    const end = Math.min(start + pagesToShow, allPageCount);

    let newPages = pagelist.slice(start, end);
    // Always remove the first page
    newPages = newPages.filter((page) => page !== 1);
    // Always remove the last page
    newPages = newPages.filter((page) => page !== allPageCount);
    // Add the first and last page
    newPages = [1, ...newPages, allPageCount];

    return newPages;
  }, [pagesToShow, allPageCount, currentPage, pagelist]);

  return {
    pages,
    allPages: pagelist,
    pageCount: allPageCount,
    items: enabled ? slicedItems : items,
    itemsPerPage,
    itemsLeft: items.length - slicedItems.length,
    infinite,
    setPage,
    currentPage,
    next: goNext,
    back: goBefore,
    renderControls:
      enabled &&
      !(allPageCount === 1 || allPageCount === 0 || (infinite && currentPage === allPageCount)),
    isLastPage: currentPage === allPageCount,
    isFirstPage: currentPage === 1,
    first: () => setPage(1),
    last: () => setPage(allPageCount),
  };
};
