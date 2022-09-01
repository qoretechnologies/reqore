import { Meta, Story } from '@storybook/react/types-6-0';
import { useState } from 'react';
import ReqoreInput, { IReqoreInputProps } from '../../components/Input';
import { ReqoreControlGroup } from '../../index';
import { FlatArg, MinimalArg } from '../utils/args';

export default {
  title: 'Components/Input',
  argTypes: {
    ...MinimalArg,
    ...FlatArg,
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
          placeholder='Reqore Input'
          onChange={handleValueChange}
          value={value}
          {...args}
        />
        <ReqoreInput
          placeholder='Minimal Input'
          minimal
          onChange={handleValueChange}
          value={value}
          {...args}
        />
        <ReqoreInput
          placeholder='Flat Input'
          flat
          onChange={handleValueChange}
          value={value}
          {...args}
        />
        <ReqoreInput
          placeholder='Clearable Input'
          onClearClick={handleValueClear}
          value={value}
          onChange={handleValueChange}
          {...args}
        />
        <ReqoreInput
          placeholder='Disabled Input'
          disabled
          onChange={handleValueChange}
          value={value}
          {...args}
        />
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup fluid>
        <ReqoreInput
          placeholder='Fluid Input'
          onChange={handleValueChange}
          value={value}
          {...args}
        />
      </ReqoreControlGroup>
    </>
  );
};

export const Basic = Template.bind({});
