import { Meta, Story } from '@storybook/react/types-6-0';
import { useState } from 'react';
import ReqoreRadioGroup, { IReqoreRadioGroupProps } from '../../components/RadioGroup';
import { argManager, DisabledArg } from '../utils/args';

const { createArg } = argManager<IReqoreRadioGroupProps>();

export default {
  title: 'Components/Radio Group',
  argTypes: {
    ...createArg('asSwitch', {
      type: 'boolean',
      defaultValue: false,
      name: 'As Switch',
      description: 'If the radio group should be rendered as a switch',
    }),
    ...DisabledArg,
  },
} as Meta<IReqoreRadioGroupProps>;

const Template: Story<IReqoreRadioGroupProps> = (args: IReqoreRadioGroupProps) => {
  const [selected, setSelected] = useState(null);

  return (
    <ReqoreRadioGroup
      {...args}
      items={[
        {
          label: 'Option 1',
          value: 'opt1',
        },
        {
          label: 'Option 2',
          value: 'opt2',
        },
        {
          label: 'Option 3',
          value: 'opt3',
        },
        {
          label: 'Read Only Option',
          value: 'opt4',
          readOnly: true,
        },
        {
          label: 'Disabled Option',
          value: 'opt5',
          disabled: true,
        },
      ]}
      onSelectClick={(value) => setSelected(value)}
      selected={selected}
    />
  );
};

export const Basic = Template.bind({});
export const Switch = Template.bind({});
Switch.args = {
  asSwitch: true,
};
