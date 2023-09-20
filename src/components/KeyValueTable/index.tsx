import { keys, size } from 'lodash';
import { useMemo } from 'react';
import { TABLE_SIZE_TO_PX } from '../../constants/sizes';
import { TReqoreIntent } from '../../constants/theme';
import { IReqoreTooltip } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { IReqoreButtonProps } from '../Button';
import { IReqoreExportModalProps } from '../ExportModal';
import { IReqorePanelProps } from '../Panel';
import ReqoreTable, {
  IReqoreTableColumn,
  IReqoreTableProps,
  IReqoreTableRowData,
  TReqoreTableColumnContent,
} from '../Table';
import { IReqoreTableValueProps, ReqoreTableValue } from '../Table/value';

export type TReqoreKeyValueTablePrimitiveValue = string | number | boolean | null | undefined;
export type TReqoreKeyValueTableValue =
  | TReqoreKeyValueTablePrimitiveValue
  | TReqoreKeyValueTablePrimitiveValue[]
  | { [key: string]: TReqoreKeyValueTableValue };
export type TReqoreKeyValueTableExportMapper = (
  data: { tableKey: TReqoreTableColumnContent; value: TReqoreTableColumnContent }[]
) => IReqoreExportModalProps['data'];

export interface IReqoreKeyValueTableProps
  extends IReqorePanelProps,
    Pick<
      IReqoreTableProps,
      | 'striped'
      | 'width'
      | 'height'
      | 'fill'
      | 'filterable'
      | 'exportable'
      | 'filter'
      | 'onFilterChange'
      | 'filterProps'
      | 'zoomable'
      | 'wrapperSize'
      | 'paging'
      | 'onRowClick'
    > {
  data: { [key: string | number]: TReqoreKeyValueTableValue };

  keyLabel?: string;
  keyIcon?: IReqoreIconName;
  keyTooltip?: (key: string | number) => string | IReqoreTooltip;
  keyColumnIntent?: TReqoreIntent;
  keyAlign?: IReqoreTableColumn['align'];
  maxKeyWidth?: number;

  sortable?: boolean;

  rowActions?: (
    key: string,
    value: TReqoreKeyValueTableValue
  ) => Omit<IReqoreButtonProps, 'rightIcon' | 'label' | 'children'>[];

  valueLabel?: string;
  valueIcon?: IReqoreIconName;
  valueTooltip?: (value: TReqoreKeyValueTableValue) => string | IReqoreTooltip;
  valueAlign?: IReqoreTableColumn['align'];
  minValueWidth?: number;
  defaultValueFilter?: string | number;

  keyRenderer?: (keyLabel: string | number) => string | number;

  valueRenderer?: (
    data: IReqoreTableRowData,
    defaultComponent?: ({ value }: IReqoreTableValueProps) => any
  ) => any;

  exportMapper?: TReqoreKeyValueTableExportMapper;
}

export const ReqoreKeyValueTable = ({
  data,
  keyLabel,
  keyIcon,
  keyRenderer,
  keyTooltip,
  valueLabel,
  valueIcon,
  valueTooltip,
  valueRenderer,
  keyColumnIntent,
  minValueWidth = 100,
  maxKeyWidth = 200,
  keyAlign = 'left',
  valueAlign = 'left',
  defaultValueFilter,
  sortable,
  rowActions,
  ...rest
}: IReqoreKeyValueTableProps) => {
  const { columns, items } = useMemo(() => {
    const columns: IReqoreTableColumn[] = [
      {
        dataId: 'tableKey',
        grow: 1,
        sortable,
        width: maxKeyWidth < 150 ? maxKeyWidth : 150,
        pin: 'left',
        hideable: false,
        intent: keyColumnIntent,
        maxWidth: maxKeyWidth,
        align: keyAlign,

        header: {
          icon: keyIcon,
          label: keyLabel,
        },

        cell: {
          tooltip: keyTooltip ? (cellValue) => keyTooltip(cellValue) : undefined,
          content: keyRenderer ? ({ tableKey }) => keyRenderer(tableKey) : 'title',
        },
      },
      {
        dataId: 'value',
        grow: 3,
        sortable,
        hideable: false,
        filterable: true,
        pinnable: false,
        minWidth: minValueWidth,
        filter: defaultValueFilter,
        align: valueAlign,

        header: {
          icon: valueIcon,
          label: valueLabel,
        },

        cell: {
          tooltip: valueTooltip ? (cellValue) => valueTooltip(cellValue) : undefined,
          content: (data) =>
            valueRenderer?.(data, ReqoreTableValue) || <ReqoreTableValue value={data.value} />,
        },
      },
    ];

    if (rowActions) {
      columns.push({
        dataId: 'actions',
        hideable: false,
        pin: 'right',
        header: {
          icon: 'SettingsLine',
        },
        width: size(rowActions('noop', 'noop')) * TABLE_SIZE_TO_PX[rest.size || 'normal'],
        align: 'center',
        cell: {
          padded: 'none',
          actions: (data) => rowActions(data.tableKey, data.value),
        },
      });
    }

    const items: IReqoreTableRowData[] = [];

    keys(data).map((key) => {
      items.push({
        tableKey: key,
        value: data[key],
      });
    });

    return { columns, items };
  }, [data]);

  return (
    <ReqoreTable
      columns={columns}
      data={items}
      {...rest}
      sort={
        sortable
          ? {
              by: 'tableKey',
              thenBy: 'value',
              direction: 'asc',
            }
          : undefined
      }
      className={`${rest.className || ''} reqore-key-value-table`}
    />
  );
};
