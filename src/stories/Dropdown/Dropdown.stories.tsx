import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import { IReqoreButtonProps } from '../../components/Button';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import {
  ReqoreContent,
  ReqoreDropdown,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../../index';

export default {
  title: 'ReQore/Dropdown',
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
        <ReqoreContent style={{ padding: '40px' }}>
          <h4> Basic </h4>
          <ReqoreDropdown
            label='Please select'
            items={[
              {
                selected: true,
                label: 'Hello',
                icon: 'SunCloudyLine',
              },
              {
                label: 'How are ya',
                icon: 'BatteryChargeFill',
              },
              {
                disabled: true,
                label: 'i aM diSAblEd',
                icon: 'StopCircleLine',
              },
            ]}
          />
          <h4> Disabled if empty </h4>
          <ReqoreDropdown />
          <h4> With tooltip </h4>
          <ReqoreDropdown
            label='Check me out'
            componentProps={
              {
                tooltip: 'You looking at me???',
                tooltipPlacement: 'right',
              } as IReqoreButtonProps
            }
            items={[
              {
                selected: true,
                label: 'Hello',
                icon: 'SunCloudyLine',
              },
              {
                label: 'How are ya',
                icon: 'BatteryChargeFill',
              },
              {
                disabled: true,
                label: 'i aM diSAblEd',
                icon: 'StopCircleLine',
                tooltip: {
                  content: ':(',
                },
              },
            ]}
          />
          <h4> Custom component as label </h4>
          <ReqoreDropdown
            component={ReqoreInput}
            handler='focus'
            useTargetWidth
            componentProps={{
              tooltip: 'WOAH!',
              width: 500,
              tooltipPlacement: 'top',
              placeholder: 'Focus me to see some crazy stuff',
            }}
            items={[
              {
                selected: true,
                label: 'Hello',
                icon: 'SunCloudyLine',
              },
              {
                label: 'How are ya',
                icon: 'BatteryChargeFill',
              },
              {
                disabled: true,
                label: 'i aM diSAblEd',
                icon: 'StopCircleLine',
              },
            ]}
          />
          <h4> Filterable list </h4>
          <ReqoreDropdown
            filterable
            multiSelect
            label='Filter me pls'
            componentProps={{
              tooltip: 'WOAH!',
              width: 500,
              tooltipPlacement: 'top',
              placeholder: 'Focus me to see some crazy stuff',
            }}
            items={[
              {
                selected: true,
                label: 'Hello',
                icon: 'SunCloudyLine',
              },
              {
                label: 'How are ya',
                icon: 'BatteryChargeFill',
              },
              {
                disabled: true,
                label: 'i aM diSAblEd',
                icon: 'StopCircleLine',
              },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

export const Basic = Template.bind({});
