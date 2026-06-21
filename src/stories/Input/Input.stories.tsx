import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect } from 'storybook/test';
import ReqoreInput, { IReqoreInputProps } from '../../components/Input';
import { ReqoreControlGroup } from '../../index';
import { StoryMeta } from '../utils';
import { ALL_SIZES, FlatArg, IconArg, MinimalArg, RadiusSizeArg, SizeArg } from '../utils/args';

const meta = {
  title: 'Form/Input',
  component: ReqoreInput,
  argTypes: {
    ...MinimalArg,
    ...FlatArg,
    ...SizeArg,
    ...RadiusSizeArg,
    ...IconArg('icon', 'Icon'),
  },
  args: {
    icon: 'SearchLine',
  },
} as StoryMeta<typeof ReqoreInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<typeof ReqoreInput> = (args: IReqoreInputProps) => {
  const [value, setValue] = useState('Input value');

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleValueClear = () => {
    setValue('');
  };

  return (
    <>
      <ReqoreControlGroup wrap>
        <ReqoreInput {...args} placeholder='Reqore Input' onChange={handleValueChange} />
        <ReqoreInput
          {...args}
          placeholder='Minimal Input'
          minimal
          onChange={handleValueChange}
          rightIcon='ClipboardLine'
        />
        <ReqoreInput
          {...args}
          placeholder='Flat Input'
          flat
          tooltip="I'm a tooltip"
          onChange={handleValueChange}
        />
        <ReqoreInput
          {...args}
          iconColor='pending:lighten:2'
          placeholder='Clearable Input'
          onClearClick={handleValueClear}
          onChange={handleValueChange}
          leftIconProps={{ size: 'tiny' }}
        />
        <ReqoreInput
          {...args}
          iconColor='pending:lighten:2'
          placeholder='Clearable Input w/ icon'
          onClearClick={handleValueClear}
          onChange={handleValueChange}
          rightIcon='EraserFill'
          rightIconColor='#8727b7'
          focusRules={{ type: 'keypress', shortcut: '.', doNotInsertShortcut: true }}
        />
        <ReqoreInput {...args} placeholder='Disabled Input' disabled onChange={handleValueChange} />
        <ReqoreInput
          {...args}
          placeholder='Read Only Input'
          readOnly
          rightIcon='Bus2Fill'
          rightIconColor='info'
          onChange={handleValueChange}
        />
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup wrap>
        <ReqoreInput
          {...args}
          placeholder='Reqore Input'
          onChange={handleValueChange}
          value={value}
        />
        <ReqoreInput
          {...args}
          placeholder='Minimal Input'
          minimal
          onChange={handleValueChange}
          value={value}
        />
        <ReqoreInput
          {...args}
          placeholder='Flat Input'
          flat
          tooltip="I'm a tooltip"
          onChange={handleValueChange}
          rightIcon='DragMoveLine'
          rightIconColor='#eb0e8c'
          value={value}
        />
        <ReqoreInput
          {...args}
          placeholder='Clearable Input'
          onClearClick={handleValueClear}
          value={value}
          focusRules={{ type: 'auto' }}
          onChange={handleValueChange}
        />
        <ReqoreInput
          {...args}
          placeholder='Clearable Input w/ icon'
          onClearClick={handleValueClear}
          value={value}
          rightIcon='FilePptFill'
          rightIconColor='#508a90'
          onChange={handleValueChange}
        />
        <ReqoreInput
          {...args}
          placeholder='Disabled Input'
          disabled
          onChange={handleValueChange}
          value={value}
        />
        <ReqoreInput {...args} placeholder='Read Only Input' readOnly value={value} />
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup fluid>
        <ReqoreInput
          {...args}
          placeholder='Fluid Input'
          onChange={handleValueChange}
          value={value}
          focusRules={{ type: 'keypress', shortcut: 'k' }}
        />
      </ReqoreControlGroup>
    </>
  );
};

export const Basic: Story = {
  render: Template,
};

export const Info: Story = {
  render: Template,

  args: {
    intent: 'info',
  },
};

export const Success: Story = {
  render: Template,

  args: {
    intent: 'success',
  },
};

export const Warning: Story = {
  render: Template,

  args: {
    intent: 'warning',
  },
};

export const Danger: Story = {
  render: Template,

  args: {
    intent: 'danger',
  },
};

export const Pending: Story = {
  render: Template,

  args: {
    intent: 'pending',
  },
};

export const Muted: Story = {
  render: Template,

  args: {
    intent: 'muted',
  },
};

export const Effect: Story = {
  render: Template,

  args: {
    effect: {
      gradient: {
        colors: {
          0: '#56345e',
          100: 'transparent',
        },
      },
    },
  },
};

export const Transparent: Story = {
  render: Template,

  args: {
    transparent: true,
    effect: {
      gradient: {
        colors: {
          0: '#56345e',
          100: 'transparent',
        },
      },
    },
  },
};

export const Pill: Story = {
  render: Template,

  args: {
    pill: true,
  },
};

export const Loading: Story = {
  render: Template,

  args: {
    loading: true,
  },
};

export const RadiusSize: Story = {
  render: () => (
    // size='huge' so the bigger radius values aren't clamped to half the
    // input's height (which is what would happen at size='normal' for big /
    // huge / massive). Use `pill` instead when you want a fully rounded input.
    <ReqoreControlGroup vertical gapSize='small'>
      {ALL_SIZES.map((rs) => (
        <ReqoreInput
          key={rs}
          size='huge'
          radiusSize={rs}
          placeholder={`radiusSize="${rs}"`}
          icon='SearchLine'
        />
      ))}
    </ReqoreControlGroup>
  ),
};

export const ShortcutHint: Story = {
  render: () => {
    const [value, setValue] = useState('Clearable value');

    return (
      <ReqoreControlGroup vertical fluid gapSize='small'>
        <ReqoreInput
          icon='SearchLine'
          placeholder='Press / to focus'
          focusRules={{ type: 'keypress', shortcut: '/', doNotInsertShortcut: true }}
        />
        {/* Clearable + value: the hint badge should sit to the left of the clear button */}
        <ReqoreInput
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
          onClearClick={() => setValue('')}
          placeholder='Clearable, press k to focus'
          focusRules={{ type: 'keypress', shortcut: 'k', doNotInsertShortcut: true }}
        />
        {/* Clearable + value + right icon: badge sits left of both */}
        <ReqoreInput
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
          onClearClick={() => setValue('')}
          rightIcon='Calendar2Line'
          placeholder='Clearable + right icon'
          focusRules={{ type: 'keypress', shortcut: 'l', doNotInsertShortcut: true }}
        />
        <ReqoreInput
          placeholder='Hint hidden via shortcutHint={false}'
          shortcutHint={false}
          focusRules={{ type: 'keypress', shortcut: 'j', doNotInsertShortcut: true }}
        />
      </ReqoreControlGroup>
    );
  },
  play: async ({ canvasElement }) => {
    // Three of the four inputs render a hint (the last opts out)
    await expect(canvasElement.querySelectorAll('.reqore-keyboard-shortcut').length).toBe(3);
  },
};
