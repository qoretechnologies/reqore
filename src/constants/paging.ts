import { IReqorePaginationComponentProps, IReqorePaginationProps } from '../components/Paging';
import { IReqorePagingOptions } from '../hooks/usePaging';

export type TReqorePaginationType<T> =
  | 'buttons'
  | 'list'
  | 'infinite'
  | 'auto-load'
  | IReqoreComponentPagingOptions<T>;

export interface IReqoreComponentPagingOptions<T>
  extends Omit<IReqorePagingOptions<T>, 'items'>,
    IReqorePaginationComponentProps {
  pageControlsPosition?: 'top' | 'bottom' | 'both';
  includeTopControls?: boolean;
  includeBottomControls?: boolean;
}

export type TReqorePaginationTypeResult<T> = {
  pagingOptions?: Omit<IReqorePagingOptions<T>, 'items'>;
  componentOptions?: Partial<Omit<IReqorePaginationProps<T>, 'items'>>;
  pageControlsPosition?: 'top' | 'bottom' | 'both';
  includeTopControls?: boolean;
  includeBottomControls?: boolean;
};

export function getPaginationOptionsFromType<T>(
  type: TReqorePaginationType<T>
): TReqorePaginationTypeResult<T> {
  if (!type) return {};

  if (typeof type === 'object') {
    const {
      infinite,
      itemsPerPage,
      pagesToShow,
      startPage,
      pageControlsPosition = 'bottom',
      includeBottomControls,
      includeTopControls,
      ...componentOptions
    } = type;
    return {
      pagingOptions: { infinite, itemsPerPage, pagesToShow, startPage },
      pageControlsPosition,
      componentOptions,
      includeBottomControls,
      includeTopControls,
    };
  }

  switch (type) {
    case 'buttons':
      return {};
    case 'list':
      return {
        componentOptions: {
          showPagesAs: 'list',
        },
      };
    case 'infinite':
    case 'auto-load':
      return { pagingOptions: { infinite: true } };
    default:
      return {};
  }
}
