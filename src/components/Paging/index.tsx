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
  firstPageLabel?: string;
  lastPageLabel?: string;
  nextPageLabel?: string;
  previousPageLabel?: string;
  pageLabel?: string;
  loadMoreLabel?: string;
  showPages?: boolean;
  showControls?: boolean;
  showPagesAs?: 'buttons' | 'list';
  showLabels?: boolean;
  scrollOnLoadMore?: boolean;
  autoLoadMore?: boolean;
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
  allPages,
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
  firstPageLabel = 'First',
  lastPageLabel = 'Last',
  nextPageLabel = 'Next',
  previousPageLabel = 'Back',
  pageLabel = 'Page',
  loadMoreLabel = 'Load more',
  showLabels,
  showPages = true,
  showControls = true,
  scrollOnLoadMore,
  autoLoadMore,
  itemsPerPage,
  renderControls,
  scrollContainer,
  scrollToTopOnPageChange = true,
  ...rest
}: IReqorePaginationProps<T>) {
  const [loadMoreRef, setLoadMoreRef] = useState<HTMLButtonElement>(undefined);
  const [scrollTargetRef, setScrollTargetRef] = useState<HTMLDivElement>(undefined);
  const observer = useRef<IntersectionObserver>(null);

  useEffect(() => {
    if (scrollTargetRef && scrollOnLoadMore && !isLastPage && !isFirstPage) {
      scrollTargetRef.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    }
  }, [currentPage, scrollTargetRef, scrollOnLoadMore, isLastPage, isFirstPage]);

  // Scroll to bottom on load more
  useEffect(() => {
    if (scrollContainer && scrollOnLoadMore && !isFirstPage) {
      scrollContainer.scrollBy?.({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [currentPage, scrollContainer, scrollOnLoadMore, isFirstPage]);

  // Scroll to top on page change
  useEffect(() => {
    if (scrollContainer && scrollToTopOnPageChange && !infinite) {
      scrollContainer.scrollTo?.({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [currentPage, scrollContainer, scrollToTopOnPageChange, infinite]);

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
          <ReqoreButton
            icon='ArrowDropDownLine'
            badge={itemsLeft}
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
