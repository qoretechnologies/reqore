import { StoryObj } from '@storybook/react';
import ReqoreControlGroup from '../../components/ControlGroup';
import {
  IReqoreDescriptionListProps,
  ReqoreDescriptionList,
} from '../../components/DescriptionList';
import { ReqoreSpan } from '../../components/Span';
import ReqoreTag from '../../components/Tag';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Display/Description List/Stories',
  component: ReqoreDescriptionList,
} as StoryMeta<typeof ReqoreDescriptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

const lifecycleItems: IReqoreDescriptionListProps['items'] = [
  {
    key: 'created',
    label: 'Created',
    content: '5/16/2026, 11:00 PM · 1 day ago',
  },
  {
    key: 'started',
    label: 'Started',
    content: '5/16/2026, 11:00 PM · 1 day ago',
  },
  {
    key: 'completed',
    label: 'Completed',
    content: '5/17/2026, 12:00 AM · 1 day ago',
  },
  {
    key: 'duration',
    label: 'Duration',
    content: '1h',
  },
];

export const Basic: Story = {
  args: {
    label: 'Lifecycle',
    icon: 'TimeLine',
    items: lifecycleItems,
  },
};

export const WithIntents: Story = {
  args: {
    label: 'Pages',
    icon: 'FileTextLine',
    items: [
      {
        key: 'crawled',
        label: 'Crawled',
        content: '412 / 500 max',
        intent: 'success',
      },
      {
        key: 'skipped',
        label: 'Skipped',
        content: (
          <>
            18 <ReqoreSpan effect={{ opacity: 0.55 }}>(unchanged since last crawl)</ReqoreSpan>
          </>
        ),
        intent: 'info',
      },
      {
        key: 'failed',
        label: 'Failed',
        content: '3',
        intent: 'danger',
      },
    ],
  },
};

export const WithLabelAndContentIntents: Story = {
  args: {
    label: 'Pages',
    icon: 'FileTextLine',
    description:
      '`labelIntent` / `contentIntent` tint the text independently of the row `intent` (which only drives the leading icon).',
    items: [
      {
        key: 'crawled',
        label: 'Crawled',
        content: '412 / 500 max',
        intent: 'success',
        contentIntent: 'success',
      },
      {
        key: 'skipped',
        label: 'Skipped',
        content: '18',
        labelIntent: 'info',
        contentIntent: 'muted',
      },
      {
        key: 'failed',
        label: 'Failed',
        content: '3',
        intent: 'danger',
        labelIntent: 'danger',
        contentIntent: 'danger',
      },
      {
        key: 'pending',
        label: 'Pending',
        content: '7',
        intent: 'pending',
        contentIntent: 'pending',
      },
    ],
  },
};

export const CustomIntentIcon: Story = {
  args: {
    label: 'Pages',
    icon: 'FileTextLine',
    description:
      '`intentIcon` swaps the per-row glyph (still tinted by `intent`).',
    items: [
      {
        key: 'crawled',
        label: 'Crawled',
        content: '412 / 500 max',
        intent: 'success',
        intentIcon: 'ThumbUpFill',
      },
      {
        key: 'failed',
        label: 'Failed',
        content: '3',
        intent: 'danger',
        intentIcon: 'ThumbDownFill',
      },
    ],
  },
};

export const RowWithoutLabel: Story = {
  args: {
    label: 'Identity',
    items: [
      { key: 'name', label: 'Name', content: 'qorus-docs' },
      { key: 'id', label: 'ID', content: '#42' },
      {
        key: 'note',
        content: (
          <ReqoreSpan effect={{ italic: true, opacity: 0.7 }}>
            System-managed collection — read-only.
          </ReqoreSpan>
        ),
      },
    ],
  },
};

export const Sizes: Story = {
  render: () => (
    <ReqoreControlGroup vertical gapSize='normal' style={{ width: 560 }}>
      {(['tiny', 'small', 'normal', 'big'] as const).map((size) => (
        <ReqoreDescriptionList
          key={size}
          label={`size=${size}`}
          size={size}
          items={lifecycleItems}
        />
      ))}
    </ReqoreControlGroup>
  ),
};

export const Intents: Story = {
  render: () => (
    <ReqoreControlGroup vertical gapSize='normal' style={{ width: 560 }}>
      {(['info', 'success', 'warning', 'danger', 'pending', 'muted'] as const).map((intent) => (
        <ReqoreDescriptionList
          key={intent}
          label={`intent=${intent}`}
          intent={intent}
          items={lifecycleItems}
        />
      ))}
    </ReqoreControlGroup>
  ),
};

export const Bordered: Story = {
  args: {
    label: 'Bordered',
    description: 'flat={false} renders the standard panel border.',
    flat: false,
    items: lifecycleItems,
  },
};

export const Square: Story = {
  args: {
    label: 'Square',
    description: 'rounded={false} drops corner radius.',
    rounded: false,
    items: lifecycleItems,
  },
};

export const Transparent: Story = {
  args: {
    label: 'Transparent',
    transparent: true,
    flat: true,
    items: lifecycleItems,
  },
};

export const Raised: Story = {
  args: {
    label: 'Raised',
    raised: true,
    flat: true,
    items: lifecycleItems,
  },
};

export const NoChrome: Story = {
  args: {
    transparent: true,
    flat: true,
    padded: false,
    items: lifecycleItems,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 24, width: 560 }}>
        <Story />
      </div>
    ),
  ],
};

export const WithBadgeAndActions: Story = {
  args: {
    label: 'Lifecycle',
    icon: 'TimeLine',
    badge: { label: '4 events', minimal: true },
    actions: [
      {
        icon: 'RefreshLine',
        tooltip: 'Refresh',
        minimal: true,
        flat: true,
      },
    ],
    items: lifecycleItems,
  },
};

export const PlainTextLabels: Story = {
  args: {
    label: 'Plain-text labels (uppercaseLabels=false)',
    uppercaseLabels: false,
    items: lifecycleItems,
  },
};

export const CustomTheme: Story = {
  args: {
    label: 'Custom theme',
    customTheme: { main: '#1c1c2b' },
    items: lifecycleItems,
  },
};

export const WithEffect: Story = {
  args: {
    items: lifecycleItems,
    minimal: true,
    raised: true,
    size: 'small',
    flat: true,
    radiusSize: 'big',
    padded: 'huge',
    contentEffect: {
      gradient: {
        type: 'linear',
        direction: 'to bottom right',
        colors: { 0: '#222', 100: '#0d0d0d' },
      },
    },
  },
};

export const NoSeparators: Story = {
  args: {
    label: 'No separators',
    separatorOpacity: 0,
    items: lifecycleItems,
  },
};

export const LeadingTagInContent: Story = {
  args: {
    label: 'Identity',
    icon: 'BookOpenLine',
    items: [
      {
        key: 'kind',
        label: 'Kind',
        content: (
          <>
            <ReqoreTag size='small' minimal label='RAG' intent='info' />
            <ReqoreSpan>retrieval-augmented generation</ReqoreSpan>
          </>
        ),
      },
      {
        key: 'embedding',
        label: 'Embedding',
        content: <ReqoreTag size='small' minimal label='text-embedding-3-small' />,
      },
    ],
  },
};
