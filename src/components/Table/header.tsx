import { omit } from 'lodash';
import { forwardRef, memo, useCallback, useEffect, useMemo } from 'react';
import { css } from 'styled-components';
import { IReqoreTableColumn, IReqoreTableSort } from '.';
import { SIZE_TO_PX, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness } from '../../helpers/colors';
import styled, { omitStyleProps } from '../../helpers/styled';
import { alignToFlexAlign } from '../../helpers/utils';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { IWithReqoreSize } from '../../types/global';
import { IReqoreButtonProps } from '../Button';
import { IReqoreTableHeaderCellProps, ReqoreTableHeaderCell } from './headerCell';
import {
  calculatePinOffsets,
  getColumnsMaxWidth,
  getColumnsMinWidth,
  getColumnsRenderedWidth,
  getOnlyShownColumns,
  getTotalColumnsWidth,
  partitionPinnedColumns,
} from './helpers';

export type TColumnsUpdater = <T extends keyof IReqoreTableColumn>(
  id: string,
  key: T,
  value: IReqoreTableColumn[T]
) => void;

export interface IReqoreCustomHeaderCellProps
  extends Pick<
      IReqoreTableHeaderCellProps,
      | 'sortData'
      | 'onSortChange'
      | 'onColumnsUpdate'
      | 'onFilterChange'
      | 'pinOffset'
      | 'pinEdge'
      | 'parentMinimal'
      | 'sortAscendingLabel'
      | 'sortDescendingLabel'
      | 'pinLeftLabel'
      | 'pinRightLabel'
      | 'hideColumnLabel'
      | 'resetSizeLabel'
      | 'otherActionsLabel'
      | 'columnFilterPlaceholder'
    >,
    Omit<IReqoreTableColumn, 'cell' | 'header'>,
    Omit<IReqoreButtonProps, 'maxWidth' | 'content'> {
  hasColumns?: boolean;
}
export interface IReqoreCustomHeaderCellComponent extends React.FC<IReqoreCustomHeaderCellProps> {}

export interface IReqoreTableSectionProps extends IWithReqoreSize {
  columns: IReqoreTableColumn[];
  onSortChange?: (sort: string) => void;
  sortData: IReqoreTableSort;
  onColumnsUpdate: TColumnsUpdater;
  onFilterChange?: (dataId: string, value: any) => void;
  component?: IReqoreCustomHeaderCellComponent;
  heightAsGroup?: boolean;
  bodyRef: React.RefObject<HTMLDivElement>;
  tableWidth: number;
  /**
   * When `true`, the rendered header cells default to `transparent` + `flat`,
   * which removes the tinted background and the cell border. Mirrors the
   * `minimal` prop on the parent `ReqoreTable`. Per-column `header.flat` or
   * `header.transparent` still wins.
   */
  minimal?: boolean;
  /** See `IReqoreTableProps.sortAscendingLabel`. */
  sortAscendingLabel?: string;
  /** See `IReqoreTableProps.sortDescendingLabel`. */
  sortDescendingLabel?: string;
  /** See `IReqoreTableProps.pinLeftLabel`. */
  pinLeftLabel?: string;
  /** See `IReqoreTableProps.pinRightLabel`. */
  pinRightLabel?: string;
  /** See `IReqoreTableProps.hideColumnLabel`. */
  hideColumnLabel?: string;
  /** See `IReqoreTableProps.resetSizeLabel`. */
  resetSizeLabel?: string;
  /** See `IReqoreTableProps.otherActionsLabel`. */
  otherActionsLabel?: string;
  /** See `IReqoreTableProps.columnFilterPlaceholder`. */
  columnFilterPlaceholder?: string;
}

export interface IReqoreTableSectionStyle {
  theme: IReqoreTheme;
  heightAsGroup?: boolean;
  size?: TSizes;
  minWidth?: number;
}

const StyledTableHeaderWrapper = styled.div<IReqoreTableSectionStyle>`
  ${({ heightAsGroup, size, minWidth }) => css`
    box-sizing: border-box;
    display: flex;

    overflow-x: hidden;
    overflow-y: hidden;
    /* A sideways swipe is the table's to handle (it scrolls the body, which this
       header follows); the page still pans up and down under a finger. */
    touch-action: pan-y;

    flex-shrink: 0;
    flex-flow: column;
    height: ${heightAsGroup ? `${SIZE_TO_PX[size] * 2}px` : undefined};
    ${minWidth
      ? css`
          > * {
            min-width: ${minWidth}px;
          }
        `
      : ''}
  `}
`;

export interface IReqoreTableHeaderStyle {
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  grow?: number;
  theme: IReqoreTheme;
  align?: 'center' | 'left' | 'right';
}

export const StyledColumnGroupHeader = styled.div<IReqoreTableHeaderStyle>`
  ${({ align, theme }) => css`
    background-color: ${changeLightness(theme.main, 0.035)};
    justify-content: ${align ? alignToFlexAlign(align) : 'flex-start'};
  `}
`;

const StyledColumnGroup = styled.div.withConfig({
  shouldForwardProp: omitStyleProps('width'),
})<IReqoreTableHeaderStyle>`
  display: flex;
  flex-flow: column;
  flex-shrink: 0;
  width: ${({ width }) => width}px;
  max-width: ${({ maxWidth = 9999 }) => maxWidth}px;
  min-width: ${({ minWidth, width }) => minWidth || width}px;

  ${({ grow }) =>
    grow &&
    css`
      flex-grow: ${grow};
    `}
`;

const StyledColumnGroupHeaders = styled.div`
  display: flex;
`;

const StyledTableHeaderRow = styled.div<{ theme: IReqoreTheme }>`
  display: flex;
  flex: 1;

  ${StyledColumnGroupHeader} {
    font-size: 13px;
    font-weight: 600;
    padding: 5px 10px;

    display: flex;
    flex-shrink: 0;
    align-items: center;
  }
`;

const getColumnsGrow = (columns: IReqoreTableColumn[]): number | undefined => {
  const grow = columns.reduce((total, column) => total + (column.grow ?? 0), 0);

  return grow || undefined;
};

const ReqoreTableHeader = forwardRef<HTMLDivElement, IReqoreTableSectionProps>(
  (
    {
      columns,
      onSortChange,
      sortData,
      onColumnsUpdate,
      onFilterChange,
      size,
      component,
      heightAsGroup,
      bodyRef,
      tableWidth,
      minimal,
      sortAscendingLabel,
      sortDescendingLabel,
      pinLeftLabel,
      pinRightLabel,
      hideColumnLabel,
      resetSizeLabel,
      otherActionsLabel,
      columnFilterPlaceholder,
    }: IReqoreTableSectionProps,
    ref
  ) => {
    const { targetRef } = useCombinedRefs(ref);

    const pinOffsets = useMemo(() => calculatePinOffsets(columns), [columns]);
    const totalColumnsWidth = useMemo(() => getTotalColumnsWidth(columns), [columns]);

    useEffect(() => {
      const el = targetRef.current;
      if (!el) {
        return undefined;
      }

      // The header does not scroll by itself: the wheel's sideways motion scrolls the body, which
      // it follows - a trackpad's, or a plain wheel's with Shift held (Shift+wheel is sideways).
      const handleWheel = (e: WheelEvent) => {
        const dx = e.deltaX || (e.shiftKey ? e.deltaY : 0);
        if (dx) {
          e.preventDefault();
          bodyRef.current?.scrollTo({ left: bodyRef.current.scrollLeft + dx });
        }
      };

      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }, [bodyRef, targetRef]);

    const renderHeaderCell = useCallback(
      (
        headerCellComponent: IReqoreCustomHeaderCellComponent,
        props: IReqoreCustomHeaderCellProps
      ) => {
        const HeaderCell = headerCellComponent || component || ReqoreTableHeaderCell;

        return <HeaderCell key={props.dataId} {...props} />;
      },
      [component]
    );

    // Defaults applied BEFORE the caller's `header.*` props so per-column header
    // settings (e.g. `header: { flat: false }`) still win over the table-wide
    // `minimal` flag.
    const minimalHeaderDefaults: { flat?: boolean; transparent?: boolean } = minimal
      ? { flat: true, transparent: true }
      : {};

    const renderLeafHeaderCell = (column: IReqoreTableColumn) => {
      const {
        grow,
        align,
        dataId,
        header: { onClick, component: headerComponent, ...rest },
        ...colRest
      } = column;
      const pinInfo = pinOffsets[dataId];
      return renderHeaderCell(headerComponent, {
        ...minimalHeaderDefaults,
        ...rest,
        ...omit(colRest, ['cell']),
        onClick,
        dataId,
        size,
        sortData,
        grow,
        align,
        onSortChange,
        onColumnsUpdate,
        onFilterChange,
        pinOffset: pinInfo?.offset,
        pinEdge: pinInfo?.isEdge,
        parentMinimal: minimal,
        sortAscendingLabel,
        sortDescendingLabel,
        pinLeftLabel,
        pinRightLabel,
        hideColumnLabel,
        resetSizeLabel,
        otherActionsLabel,
        columnFilterPlaceholder,
      });
    };

    const renderGroup = (column: IReqoreTableColumn) => {
      const {
        align,
        dataId,
        header: { columns: subColumns, onClick, component: headerComponent, ...rest },
        ...colRest
      } = column;

      return (
        <StyledColumnGroup
          grow={getColumnsGrow(subColumns)}
          key={dataId}
          className='reqore-table-column-group'
          data-reqore-table-column-group-id={dataId}
          width={getColumnsRenderedWidth(subColumns)}
          maxWidth={getColumnsMaxWidth(subColumns)}
          minWidth={getColumnsMinWidth(subColumns)}
        >
          {renderHeaderCell(headerComponent, {
            ...minimalHeaderDefaults,
            ...rest,
            ...omit(colRest, ['cell']),
            dataId,
            size,
            onClick,
            rounded: false,
            textAlign: align,
            className: 'reqore-table-column-group-header',
            resizable: false,
            hideable: false,
            pinnable: false,
            hasColumns: true,
            grow: 1,
            parentMinimal: minimal,
          })}
          <StyledColumnGroupHeaders className='reqore-table-headers'>
            {renderUnpinnedColumns(subColumns)}
          </StyledColumnGroupHeaders>
        </StyledColumnGroup>
      );
    };

    const renderUnpinnedColumns = (cols: IReqoreTableColumn[]): React.ReactNode[] => {
      return cols.map((column) => {
        if (column.header?.columns) {
          return renderGroup(column);
        }
        return renderLeafHeaderCell(column);
      });
    };

    // Pinned columns physically move to the edges of the header row; non-pinned columns render in
    // the middle with their group structure preserved. `position: sticky` on the pinned cells
    // then keeps them glued during horizontal scroll.
    const renderColumns = (columns: IReqoreTableColumn[]) => {
      const shownColumns: IReqoreTableColumn[] = getOnlyShownColumns(columns, tableWidth);
      const { leftPinned, unpinned, rightPinned } = partitionPinnedColumns(shownColumns);

      return [
        ...leftPinned.map((col) => renderLeafHeaderCell(col)),
        ...renderUnpinnedColumns(unpinned),
        ...rightPinned.map((col) => renderLeafHeaderCell(col)),
      ];
    };

    return (
      <StyledTableHeaderWrapper
        className='reqore-table-header-wrapper'
        heightAsGroup={heightAsGroup}
        size={size}
        minWidth={totalColumnsWidth}
        ref={targetRef}
      >
        <StyledTableHeaderRow>{renderColumns(columns)}</StyledTableHeaderRow>
      </StyledTableHeaderWrapper>
    );
  }
);

export default memo(ReqoreTableHeader);
