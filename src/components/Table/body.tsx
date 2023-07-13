import { forwardRef, useMemo } from 'react';
import { useMount } from 'react-use';
import { FixedSizeList as List } from 'react-window';
import styled from 'styled-components';
import { TABLE_SIZE_TO_PX } from '../../constants/sizes';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import ReqoreTableRow, { IReqoreTableRowOptions } from './row';

export interface IReqoreTableSectionBodyProps extends IReqoreTableRowOptions {
  height: number;
  refs: {
    left: React.RefObject<HTMLDivElement>;
    right: React.RefObject<HTMLDivElement>;
    main: React.RefObject<HTMLDivElement>;
    header: React.RefObject<HTMLDivElement>;
  };
  type?: 'left' | 'right' | 'main';
  onScrollChange?: (isScrolled: boolean) => void;
}

const StyledList = styled(List)`
  ::-webkit-scrollbar {
    display: none;
  }
`;

const ReqoreTableBody = forwardRef<HTMLDivElement, IReqoreTableSectionBodyProps>(
  (
    {
      data,
      height,
      size = 'normal',
      refs,
      type,
      onScrollChange,
      ...rest
    }: IReqoreTableSectionBodyProps,
    ref
  ) => {
    const { targetRef } = useCombinedRefs(ref);

    useMount(() => {
      targetRef.current?.addEventListener('wheel', (e) => {
        if (e.deltaY) {
          e.preventDefault();

          const currentScroll = refs[type].current?.scrollTop + e.deltaY;

          onScrollChange?.(currentScroll > 0);

          refs[type].current?.scrollTo({ top: currentScroll });

          if (type === 'left') {
            refs.main.current?.scrollTo({ top: refs.main.current?.scrollTop + e.deltaY });
            refs.right.current?.scrollTo({ top: refs.right.current?.scrollTop + e.deltaY });
          } else if (type === 'main') {
            refs.left.current?.scrollTo({ top: refs.left.current?.scrollTop + e.deltaY });
            refs.right.current?.scrollTo({ top: refs.right.current?.scrollTop + e.deltaY });
          } else if (type === 'right') {
            refs.main.current?.scrollTo({ top: refs.main.current?.scrollTop + e.deltaY });
            refs.left.current?.scrollTo({ top: refs.left.current?.scrollTop + e.deltaY });
          }
        }

        if (e.deltaX && type === 'main') {
          refs.header.current?.scrollTo({ left: refs.main.current?.scrollLeft + e.deltaX });
        }
      });
    });

    const rowHeight = useMemo(
      () => (rest.flat ? TABLE_SIZE_TO_PX[size] : TABLE_SIZE_TO_PX[size] + 1),
      [size, rest.flat]
    );

    return (
      <StyledList
        outerRef={targetRef}
        itemCount={data.length}
        // If the defined height is less than the count of items' height
        // use that height instead
        height={height > data.length * rowHeight ? data.length * rowHeight : height}
        className='reqore-table-body'
        itemSize={rest.flat ? TABLE_SIZE_TO_PX[size] : TABLE_SIZE_TO_PX[size] + 1}
        itemData={{
          data,
          size,
          ...rest,
        }}
      >
        {ReqoreTableRow}
      </StyledList>
    );
  }
);

export default ReqoreTableBody;
