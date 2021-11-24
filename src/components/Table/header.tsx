import styled, { css } from 'styled-components';
import { IReqoreTableColumn, IReqoreTableSort } from '.';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness } from '../../helpers/colors';
import { IReqoreIconName } from '../../types/icons';
import ReqoreTableHeaderCell, { StyledTableHeader } from './headerCell';
import { alignToFlex } from './row';

export interface IReqoreTableSectionProps {
  columns: IReqoreTableColumn[];
  leftScroll: number;
  onSortChange?: (sort: string) => void;
  sortData: IReqoreTableSort;
  selectable?: boolean;
  selectedQuant: 'none' | 'all' | 'some';
  onToggleSelectClick: () => void;
  hasVerticalScroll: boolean;
  selectToggleTooltip?: string;
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
    width: 100%;
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
    justify-content: ${align ? alignToFlex[align] : 'flex-start'};
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

  ${StyledTableHeader}, ${StyledColumnGroupHeader} {
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
}: IReqoreTableSectionProps) => {
  const renderColumns = (columns: IReqoreTableColumn[]) =>
    columns.map(
      ({ grow, header, props = {}, columns: cols, align, content, onCellClick, ...rest }, index) =>
        cols ? (
          <StyledColumnGroup
            width={cols.reduce((wid, col) => wid + (col.width || 80), 0)}
            grow={grow}
            key={index}
            className='reqore-table-column-group'
          >
            <StyledColumnGroupHeader
              align={align}
              {...props}
              className='reqore-table-column-group-header'
            >
              {header}
            </StyledColumnGroupHeader>
            <StyledColumnGroupHeaders className='reqore-table-headers'>
              {renderColumns(cols)}
            </StyledColumnGroupHeaders>
          </StyledColumnGroup>
        ) : (
          <ReqoreTableHeaderCell
            {...props}
            {...rest}
            key={index}
            sortData={sortData}
            grow={grow}
            align={align}
            header={header}
            onSortChange={onSortChange}
          />
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
      leftScroll={leftScroll}
      hasVerticalScroll={hasVerticalScroll}
    >
      <StyledTableHeaderRow>
        {selectable && (
          <ReqoreTableHeaderCell
            dataId='selectbox'
            key='selectbox'
            sortData={sortData}
            align='center'
            onSortChange={onSortChange}
            icon={getSelectedIcon()}
            iconSize='19px'
            tooltip={selectToggleTooltip || 'Toggle selection on all data'}
            onClick={() => {
              onToggleSelectClick();
            }}
          />
        )}
        {renderColumns(columns)}
      </StyledTableHeaderRow>
    </StyledTableHeaderWrapper>
  );
};

export default ReqoreTableHeader;
