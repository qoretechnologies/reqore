import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { IReqoreMultiSelectProps, ReqoreMultiSelect } from '../../components/MultiSelect';
import { MultiSelectItems } from '../../mock/multiSelect';
import { IReqoreIconName } from '../../types/icons';
import { StoryMeta } from '../utils';
import { FlatArg, IconArg, MinimalArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreMultiSelectProps>();

const meta = {
  title: 'Form/Multi Select',
  component: ReqoreMultiSelect,
  parameters: {
    chromatic: {
      delay: 500,
    },
  },
  args: {
    canCreateItems: true,
    canRemoveItems: true,
  },
  argTypes: {
    ...FlatArg,
    ...MinimalArg(),
    ...SizeArg,
    ...createArg('canCreateItems', {
      defaultValue: true,
      name: 'Can create items',
      type: 'boolean',
    }),
    ...createArg('canRemoveItems', {
      defaultValue: true,
      name: 'Can remove items',
      type: 'boolean',
    }),
    ...IconArg('onItemClickIcon', 'Clickable item right icon', null),
  },
  /* Typed with the string-valued props the template renders: the component is
     generic over what it holds, and `typeof` a generic component gives
     Storybook the widest value type rather than the one these stories use. */
} as StoryMeta<(props: IReqoreMultiSelectProps) => JSX.Element>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreMultiSelectProps> = (args: IReqoreMultiSelectProps) => {
  const [selected, setSelected] = useState<string[]>([
    'Existing item 3',
    'Disabled item',
    'itemWithNoLabel',
  ]);

  console.log({ selected });

  return (
    <ReqoreMultiSelect
      value={selected}
      {...args}
      onValueChange={setSelected}
      enterKeySelects
      selectorProps={{
        listHeight: '600px',
        ...args.selectorProps,
      }}
      items={MultiSelectItems}
    />
  );
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders MultiSelect in its default configuration.',
      },
    },
  },
  render: Template,

  args: {
    onItemClickIcon: 'EditLine',
  },
};

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders MultiSelect in its empty state.',
      },
    },
  },
  render: Template,

  args: {
    value: [],
  },
};

export const AutoOpen: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders MultiSelect that opens automatically on mount.',
      },
    },
  },
  render: Template,

  args: {
    openOnMount: true,
  },
};

export const Flat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders MultiSelect in its flat variant.',
      },
    },
  },
  render: Template,

  args: {
    flat: true,
  },
};

export const Minimal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders MultiSelect in its minimal variant.',
      },
    },
  },
  render: Template,

  args: {
    minimal: true,
  },
};

export const WithoutNoItemsMessage: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders MultiSelect without the no-items message override.',
      },
    },
  },
  render: Template,

  args: {
    value: [],
    showNoItemsMessage: false,
  },
};

export const WithCustomNoItemsMessage: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders MultiSelect with a custom no-items message.',
      },
    },
  },
  render: Template,

  args: {
    value: [],
    selectorProps: { placeholder: 'Select items...' },
    noItemsMessageProps: { label: 'There are no items yet', color: 'warning' },
  },
};

export const Clickable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders MultiSelect in a clickable variant so hover and press states are exercised.',
      },
    },
  },
  render: Template,

  args: {
    onItemClick: (item) => console.log('onItemClick', item),
    onItemClickIcon: 'EditLine' as IReqoreIconName,
  },
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders MultiSelect in its disabled state.',
      },
    },
  },
  render: Template,

  args: {
    onItemClick: (item) => console.log('onItemClick', item),
    onItemClickIcon: 'EditLine' as IReqoreIconName,
    disabled: true,
  },
};

export const WithEffect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders MultiSelect with a visual effect applied.',
      },
    },
  },
  render: Template,

  args: {
    selectedItemEffect: {
      gradient: {
        colors: {
          0: '#7f60ea',
          100: '#00fd67',
        },
      },
    },
    selectorProps: {
      effect: {
        gradient: {
          colors: {
            0: '#7f60ea',
            100: '#00fd67',
          },
        },
      },
    },
  },
};

export const UnchoosableItems: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "An option that is present but cannot be picked — and can still be read. `disabled` is the wrong tool for this: it renders the row `pointer-events: none`, which takes its tooltip and its row actions with it, so disabling the option destroys the explanation. `readOnly` is the state that keeps the row alive — full opacity, pointer events intact, `cursor: not-allowed` — while the list refuses to select it, by click and by keyboard. The reason then has somewhere to live: a `description` under the label, a `tooltip`, a `badge`, an `intent`, or a `rightAction` the user can press. The last row is `disabled` for contrast; try to hover it.",
      },
    },
  },
  render: (args: IReqoreMultiSelectProps) => {
    const [selected, setSelected] = useState<string[]>(['smtp']);

    return (
      <ReqoreMultiSelect
        {...args}
        value={selected}
        onValueChange={setSelected}
        canRemoveItems
        openOnMount
        selectorProps={{ listHeight: '400px' }}
        items={[
          { label: 'Email (SMTP)', value: 'smtp', icon: 'MailLine' },
          { label: 'Webhook', value: 'webhook', icon: 'GlobalLine' },
          {
            label: 'Slack',
            value: 'slack',
            icon: 'SlackLine',
            readOnly: true,
            description: 'No Slack connection is configured in this instance',
            badge: [{ label: 'Needs a connection', intent: 'warning' }],
            tooltip: { content: 'Create a Slack connection to make this available' },
            rightAction: {
              icon: 'ExternalLinkLine',
              tooltip: 'Open connections',
              onClick: () => console.log('take me to connections'),
            },
          },
          {
            label: 'PagerDuty',
            value: 'pagerduty',
            icon: 'AlarmWarningLine',
            readOnly: true,
            description: 'Available on the Enterprise plan',
            intent: 'muted',
          },
          {
            label: 'Fax',
            value: 'fax',
            icon: 'PrinterLine',
            disabled: true,
            tooltip: { content: 'You will never get to read this' },
          },
        ]}
      />
    );
  },
};
