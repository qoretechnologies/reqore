import { Meta, Story } from '@storybook/react';
import { ReqoreButton, ReqoreControlGroup } from '../..';
import { IReqoreCollectionProps, ReqoreCollection } from '../../components/Collection';
import { IReqoreColumnsProps } from '../../components/Columns';
import items from '../../mock/collectionData';
import data from '../../mock/data.json';
import { argManager, IntentArg, SizeArg } from '../utils/args';

export interface IColumnsStoryArgs extends IReqoreColumnsProps {
  multipleColumns?: boolean;
}

const { createArg, disableArgs } = argManager<IReqoreCollectionProps>();

export default {
  title: 'Components/Collection',
  component: ReqoreCollection,
  argTypes: {
    ...createArg('stacked', {
      defaultValue: false,
      type: 'boolean',
      name: 'Stacked',
      description: 'If true, the collection will be stacked',
    }),
    ...createArg('maxItemHeight', {
      defaultValue: 100,
      type: 'number',
      name: 'Max Item Height',
      description: 'Max height of the collection item',
    }),
    ...createArg('sortable', {
      defaultValue: true,
      type: 'boolean',
      name: 'Sortable',
      description: 'If true, the collection will be sortable',
    }),
    ...createArg('filterable', {
      defaultValue: true,
      type: 'boolean',
      name: 'Filterable',
      description: 'If true, the collection will be filterable',
    }),
    ...createArg('rounded', {
      defaultValue: true,
      type: 'boolean',
      name: 'Rounded',
      description: 'If true, the collection will be rounded when stacked',
    }),
    ...createArg('height', {
      defaultValue: undefined,
      type: 'string',
      name: 'Height',
      description: 'Height of the collection',
    }),
    ...createArg('fill', {
      defaultValue: false,
      type: 'boolean',
      name: 'Fill parent',
      description: 'If true, the collection will fill the parent',
    }),
    ...createArg('label', {
      defaultValue: undefined,
      type: 'string',
      name: 'Label',
      description: 'Label of the collection',
    }),
    ...disableArgs(['items', 'actions', 'bottomActions', 'size', 'customTheme', 'className']),
    ...IntentArg,
    ...SizeArg,
  },
} as Meta<IReqoreCollectionProps>;

const Template: Story<IReqoreCollectionProps> = (args) => {
  return <ReqoreCollection {...args} selectedIcon='CheckLine' />;
};

export const Basic = Template.bind({});
Basic.args = {
  label: 'Config Items',
  items,
  actions: [
    { label: 'Custom action', icon: 'Home7Line', fixed: true },
    { actions: [{ value: 'Test' }] },
  ],
};

export const WithHeight = Template.bind({});
WithHeight.args = {
  label: 'Collection of items',
  height: '600px',
  items,
  actions: [
    { label: 'Custom action', icon: 'Home7Line', fixed: true },
    { actions: [{ value: 'Test' }] },
  ],
};

export const Stacked = Template.bind({});
Stacked.args = {
  label: 'Collection of items',
  stacked: true,
  items,
  actions: [
    { label: 'Custom action', icon: 'Home7Line', fixed: true },
    { actions: [{ value: 'Test' }] },
  ],
};

export const Fill = Template.bind({});
Fill.args = {
  label: 'Collection of items',
  fill: true,
  items,
  actions: [
    { label: 'Custom action', icon: 'Home7Line', fixed: true },
    { actions: [{ value: 'Test' }] },
  ],
};

export const SelectedFirst = Template.bind({});
SelectedFirst.args = {
  label: 'Collection of items',
  items,
  showSelectedFirst: true,
};

export const CustomPropsAndTexts = Template.bind({});
CustomPropsAndTexts.args = {
  label: 'Collection of items',
  items,
  inputProps: {
    effect: {
      gradient: { colors: 'warning' },
    },
    minimal: true,
  },
  inputPlaceholder: (items) => `Search in ${items.length} crazy items`,
  sortButtonTooltip: (sort) => `Seradit ${sort === 'asc' ? 'vzestupne' : 'sestupne'}`,
  displayButtonTooltip: (display) => `Zobrazit ${display === 'list' ? 'v liste' : 'v mriezke'}`,
};

export const ChildrenBeforeAndAfter = Template.bind({});
ChildrenBeforeAndAfter.args = {
  label: 'Collection of items',
  items,
  childrenBefore: (
    <ReqoreControlGroup horizontalAlign='center' fluid>
      <ReqoreButton fluid> I could be a filter of some kind</ReqoreButton>
    </ReqoreControlGroup>
  ),
  childrenAfter: (
    <ReqoreControlGroup horizontalAlign='center' fluid>
      <ReqoreControlGroup fluid={false} fixed>
        <ReqoreButton fixed textAlign='center'>
          1
        </ReqoreButton>
        <ReqoreButton fixed textAlign='center'>
          2
        </ReqoreButton>
        <ReqoreButton fixed textAlign='center'>
          3
        </ReqoreButton>
        <ReqoreButton fixed textAlign='center'>
          4
        </ReqoreButton>
      </ReqoreControlGroup>
    </ReqoreControlGroup>
  ),
};

export const FilteringSearchingPaging = Template.bind({});
FilteringSearchingPaging.args = {
  inputProps: {
    focusRules: {
      type: 'keypress',
      shortcut: 'letters',
      clearOnFocus: true,
    },
  },
  inputPlaceholder(items) {
    return `Start typing to search in ${items.length} items`;
  },
  size: 'big',
  padded: false,
  fill: true,
  items: data.slice(0, 100).map((datum) => ({
    label: `${datum.firstName} ${datum.lastName}`,
    badge: datum.id,
    size: 'small',
    expandable: true,
    content: datum.address,
    tags: [
      {
        labelKey: 'Age',
        label: datum.age,
      },
      {
        labelKey: 'Occupation',
        label: datum.occupation,
      },
    ],
  })),
} as IReqoreCollectionProps;
