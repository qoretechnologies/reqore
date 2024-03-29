import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ReqoreRadioGroup, { IReqoreRadioGroupProps } from '../../components/RadioGroup';
import { StoryMeta } from '../utils';
import { DisabledArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreRadioGroupProps>();

const meta = {
  title: 'Form/Radio Group/Stories',
  component: ReqoreRadioGroup,
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
} as StoryMeta<typeof ReqoreRadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreRadioGroupProps> = (args: IReqoreRadioGroupProps) => {
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
          divider: true,
          label: 'Intents',
        },
        {
          label: 'Danger option',
          value: 'danger',
          intent: 'danger',
        },
        {
          label: 'Success option with left margin',
          value: 'sucess',
          intent: 'success',
          margin: 'left',
        },
        {
          label: 'Pending option',
          value: 'pending',
          intent: 'pending',
        },
        {
          label: 'Info option',
          value: 'info',
          intent: 'info',
        },
        {
          label: 'Warning option',
          value: 'warning',
          intent: 'warning',
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

export const Basic: Story = {
  render: Template,
};

export const Horizontal: Story = {
  render: Template,

  args: {
    vertical: false,
  },
};

export const Switch: Story = {
  render: Template,

  args: {
    asSwitch: true,
  },
};

export const WithoutMargin: Story = {
  render: Template,

  args: {
    margin: 'none',
  },
};

export const WithTexts: Story = {
  render: Template,

  args: {
    asSwitch: true,
    onText: 'True',
    offText: 'False and wrong',
  },
};
