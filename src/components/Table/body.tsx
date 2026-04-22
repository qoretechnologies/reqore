import count from 'lodash/size';
import { forwardRef, memo, useCallback, useEffect, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import styled, { css } from 'styled-components';
import { TABLE_SIZE_TO_PX } from '../../constants/sizes';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { getTotalColumnsWidth } from './helpers';
import ReqoreTableRow, { IReqoreTableRowOptions } from './row';

export interface IReqoreTableSectionBodyProps extends IReqoreTableRowOptions {
  height: number;
  headerRef: React.RefObject<HTMLDivElement>;
  virtualized?: boolean;
  onScrollChange?: (isScrolled: boolean) => void;
}

const StyledList = styled(List)``;

const StyledNonVirtualizedBody = styled.div<{ height: number; minWidth: number }>`
  ${({ height, minWidth }) => css`
    overflow: auto;
    height: ${height}px;
    > * {
      min-width: ${minWidth}px;
    }
  `}
`;

const ReqoreTableBody = forwardRef<HTMLDivElement, IReqoreTableSectionBodyProps>(
  (
    {
      data,
      height,
      size = 'normal',
      headerRef,
      virtualized = true,
      onScrollChange,
      ...rest
    }: IReqoreTableSectionBodyProps,
    ref
  ) => {
    const { targetRef } = useCombinedRefs(ref);

    const rowHeight = useMemo(
      () => (rest.flat ? TABLE_SIZE_TO_PX[size] : TABLE_SIZE_TO_PX[size] + 1),
      [size, rest.flat]
    );

    const itemCount = useMemo(() => count(data), [data]);

    const totalColumnsWidth = useMemo(() => getTotalColumnsWidth(rest.columns), [rest.columns]);

    const itemData = useMemo(() => {
      return {
        data,
        size,
        ...rest,
      };
    }, [data, size, rest]);

    // Sync body horizontal scroll to the header and notify vertical scroll state
    useEffect(() => {
      const el = targetRef.current;
      if (!el) {
        return undefined;
      }

      const handleScroll = () => {
        if (headerRef.current) {
          headerRef.current.scrollLeft = el.scrollLeft;
        }
        onScrollChange?.(el.scrollTop > 0);
      };

      el.addEventListener('scroll', handleScroll, { passive: true });
      return () => el.removeEventListener('scroll', handleScroll);
    }, [headerRef, onScrollChange, targetRef]);

    const measuredHeight = useMemo(() => {
      if ((!height && height !== 0) || height > itemCount * rowHeight) {
        return itemCount * rowHeight;
      }
      return height;
    }, [height, itemCount, rowHeight]);

    const renderNonVirtualizedRow = useCallback(
      (_item: unknown, index: number) => (
        <ReqoreTableRow key={index} data={itemData} index={index} />
      ),
      [itemData]
    );

    if (!virtualized) {
      return (
        <StyledNonVirtualizedBody
          className='reqore-table-body'
          ref={targetRef}
          height={measuredHeight}
          minWidth={totalColumnsWidth}
        >
          {data.map(renderNonVirtualizedRow)}
        </StyledNonVirtualizedBody>
      );
    }

    return (
      <StyledList
        outerRef={targetRef}
        itemCount={itemCount}
        height={measuredHeight}
        className='reqore-table-body'
        itemSize={rowHeight}
        itemData={itemData}
        width='100%'
      >
        {ReqoreTableRow}
      </StyledList>
    );
  }
);

export default memo(ReqoreTableBody);
