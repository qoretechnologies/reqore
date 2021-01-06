import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import { IQorusSidebarProps } from '../../components/Sidebar';
import { QorusSidebar } from '../../index';
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

const Template: Story<IQorusSidebarProps> = (args: IQorusSidebarProps) => (
  <QorusSidebar {...args} />
);

export const Basic = Template.bind({});
export const Collapsed = Template.bind({});

Collapsed.args = {
  isCollapsed: true,
  isLight: false,
};

export const Light = Template.bind({});

Light.args = {
  isLight: true,
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
