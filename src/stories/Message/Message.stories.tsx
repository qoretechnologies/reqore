import { Meta, Story } from '@storybook/react/types-6-0';
import React, { useState } from 'react';
import ReqoreMessage from '../../components/Message';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../../index';

export default {
  title: 'ReQore/Message',
  args: {
    theme: {
      main: '#222222',
    },
  },
} as Meta;

const Template: Story<IReqoreUIProviderProps> = (
  args: IReqoreUIProviderProps
) => {
  const [check, setCheck] = useState(false);

  return (
    <ReqoreUIProvider {...args}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ padding: '20px' }}>
          <h4>Default</h4>
          <ReqoreMessage intent='info'> I am a message </ReqoreMessage>
          <br />
          <ReqoreMessage intent='danger'> I am a message </ReqoreMessage>
          <br />
          <ReqoreMessage intent='warning'> I am a message </ReqoreMessage>
          <br />
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
    color: '#2de2e6',
  },
};
