import { StoryObj } from '@storybook/react';
import { ReqoreEmptyState } from '../../components/EmptyState';
import { ReqoreButton, ReqoreControlGroup } from '../../index';
import { StoryMeta } from '../utils';
import { ALL_SIZES } from '../utils/args';

const meta = {
  title: 'Display/Empty State',
  component: ReqoreEmptyState,
} as StoryMeta<typeof ReqoreEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    icon: 'InboxLine',
    title: 'No data',
    description: 'There is nothing to display yet.',
  },
};

export const WithActions: Story = {
  render: (args) => (
    <ReqoreEmptyState
      {...args}
      icon='AddCircleLine'
      title='No items yet'
      description='Get started by creating your first item.'
      actions={
        <ReqoreControlGroup>
          <ReqoreButton icon='AddLine' intent='info'>
            Create Item
          </ReqoreButton>
          <ReqoreButton icon='BookOpenLine'>Documentation</ReqoreButton>
        </ReqoreControlGroup>
      }
    />
  ),
};

export const IconOnly: Story = {
  args: {
    icon: 'SearchLine',
    title: 'No results found',
  },
};

export const DescriptionOnly: Story = {
  args: {
    description: 'This section is empty. Content will appear here once available.',
  },
};

export const WithBackground: Story = {
  render: (args) => (
    <ReqoreControlGroup gapSize='big' wrap>
      <ReqoreEmptyState
        {...args}
        icon='InboxLine'
        title='Empty inbox'
        description='No messages to display.'
        rounded
      />
      <ReqoreEmptyState
        {...args}
        icon='Notification2Line'
        title='No notifications'
        description='You are all caught up!'
        intent='success'
        rounded
      />
      <ReqoreEmptyState
        {...args}
        icon='ErrorWarningLine'
        title='Something went wrong'
        description='Please try again later.'
        intent='danger'
        rounded
      />
    </ReqoreControlGroup>
  ),
};

export const WithBackgroundFlat: Story = {
  render: (args) => (
    <ReqoreControlGroup gapSize='big' wrap>
      <ReqoreEmptyState
        {...args}
        icon='InboxLine'
        title='Empty inbox'
        description='No messages to display.'
        rounded
        flat
      />
      <ReqoreEmptyState
        {...args}
        icon='Notification2Line'
        title='All clear'
        description='No pending items.'
        intent='info'
        rounded
        flat
      />
    </ReqoreControlGroup>
  ),
};

export const Intents: Story = {
  render: (args) => (
    <ReqoreControlGroup gapSize='big' wrap>
      <ReqoreEmptyState {...args} icon='InformationLine' title='Info' intent='info' rounded />
      <ReqoreEmptyState {...args} icon='CheckLine' title='Success' intent='success' rounded />
      <ReqoreEmptyState {...args} icon='AlertLine' title='Warning' intent='warning' rounded />
      <ReqoreEmptyState {...args} icon='ErrorWarningLine' title='Danger' intent='danger' rounded />
      <ReqoreEmptyState {...args} icon='TimeLine' title='Pending' intent='pending' rounded />
      <ReqoreEmptyState {...args} icon='SubtractLine' title='Muted' intent='muted' rounded />
    </ReqoreControlGroup>
  ),
};

export const Sizes: Story = {
  render: (args) => {
    const sizes = ['tiny', 'small', 'normal', 'big', 'huge'] as const;

    return (
      <ReqoreControlGroup gapSize='big' vertical>
        {sizes.map((size) => (
          <ReqoreEmptyState
            key={size}
            {...args}
            size={size}
            icon='FolderLine'
            title={`${size} empty state`}
            description='No content available.'
            rounded
          />
        ))}
      </ReqoreControlGroup>
    );
  },
};

export const Fluid: Story = {
  render: (args) => (
    <ReqoreEmptyState
      {...args}
      icon='InboxLine'
      title='No messages'
      description='Your inbox is empty.'
      rounded
      fluid
    />
  ),
};

export const NotFlat: Story = {
  args: {
    title: 'Not Flat',
    description: 'This section is currently not flat.',
    flat: false,
    gapSize: 'big',
  },
};

export const Disabled: Story = {
  args: {
    icon: 'ForbidLine',
    title: 'Unavailable',
    description: 'This section is currently disabled.',
    rounded: true,
    disabled: true,
  },
};

export const CustomDescription: Story = {
  render: (args) => (
    <ReqoreEmptyState
      {...args}
      icon='CodeLine'
      title='Custom content'
      description={
        <ul style={{ margin: '0', paddingLeft: '20px', textAlign: 'left' }}>
          <li>You can pass any React node as description</li>
          <li>Lists, links, formatted text, etc.</li>
          <li>String descriptions are auto-centered</li>
        </ul>
      }
      rounded
    />
  ),
};

export const WithGradientBackground: Story = {
  render: (args) => (
    <ReqoreEmptyState
      {...args}
      icon='StarLine'
      title='Premium feature'
      description='Upgrade your plan to unlock this feature.'
      rounded
      effect={{
        gradient: {
          colors: { 0: 'info:darken:2', 100: 'success:darken:2' },
          direction: 'to bottom right',
        },
      }}
      actions={
        <ReqoreButton icon='VipCrown2Line' intent='warning'>
          Upgrade
        </ReqoreButton>
      }
    />
  ),
};

export const SearchNoResults: Story = {
  render: (args) => (
    <ReqoreEmptyState
      {...args}
      icon='SearchLine'
      title='No results found'
      description='Try adjusting your search or filter criteria.'
      rounded
      actions={
        <ReqoreButton icon='RefreshLine' size='small'>
          Clear filters
        </ReqoreButton>
      }
    />
  ),
};

export const Raised: Story = {
  args: {
    icon: 'InboxLine',
    title: 'Raised empty state',
    description:
      'Subtle inset highlight gives the placeholder surface a tactile, slightly elevated feel.',
    raised: true,
  },
};

export const RadiusSize: Story = {
  render: () => (
    <ReqoreControlGroup vertical gapSize='small'>
      {ALL_SIZES.map((rs) => (
        <ReqoreEmptyState
          key={rs}
          icon='InboxLine'
          title={`radiusSize="${rs}"`}
          description='Corner roundness is independent of the size prop.'
          rounded
          radiusSize={rs}
        />
      ))}
    </ReqoreControlGroup>
  ),
};
