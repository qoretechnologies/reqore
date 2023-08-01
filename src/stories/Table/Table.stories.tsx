import { StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import { StyledEffect } from '../../components/Effect';
import { IReqoreTableColumn, IReqoreTableProps, IReqoreTableRowData } from '../../components/Table';
import { IReqoreCustomTableBodyCellProps } from '../../components/Table/cell';
import { IReqoreCustomHeaderCellProps } from '../../components/Table/header';
import { IReqoreCustomTableRowProps } from '../../components/Table/row';
import { TReqorePaginationType } from '../../constants/paging';
import { sleep } from '../../helpers/utils';
import {
  ReqoreH3,
  ReqoreH4,
  ReqoreIcon,
  ReqoreInput,
  ReqoreP,
  ReqoreTable,
  ReqoreTag,
} from '../../index';
import tableData from '../../mock/tableData';
import { StoryMeta } from '../utils';
import { CustomIntentArg, FlatArg, IntentArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreTableProps>();

const defaultColumns: IReqoreTableColumn[] = [
  {
    dataId: 'id',
    intent: 'info',
    header: {
      label: 'ID',
      tooltip: 'Custom ID tooltip nice',
    },
    cell: {
      content: 'tag',
    },
    width: 80,
    align: 'center',
    sortable: true,
  },
  {
    header: {
      label: 'Name',
      columns: [
        {
          dataId: 'firstName',
          minWidth: 50,
          maxWidth: 500,
          header: {
            icon: 'SlideshowLine',
            label: 'First Name',
            effect: {
              gradient: {
                colors: {
                  0: 'success',
                  100: 'info',
                },
              },
            },
          },
          cell: {
            padded: 'none',
            content: ({ _size, firstName }) => (
              <ReqoreInput icon='PriceTag2Fill' size={_size} value={firstName} />
            ),
          },
          width: 150,
          grow: 2,
        },
        {
          dataId: 'lastName',
          header: {
            icon: 'SlideshowLine',
            label: 'Last Name',
          },
          width: 150,
          grow: 1,
          sortable: true,
          cell: {
            onClick: ({ lastName }) => alert(`Clicked last name cell ${lastName}`),
            content: 'title:info',
          },
        },
      ],
    },
    dataId: 'name',
    grow: 3,
  },
  {
    dataId: 'address',
    header: {
      label: 'Address',
      description: 'This is the address',
      onClick: () => alert('clicked address'),
    },
    width: 300,
    grow: 2,
    resizable: false,
  },
  {
    dataId: 'age',
    header: {
      label: 'Really long age header',
      icon: 'User4Line',
      tooltip: 'Custom age tooltip',
      actions: [
        {
          label: 'Do something',
          icon: 'EBike2Fill',
        },
      ],
    },
    width: 100,
    align: 'center',
    sortable: true,

    cell: {
      intent: 'danger',
      content: 'tag:#000000',
      tooltip: (value) => `Age is ${value}`,
      onClick: ({ age }) => alert(`Clicked age cell ${age}`),
    },
  },
  {
    header: {
      label: 'Data',
      columns: [
        {
          dataId: 'occupation',
          header: { label: 'Ocuppation' },
          width: 200,
          cell: { content: 'text:warning' },
          filterable: true,
          filterPlaceholder: 'Search occupation',
        },
        {
          dataId: 'group',
          align: 'right',
          header: { label: <ReqoreTag label='Group' icon='Group2Line' size='small' /> },
          width: 150,
          cell: { intent: 'muted' },
          filterable: true,
        },
      ],
    },
    dataId: 'data',
  },
  {
    dataId: 'date',
    header: { label: 'Date' },
    sortable: true,
    grow: 2,
    width: 150,
    cell: {
      content: 'time-ago',
      tooltip: () => ({
        title: 'Custom tooltip',
        content: 'This is a custom tooltip',
        effect: {
          gradient: {
            colors: {
              0: 'warning',
              100: 'info',
            },
          },
        },
      }),
    },
  },
  {
    dataId: 'actions',
    header: {
      icon: 'SettingsLine',
    },
    width: 100,
    align: 'center',
    pin: 'right',

    cell: {
      padded: 'none',
      actions: () => [
        {
          icon: 'AddLine',
          intent: 'info',
        },
        {
          icon: 'EditLine',
          intent: 'warning',
        },
        {
          icon: 'DeleteBinLine',
          intent: 'danger',
        },
      ],
    },
  },
];

const defaultColumnsWithFilters: IReqoreTableColumn[] = defaultColumns.map((column, index) => {
  if (index === 4) {
    return {
      ...column,
      header: {
        ...column.header,
        columns: column.header.columns.map((subColumn, subIndex) =>
          subIndex === 0
            ? {
                ...subColumn,
                filter: 'Advisor',
              }
            : {
                ...subColumn,
                filter: 'net',
              }
        ),
      },
    };
  }

  return column;
});

const defaultColumnsWithHiddenColumns: IReqoreTableColumn[] = defaultColumns.map(
  (column, index) => {
    if (index === 4) {
      return {
        ...column,
        header: {
          ...column.header,
          columns: column.header.columns.map((subColumn, subIndex) =>
            subIndex === 0
              ? {
                  ...subColumn,
                  show: false,
                }
              : subColumn
          ),
        },
      };
    }

    if (index === 2) {
      return {
        ...column,
        show: false,
      };
    }

    return column;
  }
);

const defaultColumnsWithPinnedColumns: IReqoreTableColumn[] = defaultColumns.map(
  (column, index) => {
    if (index === 0) {
      return {
        ...column,
        pin: 'left',
      };
    }

    if (index === 1) {
      return {
        ...column,
        header: {
          ...column.header,
          columns: column.header.columns.map((subColumn, subIndex) =>
            subIndex === 1
              ? {
                  ...subColumn,
                  pin: 'left',
                }
              : subColumn
          ),
        },
      };
    }

    if (index === 3) {
      return {
        ...column,
        pin: 'right',
      };
    }

    return column;
  }
);

const meta = {
  title: 'Collections/Table/Stories',
  component: ReqoreTable,
  args: {
    columns: defaultColumns,
    data: tableData.data,
    height: 600,
    selectToggleTooltip: 'Select this row',
    fill: false,
    sort: { by: 'lastName', direction: 'desc' },
    label: 'Table',
  },
  argTypes: {
    ...createArg('rounded', {
      type: 'boolean',
      name: 'Rounded',
      description: 'If the table should have rounded corners',
    }),
    ...createArg('striped', {
      type: 'boolean',
      name: 'Striped',
      description: 'If the table should have striped rows',
    }),
    ...createArg('selectable', {
      type: 'boolean',
      name: 'Selectable',
      description: 'If the table should be selectable',
    }),
    ...createArg('columns', {
      name: 'Columns',
    }),
    ...createArg('width', {
      type: 'number',
      name: 'Width',
      description: 'The width of the table',
    }),
    ...createArg('height', {
      type: 'number',
      name: 'Height',
      description: 'The height of the table',
    }),
    ...createArg('data', {
      type: 'array',
      name: 'Data',
      description: 'The data to be displayed in the table',
      table: {
        disable: true,
      },
    }),
    ...createArg('selectToggleTooltip', {
      type: 'string',
      name: 'Select Toggle Tooltip',
      description: 'The tooltip of the select toggle',
    }),
    ...createArg('fill', {
      type: 'boolean',
      name: 'Fill',
      description: 'Whether the table should fill the parent',
    }),
    ...SizeArg,
    ...FlatArg,
    ...IntentArg,
    ...CustomIntentArg('selectedRowIntent'),
  },
} as StoryMeta<typeof ReqoreTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const NoLabel: Story = {
  args: {
    label: undefined,
  },
};

export const CustomWidth: Story = {
  args: {
    width: 400,
  },
};

export const NotFlat: Story = {
  args: {
    flat: false,
  },
};

export const Striped: Story = {
  args: {
    striped: true,
  },
};

export const Filterable: Story = {
  args: {
    filterable: true,
  },
};

export const DefaultFilter: Story = {
  args: {
    filterable: true,
    filter: 'Village',
  },
};

export const NoDataMessage: Story = {
  args: {
    filterable: true,
    filter: 'asjkghakshgjkashg',
  },
};

export const FilterableColumns: Story = {
  args: {
    columns: defaultColumnsWithFilters,
  },
};

export const AllFiltersActive: Story = {
  args: {
    filterable: true,
    filter: 'Road',
    columns: defaultColumnsWithFilters,
  },
};

export const HiddenColumns: Story = {
  args: {
    columns: defaultColumnsWithHiddenColumns,
  },
};

export const PinnedColumns: Story = {
  args: {
    columns: defaultColumnsWithPinnedColumns,
    zoomable: true,
    filterable: true,
  },
};

export const Selectable: Story = {
  args: {
    selectable: true,
  },
};

export const PreselectedRows: Story = {
  args: {
    selected: ['274', '280'],
    selectable: true,
  },
};

export const Zoomable: Story = {
  args: {
    zoomable: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(1000);
    await fireEvent.click(document.querySelector('.reqore-table-more'));
    await waitFor(() => canvas.findAllByText('Zoom in'), { timeout: 5000 });
  },
};

export const Exportable: Story = {
  args: {
    exportable: true,
    filterable: true,
    paging: 'buttons',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(1000);
    await fireEvent.click(document.querySelector('.reqore-table-more'));
    await waitFor(() => canvas.findAllByText('Export current view'), { timeout: 5000 });
  },
};

export const FillParent: Story = {
  args: {
    fill: true,
  },
};

export const Sizes: Story = {
  args: {
    size: 'small',
    filterable: true,
    wrapperSize: 'big',
  },
};

export const DefaultPaging: Story = {
  args: {
    paging: 'buttons',
  },
};

export const CustomPaging: Story = {
  args: {
    paging: {
      fluid: true,
      loadMoreLabel: 'Load more rows...',
      showLabels: true,
      infinite: true,
      itemsPerPage: 100,
    } as TReqorePaginationType<IReqoreTableRowData>,
  },
};

const CustomHeaderCell = (props: IReqoreCustomHeaderCellProps) => {
  if (props.hasColumns) {
    return <ReqoreH3 intent='success'>{props.label}</ReqoreH3>;
  }

  return (
    <ReqoreH4 style={{ width: props.width, flexGrow: props.grow }}>
      <ReqoreIcon icon={props.icon} />
      {props.label}
    </ReqoreH4>
  );
};

const CustomCell = (props: IReqoreCustomTableBodyCellProps) => {
  return <ReqoreP style={{ width: props.width, flexGrow: props.grow }}>{props.children}</ReqoreP>;
};

const CustomRow = (props: IReqoreCustomTableRowProps) => {
  return <StyledEffect style={props.style}>{props.children}</StyledEffect>;
};

export const CustomCellsAndRows: Story = {
  args: {
    headerCellComponent: CustomHeaderCell,
    bodyCellComponent: CustomCell,
    rowComponent: CustomRow,
  },
};
