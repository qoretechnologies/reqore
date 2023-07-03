import { omit } from 'lodash';
import styled, { css } from 'styled-components';
import { IReqoreTableColumn, IReqoreTableSort } from '.';
import { ReqoreButton, ReqoreControlGroup } from '../..';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness } from '../../helpers/colors';
import { alignToFlexAlign } from '../../helpers/utils';
import { IWithReqoreSize } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { ReqoreTableHeaderCell } from './headerCell';
import { getOnlyShownColumns } from './helpers';

export type TColumnsUpdater = <T extends keyof IReqoreTableColumn>(
  id: string,
  key: T,
  value: IReqoreTableColumn[T]
) => void;

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
}: IReqoreTableSectionProps) => {
  const renderColumns = (columns: IReqoreTableColumn[]) =>
    getOnlyShownColumns(columns).map(
      ({ grow, align, dataId, header: { columns, onClick, ...rest }, ...colRest }, index) =>
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
            <ReqoreControlGroup fluid rounded={false}>
              <ReqoreButton
                {...rest}
                {...colRest}
                size={size}
                readOnly={!onClick}
                rounded={false}
                textAlign={align}
                className='reqore-table-column-group-header'
              />
            </ReqoreControlGroup>
            <StyledColumnGroupHeaders className='reqore-table-headers'>
              {renderColumns(columns)}
            </StyledColumnGroupHeaders>
          </StyledColumnGroup>
        ) : (
          <ReqoreTableHeaderCell
            {...rest}
            {...omit(colRest, ['cell'])}
            dataId={dataId}
            size={size}
            key={index}
            sortData={sortData}
            grow={grow}
            align={align}
            onSortChange={onSortChange}
            onColumnsUpdate={onColumnsUpdate}
            onFilterChange={onFilterChange}
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
            size={size}
            onSortChange={onSortChange}
            icon={getSelectedIcon()}
            width={60}
            resizable={false}
            hideable={false}
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
