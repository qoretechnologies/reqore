import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import styled from 'styled-components';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import { ReqoreMenu, ReqoreMenuItem, ReqoreUIProvider } from '../../index';

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
            <ReqoreMenuItem icon='floppy-disk'>Save</ReqoreMenuItem>
            <ReqoreMenuItem icon='cross' rightIcon='warning-sign'>
              Delete
            </ReqoreMenuItem>

            <ReqoreMenuItem icon='trash'>
              Remove this really long text heh
            </ReqoreMenuItem>
            <ReqoreMenuItem icon='person' rightIcon='small-tick' selected>
              Hello
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
