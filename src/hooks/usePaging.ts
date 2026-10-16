import { range, size } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useUpdateEffect } from 'react-use';

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

export interface IReqorePagingResult<T> {
  /** Opens a page: one outside the list opens the nearest page in it. */
  setPage: (page: number) => void;
  /** The open page: always one of the list's (1 when it has none). */
  currentPage: number;
  pages: number[];
  allPages: number[];
  applyPaging: (items: T[]) => T[];
  items: T[];
  itemsPerPage: number;
  itemsLeft: number;
  isLastPage: boolean;
  isFirstPage: boolean;
  /** The next page, or the last one: each call a step, the steps one render takes too. */
  next: () => void;
  /** The page before, or the first one. */
  back: () => void;
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
  // a list without rows still has its one, empty, page
  const pagelist = useMemo(() => range(1, Math.max(1, allPageCount) + 1), [allPageCount]);
  /* The page is ours, kept within the list on every change. It was a pagination hook's window index, which two
     steps from one render (two auto-load observers, say) took past the last page: the page read as undefined,
     no rows were shown and "Load more" stayed. A step reads the page it is taken from (a functional update),
     not the one the render saw, and stops at either end. */
  const lastPage = useRef(Math.max(1, allPageCount));
  lastPage.current = Math.max(1, allPageCount);
  const toPage = (page: number): number => Math.min(Math.max(1, page), lastPage.current);
  const [openPage, setOpenPage] = useState<number>(1);
  // the page as shown: within the list as it is now, also before the effects below have caught up with it
  const currentPage = toPage(openPage);
  const setPage = useCallback((page: number) => setOpenPage(toPage(page)), []);
  const goNext = useCallback(() => setOpenPage((page) => toPage(page + 1)), []);
  const goBefore = useCallback(() => setOpenPage((page) => toPage(page - 1)), []);

  // the start page is opened as any other, so `onPageChange` hears of it
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
    /* An INFINITE list keeps the reader where they are. Its pages are cumulative
       — page 3 shows the first thirty rows — so a row arriving at the top or
       fifty older rows loading at the bottom changes what the window holds, not
       where the reader is; snapping to page 1 on every count change collapsed a
       list someone had scrolled down three times the moment anything arrived.
       Only a list that shrank below the current page pulls the page back (and
       keeps it there when it grows again). A paged table is different: its page
       is a slice, and a new data set (a filter, a reload) should open on its
       first page as it always has. */
    setOpenPage((page) => (infinite ? toPage(page) : 1));
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
