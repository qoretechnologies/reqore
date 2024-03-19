import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ReqoreInput, { IReqoreInputProps } from '../../components/Input';
import { ReqoreControlGroup } from '../../index';
import { StoryMeta } from '../utils';
import { FlatArg, IconArg, MinimalArg, SizeArg } from '../utils/args';

const meta = {
  title: 'Form/Input/Stories',
  component: ReqoreInput,
  argTypes: {
    ...MinimalArg,
    ...FlatArg,
    ...SizeArg,
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

export const Pill: Story = {
  render: Template,

  args: {
    pill: true,
  },
};
