import { debounce } from 'lodash';
import { memo, useEffect, useRef, useState } from 'react';
import { useUnmount, useUpdateEffect } from 'react-use';
import styled from 'styled-components';
import { ReqoreDropdown } from '../..';
import { IReqorePagingResult } from '../../hooks/usePaging';
import ReqoreButton, { IReqoreButtonProps, StyledButton } from '../Button';
import ReqoreControlGroup, { IReqoreControlGroupProps } from '../ControlGroup';
import { IReqoreDropdownProps } from '../Dropdown';
import { IReqoreDropdownItemProps } from '../Dropdown/item';

export interface IReqorePaginationComponentProps
  extends Omit<IReqoreControlGroupProps, 'children'> {
  pageButtonProps?: IReqoreButtonProps;
  activePageButtonProps?: IReqoreButtonProps;
  listPageButtonProps?: IReqoreDropdownProps;
  controlPageButtonProps?: IReqoreButtonProps;
  loadMoreButtonProps?: IReqoreButtonProps;
  loadAllButtonProps?: IReqoreButtonProps;
  firstPageLabel?: string;
  lastPageLabel?: string;
  nextPageLabel?: string;
  previousPageLabel?: string;
  pageLabel?: string;
  loadMoreLabel?: string;
  loadAllLabel?: string;
  showPages?: boolean;
  showControls?: boolean;
  showLoadAllButton?: boolean;
  showPagesAs?: 'buttons' | 'list';
  showLabels?: boolean;
  scrollOnLoadMore?: boolean;
  autoLoadMore?: boolean;
  changePageOnScroll?: 'vertical' | 'horizontal';
  scrollContainer?: HTMLElement;
  scrollToTopOnPageChange?: boolean;
}
export interface IReqorePaginationProps<T>
  extends Omit<IReqorePagingResult<T>, 'items'>,
    IReqorePaginationComponentProps {}

export const StyledPagesWrapper = styled(ReqoreControlGroup)`
  width: unset;
  flex: 0 auto;
  justify-content: center;

  & > ${StyledButton} {
    margin: 0;
  }
`;

function Pagination<T>({
  back,
  first,
  currentPage,
  isLastPage,
  isFirstPage,
  pageCount,
  pages,
  last,
  next,
  setPage,
  infinite,
  itemsLeft,
  showPagesAs = 'buttons',
  pageButtonProps = {},
  activePageButtonProps = {},
  listPageButtonProps = {},
  controlPageButtonProps = {},
  loadMoreButtonProps = {},
  loadAllButtonProps = {},
  firstPageLabel = 'First',
  lastPageLabel = 'Last',
  nextPageLabel = 'Next',
  previousPageLabel = 'Back',
  pageLabel = 'Page',
  loadMoreLabel = 'Load more',
  loadAllLabel = 'Load all',
  showLabels,
  showPages = true,
  showControls = true,
  showLoadAllButton = true,
  scrollOnLoadMore,
  autoLoadMore,
  itemsPerPage,
  renderControls,
  scrollContainer,
  scrollToTopOnPageChange = true,
  changePageOnScroll,
  ...rest
}: IReqorePaginationProps<T>) {
  const [loadMoreRef, setLoadMoreRef] = useState<HTMLButtonElement>(undefined);
  const [scrollTargetRef, setScrollTargetRef] = useState<HTMLDivElement>(undefined);
  const observer = useRef<IntersectionObserver>(null);

  useUpdateEffect(() => {
    // If scroll container is defined, do not scroll to load more button
    // because it will be scrolled to the bottom of the container
    // resulting in infinite scroll
    if (!scrollContainer && scrollTargetRef && scrollOnLoadMore && !isLastPage && !isFirstPage) {
      scrollTargetRef.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'start',
      });
    }
  }, [currentPage, scrollTargetRef, scrollContainer, scrollOnLoadMore, isLastPage, isFirstPage]);

  // Scroll to bottom on load more
  // Scroll container has power over scroll target
  useUpdateEffect(() => {
    if (scrollContainer && scrollOnLoadMore && !isFirstPage) {
      scrollContainer.scrollBy?.({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [currentPage, scrollContainer, scrollOnLoadMore, isFirstPage]);

  // Scroll to top on page change
  useUpdateEffect(() => {
    if (scrollContainer && scrollToTopOnPageChange && !infinite) {
      scrollContainer.scrollTo?.({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [currentPage, scrollContainer, scrollToTopOnPageChange, infinite]);

  // Switch pages when user scrolls and holds the Shift key
  useEffect(() => {
    const handleScroll = debounce((e: WheelEvent) => {
      const deltaKey = changePageOnScroll === 'vertical' ? 'deltaY' : 'deltaX';
      // Only change pages when user holds the shift key
      // aka horizontal scroll
      if (
        changePageOnScroll === 'vertical' ||
        (changePageOnScroll === 'horizontal' && e.shiftKey)
      ) {
        // Do not horizontal scroll
        e.preventDefault();
        // If the user scrolls to the right, go to the next page
        if (e[deltaKey] > 20) {
          next();
          // If the user scrolls to the left, go to the previous page
        } else if (e[deltaKey] < -20) {
          back();
        }
      }
    }, 30);

    if (scrollContainer && changePageOnScroll) {
      scrollContainer.addEventListener('wheel', handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('wheel', handleScroll);
      }
    };
  }, [currentPage, scrollContainer, changePageOnScroll]);

  useUpdateEffect(() => {
    if (loadMoreRef && autoLoadMore) {
      observer.current = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              next();
            }
          });
        },
        {
          threshold: 0.8,
        }
      );

      observer.current.observe(loadMoreRef);
    }
  }, [loadMoreRef, autoLoadMore, isLastPage]);

  useUnmount(() => {
    observer.current?.disconnect();
  });

  if (!renderControls) {
    return null;
  }

  return (
    <ReqoreControlGroup
      {...rest}
      className={`${rest.className || ''} reqore-pagination-wrapper`}
      style={{ justifyContent: 'center' }}
    >
      {infinite && !isLastPage ? (
        <ReqoreControlGroup vertical>
          <div className='reqore-auto-scroll-target' ref={setScrollTargetRef} />
          <ReqoreControlGroup stack>
            <ReqoreButton
              icon='ArrowDropDownLine'
              badge={itemsPerPage}
              iconsAlign='center'
              {...loadMoreButtonProps}
              onClick={next}
              ref={setLoadMoreRef}
              style={{
                scrollMarginTop: '200px',
              }}
            >
              {showLabels && loadMoreLabel}
            </ReqoreButton>
            {showLoadAllButton && (
              <ReqoreButton
                icon='ArrowDropDownLine'
                badge={itemsLeft}
                iconsAlign='center'
                {...loadAllButtonProps}
                onClick={last}
                style={{
                  scrollMarginTop: '200px',
                }}
              >
                {showLabels && loadAllLabel}
              </ReqoreButton>
            )}
          </ReqoreControlGroup>
        </ReqoreControlGroup>
      ) : null}
      {!infinite ? (
        <>
          {showPagesAs === 'list' || (showControls && !showPages) ? (
            <ReqoreButton
              icon='RewindMiniLine'
              fixed
              {...controlPageButtonProps}
              onClick={first}
              disabled={isFirstPage}
              tooltip={!showLabels && firstPageLabel}
            >
              {showLabels && firstPageLabel}
            </ReqoreButton>
          ) : null}
          {showControls && (
            <ReqoreButton
              icon='ArrowDropLeftLine'
              fixed
              {...controlPageButtonProps}
              onClick={back}
              disabled={isFirstPage}
              tooltip={!showLabels && previousPageLabel}
            >
              {showLabels && previousPageLabel}
            </ReqoreButton>
          )}
          {showPages && (
            <StyledPagesWrapper wrap horizontalAlign='center'>
              {showPagesAs === 'buttons' ? (
                pages.map((page) => (
                  <ReqoreButton
                    textAlign='center'
                    fixed
                    key={page}
                    onClick={() => setPage(page)}
                    active={page === currentPage}
                    {...(page === currentPage ? activePageButtonProps : pageButtonProps)}
                  >
                    {page}
                  </ReqoreButton>
                ))
              ) : (
                <ReqoreDropdown
                  filterable
                  label={`${showLabels ? `${pageLabel} ` : ''}${currentPage} / ${pageCount}`}
                  items={pages.map((page) => ({
                    label: `${showLabels ? `${pageLabel} ` : ''}${page}`,
                    onClick: () => setPage(page),
                    selected: page === currentPage,
                    ...(page === currentPage
                      ? (activePageButtonProps as IReqoreDropdownItemProps)
                      : (pageButtonProps as IReqoreDropdownItemProps)),
                  }))}
                  placement='bottom'
                  inputProps={{ focusRules: { type: 'auto', viewportOnly: true } }}
                  scrollToSelected
                  {...listPageButtonProps}
                />
              )}
            </StyledPagesWrapper>
          )}
          {showControls && (
            <ReqoreButton
              icon='ArrowDropRightLine'
              fixed
              {...controlPageButtonProps}
              onClick={next}
              disabled={isLastPage}
              tooltip={!showLabels && nextPageLabel}
            >
              {showLabels && nextPageLabel}
            </ReqoreButton>
          )}
          {showPagesAs === 'list' || (showControls && !showPages) ? (
            <ReqoreButton
              icon='SpeedMiniLine'
              fixed
              {...controlPageButtonProps}
              onClick={last}
              disabled={isLastPage}
              tooltip={!showLabels && lastPageLabel}
            >
              {showLabels && lastPageLabel}
            </ReqoreButton>
          ) : null}
        </>
      ) : null}
    </ReqoreControlGroup>
  );
}

export const ReqorePagination = memo(Pagination) as typeof Pagination;
