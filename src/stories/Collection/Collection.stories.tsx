import { Meta, Story } from '@storybook/react';
import { IReqoreCollectionProps, ReqoreCollection } from '../../components/Collection';
import { IReqoreColumnsProps } from '../../components/Columns';
import items from '../../mock/collectionData';
import { IntentArg, SizeArg, argManager } from '../utils/args';

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
      defaultValue: '600px',
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
      defaultValue: 'Collection of items',
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
  return (
    <ReqoreCollection
      {...args}
      badge={10}
      selectedIcon='CheckLine'
      actions={[{ label: 'Custom action', icon: 'Home7Line' }, { actions: [{ value: 'Test' }] }]}
    />
  );
};

export const Basic = Template.bind({});
Basic.args = {
  label: 'Config Items',
  items,
};

export const Stacked = Template.bind({});
Stacked.args = {
  label: 'Collection of items',
  stacked: true,
  items,
};

export const Fill = Template.bind({});
Fill.args = {
  label: 'Collection of items',
  fill: true,
  items,
};

export const SelectedFirst = Template.bind({});
SelectedFirst.args = {
  label: 'Collection of items',
  items,
  showSelectedFirst: true,
};
