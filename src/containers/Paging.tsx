import { memo, useMemo } from 'react';
import { IReqorePaginationProps, ReqorePagination } from '../components/Paging';
import { ReqoreVerticalSpacer } from '../components/Spacer';
import {
  TReqorePaginationType,
  TReqorePaginationTypeResult,
  getPaginationOptionsFromType,
} from '../constants/paging';
import { PADDING_FROM_SIZE, TSizes } from '../constants/sizes';
import { useReqorePaging } from '../hooks/usePaging';

export interface IReqorePagingContainerProps<T> {
  type?: TReqorePaginationType<T>;
  items: T[];
  scrollContainer?: HTMLElement;
  children: (
    items: T[],
    Controls: React.FC<Partial<IReqorePaginationProps<T>>>,
    options: TReqorePaginationTypeResult<T>
  ) => React.ReactNode;
  size?: TSizes;
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

  const Controls = ({
    withSpacer,
    position,
    ...pagingProps
  }: Partial<IReqorePaginationProps<T>> & { withSpacer?: boolean; position?: 'top' | 'bottom' }) =>
    pagingData.renderControls ? (
      <>
        {withSpacer && position === 'bottom' ? (
          <ReqoreVerticalSpacer height={PADDING_FROM_SIZE[size]} />
        ) : null}
        <ReqorePagination
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

  return (
    <>
      {includeTopControls && (pageControlsPosition === 'top' || pageControlsPosition === 'both') ? (
        <Controls autoLoadMore={false} scrollOnLoadMore={false} position='top' withSpacer />
      ) : null}

      {children(finalItems, Controls, {
        pagingOptions,
        componentOptions,
        pageControlsPosition,
        includeTopControls,
        includeBottomControls,
      })}

      {includeBottomControls &&
      (pageControlsPosition === 'bottom' || pageControlsPosition === 'both') ? (
        <Controls position='bottom' withSpacer />
      ) : null}
    </>
  );
}

export const ReqorePaginationContainer = memo(PagingContainer) as typeof PagingContainer;
