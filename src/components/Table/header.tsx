import styled, { css } from 'styled-components';
import { IReqoreTableColumn, IReqoreTableSort } from '.';
import { ReqoreButton, ReqoreControlGroup } from '../..';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness } from '../../helpers/colors';
import { alignToFlexAlign } from '../../helpers/utils';
import { IReqoreIconName } from '../../types/icons';
import ReqoreTableHeaderCell from './headerCell';

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
  setColumnWidth: (id: string, width: number | string) => void;
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
  setColumnWidth,
}: IReqoreTableSectionProps) => {
  const renderColumns = (columns: IReqoreTableColumn[]) =>
    columns.map(
      ({ grow, header, props = {}, columns: cols, align, content, onCellClick, ...rest }, index) =>
        cols ? (
          <StyledColumnGroup
            grow={grow}
            key={index}
            className='reqore-table-column-group'
            width={cols.reduce((wid, col) => wid + (col.resizedWidth || col.width || 80), 0)}
          >
            <ReqoreControlGroup fluid rounded={false}>
              <ReqoreButton
                {...props}
                readOnly={!props.onClick}
                rounded={false}
                textAlign={align}
                className='reqore-table-column-group-header'
              >
                {header}
              </ReqoreButton>
            </ReqoreControlGroup>
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
            setColumnWidth={setColumnWidth}
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
      hasVerticalScroll={hasVerticalScroll}
    >
      <StyledTableHeaderRow
        style={{
          transform: `translate3d(${leftScroll ? -leftScroll : 0}px, 0, 0)`,
        }}
      >
        {selectable && (
          <ReqoreTableHeaderCell
            dataId='selectbox'
            key='selectbox'
            sortData={sortData}
            align='center'
            onSortChange={onSortChange}
            icon={getSelectedIcon()}
            iconSize='15px'
            width={60}
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
