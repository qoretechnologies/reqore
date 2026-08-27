import count from 'lodash/size';
import { forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FixedSizeList, VariableSizeList } from 'react-window';
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
  /**
   * Rows rendered beyond the visible band, above and below. See
   * `IReqoreTableProps.overscanRowCount` for the public-facing docs.
   */
  overscanRowCount?: number;
  /** See `IReqoreTableProps.estimatedExpandedRowHeight`. */
  estimatedExpandedRowHeight?: number;
}

/**
 * Floor for the overscan, for the case where the body is short enough that one
 * viewport is only a row or two — the point is to survive a flick, and a flick
 * is the same speed whatever the table's height.
 */
const MIN_OVERSCAN_ROWS = 8;

// Wrapper that owns the overlay scrollbar's positioning context. The native
// scroll container (the react-window list / `StyledNonVirtualizedBody`) lives inside;
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

const StyledFixedList = styled(FixedSizeList)`
  box-sizing: border-box;
  ${hideNativeScrollbar}
`;

/* Used only when rows can expand. A panel's height is not knowable up front and
   changes while it is open, so the list has to be told each item's size — and
   re-told whenever a measurement lands. */
const StyledVariableList = styled(VariableSizeList)`
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
      overscanRowCount,
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

    // Keep `itemData`'s IDENTITY stable while its contents are unchanged.
    //
    // This used to be a `useMemo` keyed on `[data, size, rest]`, which cannot
    // work: `rest` is a rest-spread, so it is a new object on every render and
    // the memo never holds. react-window therefore saw new item data on every
    // render, and since it hands `itemData` to each row as a prop, every
    // mounted row re-rendered whenever ANYTHING above the table rendered —
    // which is both wasted work and, on a long table, the difference between
    // committing a scroll window within the frame and missing it.
    //
    // A dependency array cannot express this (spreading `rest`'s values would
    // change the array's LENGTH whenever a caller starts or stops passing an
    // optional prop, which React rejects), so this compares shallowly against
    // the previous value and reuses it when nothing moved. Writing a ref during
    // render is sound for a pure "cache the last value" cell like this one.
    const itemDataRef = useRef<IReqoreTableRowOptions>();
    const nextItemData = { data, size, ...rest } as IReqoreTableRowOptions;
    const previousItemData = itemDataRef.current;
    const itemDataUnchanged =
      !!previousItemData &&
      (() => {
        const previousKeys = Object.keys(previousItemData);
        const nextKeys = Object.keys(nextItemData);
        return (
          previousKeys.length === nextKeys.length &&
          nextKeys.every((key) => Object.is(previousItemData[key], nextItemData[key]))
        );
      })();
    if (!itemDataUnchanged) {
      itemDataRef.current = nextItemData;
    }
    const itemData = itemDataRef.current;

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

    /**
     * Measured heights of open detail panels, keyed by expansion id.
     *
     * A ref, not state: the row reports its height from a ResizeObserver, and
     * the only thing that has to happen in response is telling react-window to
     * re-measure from that index down. Routing it through state would re-render
     * every row to move one of them.
     */
    const expandedHeights = useRef<Record<string, number>>({});
    const listRef = useRef<VariableSizeList>(null);
    /* Bumped whenever a panel reports a new height. The heights themselves live
       in a ref because react-window is told about them imperatively — but a
       table that sizes ITSELF has to recompute its own height when they change,
       and a ref cannot ask for that. */
    const [measuredVersion, setMeasuredVersion] = useState(0);

    const expandable = !!rest.renderExpandedRow;
    const expandedIds = rest.expanded;

    const expandIdFor = useCallback(
      (index: number): string =>
        `${data[index]?._expandId ?? data[index]?._selectId ?? data[index]?._reqoreIndex ?? index}`,
      [data]
    );

    const isExpanded = useCallback(
      (index: number): boolean =>
        !!expandedIds?.some((id) => id.toString() === expandIdFor(index)),
      [expandedIds, expandIdFor]
    );

    const itemSize = useCallback(
      (index: number): number =>
        isExpanded(index)
          ? rowHeight +
            (expandedHeights.current[expandIdFor(index)] ?? rest.estimatedExpandedRowHeight ?? 200)
          : rowHeight,
      [isExpanded, expandIdFor, rowHeight, rest.estimatedExpandedRowHeight]
    );

    /** A panel reported its height — re-measure from its row down. */
    const handleExpandedHeight = useCallback(
      (index: number, panelHeight: number) => {
        const key = expandIdFor(index);
        if (expandedHeights.current[key] === panelHeight) return;
        expandedHeights.current[key] = panelHeight;
        listRef.current?.resetAfterIndex(index);
        setMeasuredVersion((version) => version + 1);
      },
      [expandIdFor]
    );

    /* Which rows are open has changed, so every size from the first affected
       row down is stale. Reset from 0 rather than tracking the delta: the list
       recomputes lazily and this runs only on a toggle. */
    useEffect(() => {
      if (expandable) listRef.current?.resetAfterIndex(0);
    }, [expandedIds, expandable]);

    /**
     * How tall the body's content is, with any open panels included.
     *
     * `itemCount * rowHeight` is only true while every row is the same height.
     * An expanded row is not, so a table left to size itself clipped its own
     * panels: the row showed as open and the detail underneath it was simply
     * cut off. Sum the real item sizes when rows can expand.
     */
    const contentHeight = useMemo(() => {
      if (!expandable) return itemCount * rowHeight;

      let total = 0;
      for (let index = 0; index < itemCount; index += 1) total += itemSize(index);
      return total;
      // `measuredVersion` is the dependency that matters: `itemSize` reads
      // panel heights out of a ref, so nothing else here changes when one lands.
    }, [expandable, itemCount, rowHeight, itemSize, measuredVersion]);

    const measuredHeight = useMemo(() => {
      if ((!height && height !== 0) || height > contentHeight) {
        return contentHeight;
      }
      return height;
    }, [height, contentHeight]);

    /**
     * How far ahead of the viewport to render.
     *
     * react-window's default is 2 rows, and that is the reason a fast scroll
     * shows blank strips: the window is advanced by a `setState` in a passive
     * scroll handler, so the browser paints the scrolled container one or more
     * frames before React commits the rows that belong there. Two rows is
     * roughly 66px of cover, while a single trackpad flick moves several
     * hundred — so the leading edge of the body is simply empty until the next
     * commit lands.
     *
     * One viewport's worth of rows is the principled default: it guarantees
     * the rendered window covers a full screen of travel between commits,
     * which is more than any one frame can consume.
     */
    const overscanCount = useMemo(
      () =>
        overscanRowCount ??
        Math.max(MIN_OVERSCAN_ROWS, Math.ceil(measuredHeight / rowHeight)),
      [overscanRowCount, measuredHeight, rowHeight]
    );

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

    if (expandable) {
      return (
        <StyledBodyWrapper>
          <StyledVariableList
            ref={listRef}
            outerRef={targetRef}
            itemCount={itemCount}
            height={measuredHeight}
            className='reqore-table-body'
            itemSize={itemSize}
            itemData={{ ...itemData, onExpandedHeight: handleExpandedHeight }}
            estimatedItemSize={rowHeight}
            overscanCount={overscanCount}
            width='100%'
          >
            {ReqoreTableRow}
          </StyledVariableList>
          <ReqoreTableScrollbar targetRef={targetRef} />
        </StyledBodyWrapper>
      );
    }

    return (
      <StyledBodyWrapper>
        <StyledFixedList
          outerRef={targetRef}
          itemCount={itemCount}
          height={measuredHeight}
          className='reqore-table-body'
          itemSize={rowHeight}
          itemData={itemData}
          overscanCount={overscanCount}
          width='100%'
        >
          {ReqoreTableRow}
        </StyledFixedList>
        <ReqoreTableScrollbar targetRef={targetRef} />
      </StyledBodyWrapper>
    );
  }
);

export default memo(ReqoreTableBody);
