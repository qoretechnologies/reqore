import { StoryObj } from '@storybook/react';
import { fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { noop } from 'lodash';
import ReqoreIcon from '../../components/Icon';
import { IReqoreKeyValueTableProps, ReqoreKeyValueTable } from '../../components/KeyValueTable';
import { IReqoreTableRowData, TReqoreTableColumnContent } from '../../components/Table';
import { TReqorePaginationType } from '../../constants/paging';
import { sleep } from '../../helpers/utils';
import { Exportable as ExportableTable } from '../Table/Table.stories';
import { StoryMeta } from '../utils';
import { CustomIntentArg, FlatArg, IntentArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreKeyValueTableProps>();

const meta = {
  title: 'Collections/Key Value Table',
  component: ReqoreKeyValueTable,
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
      name: 'Data',
      description: 'The data to be displayed in the table',
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
  args: {
    height: 600,
    width: undefined,
    fill: false,
    label: 'Table',
    data: {
      firstName: 'Filip',
      lastName: 'Machinia',
      age: 25,
      married: false,
      'In Relationship': true,
      DOB: '1995-01-01',
      occupation: 'Software Engineer',
      address: {
        street: 'Some street',
        city: 'Some city',
        country: 'Some country',
      },
      groups: ['Admin', 'User'],
      race: 'Human',
      sex: 'Male',
      height: 180,
      weight: 80,
      device: undefined,
      OS: 'MacOS',
      browser: 'Chrome',
      email: 'test@test.com',
      phone: '+420 123 456 789',
      website: 'https://machinia.com',
      company: 'Machinia',
    },
  },
} as StoryMeta<typeof ReqoreKeyValueTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable in its default configuration.',
      },
    },
  },};

export const NoLabel: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable without a label.',
      },
    },
  },
  args: {
    label: undefined,
    onRowClick: noop,
  },
};

export const InteractiveRows: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with interactive rows.',
      },
    },
  },
  args: {
    onRowClick: noop,
  },
  play: async ({ canvasElement }) => {
    await userEvent.hover(canvasElement.querySelectorAll('.reqore-table-row')[2]);
  },
};

export const CustomWidth: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with a custom width.',
      },
    },
  },
  args: {
    width: 400,
  },
};

export const NotFlat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with flat={false} so the elevated look is applied.',
      },
    },
  },
  args: {
    flat: false,
  },
};

export const NoHeight: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable without an intrinsic height.',
      },
    },
  },
  args: {
    height: undefined,
  },
};

export const Striped: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with striped rows.',
      },
    },
  },
  args: {
    striped: true,
  },
};

export const Exportable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with the export controls enabled.',
      },
    },
  },
  args: {
    exportable: true,
    zoomable: true,
  },
  play: async ({ canvasElement, ...rest }) => {
    // @ts-ignore
    await ExportableTable.play({ canvasElement, ...rest });
  },
};

export const Sortable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with sorting enabled.',
      },
    },
  },
  args: {
    sortable: true,
  },
};

export const Filterable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with filter controls enabled.',
      },
    },
  },
  args: {
    filterable: true,
  },
};

export const DefaultFilter: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with a default filter applied.',
      },
    },
  },
  args: {
    filterable: true,
    filter: 'Mach',
  },
};

export const DefaultValueFilter: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with a default value filter applied.',
      },
    },
  },
  args: {
    defaultValueFilter: 80,
  },
};

export const AllFiltersActive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with every filter turned on to prove all filter states render together.',
      },
    },
  },
  args: {
    filterable: true,
    filter: 1,
    defaultValueFilter: 80,
  },
};

export const WithActions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with action buttons attached.',
      },
    },
  },
  args: {
    rowActions: {
      width: 120,
      actions: () => [
        {
          icon: 'InformationLine',
        },
        {
          icon: 'EditLine',
        },
        {
          icon: 'DeleteBinLine',
          intent: 'danger',
        },
      ],
    },
    zoomable: true,
  },
};

export const CustomTheme: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with a custom theme override applied.',
      },
    },
  },
  args: {
    customTheme: { main: '#ff0000' },
    flat: false,
    transparent: false,
  },
};

export const NoDataMessage: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with a custom no-data message.',
      },
    },
  },
  args: {
    filterable: true,
    filter: 'asjkghakshgjkashg',
  },
};

export const Zoomable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with zooming controls enabled.',
      },
    },
  },
  args: {
    zoomable: true,
  },
};

export const FillParent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable filling its parent container.',
      },
    },
  },
  args: {
    fill: true,
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable at every size (tiny through huge) so the size scale is visible side by side.',
      },
    },
  },
  args: {
    size: 'small',
    filterable: true,
    wrapperSize: 'big',
  },
};

export const DefaultPaging: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with the default paging control.',
      },
    },
  },
  args: {
    paging: 'buttons',
  },
};

export const KeyTooltip: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with a tooltip attached to the key.',
      },
    },
  },
  args: {
    keyTooltip: (key) => `Tooltip for ${key}`,
  },
  play: async () => {
    await sleep(500);

    await fireEvent.mouseEnter(document.querySelector('.reqore-table-cell'));
  },
};

export const ValueTooltip: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with a tooltip attached to the value.',
      },
    },
  },
  args: {
    valueTooltip: (value) => ({
      content: `${JSON.stringify(value || 'No value')}`,
      noArrow: true,
      blur: true,
      flat: false,
      placement: 'top',
    }),
  },
  play: async () => {
    await sleep(500);

    await fireEvent.mouseEnter(document.querySelectorAll('.reqore-table-cell')[23]);
  },
};

export const CustomColumnWidths: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with custom column widths applied.',
      },
    },
  },
  args: {
    minValueWidth: 500,
    maxKeyWidth: 100,
  },
};

export const CustomKeyIntent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with a custom intent applied to keys.',
      },
    },
  },
  args: {
    keyColumnIntent: 'success',
  },
};

export const CustomAlign: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with a custom alignment applied.',
      },
    },
  },
  args: {
    keyAlign: 'right',
    valueAlign: 'center',
  },
};

export const CustomPaging: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with a custom paging control.',
      },
    },
  },
  args: {
    paging: {
      fluid: true,
      loadMoreLabel: 'Load more rows...',
      showLabels: true,
      infinite: true,
      itemsPerPage: 2,
    } as TReqorePaginationType<IReqoreTableRowData>,
  },
};

export const CustomKeyRenderer: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with a custom key renderer.',
      },
    },
  },
  args: {
    keyRenderer: (label) => `${label}_custom`,
  },
};

export const CustomValueRenderer: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with a custom value renderer.',
      },
    },
  },
  args: {
    valueRenderer: ({ value, tableKey }, Component): TReqoreTableColumnContent | JSX.Element => {
      switch (tableKey) {
        case 'race':
          return 'tag:success';
        case 'sex':
          return <ReqoreIcon icon={value === 'Male' ? 'User6Line' : 'User6Fill'} />;
        case 'height':
          return <>{value} cm</>;
        case 'weight':
          return <Component value={value} />;
        default:
          return undefined;
      }
    },
  },
};

export const CustomExportMapper: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with a custom export mapper that shapes the exported data.',
      },
    },
  },
  args: {
    exportable: true,
    exportMapper: (data) => {
      return data.reduce(
        (acc, row) => ({
          ...acc,
          [row.tableKey.toString()]: row.value,
        }),
        {}
      );
    },
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    // @ts-expect-error
    await ExportableTable.play({ canvasElement, ...rest });
    await fireEvent.click(canvas.getAllByText('Export full data')[0]);
    await waitFor(() => canvas.findAllByText('Export data'), { timeout: 5000 });
  },
};

export const NonVirtualizedWrapped: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyValueTable with virtualization disabled and wrapping enabled.',
      },
    },
  },
  args: {
    wrap: true,
    height: 500,
    data: {
      Summary:
        'Variable row height support for ReqoreTable and ReqoreKeyValueTable. Enabling `wrap` implicitly turns virtualization off and lets each row grow to fit its tallest cell.',
      Owner: 'Platform team',
      Status: 'In review',
      Notes:
        'When virtualization is off, row content is never clipped. Pinned columns still work via `position: sticky` within the single body scroller, and horizontal scroll tracks the header natively.',
      Tags: 'table, virtualization, sticky, accessibility, wrap',
      CreatedAt: '2026-04-22',
    },
  },
};
