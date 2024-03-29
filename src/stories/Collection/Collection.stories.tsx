import { StoryObj } from '@storybook/react';
import { ReqoreButton, ReqoreControlGroup, ReqoreVerticalSpacer } from '../..';
import { IReqoreCollectionProps, ReqoreCollection } from '../../components/Collection';
import { IReqoreColumnsProps } from '../../components/Columns';
import { PADDING_FROM_SIZE } from '../../constants/sizes';
import items, { bigCollection } from '../../mock/collectionData';

import { expect } from '@storybook/jest';
import { fireEvent } from '@storybook/testing-library';
import { waitFor } from '@testing-library/react';
import { sleep } from '../../helpers/utils';
import { StoryMeta } from '../utils';
import { argManager, IntentArg, SizeArg } from '../utils/args';

export interface IColumnsStoryArgs extends IReqoreColumnsProps {
  multipleColumns?: boolean;
}

const { createArg, disableArgs } = argManager<IReqoreCollectionProps>();

const meta = {
  title: 'Collections/Collection/Stories',
  component: ReqoreCollection,
  argTypes: {
    ...createArg('stacked', {
      type: 'boolean',
      name: 'Stacked',
      description: 'If true, the collection will be stacked',
    }),
    ...createArg('maxItemHeight', {
      type: 'number',
      name: 'Max Item Height',
      description: 'Max height of the collection item',
    }),
    ...createArg('sortable', {
      type: 'boolean',
      name: 'Sortable',
      description: 'If true, the collection will be sortable',
    }),
    ...createArg('filterable', {
      type: 'boolean',
      name: 'Filterable',
      description: 'If true, the collection will be filterable',
    }),
    ...createArg('rounded', {
      type: 'boolean',
      name: 'Rounded',
      description: 'If true, the collection will be rounded when stacked',
    }),
    ...createArg('height', {
      type: 'string',
      name: 'Height',
      description: 'Height of the collection',
    }),
    ...createArg('fill', {
      type: 'boolean',
      name: 'Fill parent',
      description: 'If true, the collection will fill the parent',
    }),
    ...createArg('label', {
      type: 'string',
      name: 'Label',
      description: 'Label of the collection',
    }),
    ...disableArgs(['items', 'actions', 'bottomActions', 'size', 'customTheme', 'className']),
    ...IntentArg,
    ...SizeArg,
  },
  args: {
    selectedIcon: 'CheckLine',
    maxItemHeight: 100,
    sortable: true,
    filterable: true,
    rounded: true,
  },
} as StoryMeta<typeof ReqoreCollection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    label: 'Config Items',
    items,
    actions: [
      { label: 'Custom action', icon: 'Home7Line', fixed: true },
      { actions: [{ label: 'Test' }] },
    ],
  },
};

export const WithHeight: Story = {
  args: {
    label: 'Collection of items',
    height: '600px',
    items,
    actions: [
      { label: 'Custom action', icon: 'Home7Line', fixed: true },
      { actions: [{ label: 'Test' }] },
    ],
  },
};

export const Stacked: Story = {
  args: {
    label: 'Collection of items',
    stacked: true,
    items,
    actions: [
      { label: 'Custom action', icon: 'Home7Line', fixed: true },
      { actions: [{ label: 'Test' }] },
    ],
  },
};

export const Fill: Story = {
  args: {
    label: 'Collection of items',
    fill: true,
    items,
    actions: [
      { label: 'Custom action', icon: 'Home7Line', fixed: true },
      { actions: [{ label: 'Test' }] },
    ],
  },
};

export const SelectedFirst: Story = {
  args: {
    label: 'Collection of items',
    items,
    showSelectedFirst: true,
  },
};

export const Zoomable: Story = {
  args: {
    label: 'Collection of items',
    items,
    zoomable: true,
  },
};

export const WithDefaultZoom: Story = {
  args: {
    label: 'Collection of items',
    items,
    zoomable: true,
    size: 'tiny',
    defaultZoom: 2,
  },
};

export const CustomColumnsData: Story = {
  args: {
    columns: 2,
    columnsGap: '50px',
    minColumnWidth: '100px',
    maxColumnWidth: '200px',
    items,
    label: '2 columns of max 200px width with 50px gap',
  },
};

export const CustomPropsAndTexts: Story = {
  args: {
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
  },
};

export const ChildrenBeforeAndAfter: Story = {
  args: {
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
  },
};

export const FilteringSearchingPaging: Story = {
  args: {
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
  } as IReqoreCollectionProps,
};

export const CustomFilteringSearchingPaging: Story = {
  args: {
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
    items: [
      ...bigCollection,
      ...bigCollection,
      ...bigCollection,
      ...bigCollection,
      ...bigCollection,
    ],
  } as IReqoreCollectionProps,
};

export const DefaultFilter: Story = {
  args: {
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
    items: [
      ...bigCollection,
      ...bigCollection,
      ...bigCollection,
      ...bigCollection,
      ...bigCollection,
    ],
  } as IReqoreCollectionProps,
};

export const CustomSortKeysWithDefaultSort: Story = {
  args: {
    label: 'Posts',
    items: items.map((item) => ({
      ...item,
      badge: [item.metadata.id, item.metadata.category],
    })),
    defaultSort: 'desc',
    defaultSortBy: 'id',
    sortKeys: {
      id: 'ID',
      category: 'Category',
    },
  },
  play: async ({ canvasElement }) => {
    await sleep(500);

    await fireEvent.click(canvasElement.querySelector('.reqore-collection-sort'));

    await waitFor(
      () => expect(document.querySelectorAll('.reqore-popover-content')).toHaveLength(1),
      {
        timeout: 5000,
      }
    );
  },
};
