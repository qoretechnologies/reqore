import { keys } from 'lodash';
import { useMemo } from 'react';
import { TReqoreIntent } from '../../constants/theme';
import { IReqoreIconName } from '../../types/icons';
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

export interface IReqoreKeyValueTableProps
  extends IReqorePanelProps,
    Pick<IReqoreTableProps, 'striped' | 'width' | 'height' | 'fill'> {
  data: { [key: string | number]: TReqoreKeyValueTableValue };

  keyLabel?: string;
  keyIcon?: IReqoreIconName;
  keyColumnIntent?: TReqoreIntent;
  keyAlign?: IReqoreTableColumn['align'];
  maxKeyWidth?: number;

  valueLabel?: string;
  valueIcon?: IReqoreIconName;
  valueAlign?: IReqoreTableColumn['align'];
  minValueWidth?: number;
  defaultValueFilter?: string | number;

  valueRenderer?: (
    data: IReqoreTableRowData,
    defaultComponent?: ({
      value,
    }: IReqoreTableValueProps) => TReqoreTableColumnContent | JSX.Element
  ) => JSX.Element;
}

export const ReqoreKeyValueTable = ({
  data,
  keyLabel,
  keyIcon,
  valueLabel,
  valueIcon,
  valueRenderer,
  keyColumnIntent = 'muted',
  minValueWidth = 100,
  maxKeyWidth = 200,
  keyAlign = 'left',
  valueAlign = 'left',
  defaultValueFilter,
  ...rest
}: IReqoreKeyValueTableProps) => {
  const { columns, items } = useMemo(() => {
    let columns: IReqoreTableColumn[] = [
      {
        dataId: 'tableKey',
        grow: 1,
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
          content: 'title',
        },
      },
      {
        dataId: 'value',
        grow: 3,
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
          content: (data) =>
            valueRenderer?.(data, ReqoreTableValue) || <ReqoreTableValue value={data.value} />,
        },
      },
    ];

    let items: IReqoreTableRowData[] = [];

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
      className={`${rest.className || ''} reqore-key-value-table`}
    />
  );
};
