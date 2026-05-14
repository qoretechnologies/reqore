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
  /**
   * Uniform pixel height for every body row. Overrides the size-derived
   * default. See `IReqoreTableProps.rowHeight` for the public-facing docs.
   */
  rowHeight?: number;
}

const StyledList = styled(List)``;

const StyledNonVirtualizedBody = styled.div<{ height?: number; minWidth: number }>`
  ${({ height, minWidth }) => css`
    overflow: auto;
    ${height || height === 0
      ? css`
          height: ${height}px;
        `
      : ''}
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
      rowHeight: rowHeightOverride,
      ...rest
    }: IReqoreTableSectionBodyProps,
    ref
  ) => {
    const { targetRef } = useCombinedRefs(ref);

    const rowHeight = useMemo(() => {
      if (typeof rowHeightOverride === 'number' && rowHeightOverride > 0) {
        return rowHeightOverride;
      }
      return rest.flat ? TABLE_SIZE_TO_PX[size] : TABLE_SIZE_TO_PX[size] + 1;
    }, [rowHeightOverride, size, rest.flat]);

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
      // Non-virtualized rows can wrap and exceed the fixed `rowHeight`, so pinning a pixel
      // height would force a vertical scrollbar. Only set a height when the caller explicitly
      // requested one — otherwise let the body grow to fit its content.
      return (
        <StyledNonVirtualizedBody
          className='reqore-table-body'
          ref={targetRef}
          height={height || height === 0 ? measuredHeight : undefined}
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
