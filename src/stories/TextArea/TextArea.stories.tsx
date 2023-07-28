import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { IReqoreTextareaProps } from '../../components/Textarea';
import { ReqoreControlGroup, ReqoreTextarea } from '../../index';
import { StoryMeta } from '../utils';
import { DisabledArg, MinimalArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreTextareaProps>();

const meta = {
  title: 'Form/TextArea/Stories',
  component: ReqoreTextarea,
  args: {
    scaleWithContent: true,
    fluid: undefined,
    placeholder: 'Placeholder',
  },
  argTypes: {
    ...MinimalArg(),
    ...DisabledArg,
    ...SizeArg,
    ...createArg('scaleWithContent', {
      name: 'Scale with content',
      description: 'Scale with content',
      control: 'boolean',
      defaultValue: true,
    }),
    ...createArg('fluid', {
      name: 'Fluid',
      description: 'Fluid',
      control: 'boolean',
      defaultValue: undefined,
    }),
    ...createArg('placeholder', {
      name: 'Placeholder',
      description: 'Placeholder',
      control: 'text',
      defaultValue: 'Placeholder',
    }),
  },
} as StoryMeta<typeof ReqoreTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

const str =
  '✔ Checking your system\n' +
  '✔ Locating Application\n' +
  '✔ Preparing native dependencies\n' +
  '✔ Compiling Main Process Code\n' +
  '✔ Launch Dev Servers\n' +
  '✔ Compiling Preload Scripts\n' +
  '✔ Launching Application\n';

const Template: StoryFn<IReqoreTextareaProps> = (args) => {
  const [value, setValue] = useState(str);

  const handleValueChange = (e) => {
    setValue(e.target.value);
  };

  const handleValueClear = () => {
    setValue('');
  };

  return (
    <>
      <ReqoreControlGroup wrap>
        <ReqoreTextarea {...args} onChange={handleValueChange} onClearClick={handleValueClear} />
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          tooltip={{
            placement: 'right-start',
            content: 'I am a tooltip',
          }}
          minimal
        />
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          tooltip="I'm a tooltip"
          flat
        />
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          disabled
        />
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          readOnly
        />
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup wrap>
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          value={value}
        />
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          value={value}
          tooltip={{
            placement: 'right-start',
            content: 'I am a tooltip',
          }}
          minimal
        />
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          value={value}
          tooltip="I'm a tooltip"
          flat
        />
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          value={value}
          disabled
        />
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          value={value}
          readOnly
        />
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup fluid>
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          value={value}
          fluid
          focusRules={{ type: 'keypress', shortcut: 'letters', clearOnFocus: true }}
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

export const Custom: Story = {
  render: Template,

  args: {
    customTheme: {
      main: '#38fdb2',
    },
  },
};

export const Effect: Story = {
  render: Template,

  args: {
    effect: {
      gradient: {
        type: 'radial',
        colors: {
          0: '#361554',
          50: '#160013',
        },
      },
      spaced: 2,
      color: '#ffffff',
      uppercase: true,
      textSize: 'small',
      weight: 'bold',
    },
  },
};
