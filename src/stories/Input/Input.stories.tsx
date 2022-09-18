import { Meta, Story } from '@storybook/react/types-6-0';
import { useState } from 'react';
import ReqoreInput, { IReqoreInputProps } from '../../components/Input';
import { ReqoreControlGroup } from '../../index';
import { FlatArg, IconArg, MinimalArg } from '../utils/args';

export default {
  title: 'Components/Input',
  argTypes: {
    ...MinimalArg,
    ...FlatArg,
    ...IconArg('icon', 'Icon', 'SearchLine'),
  },
} as Meta<IReqoreInputProps>;

const Template: Story<IReqoreInputProps> = (args: IReqoreInputProps) => {
  const [value, setValue] = useState('Input value');

  const handleValueChange = (e) => {
    setValue(e.target.value);
  };

  const handleValueClear = () => {
    setValue('');
  };

  return (
    <>
      <ReqoreControlGroup>
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
          value={value}
        />
        <ReqoreInput
          {...args}
          placeholder='Clearable Input'
          onClearClick={handleValueClear}
          value={value}
          onChange={handleValueChange}
        />
        <ReqoreInput
          {...args}
          placeholder='Disabled Input'
          disabled
          onChange={handleValueChange}
          value={value}
        />
        <ReqoreInput
          {...args}
          placeholder='Read Only Input'
          readOnly
          onChange={handleValueChange}
          value={value}
        />
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup fluid>
        <ReqoreInput
          {...args}
          placeholder='Fluid Input'
          onChange={handleValueChange}
          value={value}
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
