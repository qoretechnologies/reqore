import { omit } from 'lodash';
import styled, { css } from 'styled-components';
import { IReqoreTableColumn, IReqoreTableSort } from '.';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness } from '../../helpers/colors';
import { alignToFlexAlign } from '../../helpers/utils';
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
    IReqoreButtonProps {
  hasColumns?: boolean;
}
export interface IReqoreCustomHeaderCellComponent extends React.FC<IReqoreCustomHeaderCellProps> {}

export interface IReqoreTableSectionProps extends IWithReqoreSize {
  columns: IReqoreTableColumn[];
  leftScroll: number;
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
}

export interface IReqoreTableSectionStyle {
  leftScroll: number;
  hasVerticalScroll: boolean;
  theme: IReqoreTheme;
}

const StyledTableHeaderWrapper = styled.div<IReqoreTableSectionStyle>`
  ${({ leftScroll }) => css`
    display: flex;
    flex-flow: column;
    transform: translate3d(${-leftScroll}px, 0, 0);

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
  width: ${({ width }) => width}px;

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

const ReqoreTableHeader = ({
  columns,
  leftScroll,
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
}: IReqoreTableSectionProps) => {
  const renderHeaderCell = (
    headerCellComponent: IReqoreCustomHeaderCellComponent,
    props: IReqoreCustomHeaderCellProps
  ) => {
    const HeaderCell = headerCellComponent || component || ReqoreTableHeaderCell;

    return <HeaderCell key={props.dataId} {...props} />;
  };

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
            grow={grow}
            key={index}
            className='reqore-table-column-group'
            width={getOnlyShownColumns(columns).reduce(
              (wid, col) => wid + (col.resizedWidth || col.width || 80),
              0
            )}
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
    >
      <StyledTableHeaderRow
        style={{
          transform: `translate3d(${leftScroll ? -leftScroll : 0}px, 0, 0)`,
        }}
      >
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
};

export default ReqoreTableHeader;
