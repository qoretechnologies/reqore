import { Meta, Story } from '@storybook/react/types-6-0';
import { noop } from 'lodash';
import React from 'react';
import { ReqorePanel } from '../../components/Panel';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../../index';

export default {
  title: 'ReQore/Panel',
  args: {
    theme: {
      main: '#222222',
    },
  },
} as Meta;

const Template: Story<IReqoreUIProviderProps> = ({ theme, ...args }: IReqoreUIProviderProps) => {
  return (
    <ReqoreUIProvider theme={theme}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ padding: '20px' }}>
          <h4>Default</h4>
          <ReqorePanel {...args}>
            <div style={{ padding: '15px' }}>
              I am a message a very long message - Shadowlands has mechanisms put in place for
              allowing players to catch up on Renown, the system of gaining favor and unlocking
              rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
              main characters who have started late, for alts, for players who have switched
              Covenants and are starting over, and for players who have simply missed weekly quests
              for earning Renown due to being away from the game.
            </div>
          </ReqorePanel>
          <br />
          <h4>Rounded with title</h4>
          <ReqorePanel {...args} rounded title='I am a title' icon='UserFill'>
            <div style={{ padding: '15px' }}>
              I am a message a very long message - Shadowlands has mechanisms put in place for
              allowing players to catch up on Renown, the system of gaining favor and unlocking
              rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
              main characters who have started late, for alts, for players who have switched
              Covenants and are starting over, and for players who have simply missed weekly quests
              for earning Renown due to being away from the game.
            </div>
          </ReqorePanel>
          <br />
          <h4>With actions</h4>
          <ReqorePanel
            {...args}
            rounded
            onClose={noop}
            collapsible
            actions={[
              {
                icon: 'Settings2Line',
                onClick: noop,
              },
              {
                icon: 'UserFill',
                onClick: noop,
                label: 'Test',
              },
            ]}
          >
            <div style={{ padding: '15px' }}>
              I am a message a very long message - Shadowlands has mechanisms put in place for
              allowing players to catch up on Renown, the system of gaining favor and unlocking
              rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
              main characters who have started late, for alts, for players who have switched
              Covenants and are starting over, and for players who have simply missed weekly quests
              for earning Renown due to being away from the game.
            </div>
          </ReqorePanel>
          <br />
          <h4>With nested actions</h4>
          <ReqorePanel
            {...args}
            rounded
            onClose={noop}
            collapsible
            actions={[
              {
                icon: 'Settings2Line',
                onClick: noop,
              },
              {
                icon: 'ListCheck2',
                label: 'List',
                actions: [
                  {
                    label: 'Action 1',
                    onClick: noop,
                  },
                  {
                    label: 'Action 2',
                    onClick: noop,
                  },
                ],
              },
            ]}
          >
            <div style={{ padding: '15px' }}>
              I am a message a very long message - Shadowlands has mechanisms put in place for
              allowing players to catch up on Renown, the system of gaining favor and unlocking
              rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
              main characters who have started late, for alts, for players who have switched
              Covenants and are starting over, and for players who have simply missed weekly quests
              for earning Renown due to being away from the game.
            </div>
          </ReqorePanel>
          <br />
          <h4>Keeps content when collapsed</h4>
          <ReqorePanel
            {...args}
            rounded
            onClose={noop}
            collapsible
            unMountContentOnCollapse={false}
            actions={[
              {
                icon: 'Settings2Line',
                onClick: noop,
              },
              {
                icon: 'UserFill',
                onClick: noop,
                label: 'Test',
              },
            ]}
          >
            <div style={{ padding: '15px' }}>
              I am a message a very long message - Shadowlands has mechanisms put in place for
              allowing players to catch up on Renown, the system of gaining favor and unlocking
              rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
              main characters who have started late, for alts, for players who have switched
              Covenants and are starting over, and for players who have simply missed weekly quests
              for earning Renown due to being away from the game.
            </div>
          </ReqorePanel>
          <br />
          <h4>Default collapsed</h4>
          <ReqorePanel
            {...args}
            rounded
            onClose={noop}
            collapsible
            isCollapsed
            actions={[
              {
                icon: 'Settings2Line',
                onClick: noop,
              },
              {
                icon: 'UserFill',
                onClick: noop,
                label: 'Test',
              },
            ]}
          >
            <div style={{ padding: '15px' }}>
              I am a message a very long message - Shadowlands has mechanisms put in place for
              allowing players to catch up on Renown, the system of gaining favor and unlocking
              rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
              main characters who have started late, for alts, for players who have switched
              Covenants and are starting over, and for players who have simply missed weekly quests
              for earning Renown due to being away from the game.
            </div>
          </ReqorePanel>
          <br />
          <h4>Flat</h4>
          <ReqorePanel
            {...args}
            rounded
            onClose={noop}
            collapsible
            flat
            actions={[
              {
                icon: 'Settings2Line',
                onClick: noop,
              },
              {
                icon: 'UserFill',
                onClick: noop,
                label: 'Test',
              },
            ]}
          >
            <div style={{ padding: '15px' }}>
              I am a message a very long message - Shadowlands has mechanisms put in place for
              allowing players to catch up on Renown, the system of gaining favor and unlocking
              rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
              main characters who have started late, for alts, for players who have switched
              Covenants and are starting over, and for players who have simply missed weekly quests
              for earning Renown due to being away from the game.
            </div>
          </ReqorePanel>
          <br />
          <h4>With intent</h4>
          <ReqorePanel
            {...args}
            rounded
            onClose={noop}
            collapsible
            intent='warning'
            title='Warning panel'
            icon='AlarmWarningLine'
            actions={[
              {
                icon: 'Settings2Line',
                onClick: noop,
              },
              {
                icon: 'UserFill',
                onClick: noop,
                label: 'Test',
              },
            ]}
          >
            <div style={{ padding: '15px' }}>
              I am a message a very long message - Shadowlands has mechanisms put in place for
              allowing players to catch up on Renown, the system of gaining favor and unlocking
              rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
              main characters who have started late, for alts, for players who have switched
              Covenants and are starting over, and for players who have simply missed weekly quests
              for earning Renown due to being away from the game.
            </div>
          </ReqorePanel>
          <br />
          <ReqorePanel
            {...args}
            collapsible
            intent='danger'
            title='DANGER'
            icon='AlarmWarningLine'
            actions={[
              {
                icon: 'Settings2Line',
                onClick: noop,
              },
              {
                icon: 'UserFill',
                onClick: noop,
                label: 'Test',
              },
            ]}
          >
            <div style={{ padding: '15px' }}>
              I am a message a very long message - Shadowlands has mechanisms put in place for
              allowing players to catch up on Renown, the system of gaining favor and unlocking
              rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
              main characters who have started late, for alts, for players who have switched
              Covenants and are starting over, and for players who have simply missed weekly quests
              for earning Renown due to being away from the game.
            </div>
          </ReqorePanel>
          <br />
          <ReqorePanel
            {...args}
            rounded
            onClose={noop}
            collapsible
            intent='success'
            flat
            actions={[
              {
                icon: 'Settings2Line',
                onClick: noop,
              },
              {
                icon: 'UserFill',
                onClick: noop,
                label: 'Test',
              },
            ]}
          >
            <div style={{ padding: '15px' }}>
              I am a message a very long message - Shadowlands has mechanisms put in place for
              allowing players to catch up on Renown, the system of gaining favor and unlocking
              rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
              main characters who have started late, for alts, for players who have switched
              Covenants and are starting over, and for players who have simply missed weekly quests
              for earning Renown due to being away from the game.
            </div>
          </ReqorePanel>
          <br />
          <ReqorePanel
            {...args}
            rounded
            onClose={noop}
            collapsible
            intent='info'
            actions={[
              {
                icon: 'Settings2Line',
                onClick: noop,
              },
              {
                icon: 'UserFill',
                onClick: noop,
                label: 'Test',
              },
            ]}
          >
            <div style={{ padding: '15px' }}>
              I am a message a very long message - Shadowlands has mechanisms put in place for
              allowing players to catch up on Renown, the system of gaining favor and unlocking
              rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
              main characters who have started late, for alts, for players who have switched
              Covenants and are starting over, and for players who have simply missed weekly quests
              for earning Renown due to being away from the game.
            </div>
          </ReqorePanel>
          <br />
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
  customTheme: {
    main: '#0d0221',
  },
};
