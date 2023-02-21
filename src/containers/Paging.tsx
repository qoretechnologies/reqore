import { memo, useMemo } from 'react';
import {
  IReqorePaginationComponentProps,
  IReqorePaginationProps,
  ReqorePagination,
} from '../components/Paging';
import { ReqoreVerticalSpacer } from '../components/Spacer';
import {
  getPaginationOptionsFromType,
  TReqorePaginationType,
  TReqorePaginationTypeResult,
} from '../constants/paging';
import { PADDING_FROM_SIZE, TSizes } from '../constants/sizes';
import { IReqorePagingResult, useReqorePaging } from '../hooks/usePaging';

export interface IReqorePagingContainerProps<T> {
  type?: TReqorePaginationType<T>;
  items: T[];
  scrollContainer?: IReqorePaginationComponentProps['scrollContainer'];
  children: (
    items: T[],
    Controls: JSX.Element,
    options: TReqorePaginationTypeResult<T>
  ) => React.ReactNode;
  size?: TSizes;
}

function PagingControls<T>({
  withSpacer,
  position,
  pagingData,
  componentOptions,
  scrollContainer,
  size,
  ...pagingProps
}: Partial<IReqorePaginationProps<T>> &
  Partial<TReqorePaginationTypeResult<T>> & {
    withSpacer?: boolean;
    position?: 'top' | 'bottom';
    pagingData: Omit<IReqorePagingResult<T>, 'items'>;
  }) {
  return pagingData.renderControls ? (
    <>
      {withSpacer && position === 'bottom' ? (
        <ReqoreVerticalSpacer height={PADDING_FROM_SIZE[size]} />
      ) : null}
      <ReqorePagination
        key={`reqore-pagination-${position}`}
        size={size}
        {...pagingData}
        {...componentOptions}
        scrollContainer={scrollContainer}
        {...pagingProps}
      />
      {withSpacer && position === 'top' ? (
        <ReqoreVerticalSpacer height={PADDING_FROM_SIZE[size]} />
      ) : null}
    </>
  ) : null;
}

function PagingContainer<T>({
  type,
  items,
  scrollContainer,
  children,
  size = 'normal',
}: IReqorePagingContainerProps<T>) {
  const {
    pagingOptions = {},
    componentOptions = {},
    pageControlsPosition = 'bottom',
    includeTopControls = true,
    includeBottomControls = true,
  } = useMemo(() => getPaginationOptionsFromType(type), [type]);

  const { items: finalItems, ...pagingData } = useReqorePaging({
    items,
    ...pagingOptions,
    enabled: !!type,
  });

  return (
    <>
      {includeTopControls && (pageControlsPosition === 'top' || pageControlsPosition === 'both') ? (
        <PagingControls<T>
          key='top-paging'
          position='top'
          withSpacer
          scrollContainer={scrollContainer}
          size={size}
          pagingData={pagingData}
          pagingOptions={pagingOptions}
          componentOptions={componentOptions}
          autoLoadMore={false}
          scrollOnLoadMore={false}
        />
      ) : null}

      {children(
        finalItems,
        <PagingControls
          key='custom-paging'
          scrollContainer={scrollContainer}
          size={size}
          pagingData={pagingData}
          pagingOptions={pagingOptions}
          componentOptions={componentOptions}
        />,
        {
          pagingOptions,
          componentOptions,
          pageControlsPosition,
          includeTopControls,
          includeBottomControls,
        }
      )}

      {includeBottomControls &&
      (pageControlsPosition === 'bottom' || pageControlsPosition === 'both') ? (
        <PagingControls<T>
          key='bottom-paging'
          position='bottom'
          withSpacer
          scrollContainer={scrollContainer}
          size={size}
          pagingData={pagingData}
          pagingOptions={pagingOptions}
          componentOptions={componentOptions}
        />
      ) : null}
    </>
  );
}

export const ReqorePaginationContainer = memo(PagingContainer) as typeof PagingContainer;
