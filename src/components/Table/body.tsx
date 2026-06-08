import count from 'lodash/size';
import { forwardRef, memo, useCallback, useEffect, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import styled, { css } from 'styled-components';
import { TABLE_SIZE_TO_PX } from '../../constants/sizes';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { getTotalColumnsWidth } from './helpers';
import ReqoreTableRow, { IReqoreTableRowOptions } from './row';
import { ReqoreTableScrollbar } from './scrollbar';

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

// Wrapper that owns the overlay scrollbar's positioning context. The native
// scroll container (`StyledList` / `StyledNonVirtualizedBody`) lives inside;
// the overlay thumb is absolutely positioned over its right edge.
const StyledBodyWrapper = styled.div`
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
`;

// Hide the native scrollbar so the body's content area is always the full
// container width. The header and body therefore align by construction —
// nothing needs to measure the scrollbar at runtime. Scrolling still works
// natively (wheel, trackpad, touch, keyboard); the overlay thumb above is a
// purely visual cue + drag handle.
const hideNativeScrollbar = css`
  scrollbar-width: none;
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;

const StyledList = styled(List)`
  box-sizing: border-box;
  ${hideNativeScrollbar}
`;

const StyledNonVirtualizedBody = styled.div<{ height?: number; minWidth: number }>`
  ${({ height, minWidth }) => css`
    box-sizing: border-box;
    overflow: auto;
    ${hideNativeScrollbar}
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
        <StyledBodyWrapper>
          <StyledNonVirtualizedBody
            className='reqore-table-body'
            ref={targetRef}
            height={height || height === 0 ? measuredHeight : undefined}
            minWidth={totalColumnsWidth}
          >
            {data.map(renderNonVirtualizedRow)}
          </StyledNonVirtualizedBody>
          <ReqoreTableScrollbar targetRef={targetRef} />
        </StyledBodyWrapper>
      );
    }

    return (
      <StyledBodyWrapper>
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
        <ReqoreTableScrollbar targetRef={targetRef} />
      </StyledBodyWrapper>
    );
  }
);

export default memo(ReqoreTableBody);
