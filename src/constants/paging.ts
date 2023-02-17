import { IReqoreCollectionPagingOptions } from '../components/Collection';
import { IReqorePaginationProps } from '../components/Paging';
import { IReqorePagingOptions } from '../hooks/usePaging';

export type TReqorePaginationType =
  | true
  | 'list'
  | 'infinite'
  | 'auto-load'
  | IReqoreCollectionPagingOptions;

export function getPaginationOptionsFromType<T>(type: TReqorePaginationType): {
  pagingOptions?: Omit<IReqorePagingOptions<T>, 'items'>;
  componentOptions?: Partial<Omit<IReqorePaginationProps<T>, 'items'>>;
  pageControlsPosition?: 'top' | 'bottom' | 'both';
} {
  if (!type) return {};

  if (typeof type === 'object') {
    const {
      infinite,
      itemsPerPage,
      pagesToShow,
      startPage,
      pageControlsPosition = 'bottom',
      ...componentOptions
    } = type;
    return {
      pagingOptions: { infinite, itemsPerPage, pagesToShow, startPage },
      pageControlsPosition,
      componentOptions,
    };
  }

  switch (type) {
    case true:
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
  }
}
