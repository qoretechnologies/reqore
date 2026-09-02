import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { IReqoreSelectSingleProps, ReqoreSelect } from '../../components/Select';
import { MultiSelectItems } from '../../mock/multiSelect';
import { IReqoreIconName } from '../../types/icons';
import { StoryMeta } from '../utils';
import { FlatArg, IconArg, MinimalArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreSelectSingleProps>();

const meta = {
  title: 'Form/Select',
  component: ReqoreSelect,
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
      name: 'Can create a value',
      type: 'boolean',
    }),
    ...createArg('canRemoveItems', {
      defaultValue: true,
      name: 'Can clear the value',
      type: 'boolean',
    }),
    ...IconArg('onItemClickIcon', 'Clickable item right icon', null),
  },
} as StoryMeta<typeof ReqoreSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreSelectSingleProps> = (args: IReqoreSelectSingleProps) => {
  const [selected, setSelected] = useState<string | undefined>('Existing item 3');

  return (
    <ReqoreSelect
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
          'Renders Select in its default configuration: the chosen value is a chip and the list holds the candidates.',
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
        story: 'Renders Select in its empty state.',
      },
    },
  },
  render: Template,

  args: {
    value: undefined,
  },
};

export const ValueOutsideTheList: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Select holding a value that no item offers — the case a creatable field lands in once a value is entered by hand. The chip is drawn from the value itself.',
      },
    },
  },
  render: Template,

  args: {
    value: '$.create.body.items[0].sku',
  },
};

export const NotCreatable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Select as a pure picker: only the offered values can be chosen.',
      },
    },
  },
  render: Template,

  args: {
    canCreateItems: false,
  },
};

export const NotClearable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Select whose chip cannot be removed — for a field that must always hold a value.',
      },
    },
  },
  render: Template,

  args: {
    canRemoveItems: false,
  },
};

export const AutoOpen: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Select that opens its list automatically on mount.',
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
        story: 'Renders Select in its flat variant.',
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
        story: 'Renders Select in its minimal variant.',
      },
    },
  },
  render: Template,

  args: {
    minimal: true,
  },
};

export const WithCustomEmptyMessage: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders an empty Select with a custom empty-state message.',
      },
    },
  },
  render: Template,

  args: {
    value: undefined,
    selectorProps: { placeholder: 'Pick a value...' },
    noItemsMessageProps: { label: 'Nothing chosen yet', color: 'warning' },
  },
};

export const Clickable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Select whose chip is clickable, so hover and press states are exercised.',
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
        story: 'Renders Select in its disabled state.',
      },
    },
  },
  render: Template,

  args: {
    disabled: true,
  },
};

export const WithEffect: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Select with a visual effect applied.',
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

export const Multi: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Select with `multi`, which is the same component holding many values instead of one — picking a second item adds to the selection rather than replacing it. `ReqoreMultiSelect` is this, with `multi` pre-set.',
      },
    },
  },
  render: (args) => {
    const [selected, setSelected] = useState<string[]>(['Existing item 3', 'Existing item 1']);

    return (
      <ReqoreSelect
        {...args}
        multi
        value={selected}
        onValueChange={setSelected}
        enterKeySelects
        items={MultiSelectItems}
      />
    );
  },
};
