import { Meta, Story } from '@storybook/react/types-6-0';
import { IReqoreTableColumn, IReqoreTableProps } from '../../components/Table';
import { ReqoreTable } from '../../index';
import tableData from '../../mock/tableData';
import { argManager, CustomIntentArg, FlatArg, IntentArg, SizeArg } from '../utils/args';

const { createArg } = argManager<IReqoreTableProps>();

export default {
  title: 'Components/Table',
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
      defaultValue: [
        {
          dataId: 'id',
          header: 'ID',
          width: 50,
          align: 'center',
          sortable: true,
          tooltip: 'Custom ID tooltip nice',
          content: 'tag',
        },
        {
          header: 'Name',
          dataId: 'name',
          grow: 3,
          columns: [
            {
              icon: 'SlideshowLine',
              dataId: 'firstName',
              header: 'First Name',
              width: 150,
              grow: 2,
            },
            {
              icon: 'SlideshowLine',
              dataId: 'lastName',
              header: 'Last Name',
              width: 150,
              grow: 1,
              sortable: true,
              onCellClick: ({ lastName }) => alert(`Clicked last name cell ${lastName}`),
              content: 'title:info',
            },
          ],
        },
        {
          dataId: 'address',
          header: 'Address',
          width: 300,
          grow: 2,
          onClick: () => alert('clicked address'),
        },
        {
          icon: 'User4Line',
          dataId: 'age',
          header: 'Really long age header',
          width: 50,
          align: 'center',
          sortable: true,
          intent: 'danger',
          content: 'tag:#000000',
          onCellClick: ({ age }) => alert(`Clicked age cell ${age}`),
        },
        {
          header: 'Data',
          dataId: 'data',
          columns: [
            { dataId: 'occupation', header: 'Ocuppation', width: 200, content: 'text:warning' },
            { dataId: 'group', header: 'Group', width: 150, intent: 'muted' },
          ],
        },
        {
          dataId: 'date',
          header: 'Date',
          sortable: true,
          content: 'time-ago',
        },
      ] as IReqoreTableColumn[],
    }),
    ...createArg('width', {
      type: 'number',
      defaultValue: 800,
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
  return <ReqoreTable {...args} sort={{ by: 'age', direction: 'desc' }} />;
};

export const Basic = Template.bind({});
export const Flat = Template.bind({});
Flat.args = {
  flat: true,
};
export const Striped = Template.bind({});
Striped.args = {
  striped: true,
};
export const Rounded = Template.bind({});
Rounded.args = {
  rounded: true,
};
export const Selectable = Template.bind({});
Selectable.args = {
  selectable: true,
};

export const FillParent = Template.bind({});
FillParent.args = {
  fill: true,
};
