import { Meta, Story } from '@storybook/react/types-6-0';
import { noop } from 'lodash';
import React, { useState } from 'react';
import ReqoreControlGroup from '../../components/ControlGroup';
import { IReqoreDrawerProps, ReqoreDrawer } from '../../components/Drawer';
import ReqoreDropdown from '../../components/Dropdown';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import { ReqoreButton, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../../index';

export default {
  title: 'ReQore/Drawer',
  component: ReqoreDrawer,
  args: {
    theme: {
      main: '#222222',
    },
  },
} as Meta;

const Template: Story<IReqoreUIProviderProps & IReqoreDrawerProps> = (
  args: IReqoreUIProviderProps & IReqoreDrawerProps
) => {
  const [drawerData, setDrawerData] = useState<IReqoreDrawerProps>({
    position: 'right',
    isHidden: false,
    resizable: false,
    isOpen: true,
    children: null,
    hidable: true,
    hasBackdrop: false,
    onClose: noop,
    size: '500px',
    maxSize: '80%',
    minSize: '20%',
    flat: false,
    floating: false,
  });

  const updateItem = (item: string, value: any) => {
    setDrawerData({
      ...drawerData,
      [item]: value,
    });
  };

  return (
    <ReqoreUIProvider {...args}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ width: '100%', height: '100%', padding: '20px' }}>
          <ReqoreControlGroup>
            <ReqoreButton
              intent={drawerData.isOpen ? 'success' : undefined}
              onClick={() => updateItem('isOpen', !drawerData.isOpen)}
            >
              Toggle
            </ReqoreButton>
            <ReqoreButton
              intent={drawerData.resizable ? 'success' : undefined}
              onClick={() => updateItem('resizable', !drawerData.resizable)}
            >
              Resizable
            </ReqoreButton>
            <ReqoreButton
              intent={drawerData.hidable ? 'success' : undefined}
              onClick={() => updateItem('hidable', !drawerData.hidable)}
            >
              Hidable
            </ReqoreButton>
            <ReqoreButton
              intent={drawerData.hasBackdrop ? 'success' : undefined}
              onClick={() => updateItem('hasBackdrop', !drawerData.hasBackdrop)}
            >
              Has backdrop
            </ReqoreButton>
            <ReqoreButton
              intent={drawerData.flat ? 'success' : undefined}
              onClick={() => updateItem('flat', !drawerData.flat)}
            >
              Flat
            </ReqoreButton>
            <ReqoreButton
              intent={drawerData.floating ? 'success' : undefined}
              onClick={() => updateItem('floating', !drawerData.floating)}
            >
              Floating
            </ReqoreButton>
            <ReqoreDropdown
              items={[
                {
                  label: 'top',
                  onClick: () => updateItem('position', 'top'),
                },
                {
                  label: 'right',
                  onClick: () => updateItem('position', 'right'),
                },
                {
                  label: 'left',
                  onClick: () => updateItem('position', 'left'),
                },
                {
                  label: 'bottom',
                  onClick: () => updateItem('position', 'bottom'),
                },
              ]}
              label={drawerData.position}
            />
          </ReqoreControlGroup>
          <ReqoreDrawer {...drawerData} onClose={() => updateItem('isOpen', false)}>
            <div style={{ padding: '15px' }}>
              I am a message a very long message - Shadowlands has mechanisms put in place for
              allowing players to catch up on Renown, the system of gaining favor and unlocking
              rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
              main characters who have started late, for alts, for players who have switched
              Covenants and are starting over, and for players who have simply missed weekly quests
              for earning Renown due to being away from the game.
            </div>
          </ReqoreDrawer>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

export const Basic = Template.bind({});
Basic.args = {} as IReqoreUIProviderProps & IReqoreDrawerProps;

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
    color: '#2de2e6',
  },
};
