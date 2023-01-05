import { Meta, Story } from '@storybook/react/types-6-0';
import { useState } from 'react';
import { IReqoreMultiSelectProps, ReqoreMultiSelect } from '../../components/MultiSelect';
import { MultiSelectItems } from '../../mock/multiSelect';
import { FlatArg, MinimalArg, SizeArg, argManager } from '../utils/args';

const { createArg, disableArg } = argManager<IReqoreMultiSelectProps>();

export default {
  title: 'Components/MultiSelect',
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
      openOnMount
      selectorProps={{
        listHeight: '600px',
        ...args.selectorProps,
      }}
      items={MultiSelectItems}
    />
  );
};

export const Basic = Template.bind({});
export const Empty = Template.bind({});
Empty.args = {
  value: [],
};

export const Flat = Template.bind({});
Flat.args = {
  flat: true,
};

export const Minimal = Template.bind({});
Minimal.args = {
  minimal: true,
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
