/* @flow */
import { rgba } from 'polished';
import { Resizable } from 're-resizable';
import styled from 'styled-components';
import { IReqoreTableColumn, IReqoreTableSort } from '.';
import { ReqoreButton, ReqoreControlGroup, ReqoreDropdown } from '../..';
import { IReqoreTheme } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';
import { IReqoreButtonProps } from '../Button';

export interface IReqoreTableHeaderCellProps extends IReqoreTableColumn, IReqoreButtonProps {
  onSortChange?: (sort: string) => void;
  sortData: IReqoreTableSort;
  setColumnWidth?: (id: string, width: number | string) => void;
  filterPlaceholder?: string;
}

export interface IReqoreTableHeaderStyle {
  width?: number;
  grow?: number;
  theme: IReqoreTheme;
  align?: 'center' | 'left' | 'right';
  interactive?: boolean;
}

export const StyledTableHeaderResize = styled.div`
  &:before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 1px;
    height: 70%;
    border-left: 1px dashed ${({ theme }) => rgba(getReadableColor(theme), 0.3)};
  }
`;

const ReqoreTableHeaderCell = ({
  width,
  resizedWidth,
  grow,
  align,
  header,
  onSortChange,
  dataId,
  sortable,
  sortData,
  className,
  onClick,
  setColumnWidth,
  resizable = true,
  filterPlaceholder,
  ...rest
}: IReqoreTableHeaderCellProps) => {
  return (
    <Resizable
      minWidth={!width || width < 120 ? 120 : width}
      onResize={(_event, _direction, _component) => {
        setColumnWidth(dataId, _component.style.width);
      }}
      handleComponent={{
        right: <StyledTableHeaderResize />,
      }}
      style={{
        overflow: 'hidden',
        flexGrow: grow,
      }}
      size={{
        width: resizedWidth || width,
        height: undefined,
      }}
      enable={{
        right: resizable && !!setColumnWidth,
      }}
    >
      <ReqoreControlGroup fluid stack rounded={false} fill style={{ height: '100%' }}>
        <ReqoreButton
          {...rest}
          readOnly={!sortable && !onClick}
          className={`${className || ''} reqore-table-header-cell`}
          rounded={false}
          textAlign={align}
          rightIcon={
            sortable && sortData.by === dataId
              ? (`Arrow${sortData.direction === 'desc' ? 'Down' : 'Up'}Fill` as
                  | 'ArrowDownFill'
                  | 'ArrowUpFill')
              : undefined
          }
          onClick={(e) => {
            if (sortable) {
              onSortChange(dataId);
            }

            onClick?.(e);
          }}
        >
          {header}
        </ReqoreButton>
        <ReqoreDropdown<IReqoreButtonProps>
          icon='MoreLine'
          fixed
          rounded={false}
          filterable
          filterPlaceholder={filterPlaceholder || 'Filter by this column...'}
          items={[
            {
              divider: true,
              label: 'Options',
            },
            {
              label: 'Reset size',
              icon: 'HistoryLine',
              disabled: !resizedWidth || width === resizedWidth,
              onClick: () => {
                setColumnWidth?.(dataId, width);
              },
            },
          ]}
        />
      </ReqoreControlGroup>
    </Resizable>
  );
};

export default ReqoreTableHeaderCell;
