import { Icon } from '@blueprintjs/core';
import { Meta, Story } from '@storybook/react/types-6-0';
import { darken } from 'polished';
import React from 'react';
import styled, { css } from 'styled-components';
import { IReqoreNavbarProps, ReqoreFooter } from '../../components/Navbar';
import { IReqoreNavbarItemProps } from '../../components/Navbar/item';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import {
  ReqoreHeader,
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
} as Meta;

const StyledStoriesWrapper = styled.div`
  width: 100%;
  height: 800px;
  display: flex;
  flex-flow: row;
`;

const StyledStoriesContent = styled.div`
  ${({ theme }) => css`
    padding: 15px;
    display: flex;
    width: 100%;
    height: 100%;
    flex: 1;
    background-color: ${changeLightness(theme.main, 0.08)};

    div {
      width: 100%;
      height: 100%;
      flex: 1;
      border-radius: 10px;
      background-color: ${theme.main};
      color: ${getReadableColor(theme.main)};
      box-shadow: 0px 0px 3px 0px ${darken(0.2, theme.main)};
    }
  `}
`;

const StyledStoriesContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
`;

const Template: Story<IReqoreUIProviderProps & IReqoreNavbarProps> = ({
  theme,
  ...args
}: IReqoreUIProviderProps & IReqoreNavbarProps) => {
  return (
    <ReqoreUIProvider theme={theme}>
      <ReqoreThemeProvider>
        <StyledStoriesWrapper>
          <StyledStoriesContentWrapper>
            <ReqoreHeader>
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
                      <ReqoreMenuItem icon='bank-account'>
                        Profile
                      </ReqoreMenuItem>
                      <ReqoreMenuItem icon='warning-sign'>
                        Alerts
                      </ReqoreMenuItem>
                      <ReqoreMenuItem icon='log-out'>Log out</ReqoreMenuItem>
                    </ReqoreMenu>
                  }
                  handler='click'
                  componentProps={
                    { interactive: true } as IReqoreNavbarItemProps
                  }
                  isReqoreComponent
                >
                  <Icon icon='person' />
                </ReqorePopover>
                <ReqoreNavbarDivider />
                <ReqorePopover
                  component={ReqoreNavbarItem}
                  content='Notifications'
                  componentProps={
                    { interactive: true } as IReqoreNavbarItemProps
                  }
                  isReqoreComponent
                >
                  <Icon icon='notifications' />
                </ReqorePopover>
              </ReqoreNavbarGroup>
            </ReqoreHeader>

            <StyledStoriesContent>
              <div />
            </StyledStoriesContent>
            <ReqoreFooter>
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
                      <ReqoreMenuItem icon='bank-account'>
                        Profile
                      </ReqoreMenuItem>
                      <ReqoreMenuItem icon='warning-sign'>
                        Alerts
                      </ReqoreMenuItem>
                      <ReqoreMenuItem icon='log-out'>Log out</ReqoreMenuItem>
                    </ReqoreMenu>
                  }
                  handler='click'
                  componentProps={
                    { interactive: true } as IReqoreNavbarItemProps
                  }
                  isReqoreComponent
                >
                  <Icon icon='person' />
                </ReqorePopover>
                <ReqorePopover
                  component={ReqoreNavbarItem}
                  content='Notifications'
                  componentProps={
                    { interactive: true } as IReqoreNavbarItemProps
                  }
                  isReqoreComponent
                >
                  <Icon icon='notifications' />
                </ReqorePopover>
              </ReqoreNavbarGroup>
            </ReqoreFooter>
          </StyledStoriesContentWrapper>
        </StyledStoriesWrapper>
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
