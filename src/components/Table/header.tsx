import { omit } from 'lodash';
import { forwardRef, useCallback } from 'react';
import { useMount } from 'react-use';
import styled, { css } from 'styled-components';
import { IReqoreTableColumn, IReqoreTableSort } from '.';
import { SIZE_TO_PX, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness } from '../../helpers/colors';
import { alignToFlexAlign } from '../../helpers/utils';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { IWithReqoreSize } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { IReqoreButtonProps } from '../Button';
import { IReqoreTableHeaderCellProps, ReqoreTableHeaderCell } from './headerCell';
import { calculateMinimumCellWidth, getOnlyShownColumns } from './helpers';

export type TColumnsUpdater = <T extends keyof IReqoreTableColumn>(
  id: string,
  key: T,
  value: IReqoreTableColumn[T]
) => void;

export interface IReqoreCustomHeaderCellProps
  extends Pick<
      IReqoreTableHeaderCellProps,
      'sortData' | 'onSortChange' | 'onColumnsUpdate' | 'onFilterChange'
    >,
    Omit<IReqoreTableColumn, 'cell' | 'header'>,
    Omit<IReqoreButtonProps, 'maxWidth'> {
  hasColumns?: boolean;
}
export interface IReqoreCustomHeaderCellComponent extends React.FC<IReqoreCustomHeaderCellProps> {}

export interface IReqoreTableSectionProps extends IWithReqoreSize {
  columns: IReqoreTableColumn[];
  onSortChange?: (sort: string) => void;
  sortData: IReqoreTableSort;
  selectable?: boolean;
  selectedQuant: 'none' | 'all' | 'some';
  onToggleSelectClick: () => void;
  hasVerticalScroll: boolean;
  selectToggleTooltip?: string;
  onColumnsUpdate: TColumnsUpdater;
  onFilterChange?: (dataId: string, value: any) => void;
  component?: IReqoreCustomHeaderCellComponent;
  heightAsGroup?: boolean;
  scrollable?: boolean;
  bodyRef: React.RefObject<HTMLDivElement>;
}

export interface IReqoreTableSectionStyle {
  leftScroll: number;
  hasVerticalScroll: boolean;
  theme: IReqoreTheme;
  heightAsGroup?: boolean;
  size?: TSizes;
}

const StyledTableHeaderWrapper = styled.div<IReqoreTableSectionStyle>`
  ${({ heightAsGroup, size }) => css`
    display: flex;

    overflow-x: auto;
    overflow-y: hidden;
    ::-webkit-scrollbar {
      display: none;
    }

    flex-shrink: 0;
    flex-flow: column;
    height: ${heightAsGroup ? `${SIZE_TO_PX[size] * 2}px` : undefined};

    ${({ theme }) => css`
      background-color: ${theme.main};
    `}
  `}
`;

export interface IReqoreTableHeaderStyle {
  width?: number;
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

const StyledColumnGroup = styled.div<IReqoreTableHeaderStyle>`
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

const ReqoreTableHeader = forwardRef<HTMLDivElement, IReqoreTableSectionProps>(
  (
    {
      columns,
      onSortChange,
      sortData,
      selectable,
      selectedQuant,
      onToggleSelectClick,
      selectToggleTooltip,
      hasVerticalScroll,
      onColumnsUpdate,
      onFilterChange,
      size,
      component,
      heightAsGroup,
      scrollable,
      bodyRef,
    }: IReqoreTableSectionProps,
    ref
  ) => {
    const { targetRef } = useCombinedRefs(ref);

    useMount(() => {
      if (scrollable) {
        targetRef.current?.addEventListener('wheel', (e) => {
          if (e.deltaX) {
            e.preventDefault();

            targetRef.current?.scrollTo({ left: targetRef.current?.scrollLeft + e.deltaX });
            bodyRef.current?.scrollTo({ left: bodyRef.current?.scrollLeft + e.deltaX });
          }
        });
      }
    });

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

    const renderColumns = (columns: IReqoreTableColumn[]) =>
      getOnlyShownColumns(columns).map(
        (
          {
            grow,
            align,
            dataId,
            header: { columns, onClick, component: headerComponent, ...rest },
            ...colRest
          },
          index
        ) =>
          columns ? (
            <StyledColumnGroup
              grow={getOnlyShownColumns(columns).reduce((gr, col) => gr + col.grow, 0)}
              key={index}
              className='reqore-table-column-group'
              width={getOnlyShownColumns(columns).reduce(
                (wid, col) => wid + (col.resizedWidth || col.width || 80),
                0
              )}
              maxWidth={getOnlyShownColumns(columns).reduce((wid, col) => wid + col.maxWidth, 0)}
              minWidth={getOnlyShownColumns(columns).reduce((wid, col) => wid + col.minWidth, 0)}
            >
              {renderHeaderCell(headerComponent, {
                ...rest,
                ...omit(colRest, ['cell']),
                dataId,
                size,
                readOnly: !onClick,
                rounded: false,
                textAlign: align,
                className: 'reqore-table-column-group-header',
                resizable: false,
                hideable: false,
                hasColumns: true,
              })}
              <StyledColumnGroupHeaders className='reqore-table-headers'>
                {renderColumns(columns)}
              </StyledColumnGroupHeaders>
            </StyledColumnGroup>
          ) : (
            renderHeaderCell(headerComponent, {
              ...rest,
              ...omit(colRest, ['cell']),
              dataId,
              size,
              sortData,
              grow,
              align,
              onSortChange,
              onColumnsUpdate,
              onFilterChange,
            })
          )
      );

    const getSelectedIcon = (): IReqoreIconName => {
      switch (selectedQuant) {
        case 'all':
          return 'CheckboxCircleLine';
        case 'some':
          return 'IndeterminateCircleLine';
        default:
          return 'CheckboxBlankCircleLine';
      }
    };

    return (
      <StyledTableHeaderWrapper
        className='reqore-table-header-wrapper'
        hasVerticalScroll={hasVerticalScroll}
        heightAsGroup={heightAsGroup}
        size={size}
        ref={targetRef}
      >
        <StyledTableHeaderRow>
          {selectable &&
            renderHeaderCell(component, {
              dataId: 'selectbox',
              sortData,
              align: 'center',
              size,
              onSortChange,
              icon: getSelectedIcon(),
              width: calculateMinimumCellWidth(50, size),
              resizable: false,
              hideable: false,
              tooltip: selectToggleTooltip || 'Toggle selection on all data',
              onClick: () => {
                onToggleSelectClick();
              },
            })}
          {renderColumns(columns)}
        </StyledTableHeaderRow>
      </StyledTableHeaderWrapper>
    );
  }
);

export default ReqoreTableHeader;
