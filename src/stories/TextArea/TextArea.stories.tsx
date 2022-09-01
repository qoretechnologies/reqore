import { Meta, Story } from '@storybook/react/types-6-0';
import { useState } from 'react';
import { IReqoreTextareaProps } from '../../components/Textarea';
import { ReqoreTextarea } from '../../index';
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
    <ReqoreTextarea
      {...args}
      onChange={handleValueChange}
      onClearClick={handleValueClear}
      value={value}
    />
  );
};

export const Basic = Template.bind({});
export const Minimal = Template.bind({});
Minimal.args = {
  minimal: true,
};
export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};
