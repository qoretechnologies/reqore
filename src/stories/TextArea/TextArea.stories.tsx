import { Meta, Story } from '@storybook/react/types-6-0';
import { useState } from 'react';
import { IReqoreTextareaProps } from '../../components/Textarea';
import { ReqoreControlGroup, ReqoreTextarea } from '../../index';
import { argManager, DisabledArg, MinimalArg, SizeArg } from '../utils/args';

const { createArg } = argManager<IReqoreTextareaProps>();

export default {
  title: 'Components/TextArea',
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
      defaultValue: false,
    }),
    ...createArg('placeholder', {
      name: 'Placeholder',
      description: 'Placeholder',
      control: 'text',
      defaultValue: 'Placeholder',
    }),
  },
} as Meta<IReqoreTextareaProps>;

const str =
  '✔ Checking your system\n' +
  '✔ Locating Application\n' +
  '✔ Preparing native dependencies\n' +
  '✔ Compiling Main Process Code\n' +
  '✔ Launch Dev Servers\n' +
  '✔ Compiling Preload Scripts\n' +
  '✔ Launching Application\n';

const Template: Story<IReqoreTextareaProps> = (args) => {
  const [value, setValue] = useState(str);

  const handleValueChange = (e) => {
    setValue(e.target.value);
  };

  const handleValueClear = () => {
    setValue('');
  };

  return (
    <>
      <ReqoreControlGroup fluid>
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
        />
      </ReqoreControlGroup>
    </>
  );
};

export const Basic = Template.bind({});
export const Info = Template.bind({});
Info.args = {
  intent: 'info',
};
export const Success = Template.bind({});
Success.args = {
  intent: 'success',
};
export const Warning = Template.bind({});
Warning.args = {
  intent: 'warning',
};
export const Danger = Template.bind({});
Danger.args = {
  intent: 'danger',
};
export const Pending = Template.bind({});
Pending.args = {
  intent: 'pending',
};
export const Muted = Template.bind({});
Muted.args = {
  intent: 'muted',
};

export const Custom = Template.bind({});
Custom.args = {
  customTheme: {
    main: '#38fdb2',
  },
};

export const Effect = Template.bind({});
Effect.args = {
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
};
