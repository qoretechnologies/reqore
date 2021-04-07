import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import { ReqoreTree } from '../../components/Tree';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../../index';
import MockObject from '../../mock/object.json';

export default {
  title: 'ReQore/Tree',
  args: {
    theme: {
      main: '#222222',
    },
  },
} as Meta;

const data = MockObject;

const Template: Story<IReqoreUIProviderProps> = (
  args: IReqoreUIProviderProps
) => {
  return (
    <ReqoreUIProvider {...args}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ padding: '20px' }}>
          <h4> Default </h4>
          <ReqoreTree data={data} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

export const Basic = Template.bind({});
