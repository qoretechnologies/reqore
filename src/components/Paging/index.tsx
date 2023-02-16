import { memo } from 'react';
import { ReqoreDropdown } from '../..';
import { IReqorePagingResult } from '../../hooks/usePaging';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import ReqoreControlGroup, { IReqoreControlGroupProps } from '../ControlGroup';
import { IReqoreDropdownProps } from '../Dropdown';
import { IReqoreDropdownItemProps } from '../Dropdown/item';

export interface IReqorePaginationProps<T>
  extends IReqorePagingResult<T>,
    Omit<IReqoreControlGroupProps, 'children'> {
  pageButtonProps?: IReqoreButtonProps;
  activePageButtonProps?: IReqoreButtonProps;
  listPageButtonProps?: IReqoreDropdownProps;
  controlPageButtonProps?: IReqoreButtonProps;
  firstPageLabel?: string;
  lastPageLabel?: string;
  nextPageLabel?: string;
  previousPageLabel?: string;
  pageLabel?: string;
  showPages?: boolean;
  showControls?: boolean;
  showPagesAs?: 'buttons' | 'list';
  showLabels?: boolean;
}

function Pagination<T>({
  allPages,
  back,
  first,
  currentPage,
  isLastPage,
  isFirstPage,
  pages,
  items,
  last,
  next,
  setPage,
  showPagesAs = 'buttons',
  pageButtonProps = {},
  activePageButtonProps = {},
  listPageButtonProps = {},
  controlPageButtonProps = {},
  firstPageLabel = 'First',
  lastPageLabel = 'Last',
  nextPageLabel = 'Next',
  previousPageLabel = 'Back',
  pageLabel = 'Page',
  showLabels,
  showPages = true,
  showControls = true,
  ...rest
}: IReqorePaginationProps<T>) {
  return (
    <ReqoreControlGroup {...rest} style={{ justifyContent: 'center' }}>
      {showControls && (
        <ReqoreButton
          icon='RewindMiniLine'
          fixed
          {...controlPageButtonProps}
          onClick={first}
          disabled={isFirstPage}
        >
          {showLabels && firstPageLabel}
        </ReqoreButton>
      )}
      {showControls && (
        <ReqoreButton
          icon='ArrowDropLeftLine'
          fixed
          {...controlPageButtonProps}
          onClick={back}
          disabled={isFirstPage}
        >
          {showLabels && previousPageLabel}
        </ReqoreButton>
      )}
      {showPages && (
        <ReqoreControlGroup wrap horizontalAlign='center'>
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
              label={`${showLabels ? `${pageLabel} ` : ''}${currentPage}`}
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
        </ReqoreControlGroup>
      )}
      {showControls && (
        <ReqoreButton
          icon='ArrowDropRightLine'
          fixed
          {...controlPageButtonProps}
          onClick={next}
          disabled={isLastPage}
        >
          {showLabels && nextPageLabel}
        </ReqoreButton>
      )}
      {showControls && (
        <ReqoreButton
          icon='SpeedMiniLine'
          fixed
          {...controlPageButtonProps}
          onClick={last}
          disabled={isLastPage}
        >
          {showLabels && lastPageLabel}
        </ReqoreButton>
      )}
    </ReqoreControlGroup>
  );
}

export const ReqorePagination = memo(Pagination) as typeof Pagination;
