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
  parameters: {
    docs: {
      description: {
        story:
          'Renders EmptyState in its default configuration.',
      },
    },
  },
  args: {
    icon: 'InboxLine',
    title: 'No data',
    description: 'There is nothing to display yet.',
  },
};

export const WithActions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders EmptyState with action buttons attached.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders EmptyState showing only an icon (no label).',
      },
    },
  },
  args: {
    icon: 'SearchLine',
    title: 'No results found',
  },
};

export const DescriptionOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders EmptyState showing only a description.',
      },
    },
  },
  args: {
    description: 'This section is empty. Content will appear here once available.',
  },
};

export const WithBackground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders EmptyState with a background image or color set.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders EmptyState with the flat background variant.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders EmptyState at every intent (info, success, warning, danger, pending, muted) so the intent palette is visible side by side.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders EmptyState at every size (tiny through huge) so the size scale is visible side by side.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders EmptyState with fluid set so it fills the available horizontal space.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders EmptyState with flat={false} so the elevated look is applied.',
      },
    },
  },
  args: {
    title: 'Not Flat',
    description: 'This section is currently not flat.',
    flat: false,
    gapSize: 'big',
  },
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders EmptyState in its disabled state.',
      },
    },
  },
  args: {
    icon: 'ForbidLine',
    title: 'Unavailable',
    description: 'This section is currently disabled.',
    rounded: true,
    disabled: true,
  },
};

export const CustomDescription: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders EmptyState with a custom description.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders EmptyState with a gradient applied to its background.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders EmptyState after a search that yielded no results.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders EmptyState with the raised effect.',
      },
    },
  },
  args: {
    icon: 'InboxLine',
    title: 'Raised empty state',
    description:
      'Subtle inset highlight gives the placeholder surface a tactile, slightly elevated feel.',
    raised: true,
  },
};

export const RadiusSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders EmptyState at every radius size to show the border-radius scale.',
      },
    },
  },
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
