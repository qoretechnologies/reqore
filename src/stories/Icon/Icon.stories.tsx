import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import {
  ReqoreContent,
  ReqoreIcon,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../../index';

export default {
  title: 'ReQore/Icon',
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
          <h4> Default </h4>
          <ReqoreIcon icon='AccountCircleLine' size='12px' />
          <ReqoreIcon icon='4KFill' size='14px' />
          <ReqoreIcon icon='ArrowLeftCircleFill' />
          <ReqoreIcon icon='HotelFill' size='18px' />
          <ReqoreIcon icon='SignalTowerFill' size='20px' color='#ff0000' />
          <h4> Margined </h4>
          <ReqoreIcon icon='AccountCircleLine' size='12px' />
          No Margin
          <div>
            <ReqoreIcon icon='4KFill' size='14px' margin='right' />
            Right Margin
          </div>
          <div>
            Left Margin
            <ReqoreIcon icon='ArrowLeftCircleFill' margin='left' />
          </div>
          <div>
            Both
            <ReqoreIcon icon='HotelFill' size='18px' margin='both' />
            Sides
          </div>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

export const Basic = Template.bind({});
