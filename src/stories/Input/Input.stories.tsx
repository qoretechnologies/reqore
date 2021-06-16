import { Meta, Story } from '@storybook/react/types-6-0';
import React, { useState } from 'react';
import ReqoreInput from '../../components/Input';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../../index';

export default {
  title: 'ReQore/Input',
  args: {
    theme: {
      main: '#222222',
    },
  },
} as Meta;

const Template: Story<IReqoreUIProviderProps> = (
  args: IReqoreUIProviderProps
) => {
  const [value, setValue] = useState('I can be cleared');

  const handleValueChange = (e) => {
    setValue(e.target.value);
  };

  const handleValueClear = () => {
    setValue('');
  };

  return (
    <ReqoreUIProvider {...args}>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <div style={{ padding: '20px' }}>
            <h4>Default</h4>
            <ReqoreInput placeholder='Hello' size='small' />
            <br />
            <ReqoreInput placeholder='Hello' />
            <br />
            <ReqoreInput placeholder='Hello' size='big' />
            <h4>Minimal</h4>
            <ReqoreInput
              placeholder='Hello'
              tooltip='I am Groot!'
              minimal
              size='small'
            />
            <br />
            <ReqoreInput placeholder='Hello' tooltip='I am Groot!' minimal />
            <br />
            <ReqoreInput
              placeholder='Hello'
              tooltip='I am Groot!'
              minimal
              size='big'
            />
            <h4>Custom width</h4>
            <ReqoreInput placeholder='Hello' size='small' width={200} />
            <br />
            <ReqoreInput placeholder='Hello' width={300} />
            <br />
            <ReqoreInput placeholder='Hello' size='big' width={400} />
            <h4>With Icon</h4>
            <ReqoreInput placeholder='Hello' size='small' icon='Search2Line' />
            <br />
            <ReqoreInput placeholder='Hello' icon='Search2Line' />
            <br />
            <ReqoreInput
              placeholder='Hello'
              size='big'
              icon='Search2Line'
              disabled
            />
            <h4>Disabled</h4>
            <ReqoreInput placeholder='Hello' disabled />
            <h4>Clearable</h4>
            <ReqoreInput
              value={value}
              onChange={handleValueChange}
              onClearClick={handleValueClear}
              size='small'
            />
            <br />
            <ReqoreInput
              value={value}
              onChange={handleValueChange}
              onClearClick={handleValueClear}
            />
            <br />
            <ReqoreInput
              value={value}
              onChange={handleValueChange}
              onClearClick={handleValueClear}
              size='big'
            />
            <br />
            <ReqoreInput
              value={value}
              onChange={handleValueChange}
              onClearClick={handleValueClear}
              size='small'
              minimal
            />
            <br />
            <ReqoreInput
              value={value}
              onChange={handleValueChange}
              onClearClick={handleValueClear}
              minimal
            />
            <br />
            <ReqoreInput
              value={value}
              onChange={handleValueChange}
              onClearClick={handleValueClear}
              size='big'
              minimal
            />
          </div>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

export const Basic = Template.bind({});
export const LightColor = Template.bind({});
LightColor.args = {
  theme: {
    main: '#ffffff',
  },
};

export const CustomColor = Template.bind({});
CustomColor.args = {
  theme: {
    main: '#0d0221',
    text: {
      color: '#2de2e6',
      dim: false,
    },
  },
};
