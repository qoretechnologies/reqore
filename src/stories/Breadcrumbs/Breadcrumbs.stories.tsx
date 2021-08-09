import { Meta, Story } from '@storybook/react/types-6-0';
import { noop } from 'lodash';
import React from 'react';
import { IReqoreBreadcrumbsProps } from '../../components/Breadcrumbs';
import { ReqoreFooter } from '../../components/Navbar';
import { IReqoreBreadcrumbsTheme, IReqoreTheme } from '../../constants/theme';
import {
  ReqoreBreadcrumbs,
  ReqoreContent,
  ReqoreHeader,
  ReqoreLayoutContent,
  ReqoreMenu,
  ReqoreMenuItem,
  ReqoreUIProvider,
} from '../../index';
import { IReqoreIconName } from '../../types/icons';

export default {
  title: 'ReQore/Breadcrumbs',
  args: {
    theme: {
      main: '#ffffff',
    },
    breadcrumbs: {
      items: [
        {
          label: 'Page 1',
          icon: 'Home7Fill' as IReqoreIconName,
          tooltip: 'Hooooooome!',
        },
        {
          label: 'Page 2',
          icon: 'Settings5Fill' as IReqoreIconName,
          as: 'a',
          props: {
            href: 'https://google.com',
          },
        },
        {
          label: 'Page 3',
          icon: 'RainbowFill' as IReqoreIconName,
          tooltip: 'Click to go to page 3!',
        },
        {
          label: 'Page 4',
          icon: 'Notification3Fill' as IReqoreIconName,
        },
        {
          label: 'Page 5',
          icon: 'Notification3Fill' as IReqoreIconName,
        },
        {
          label: 'Page 6',
          icon: 'Notification3Fill' as IReqoreIconName,
        },
        {
          label: 'Page 7',
          icon: 'Notification3Fill' as IReqoreIconName,
        },
        {
          label: 'Page 8',
          icon: 'Notification3Fill' as IReqoreIconName,
        },
        {
          label: 'Page 9',
          icon: 'Notification3Fill' as IReqoreIconName,
          active: true,
        },
      ],
      rightElement: (
        <ReqoreMenu>
          <ReqoreMenuItem icon='User3Line'>Right Element</ReqoreMenuItem>
        </ReqoreMenu>
      ),
    },
  },
} as Meta;

const Template: Story<{
  theme: IReqoreTheme;
  breadcrumbs: IReqoreBreadcrumbsProps;
}> = ({ theme, breadcrumbs }: { theme: IReqoreTheme; breadcrumbs: IReqoreBreadcrumbsProps }) => {
  return (
    <ReqoreUIProvider theme={theme}>
      <ReqoreLayoutContent>
        <ReqoreHeader></ReqoreHeader>
        <ReqoreBreadcrumbs {...breadcrumbs} />
        <ReqoreContent>
          <h3>Hello</h3>
        </ReqoreContent>
        <ReqoreFooter></ReqoreFooter>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

export const Default = Template.bind({});
export const Dark = Template.bind({});
Dark.args = {
  theme: {
    main: '#222222',
  },
};

export const CustomMainColor = Template.bind({});
CustomMainColor.args = {
  theme: {
    main: '#ffffff',
    breadcrumbs: {
      main: '#194d5d',
    },
  },
  breadcrumbs: {
    items: [
      {
        label: 'Page 1',
        icon: 'Home2Line' as IReqoreIconName,
        tooltip: 'Hooooooome!',
      },
      {
        label: 'Page 2',
        icon: 'Notification3Fill' as IReqoreIconName,
        as: 'a',
        props: {
          href: 'https://google.com',
        },
      },
      {
        label: 'Page 3',
        icon: 'Notification3Fill' as IReqoreIconName,
        tooltip: 'Click to go to page 3!',
        props: {
          onClick: () => noop(),
        },
      },
      {
        label: 'Page 4',
        icon: 'Notification3Fill' as IReqoreIconName,
      },
      {
        label: 'Page 5',
        icon: 'Notification3Fill' as IReqoreIconName,
      },
      {
        withTabs: {
          tabs: [
            {
              label: 'Tab 1',
              id: 'tab1',
              icon: 'Home8Fill' as IReqoreIconName,
              tooltip: 'Hooooooome!',
            },
            {
              label: 'Tab 2',
              id: 'tab2',
              icon: 'Notification3Fill' as IReqoreIconName,
              as: 'a',
              props: {
                href: 'https://google.com',
              },
            },
            {
              label: 'Tab 3',
              id: 'tab3',
              icon: 'Notification3Fill' as IReqoreIconName,
              tooltip: 'Click to go to page 3!',
            },
            {
              label: 'Tab 4',
              id: 'tab4',
              icon: 'Notification3Fill' as IReqoreIconName,
              disabled: true,
            },
            {
              label: 'Really long tab name',
              id: 'tab5',
              icon: 'Notification3Fill' as IReqoreIconName,
            },
          ],
          activeTab: 'tab5',
          onTabChange: (tabId) => {
            alert(`Tab ${tabId} clicked`);
          },
        },
      },
    ],
  },
};

export const CustomColors = Template.bind({});
CustomColors.args = {
  theme: {
    main: '#ffffff',
    breadcrumbs: {
      item: {
        color: '#7532a8',
        hoverColor: '#5932a8',
        activeColor: '#323aa8',
      },
    },
  },
};

export const WithTabs = Template.bind({});
WithTabs.args = {
  theme: {
    main: '#ffffff',
  },
  breadcrumbs: {
    items: [
      {
        label: 'Page 1',
        icon: 'Notification3Fill' as IReqoreIconName,
        tooltip: 'Hooooooome!',
      },
      {
        label: 'Page 2',
        icon: 'Notification3Fill' as IReqoreIconName,
        as: 'a',
        props: {
          href: 'https://google.com',
        },
      },
      {
        label: 'Page 3',
        icon: 'Notification3Fill' as IReqoreIconName,
        tooltip: 'Click to go to page 3!',
      },
      {
        label: 'Page 4',
        icon: 'Notification3Fill' as IReqoreIconName,
      },
      {
        label: 'Page 5',
        icon: 'Notification3Fill' as IReqoreIconName,
      },
      {
        withTabs: {
          tabs: [
            {
              label: 'Tab 1',
              id: 'tab1',
              icon: 'Home8Fill' as IReqoreIconName,
              tooltip: 'Hooooooome!',
            },
            {
              label: 'Tab 2',
              id: 'tab2',
              icon: 'Notification3Fill' as IReqoreIconName,
              as: 'a',
              props: {
                href: 'https://google.com',
              },
            },
            {
              label: 'Tab 3',
              id: 'tab3',
              icon: 'Notification3Fill' as IReqoreIconName,
              tooltip: 'Click to go to page 3!',
            },
            {
              label: 'Tab 4',
              id: 'tab4',
              icon: 'Notification3Fill' as IReqoreIconName,
              active: true,
            },
            {
              label: 'Tab 5',
              id: 'tab5',
              icon: 'Notification3Fill' as IReqoreIconName,
              disabled: true,
            },
          ],
          activeTab: 'tab1',
          onTabChange: (tabId) => {
            alert(`Tab ${tabId} clicked`);
          },
          activeTabIntent: 'info',
        },
      },
    ],
    rightElement: (
      <ReqoreMenu>
        <ReqoreMenuItem icon='User3Line'>Right Element</ReqoreMenuItem>
      </ReqoreMenu>
    ),
  },
};

export const WithTabsDark = Template.bind({});
WithTabsDark.args = {
  theme: {
    main: '#222222',
  },
  breadcrumbs: {
    items: [
      {
        label: 'Page 1',
        icon: 'Home2Line' as IReqoreIconName,
        tooltip: 'Hooooooome!',
      },
      {
        label: 'Page 2',
        icon: 'Notification3Fill' as IReqoreIconName,
        as: 'a',
        props: {
          href: 'https://google.com',
        },
      },
      {
        label: 'Page 3',
        icon: 'Notification3Fill' as IReqoreIconName,
        tooltip: 'Click to go to page 3!',
        props: {
          onClick: () => noop(),
        },
      },
      {
        label: 'Page 4',
        icon: 'Notification3Fill' as IReqoreIconName,
      },
      {
        label: 'Page 5',
        icon: 'Notification3Fill' as IReqoreIconName,
      },
      {
        withTabs: {
          tabs: [
            {
              label: 'Tab 1',
              id: 'tab1',
              icon: 'Home8Fill' as IReqoreIconName,
              tooltip: 'Hooooooome!',
            },
            {
              label: 'Tab 2',
              id: 'tab2',
              icon: 'Notification3Fill' as IReqoreIconName,
              as: 'a',
              props: {
                href: 'https://google.com',
              },
            },
            {
              label: 'Tab 3',
              id: 'tab3',
              icon: 'Notification3Fill' as IReqoreIconName,
              tooltip: 'Click to go to page 3!',
            },
            {
              label: 'Tab 4',
              id: 'tab4',
              icon: 'Notification3Fill' as IReqoreIconName,
              disabled: true,
            },
            {
              label: 'Really long tab name',
              id: 'tab5',
              icon: 'Notification3Fill' as IReqoreIconName,
            },
          ],
          activeTab: 'tab5',
          onTabChange: (tabId) => {
            alert(`Tab ${tabId} clicked`);
          },
        },
      },
    ],
    rightElement: (
      <ReqoreMenu>
        <ReqoreMenuItem icon='User3Line'>Right Element</ReqoreMenuItem>
      </ReqoreMenu>
    ),
  },
};

export const WithCustomTheme = Template.bind({});
WithCustomTheme.args = {
  breadcrumbs: {
    customTheme: {
      main: '#ff0000',
      item: {
        color: '#ffffff',
      },
    } as IReqoreBreadcrumbsTheme,
    items: [
      {
        label: 'Page 1',
        icon: 'Home2Line' as IReqoreIconName,
        tooltip: 'Hooooooome!',
      },
      {
        label: 'Page 2',
        icon: 'Notification3Fill' as IReqoreIconName,
        as: 'a',
        props: {
          href: 'https://google.com',
        },
      },
      {
        label: 'Page 3',
        icon: 'Notification3Fill' as IReqoreIconName,
        tooltip: 'Click to go to page 3!',
        props: {
          onClick: () => noop(),
        },
      },
      {
        label: 'Page 4',
        icon: 'Notification3Fill' as IReqoreIconName,
      },
      {
        label: 'Page 5',
        icon: 'Notification3Fill' as IReqoreIconName,
      },
      {
        withTabs: {
          tabs: [
            {
              label: 'Tab 1',
              id: 'tab1',
              icon: 'Home8Fill' as IReqoreIconName,
              tooltip: 'Hooooooome!',
            },
            {
              label: 'Tab 2',
              id: 'tab2',
              icon: 'Notification3Fill' as IReqoreIconName,
              as: 'a',
              props: {
                href: 'https://google.com',
              },
            },
            {
              label: 'Tab 3',
              id: 'tab3',
              icon: 'Notification3Fill' as IReqoreIconName,
              tooltip: 'Click to go to page 3!',
            },
            {
              label: 'Tab 4',
              id: 'tab4',
              icon: 'Notification3Fill' as IReqoreIconName,
              disabled: true,
            },
            {
              label: 'Really long tab name',
              id: 'tab5',
              icon: 'Notification3Fill' as IReqoreIconName,
            },
          ],
          activeTab: 'tab5',
          onTabChange: (tabId) => {
            alert(`Tab ${tabId} clicked`);
          },
        },
      },
    ],
    rightElement: (
      <ReqoreMenu>
        <ReqoreMenuItem icon='User3Line'>Right Element</ReqoreMenuItem>
      </ReqoreMenu>
    ),
  },
};

export const Flat = Template.bind({});
Flat.args = {
  breadcrumbs: {
    items: [
      {
        label: 'Page 1',
        icon: 'Home2Line' as IReqoreIconName,
        tooltip: 'Hooooooome!',
      },
      {
        label: 'Page 2',
        icon: 'Notification3Fill' as IReqoreIconName,
        as: 'a',
        props: {
          href: 'https://google.com',
        },
      },
      {
        label: 'Page 3',
        icon: 'Notification3Fill' as IReqoreIconName,
        tooltip: 'Click to go to page 3!',
        props: {
          onClick: () => noop(),
        },
      },
      {
        label: 'Page 4',
        icon: 'Notification3Fill' as IReqoreIconName,
      },
      {
        label: 'Page 5',
        icon: 'Notification3Fill' as IReqoreIconName,
      },
      {
        withTabs: {
          tabs: [
            {
              label: 'Tab 1',
              id: 'tab1',
              icon: 'Home8Fill' as IReqoreIconName,
              tooltip: 'Hooooooome!',
            },
            {
              label: 'Tab 2',
              id: 'tab2',
              icon: 'Notification3Fill' as IReqoreIconName,
              as: 'a',
              props: {
                href: 'https://google.com',
              },
            },
            {
              label: 'Tab 3',
              id: 'tab3',
              icon: 'Notification3Fill' as IReqoreIconName,
              tooltip: 'Click to go to page 3!',
            },
            {
              label: 'Tab 4',
              id: 'tab4',
              icon: 'Notification3Fill' as IReqoreIconName,
              disabled: true,
            },
            {
              label: 'Really long tab name',
              id: 'tab5',
              icon: 'Notification3Fill' as IReqoreIconName,
            },
          ],
          activeTab: 'tab5',
          onTabChange: (tabId) => {
            alert(`Tab ${tabId} clicked`);
          },
        },
      },
    ],
    flat: true,
  },
};
