import { Meta, Story } from '@storybook/react/types-6-0';
import { useState } from 'react';
import { IReqoreMultiSelectProps, ReqoreMultiSelect } from '../../components/MultiSelect';
import { MultiSelectItems } from '../../mock/multiSelect';
import { IReqoreIconName } from '../../types/icons';
import { FlatArg, IconArg, MinimalArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreMultiSelectProps>();

export default {
  title: 'Components/Multi Select',
  parameters: {
    chromatic: {
      delay: 500,
    },
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
} as Meta<IReqoreMultiSelectProps>;

const Template: Story<IReqoreMultiSelectProps> = (args: IReqoreMultiSelectProps) => {
  const [selected, setSelected] = useState<string[]>([
    'Existing item 1',
    'Existing item 3',
    'Disabled item',
    'Minimal item with border',
    'itemWithNoLabel',
  ]);

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

export const Basic = Template.bind({});
Basic.args = {
  onItemClickIcon: 'EditLine' as IReqoreIconName,
};
export const Empty = Template.bind({});
Empty.args = {
  value: [],
};

export const AutoOpen = Template.bind({});
AutoOpen.args = {
  openOnMount: true,
};

export const Flat = Template.bind({});
Flat.args = {
  flat: true,
};

export const Minimal = Template.bind({});
Minimal.args = {
  minimal: true,
};

export const Clickable = Template.bind({});
Clickable.args = {
  onItemClick: (item) => console.log('onItemClick', item),
  onItemClickIcon: 'EditLine' as IReqoreIconName,
};

export const WithEffect = Template.bind({});
WithEffect.args = {
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
};
