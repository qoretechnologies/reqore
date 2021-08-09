import { Meta, Story } from '@storybook/react/types-6-0';
import { noop } from 'lodash';
import React from 'react';
import ReqoreContent from '../../components/Content';
import ReqoreIcon from '../../components/Icon';
import { IReqoreNavbarProps, ReqoreFooter } from '../../components/Navbar';
import { IReqoreNavbarItemProps } from '../../components/Navbar/item';
import { IReqoreNavbarTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import {
  ReqoreHeader,
  ReqoreLayoutContent,
  ReqoreMenu,
  ReqoreMenuDivider,
  ReqoreMenuItem,
  ReqoreNavbarDivider,
  ReqoreNavbarGroup,
  ReqoreNavbarItem,
  ReqorePopover,
  ReqoreUIProvider,
} from '../../index';

export default {
  title: 'ReQore/Navigation Bar',
  args: {
    theme: {
      main: '#ffffff',
    },
  },
} as Meta<IReqoreUIProviderProps & IReqoreNavbarProps & IThemeData>;

interface IThemeData {
  customHeaderTheme: IReqoreNavbarTheme;
  customFooterTheme: IReqoreNavbarTheme;
}

const Template: Story<IReqoreUIProviderProps & IReqoreNavbarProps & IThemeData> = ({
  theme,
  customHeaderTheme,
  customFooterTheme,
  flat,
  ...args
}: IReqoreUIProviderProps & IReqoreNavbarProps & IThemeData) => {
  return (
    <ReqoreUIProvider theme={theme}>
      <ReqoreThemeProvider>
        <ReqoreLayoutContent>
          <ReqoreHeader customTheme={customHeaderTheme} flat={flat}>
            <ReqoreNavbarGroup>
              <ReqoreNavbarItem>
                <h3>I am a logo on the left</h3>
              </ReqoreNavbarItem>
            </ReqoreNavbarGroup>
            <ReqoreNavbarGroup position='right'>
              <ReqoreNavbarItem active>
                <ReqoreIcon icon='AwardFill' />
              </ReqoreNavbarItem>
              <ReqoreNavbarItem disabled>
                <ReqoreIcon icon='BehanceLine' />
              </ReqoreNavbarItem>
              <ReqorePopover
                component={ReqoreNavbarItem}
                content={
                  <ReqoreMenu>
                    <ReqoreMenuDivider label='User area' />
                    <ReqoreMenuItem icon='ArrowGoBackFill'>Profile</ReqoreMenuItem>
                    <ReqoreMenuItem icon='DeleteBack2Fill'>Alerts</ReqoreMenuItem>
                    <ReqoreMenuItem icon='FileTextFill'>Log out</ReqoreMenuItem>
                  </ReqoreMenu>
                }
                handler='click'
                componentProps={{ interactive: true } as IReqoreNavbarItemProps}
                isReqoreComponent
              >
                <ReqoreIcon icon='UserFill' />
              </ReqorePopover>
              <ReqoreNavbarDivider />
              <ReqorePopover
                component={ReqoreNavbarItem}
                content='Notifications'
                componentProps={{ onClick: noop } as IReqoreNavbarItemProps}
                isReqoreComponent
              >
                <ReqoreIcon icon='Notification4Fill' />
              </ReqorePopover>
            </ReqoreNavbarGroup>
          </ReqoreHeader>

          <ReqoreContent>Hey!</ReqoreContent>
          <ReqoreFooter customTheme={customFooterTheme} flat={flat}>
            <ReqoreNavbarGroup>
              <ReqoreNavbarItem>
                <h3>I am a logo on the left</h3>
              </ReqoreNavbarItem>
            </ReqoreNavbarGroup>
            <ReqoreNavbarGroup position='right'>
              <ReqorePopover
                component={ReqoreNavbarItem}
                content={
                  <ReqoreMenu>
                    <ReqoreMenuDivider label='User area' />
                    <ReqoreMenuItem icon='DualSim1Fill'>Profile</ReqoreMenuItem>
                    <ReqoreMenuItem icon='FolderReceivedFill'>Alerts</ReqoreMenuItem>
                    <ReqoreMenuItem icon='FolderOpenFill'>Log out</ReqoreMenuItem>
                  </ReqoreMenu>
                }
                handler='click'
                componentProps={{ interactive: true } as IReqoreNavbarItemProps}
                isReqoreComponent
              >
                <ReqoreIcon icon='FlightLandLine' />
              </ReqorePopover>
              <ReqorePopover
                component={ReqoreNavbarItem}
                content='Notifications'
                componentProps={{ interactive: true } as IReqoreNavbarItemProps}
                isReqoreComponent
              >
                <ReqoreIcon icon='GpsLine' />
              </ReqorePopover>
            </ReqoreNavbarGroup>
          </ReqoreFooter>
        </ReqoreLayoutContent>
      </ReqoreThemeProvider>
    </ReqoreUIProvider>
  );
};

export const Default = Template.bind({});
export const Dark = Template.bind({});
Dark.args = {
  theme: {
    main: '#333333',
  },
};

export const CustomColor = Template.bind({});
CustomColor.args = {
  theme: {
    main: '#194d5d',
  },
};

export const CustomTheme = Template.bind({});
CustomTheme.args = {
  customHeaderTheme: {
    main: '#4f2769',
  } as IReqoreNavbarTheme,
  customFooterTheme: {
    main: '#ad973b',
  } as IReqoreNavbarTheme,
};

export const Flat = Template.bind({});
Flat.args = {
  theme: {
    main: '#222222',
  },
  flat: true,
};
