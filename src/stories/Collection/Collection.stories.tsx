import { Meta, Story } from '@storybook/react';
import { ReqoreButton, ReqoreControlGroup, ReqoreVerticalSpacer } from '../..';
import { IReqoreCollectionProps, ReqoreCollection } from '../../components/Collection';
import { IReqoreColumnsProps } from '../../components/Columns';
import { PADDING_FROM_SIZE } from '../../constants/sizes';
import items, { bigCollection } from '../../mock/collectionData';

import { argManager, IntentArg, SizeArg } from '../utils/args';

export interface IColumnsStoryArgs extends IReqoreColumnsProps {
  multipleColumns?: boolean;
}

const { createArg, disableArgs } = argManager<IReqoreCollectionProps>();

export default {
  title: 'Collections/Collection/Stories',
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

export const Zoomable = Template.bind({});
Zoomable.args = {
  label: 'Collection of items',
  items,
  zoomable: true,
};

export const WithDefaultZoom = Template.bind({});
WithDefaultZoom.args = {
  label: 'Collection of items',
  items,
  zoomable: true,
  size: 'tiny',
  defaultZoom: 2,
};

export const CustomColumnsData = Template.bind({});
CustomColumnsData.args = {
  columns: 2,
  columnsGap: '50px',
  minColumnWidth: '100px',
  maxColumnWidth: '200px',
  items,
  label: '2 columns of max 200px width with 50px gap',
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
  padded: false,
  items,
  contentRenderer: (children) => (
    <>
      <ReqoreControlGroup horizontalAlign='center' fluid>
        <ReqoreButton fluid> I could be a filter of some kind</ReqoreButton>
      </ReqoreControlGroup>
      <ReqoreVerticalSpacer height={PADDING_FROM_SIZE.normal} />
      {children}
      <ReqoreVerticalSpacer height={PADDING_FROM_SIZE.normal} />
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
    </>
  ),
};

export const FilteringSearchingPaging = Template.bind({});
FilteringSearchingPaging.args = {
  inputProps: {
    fluid: true,
    focusRules: {
      type: 'keypress',
      shortcut: 'letters',
      clearOnFocus: true,
    },
  },
  displayButtonProps: {
    fixed: false,
  },
  sortButtonProps: {
    fixed: false,
  },
  paging: 'buttons',
  size: 'big',
  padded: false,
  items: bigCollection,
} as IReqoreCollectionProps;

export const CustomFilteringSearchingPaging = Template.bind({});
CustomFilteringSearchingPaging.args = {
  inputProps: {
    fluid: true,
    focusRules: {
      type: 'auto',
      clearOnFocus: true,
    },
  },
  paging: {
    itemsPerPage: 55,
    scrollToTopOnPageChange: true,
  },
  inputInTitle: false,
  responsiveTitle: true,
  size: 'small',
  padded: false,
  fill: true,
  items: [...bigCollection, ...bigCollection, ...bigCollection, ...bigCollection, ...bigCollection],
} as IReqoreCollectionProps;

export const DefaultFilter = Template.bind({});
DefaultFilter.args = {
  inputProps: {
    fluid: true,
  },
  defaultQuery: 'Med',
  paging: {
    itemsPerPage: 55,
    scrollToTopOnPageChange: true,
  },
  inputInTitle: false,
  responsiveTitle: true,
  size: 'small',
  padded: false,
  fill: true,
  items: [...bigCollection, ...bigCollection, ...bigCollection, ...bigCollection, ...bigCollection],
} as IReqoreCollectionProps;
