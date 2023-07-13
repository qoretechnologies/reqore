import { Meta, Story } from '@storybook/react/types-6-0';
import { IReqoreKeyValueTableProps, ReqoreKeyValueTable } from '../../components/KeyValueTable';
import { IReqoreTableProps, IReqoreTableRowData } from '../../components/Table';
import ReqoreTag from '../../components/Tag';
import { TReqorePaginationType } from '../../constants/paging';
import { CustomIntentArg, FlatArg, IntentArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreKeyValueTableProps>();

export default {
  title: 'Collections/Key Value Table/Stories',
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
      defaultValue: {
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
} as Meta<IReqoreTableProps>;

const Template: Story<IReqoreKeyValueTableProps> = (args) => {
  return <ReqoreKeyValueTable label='Table' {...args} />;
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
  filter: 'Mach',
};

export const DefaultValueFilter = Template.bind({});
DefaultValueFilter.args = {
  defaultValueFilter: 80,
};

export const AllFiltersActive = Template.bind({});
AllFiltersActive.args = {
  filterable: true,
  filter: 1,
  defaultValueFilter: 80,
};

export const NoDataMessage = Template.bind({});
NoDataMessage.args = {
  filterable: true,
  filter: 'asjkghakshgjkashg',
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

export const DefaultPaging = Template.bind({});
DefaultPaging.args = {
  paging: 'buttons',
};

export const CustomColumnWidths = Template.bind({});
CustomColumnWidths.args = {
  minValueWidth: 500,
  maxKeyWidth: 100,
};

export const CustomKeyIntent = Template.bind({});
CustomKeyIntent.args = {
  keyColumnIntent: 'success',
};

export const CustomPaging = Template.bind({});
CustomPaging.args = {
  paging: {
    fluid: true,
    loadMoreLabel: 'Load more rows...',
    showLabels: true,
    infinite: true,
    itemsPerPage: 2,
  } as TReqorePaginationType<IReqoreTableRowData>,
};

export const CustomValueRenderer = Template.bind({});
CustomValueRenderer.args = {
  valueRenderer: ({ value }) =>
    value === 'Human' ? <ReqoreTag intent='success' label={value} icon='User3Line' /> : undefined,
};
