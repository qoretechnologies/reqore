import { Meta, Story } from '@storybook/react/types-6-0';
import { omit } from 'lodash';
import React, { useState } from 'react';
import { IQorusSidebarProps } from '../../components/Sidebar';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import { ReqoreSidebar, ReqoreUIProvider } from '../../index';
import { qorusSidebarItems } from '../../mock/menu';

export default {
  title: 'ReQore/Sidebar',
  component: ReqoreSidebar,
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
}: IQorusSidebarProps & IReqoreUIProviderProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(args.isOpen || true);

  return (
    <ReqoreUIProvider theme={theme} withSidebar>
      {!args.position || args.position === 'left' ? (
        <ReqoreSidebar {...args} onCloseClick={() => setIsOpen(false)} isOpen={isOpen} />
      ) : null}
      <div style={{ flex: 1, width: '100%', height: '100%' }} />
      {args.position === 'right' ? (
        <ReqoreSidebar {...args} onCloseClick={() => setIsOpen(false)} isOpen={isOpen} />
      ) : null}
    </ReqoreUIProvider>
  );
};

const MultiTemplate: Story<IQorusSidebarProps & IReqoreUIProviderProps> = ({
  theme,
  ...args
}: IQorusSidebarProps & IReqoreUIProviderProps) => (
  <ReqoreUIProvider theme={theme} withSidebar>
    <ReqoreSidebar {...args} />
    <ReqoreSidebar {...omit(args, ['customTheme'])} />
    <div style={{ flex: 1, width: '100%', height: '100%' }} />
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

export const WithCustomTheme = MultiTemplate.bind({});

WithCustomTheme.args = {
  customTheme: {
    main: '#ffffff',
    item: {
      color: '#ff0000',
    },
  },
  path: '/item-3/item-2',
} as IReqoreUIProviderProps & IQorusSidebarProps;

export const WithNativeTitles = Template.bind({});

WithNativeTitles.args = {
  useNativeTitle: true,
} as IReqoreUIProviderProps & IQorusSidebarProps;

export const CollapsingDisabled = Template.bind({});

CollapsingDisabled.args = {
  collapsible: false,
  isCollapsed: true,
} as IReqoreUIProviderProps & IQorusSidebarProps;

export const OnRight = Template.bind({});
OnRight.args = {
  position: 'right',
} as IReqoreUIProviderProps & IQorusSidebarProps;

export const Bordered = Template.bind({});
Bordered.args = {
  bordered: true,
} as IReqoreUIProviderProps & IQorusSidebarProps;

export const Flat = Template.bind({});
Flat.args = {
  flat: true,
} as IReqoreUIProviderProps & IQorusSidebarProps;

export const Floating = Template.bind({});
Floating.args = {
  floating: true,
  isOpen: true,
  flat: true,
  isCollapsed: false,
  hasFloatingBackdrop: false,
  closeOnItemClick: true,
} as IReqoreUIProviderProps & IQorusSidebarProps;
