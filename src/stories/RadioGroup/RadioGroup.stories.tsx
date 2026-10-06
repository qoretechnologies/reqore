import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import ReqoreRadioGroup, { IReqoreRadioGroupProps } from '../../components/RadioGroup';
import { StoryMeta } from '../utils';
import { StoryForm, storyFormText } from '../utils/formPreview';
import { DisabledArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreRadioGroupProps>();

const meta = {
  title: 'Form/Radio Group',
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
  const [selected, setSelected] = useState('checkedIntent');

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
          label: 'Intent only when checked',
          value: 'checkedIntent',
          checkedIntent: 'info',
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders RadioGroup in its default configuration.',
      },
    },
  },
  render: Template,
};

export const Horizontal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RadioGroup laid out horizontally.',
      },
    },
  },
  render: Template,

  args: {
    vertical: false,
  },
};

export const Switch: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RadioGroup in switch mode.',
      },
    },
  },
  render: Template,

  args: {
    asSwitch: true,
  },
};

export const WithoutMargin: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RadioGroup with margin removed.',
      },
    },
  },
  render: Template,

  args: {
    margin: 'none',
  },
};

export const WithTexts: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RadioGroup with text overrides for the items.',
      },
    },
  },
  render: Template,

  args: {
    asSwitch: true,
    onText: 'True',
    offText: 'False and wrong',
  },
};

/* -------------------------------------------------------------------------------------------
 * As a form control: with a `name`, the options are one native radio group.
 * ----------------------------------------------------------------------------------------- */

const DEVICES: IReqoreRadioGroupProps['items'] = [
  { label: 'Authenticator app', value: 'otp-app', description: 'Pixel 9, added in March' },
  { label: 'Backup phone', value: 'otp-phone' },
  { label: 'Retired security key', value: 'otp-key', disabled: true },
  { label: 'Hardware token', value: 'otp-token' },
];

const FormTemplate: StoryFn<IReqoreRadioGroupProps> = (args: IReqoreRadioGroupProps) => {
  const [selected, setSelected] = useState('otp-phone');

  return (
    <StoryForm>
      <ReqoreRadioGroup
        aria-label='Your one-time-code devices'
        name='selectedCredentialId'
        required
        {...args}
        items={DEVICES}
        selected={selected}
        onSelectClick={setSelected}
      />
    </StoryForm>
  );
};

const radios = () =>
  Array.from(document.querySelectorAll('.reqore-checkbox-input')) as HTMLInputElement[];

export const FormControl: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a named radio group inside a plain HTML form, with what the form posts written under it. Every option is a native radio named `selectedCredentialId`; clicking "Authenticator app" selects it and the form posts `selectedCredentialId=otp-app`.',
      },
    },
  },
  render: FormTemplate,
  play: async () => {
    await waitFor(() => expect(storyFormText('posts')).toBe('selectedCredentialId=otp-phone'));

    const options = radios();
    expect(options.map((radio) => radio.type)).toEqual(['radio', 'radio', 'radio', 'radio']);
    expect(options.every((radio) => radio.name === 'selectedCredentialId')).toBe(true);
    expect(document.querySelector('[role="radiogroup"]').getAttribute('aria-label')).toBe(
      'Your one-time-code devices'
    );

    await userEvent.click(document.querySelector('.reqore-checkbox-label'));

    await waitFor(() => expect(options[0].checked).toBe(true));
    await waitFor(() => expect(storyFormText('posts')).toBe('selectedCredentialId=otp-app'));
  },
};

export const FormControlKeyboard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the same group, driven from the keyboard. Tab enters the group on the selected option (one tab stop for the whole group) and draws the focus ring on its box; the down arrow moves the choice past the disabled option to "Hardware token", which the form then posts.',
      },
    },
  },
  render: FormTemplate,
  play: async () => {
    await waitFor(() => expect(storyFormText('posts')).toBe('selectedCredentialId=otp-phone'));
    const options = radios();

    await userEvent.tab();
    await waitFor(() => expect(document.activeElement).toBe(options[1]));

    await userEvent.keyboard('{ArrowDown}');

    await waitFor(() => expect(document.activeElement).toBe(options[3]));
    await waitFor(() => expect(options[3].checked).toBe(true));
    await waitFor(() => expect(storyFormText('posts')).toBe('selectedCredentialId=otp-token'));
  },
};

export const FormControlMobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    qlip: { viewport: { width: 380, height: 700 } },
    docs: {
      description: {
        story:
          'Renders the named radio group on a phone-width screen (380px): the options and the description fit the screen, and tapping "Hardware token" selects it.',
      },
    },
  },
  render: FormTemplate,
  play: async () => {
    await waitFor(() => expect(storyFormText('posts')).toBe('selectedCredentialId=otp-phone'));

    const labels = document.querySelectorAll('.reqore-checkbox-label');
    await userEvent.click(labels[3]);

    await waitFor(() => expect(storyFormText('posts')).toBe('selectedCredentialId=otp-token'));
    const form = document.querySelector('.story-form') as HTMLElement;
    expect(form.scrollWidth).toBeLessThanOrEqual(form.clientWidth + 1);
  },
};
