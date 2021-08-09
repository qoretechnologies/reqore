import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import ReqoreButton from '../../components/Button';
import { IReqoreTheme } from '../../constants/theme';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqorePopover,
  ReqoreUIProvider,
} from '../../index';

export default {
  title: 'ReQore/Button',
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
      <ReqoreLayoutContent>
        <ReqoreContent style={{ padding: '20px' }}>
          <h4>Default</h4>
          <ReqoreButton>Button</ReqoreButton>
          <h4>Small</h4>
          <ReqoreButton size='small'>Button</ReqoreButton>
          <h4>Big</h4>
          <ReqoreButton size='big'>Button</ReqoreButton>
          <h2>With icons</h2>
          <h4>Default</h4>
          <ReqoreButton icon='4KLine'>Button</ReqoreButton>
          <h4>Small</h4>
          <ReqoreButton icon='24HoursFill' size='small'>
            Button
          </ReqoreButton>
          <h4>Big</h4>
          <ReqoreButton icon='BallPenFill' size='big'>
            Button
          </ReqoreButton>
          <h2>Activve</h2>
          <h4>Default</h4>
          <ReqoreButton icon='4KLine' active>
            Button
          </ReqoreButton>
          <h4>Minimal</h4>
          <ReqoreButton icon='24HoursFill' size='small' active>
            Button
          </ReqoreButton>
          <h4>With intents</h4>
          <ReqoreButton icon='BallPenFill' size='big' intent='pending' active>
            Button
          </ReqoreButton>
          <br />
          <ReqoreButton icon='BallPenFill' size='big' intent='info' active>
            Button
          </ReqoreButton>
          <h2>Only icons</h2>
          <h4>Default</h4>
          <ReqoreButton icon='4KLine'></ReqoreButton>
          <h4>Small</h4>
          <ReqoreButton icon='24HoursFill' size='small'></ReqoreButton>
          <h4>Big</h4>
          <ReqoreButton icon='BallPenFill' size='big'></ReqoreButton>
          <h2>Minimal</h2>
          <h4>Default</h4>
          <ReqoreButton minimal>Minimal</ReqoreButton>
          <h4>Small only icon</h4>
          <ReqoreButton icon='24HoursFill' size='small' minimal></ReqoreButton>
          <h4>Big with icon</h4>
          <ReqoreButton icon='BallPenFill' size='big' minimal>
            Big button
          </ReqoreButton>
          <h2>Disabled</h2>
          <h4>Minimal</h4>
          <ReqoreButton minimal disabled>
            Minimal
          </ReqoreButton>
          <h4>Small only icon</h4>
          <ReqoreButton icon='24HoursFill' size='small' disabled></ReqoreButton>
          <h4>Big with icon</h4>
          <ReqoreButton icon='BallPenFill' size='big' disabled>
            Big button
          </ReqoreButton>
          <h2>With tooltip</h2>
          <h4>Basic tooltip</h4>
          <ReqoreButton minimal tooltip='I am a minimal button'>
            Minimal
          </ReqoreButton>
          <h4>Basic tooltip & onlick popover</h4>
          <ReqorePopover
            component={ReqoreButton}
            componentProps={{
              icon: 'BallPenFill',
              tooltip: 'Hey',
            }}
            content='Hello'
            handler='click'
            isReqoreComponent
          >
            Click for more
          </ReqorePopover>
          <h4>With intents</h4>
          <ReqoreButton intent='info'>Info</ReqoreButton>
          <br />
          <ReqoreButton intent='success' icon='CheckDoubleLine'>
            Success
          </ReqoreButton>
          <br />
          <ReqoreButton intent='pending'>Pending</ReqoreButton>
          <br />
          <ReqoreButton intent='warning'>Warning</ReqoreButton>
          <br />
          <ReqoreButton intent='danger'>Danger</ReqoreButton>
          <br />

          <ReqoreButton intent='info' minimal>
            Info
          </ReqoreButton>
          <br />
          <ReqoreButton intent='success' minimal>
            Success
          </ReqoreButton>
          <br />
          <ReqoreButton intent='pending' minimal>
            Pending
          </ReqoreButton>
          <br />
          <ReqoreButton intent='warning' minimal>
            Warning
          </ReqoreButton>
          <br />
          <ReqoreButton intent='danger' minimal>
            Danger
          </ReqoreButton>
          <h4>Flat</h4>
          <ReqoreButton flat>Info</ReqoreButton>
          <br />
          <ReqoreButton intent='info' flat>
            Info
          </ReqoreButton>
          <br />
          <ReqoreButton icon='User2Line' flat intent='warning'>
            Info
          </ReqoreButton>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

export const Basic = Template.bind({});
export const LightColor = Template.bind({});
LightColor.args = {
  theme: {
    main: '#ffffff',
  },
};

export const CustomColor = Template.bind({});
CustomColor.args = {
  theme: {
    main: '#0d0221',
    text: {
      color: '#2de2e6',
    },
  },
};

export const CustomIntentColors = Template.bind({});
CustomIntentColors.args = {
  theme: {
    main: '#0d0221',
    intents: {
      success: '#eb98cf',
      pending: '#636363',
      warning: '#15057a',
    },
  } as IReqoreTheme,
};
