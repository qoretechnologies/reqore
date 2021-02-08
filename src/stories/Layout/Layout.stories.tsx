import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import { ReqoreFooter } from '../../components/Navbar';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import {
  QorusSidebar,
  ReqoreContent,
  ReqoreHeader,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../../index';
import { qorusSidebarItems } from '../../mock/menu';

export default {
  title: 'ReQore/Layout',
  args: {
    theme: {
      main: '#222222',
    },
  },
} as Meta;

const Template: Story<IReqoreUIProviderProps> = (
  args: IReqoreUIProviderProps
) => {
  return (
    <ReqoreUIProvider {...args}>
      {args.withSidebar && <QorusSidebar items={qorusSidebarItems} path='/' />}
      <ReqoreLayoutContent>
        <ReqoreHeader></ReqoreHeader>
        <ReqoreContent>
          <h3>Hello</h3>
        </ReqoreContent>
        <ReqoreFooter></ReqoreFooter>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

export const WithoutSidebar = Template.bind({});
export const WithSidebar = Template.bind({});
WithSidebar.args = {
  withSidebar: true,
};
