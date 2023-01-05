import { Meta, Story } from '@storybook/react/types-6-0';
import { useState } from 'react';
import { IReqoreMultiSelectProps, ReqoreMultiSelect } from '../../components/MultiSelect';
import { argManager, FlatArg, MinimalArg, SizeArg } from '../utils/args';

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
      {...args}
      value={selected}
      onValueChange={setSelected}
      canCreateItems
      canRemoveItems
      enterKeySelects
      openOnMount
      selectorProps={{
        listHeight: '600px',
        ...args.selectorProps,
      }}
      items={[
        {
          label: 'Existing item 1',
          value: 'Existing item 1',
          icon: 'SunCloudyLine',
        },
        {
          label: 'Existing item 2',
          value: 'Existing item 2',
          icon: 'BatteryChargeFill',
        },
        {
          label: 'Existing item 3',
          value: 'Existing item 3',
          icon: 'DropboxFill',
          intent: 'info',
        },
        {
          label: 'Existing item 4',
          value: 'Existing item 4',
          icon: 'PagesLine',
          effect: { gradient: { colors: { 0: 'success', 100: 'info:darken:1' } } },
        },
        {
          disabled: true,
          label: 'Disabled item',
          value: 'Disabled item',
          icon: 'StopCircleLine',
        },
        {
          minimal: true,
          label: 'Minimal item',
          value: 'Minimal item',
          icon: 'StopCircleLine',
        },
        {
          divider: true,
          icon: 'CheckDoubleLine',
        },
        {
          value: 'itemWithNoLabel',
          icon: 'TakeawayLine',
        },
        {
          label: 'Other Item 1',
          value: 'Other Item 1',
          icon: 'MapFill',
        },
        {
          label: 'Other Item 2',
          value: 'Other Item 2',
          icon: 'ArrowLeftUpFill',
        },
        {
          label: 'Other Item 3',
          value: 'Other Item 3',
          icon: 'MicLine',
        },
      ]}
    />
  );
};

export const Basic = Template.bind({});

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
