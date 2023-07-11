import { Meta, Story } from '@storybook/react/types-6-0';
import { StyledEffect } from '../../components/Effect';
import { IReqoreTableColumn, IReqoreTableProps } from '../../components/Table';
import { IReqoreCustomTableBodyCellProps } from '../../components/Table/cell';
import { IReqoreCustomHeaderCellProps } from '../../components/Table/header';
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

const defaultColumnsWithFilters = defaultColumns.map((column, index) => {
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

const defaultColumnsWithHiddenColumns = defaultColumns.map((column, index) => {
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
});

const defaultColumnsWithPinnedColumns = defaultColumns.map((column, index) => {
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
});

export default {
  title: 'Collections/Table/Stories',
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
      defaultValue: defaultColumns,
    }),
    ...createArg('width', {
      type: 'number',
      defaultValue: undefined,
      name: 'Width',
      description: 'The width of the table',
    }),
    ...createArg('height', {
      type: 'number',
      defaultValue: 600,
      name: 'Height',
      description: 'The height of the table',
    }),
    ...createArg('data', {
      type: 'array',
      defaultValue: tableData.data as any,
      name: 'Data',
      description: 'The data to be displayed in the table',
      table: {
        disable: true,
      },
    }),
    ...createArg('selectToggleTooltip', {
      type: 'string',
      defaultValue: 'Select This Row',
      name: 'Select Toggle Tooltip',
      description: 'The tooltip of the select toggle',
    }),
    ...createArg('fill', {
      type: 'boolean',
      defaultValue: false,
      name: 'Fill',
      description: 'Whether the table should fill the parent',
    }),
    ...SizeArg,
    ...FlatArg,
    ...IntentArg,
    ...CustomIntentArg('selectedRowIntent'),
  },
} as Meta<IReqoreTableProps>;

const Template: Story<IReqoreTableProps> = (args) => {
  return <ReqoreTable label='Table' {...args} sort={{ by: 'lastName', direction: 'desc' }} />;
};

export const Basic = Template.bind({});
export const NoLabel = Template.bind({});
NoLabel.args = {
  label: undefined,
};

export const CustomWidth = Template.bind({});
CustomWidth.args = {
  width: 400,
};

export const NotFlat = Template.bind({});
NotFlat.args = {
  flat: false,
};
export const Striped = Template.bind({});
Striped.args = {
  striped: true,
};
export const Filterable = Template.bind({});
Filterable.args = {
  filterable: true,
};
export const DefaultFilter = Template.bind({});
DefaultFilter.args = {
  filterable: true,
  filter: 'Village',
};

export const NoDataMessage = Template.bind({});
NoDataMessage.args = {
  filterable: true,
  filter: 'asjkghakshgjkashg',
};

export const FilterableColumns = Template.bind({});
FilterableColumns.args = {
  columns: defaultColumnsWithFilters,
};

export const AllFiltersActive = Template.bind({});
AllFiltersActive.args = {
  filterable: true,
  filter: 'Road',
  columns: defaultColumnsWithFilters,
};

export const HiddenColumns = Template.bind({});
HiddenColumns.args = {
  columns: defaultColumnsWithHiddenColumns,
};

export const PinnedColumns = Template.bind({});
PinnedColumns.args = {
  columns: defaultColumnsWithPinnedColumns,
  zoomable: true,
  filterable: true,
};

export const Selectable = Template.bind({});
Selectable.args = {
  selectable: true,
};

export const PreselectedRows = Template.bind({});
PreselectedRows.args = {
  selected: [274, 280],
  selectable: true,
};

export const Zoomable = Template.bind({});
Zoomable.args = {
  zoomable: true,
};

export const FillParent = Template.bind({});
FillParent.args = {
  fill: true,
};

export const Sizes = Template.bind({});
Sizes.args = {
  size: 'small',
  filterable: true,
  wrapperSize: 'big',
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

const CustomRow = (props: IReqoreCustomTableBodyCellProps) => {
  return <StyledEffect style={props.style}>{props.children}</StyledEffect>;
};

export const CustomCellsAndRows = Template.bind({});
CustomCellsAndRows.args = {
  headerCellComponent: CustomHeaderCell,
  bodyCellComponent: CustomCell,
  rowComponent: CustomRow,
};
