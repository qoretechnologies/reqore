import { StoryObj } from '@storybook/react';
import { ReqoreButton, ReqoreControlGroup, ReqoreVerticalSpacer } from '../..';
import { IReqoreCollectionProps, ReqoreCollection } from '../../components/Collection';
import { IReqoreColumnsProps } from '../../components/Columns';
import { PADDING_FROM_SIZE } from '../../constants/sizes';
import items, { bigCollection, collectionWithGroups } from '../../mock/collectionData';

import { expect } from '@storybook/jest';
import { fireEvent } from '@storybook/testing-library';
import { waitFor } from '@testing-library/react';
import { noop } from 'lodash';
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
      { label: 'Custom', icon: 'Home7Line', fixed: true },
      { actions: [{ label: 'Test' }] },
      { label: 'Right', icon: 'AiGenerate2', fixed: true, position: 'right' },
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

export const NoSorting: Story = {
  args: {
    label: 'Collection of items',
    items,
    sortable: false,
    defaultSortBy: null,
  },
};

export const SelectedFirst: Story = {
  args: {
    label: 'Collection of items',
    items,
    sortable: false,
    showSelectedFirst: true,
  },
};

export const WithoutLayoutActions: Story = {
  args: {
    filterable: false,
    sortable: false,
    label: undefined,
    badge: undefined,
    showLayoutSwitch: false,
    items,
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

export const WithStretchedItems: Story = {
  args: {
    label: 'Collection with stretched items',
    items: [
      {
        label: 'Stretched hero item',
        content: 'This item stretches across all columns regardless of count.',
        stretch: true,
        intent: 'info',
      },
      { label: 'Normal item', content: 'Regular item.' },
      { label: 'Normal item', content: 'Regular item.' },
      { label: 'Normal item', content: 'Regular item.' },
      { label: 'Normal item', content: 'Regular item.' },
      {
        label: 'Another stretched item',
        content: 'Also spans the full width, even as the window resizes.',
        stretch: true,
        intent: 'success',
      },
      { label: 'Normal item', content: 'Regular item.' },
      { label: 'Normal item', content: 'Regular item.' },
    ],
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
      async () => {
        await expect(document.querySelectorAll('.reqore-popover-content')).toHaveLength(1);
      },
      {
        timeout: 5000,
      }
    );
  },
};

export const Skeleton: Story = {
  args: {
    skeleton: true,
  },
};

export const WithGroups: Story = {
  args: {
    items: [
      {
        label: 'This item is not flat',
        tooltip: 'This is a test item',
        content:
          'Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long',
        flat: false,
        tags: [
          {
            label: 23,
            asBadge: true,
          },
          {
            label: 2022,
            labelKey: 'Year',
            asBadge: true,
            onRemoveClick: noop,
          },
        ],
        expandable: true,
        metadata: {
          id: 23,
          category: 'Article',
        },
      },
      {
        label: 'Test with tooltip',
        tooltip: 'This is a test item',
        labelSize: 2,
        contentSize: 'huge',
        selected: true,
        icon: 'Hashtag',
        content:
          'Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long',
        tags: [
          {
            label: 'local',
            labelKey: 'level',
            intent: 'info',
            icon: 'Hashtag',
          },
          {
            label: 'string',
            labelKey: 'type',
            intent: 'warning',
            icon: 'CodeLine',
          },
        ],
        metadata: {
          id: 24,
          category: 'Post',
        },
      },
      {
        icon: 'TextWrap',
        label: 'Small item that is not minimal',
        tooltip: 'This is a test item',
        size: 'small',
        content:
          'Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long',
        minimal: false,
        badge: 0,
        searchString: 'secret',
        metadata: {
          id: 1,
          category: 'None',
        },
      },
      {
        icon: 'ZcoolLine',
        label: 'Item without fade',
        content:
          'Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long Hello I am a test item content and I am very long so will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long Hello I am a test item content and I am very long so will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long',
        showContentFade: false,
        metadata: {
          id: 13,
          category: 'Article',
        },
      },
      ...collectionWithGroups,
    ],
  },
};

export const WithConfiguredGroups: Story = {
  args: {
    label: 'Integrations',
    items: [
      {
        label: 'Send Email',
        groups: ['Communication'],
        content: 'Send an email through SMTP',
      },
      {
        label: 'Send Slack Message',
        groups: ['Communication'],
        content: 'Post a message to a Slack channel',
      },
      {
        label: 'Run Query',
        groups: ['Database'],
        content: 'Execute a SQL query',
      },
      {
        label: 'Insert Row',
        groups: ['Database'],
        content: 'Insert a new row into a table',
      },
      {
        label: 'Standalone Item',
        content: 'No group assigned',
      },
    ],
    groups: {
      Communication: {
        label: 'Communication channels',
        description: 'Email, chat and notification integrations',
        icon: 'ChatSmile2Line',
      },
      Database: {
        label: 'Databases',
        description: 'Read and write to data stores',
        icon: 'Database2Line',
        intent: 'success',
        collapsible: true,
        isCollapsed: true,
      },
    },
  } as IReqoreCollectionProps,
};

export const SortByRelevanceAcrossGroups: Story = {
  args: {
    label: 'Search Results (sorted by relevance, not group)',
    sortByGroupFirst: false,
    defaultSortBy: 'relevance',
    defaultSort: 'asc',
    sortKeys: {
      relevance: 'Relevance',
    },
    items: [
      {
        label: 'Zendesk: Create Ticket',
        groups: ['Zendesk'],
        badge: 'Exact',
        intent: 'success',
        content: 'Creates a new support ticket in Zendesk',
        metadata: { relevance: 0 },
      },
      {
        label: 'AWS: Launch Instance',
        groups: ['AWS'],
        badge: 'Partial',
        content: 'Launch a new EC2 instance in AWS',
        metadata: { relevance: 1 },
      },
      {
        label: 'AWS: S3 Upload',
        groups: ['AWS'],
        badge: 'Exact',
        intent: 'success',
        content: 'Upload a file to an S3 bucket',
        metadata: { relevance: 0 },
      },
      {
        label: 'Slack: Send Message',
        groups: ['Slack'],
        badge: 'Weak',
        intent: 'warning',
        content: 'Send a message to a Slack channel',
        metadata: { relevance: 2 },
      },
      {
        label: 'Slack: Create Channel',
        groups: ['Slack'],
        badge: 'Partial',
        content: 'Create a new Slack channel',
        metadata: { relevance: 1 },
      },
      {
        label: 'Zendesk: Update Ticket',
        groups: ['Zendesk'],
        badge: 'Weak',
        intent: 'warning',
        content: 'Update an existing support ticket',
        metadata: { relevance: 2 },
      },
      {
        label: 'Discord: Post Announcement',
        groups: ['Discord'],
        badge: 'Exact',
        intent: 'success',
        content: 'Post an announcement to a Discord channel',
        metadata: { relevance: 0 },
      },
      {
        label: 'Discord: Ban User',
        groups: ['Discord'],
        badge: 'Weak',
        intent: 'warning',
        content: 'Ban a user from the Discord server',
        metadata: { relevance: 2 },
      },
    ],
  },
};

export const ItemIsInMultipleGroups: Story = {
  args: {
    items: [
      {
        label: 'This item is not flat',
        tooltip: 'This is a test item',
        content:
          'Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long',
        flat: false,
        tags: [
          {
            label: 23,
            asBadge: true,
          },
          {
            label: 2022,
            labelKey: 'Year',
            asBadge: true,
            onRemoveClick: noop,
          },
        ],
        expandable: true,
        metadata: {
          id: 23,
          category: 'Article',
        },
        groups: ['Group A'],
      },
      {
        label: 'Test with tooltip',
        tooltip: 'This is a test item',
        labelSize: 2,
        contentSize: 'huge',
        selected: true,
        icon: 'Hashtag',
        groups: ['Group A', 'Group B'],
        content:
          'Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long',
        tags: [
          {
            label: 'local',
            labelKey: 'level',
            intent: 'info',
            icon: 'Hashtag',
          },
          {
            label: 'string',
            labelKey: 'type',
            intent: 'warning',
            icon: 'CodeLine',
          },
        ],
        metadata: {
          id: 24,
          category: 'Post',
        },
      },
      {
        icon: 'TextWrap',
        label: 'Small item that is not minimal',
        tooltip: 'This is a test item',
        size: 'small',
        content:
          'Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long',
        minimal: false,
        badge: 0,
        searchString: 'secret',
        metadata: {
          id: 1,
          category: 'None',
        },
        groups: ['Group B'],
      },
      {
        icon: 'ZcoolLine',
        label: 'Item without fade',
        content:
          'Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long Hello I am a test item content and I am very long so will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long Hello I am a test item content and I am very long so will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long',
        showContentFade: false,
        metadata: {
          id: 13,
          category: 'Article',
        },
      },
    ],
  },
};
