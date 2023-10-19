import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { IReqoreMultiSelectProps, ReqoreMultiSelect } from '../../components/MultiSelect';
import { MultiSelectItems } from '../../mock/multiSelect';
import { IReqoreIconName } from '../../types/icons';
import { StoryMeta } from '../utils';
import { FlatArg, IconArg, MinimalArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreMultiSelectProps>();

const meta = {
  title: 'Form/Multi Select/Stories',
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
} as StoryMeta<typeof ReqoreMultiSelect>;

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
  render: Template,

  args: {
    onItemClickIcon: 'EditLine',
  },
};

export const Empty: Story = {
  render: Template,

  args: {
    value: [],
  },
};

export const AutoOpen: Story = {
  render: Template,

  args: {
    openOnMount: true,
  },
};

export const Flat: Story = {
  render: Template,

  args: {
    flat: true,
  },
};

export const Minimal: Story = {
  render: Template,

  args: {
    minimal: true,
  },
};

export const Clickable: Story = {
  render: Template,

  args: {
    onItemClick: (item) => console.log('onItemClick', item),
    onItemClickIcon: 'EditLine' as IReqoreIconName,
  },
};

export const WithEffect: Story = {
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
