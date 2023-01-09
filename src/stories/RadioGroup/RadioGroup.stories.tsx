import { Meta, Story } from '@storybook/react/types-6-0';
import { useState } from 'react';
import ReqoreRadioGroup, { IReqoreRadioGroupProps } from '../../components/RadioGroup';
import { DisabledArg, SizeArg, argManager } from '../utils/args';

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
    ...SizeArg,
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
          onText: 1,
          offText: 0,
        },
        {
          label: 'Danger option',
          value: 'danger',
          intent: 'danger',
        },
        {
          label: 'Effect option',
          labelPosition: 'left',
          value: 'effect',
          effect: {
            gradient: {
              colors: {
                0: 'info',
                100: 'success',
              },
            },
          },
        },
        {
          label: 'Effect option with main color gradient and hover animation',
          value: 'effect2',
          effect: {
            gradient: {
              colors: 'main',
              animate: 'hover',
            },
          },
        },
        {
          label: 'Text effect & custom theme option',
          value: 'textEffect',
          customTheme: {
            main: '#110134',
          },
          onText: 'On',
          offText: 'Off',
          switchTextEffect: {
            gradient: {
              colors: {
                0: 'warning',
                100: 'pending',
              },
            },
          },
        },
        {
          divider: true,
          label: 'Divider',
        },
        {
          label: 'Beautiful option 3 with gradient effect',
          value: 'opt3',
          labelEffect: {
            gradient: {
              colors: {
                0: 'info',
                100: 'info:lighten:3',
              },
            },
            weight: 'thick',
          },
        },
        {
          label: 'Custom Icons Option',
          value: 'customIconsOpt',
          checkedIcon: 'EmotionHappyLine',
          uncheckedIcon: 'EmotionSadLine',
        },
        {
          label: 'Custom Image Option',
          value: 'customOpt',
          labelEffect: {
            glow: {
              color: 'danger',
              blur: 2,
            },
          },
          image:
            'https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4',
        },
        {
          divider: true,
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
          labelEffect: {
            glow: {
              color: '#ffffff',
              blur: 0,
            },
          },
        },
      ]}
      onSelectClick={(value) => setSelected(value)}
      selected={selected}
    />
  );
};

export const Basic = Template.bind({});
export const Horizontal = Template.bind({});
Horizontal.args = {
  vertical: false,
};
export const Switch = Template.bind({});
Switch.args = {
  asSwitch: true,
};

export const WithTexts = Template.bind({});
WithTexts.args = {
  asSwitch: true,
  onText: 'True',
  offText: 'False and wrong',
};
