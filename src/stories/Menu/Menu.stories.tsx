import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import styled from 'styled-components';
import { IReqoreMenuItemProps } from '../../components/Menu/item';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import {
  ReqoreMenu,
  ReqoreMenuDivider,
  ReqoreMenuItem,
  ReqorePopover,
  ReqoreUIProvider,
} from '../../index';

export default {
  title: 'ReQore/Menu',
  component: ReqoreMenu,
  args: {
    theme: {
      main: '#ffffff',
    },
  },
} as Meta;

const StyledStoriesContent = styled.div`
  padding: 10px;
  display: flex;
  width: 100%;
  height: 500px;
  background-color: ${({ theme }) => theme.main};
`;

const Template: Story<IReqoreUIProviderProps> = ({
  theme,
  ...args
}: IReqoreUIProviderProps) => {
  return (
    <ReqoreUIProvider theme={theme}>
      <ReqoreThemeProvider>
        <StyledStoriesContent>
          <ReqoreMenu {...args}>
            <ReqoreMenuItem icon='Save3Fill'>Save</ReqoreMenuItem>
            <ReqoreMenuItem
              icon='ChatPollFill'
              onClick={() => alert('Item clicked')}
              rightIcon='FahrenheitFill'
              onRightIconClick={(itemId) => alert('Icon clicked')}
              tooltip={{
                content: 'You sure?',
              }}
            >
              Delete
            </ReqoreMenuItem>

            <ReqoreMenuItem icon='Lock2Fill'>
              Remove this really long text heh
            </ReqoreMenuItem>
            <ReqoreMenuDivider />
            <ReqorePopover
              component={ReqoreMenuItem}
              componentProps={
                {
                  icon: 'EmotionUnhappyLine',
                  rightIcon: 'Scissors2Fill',
                } as IReqoreMenuItemProps
              }
              content={
                <ReqoreMenu {...args}>
                  <ReqoreMenuItem icon='ZhihuFill'>Save</ReqoreMenuItem>
                </ReqoreMenu>
              }
              isReqoreComponent
              handler='click'
              placement='right'
            >
              I have a submenu on click
            </ReqorePopover>
            <ReqoreMenuDivider label='Divider' />
            <ReqoreMenuItem
              icon='DualSim1Line'
              rightIcon='MoneyEuroBoxLine'
              selected
            >
              I am selected!
            </ReqoreMenuItem>
          </ReqoreMenu>
        </StyledStoriesContent>
      </ReqoreThemeProvider>
    </ReqoreUIProvider>
  );
};

export const Default = Template.bind({});
export const Bordered = Template.bind({});
Bordered.args = {
  position: 'left',
};
export const Dark = Template.bind({});
Dark.args = {
  position: 'left',
  theme: {
    main: '#222222',
  },
};
export const CustomColor = Template.bind({});
CustomColor.args = {
  theme: {
    main: '#194d5d',
  },
};

export const CustomAccent = Template.bind({});
CustomAccent.args = {
  theme: {
    main: '#194d5d',
  },
  accent: '#57195d',
};
