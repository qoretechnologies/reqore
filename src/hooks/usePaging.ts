import { size } from 'lodash';
import { useCallback, useEffect, useMemo, useRef } from 'react';
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
  applyPaging: (items: T[]) => T[];
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
  }: IReqorePagingOptions<T> = {
    /* A SHALLOW default, deliberately. This was lodash `merge`, which deep-clones:
       every call built a new `items` array and cloned every row object in it, so
       the page slice below saw new input on every render, every consumer of the
       slice (a table body, a collection) saw a new array, and every memoised row
       re-rendered on every render of its page — fifty rows, whatever the page was
       doing. `items` is the caller's; it is not ours to copy.
       An `undefined` option keeps its default, as the merge treated it: a caller
       that re-renders without a prop it passed before still gets ten per page. */
    ...defaultPagingOptions,
    ...(Object.fromEntries(
      Object.entries(options).filter(([, value]) => value !== undefined)
    ) as IReqorePagingOptions<T>),
  };
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

  /* The pagination hook derives `currentPage` from a window of pages; while the
     total is shrinking that window is briefly out of range and the page reads as
     undefined, which is exactly when the clamp below has to know where the reader
     was. */
  const lastKnownPage = useRef(1);
  if (currentPage) {
    lastKnownPage.current = currentPage;
  }

  useUpdateEffect(() => {
    const pageCount = Math.max(1, Math.ceil(size(items) / itemsPerPage));
    /* An INFINITE list keeps the reader where they are. Its pages are cumulative
       — page 3 shows the first thirty rows — so a row arriving at the top or
       fifty older rows loading at the bottom changes what the window holds, not
       where the reader is; snapping to page 1 on every count change collapsed a
       list someone had scrolled down three times the moment anything arrived.
       Only a list that shrank below the current page pulls the page back. A
       paged table is different: its page is a slice, and a new data set (a
       filter, a reload) should open on its first page as it always has. */
    if (infinite) {
      const page = currentPage ?? lastKnownPage.current;
      if (!currentPage || page > pageCount) {
        setPage(Math.min(page, pageCount));
      }
    } else {
      setPage(1);
    }
    // After the page: the pagination hook validates a page against the total it
    // holds, so shrinking the total first would reject the page it should land on.
    setTotalPage(pageCount);
  }, [size(items)]);

  const slicedItems: T[] = useMemo(() => {
    return items.slice(infinite ? 0 : (currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [items, currentPage, itemsPerPage, infinite]);

  const applyPaging = useCallback(
    (items: T[]): T[] =>
      !enabled
        ? items
        : items.slice(infinite ? 0 : (currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [currentPage, itemsPerPage, infinite, enabled]
  );

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

  return useMemo(
    () => ({
      pages,
      allPages: pagelist,
      pageCount: allPageCount,
      items: enabled ? slicedItems : items,
      applyPaging,
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
    }),
    [
      pages,
      pagelist,
      allPageCount,
      enabled,
      slicedItems,
      items,
      applyPaging,
      itemsPerPage,
      infinite,
      setPage,
      currentPage,
      goNext,
      goBefore,
    ]
  );
};
