import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import { IReqoreBreadcrumbsProps } from '../../components/Breadcrumbs';
import { ReqoreFooter } from '../../components/Navbar';
import { IReqoreTheme } from '../../constants/theme';
import {
  ReqoreBreadcrumbs,
  ReqoreContent,
  ReqoreHeader,
  ReqoreLayoutContent,
  ReqoreMenu,
  ReqoreMenuItem,
  ReqoreUIProvider,
} from '../../index';

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
          icon: 'home',
          tooltip: 'Hooooooome!',
        },
        {
          label: 'Page 2',
          icon: 'cog',
          as: 'a',
          props: {
            href: 'https://google.com',
          },
        },
        {
          label: 'Page 3',
          icon: 'notifications',
          tooltip: 'Click to go to page 3!',
        },
        {
          label: 'Page 4',
          icon: 'notifications',
        },
        {
          label: 'Page 5',
          icon: 'notifications',
        },
        {
          label: 'Page 6',
          icon: 'notifications',
        },
        {
          label: 'Page 7',
          icon: 'notifications',
        },
        {
          label: 'Page 8',
          icon: 'notifications',
        },
        {
          label: 'Page 9',
          icon: 'notifications',
          active: true,
        },
      ],
      rightElement: (
        <ReqoreMenu>
          <ReqoreMenuItem icon='person'>Right Element</ReqoreMenuItem>
        </ReqoreMenu>
      ),
    },
  },
} as Meta;

const Template: Story<{
  theme: IReqoreTheme;
  breadcrumbs: IReqoreBreadcrumbsProps;
}> = ({
  theme,
  breadcrumbs,
}: {
  theme: IReqoreTheme;
  breadcrumbs: IReqoreBreadcrumbsProps;
}) => {
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
