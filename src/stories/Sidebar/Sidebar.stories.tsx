import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import { IQorusSidebarProps } from '../../components/Sidebar';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import { QorusSidebar, ReqoreUIProvider } from '../../index';
import { qorusSidebarItems } from '../../mock/menu';

export default {
  title: 'ReQore/Sidebar',
  component: QorusSidebar,
  args: {
    items: qorusSidebarItems,
    path: '/',
    isLight: false,
    isCollapsed: false,
  },
} as Meta;

const Template: Story<IQorusSidebarProps & IReqoreUIProviderProps> = ({
  theme,
  ...args
}: IQorusSidebarProps & IReqoreUIProviderProps) => (
  <ReqoreUIProvider theme={theme}>
    <QorusSidebar {...args} />
  </ReqoreUIProvider>
);

export const Basic = Template.bind({});
export const Collapsed = Template.bind({});

Collapsed.args = {
  isCollapsed: true,
  isLight: false,
};

export const WithBookmarks = Template.bind({});

WithBookmarks.args = {
  bookmarks: ['submenu-item-2', 'another-item-1'],
  onBookmarksChange: () => true,
};

export const WithActivePath = Template.bind({});

WithActivePath.args = {
  path: '/item-3/item-2',
};

export const WithCustomElement = Template.bind({});

WithCustomElement.args = {
  customItems: [
    {
      element: () => <p>Hello I am a custom element!</p>,
    },
  ],
};

export const WithDarkTheme = Template.bind({});

WithDarkTheme.args = {
  theme: {
    main: '#444444',
  },
  path: '/item-3/item-2',
};

export const WithLightTheme = Template.bind({});

WithLightTheme.args = {
  theme: {
    main: '#ffffff',
  },
  path: '/item-3/item-2',
};

export const WithCustomMainColor = Template.bind({});

WithCustomMainColor.args = {
  theme: {
    main: '#333333',
    sidebar: {
      main: '#692b75',
    },
  },
  path: '/item-3/item-2',
} as IReqoreUIProviderProps & IQorusSidebarProps;

export const WithCustomColors = Template.bind({});

WithCustomColors.args = {
  theme: {
    main: '#c96604',
  },
  path: '/item-3/item-2',
} as IReqoreUIProviderProps & IQorusSidebarProps;
