import { Meta, Story } from '@storybook/react/types-6-0';
import { noop } from 'lodash';
import React from 'react';
import { ReqorePanel } from '../../components/Panel';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import { ReqoreButton, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../../index';

export default {
  title: 'ReQore/Panel',
  args: {
    theme: {
      main: '#222222',
    },
  },
} as Meta;

const SingleTemplate: Story<IReqoreUIProviderProps> = ({
  theme,
  ...args
}: IReqoreUIProviderProps) => {
  return (
    <ReqoreUIProvider theme={theme}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ padding: '20px' }}>
          <ReqorePanel {...args}>
            <div style={{ padding: '15px' }}>
              I am a message a very long message - Shadowlands has mechanisms put in place for
              allowing players to catch up on Renown, the system of gaining favor and unlocking
              rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
              main characters who have started late, for alts, for players who have switched
              Covenants and are starting over, and for players who have simply missed weekly quests
              for earning Renown due to being away from the game. I am a message a very long message
              - Shadowlands has mechanisms put in place for allowing players to catch up on Renown,
              the system of gaining favor and unlocking rewards, Campaign chapters, and soulbinds
              within your Covenant. This system works for main characters who have started late, for
              alts, for players who have switched Covenants and are starting over, and for players
              who have simply missed weekly quests for earning Renown due to being away from the
              game. I am a message a very long message - Shadowlands has mechanisms put in place for
              allowing players to catch up on Renown, the system of gaining favor and unlocking
              rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
              main characters who have started late, for alts, for players who have switched
              Covenants and are starting over, and for players who have simply missed weekly quests
              for earning Renown due to being away from the game. I am a message a very long message
              - Shadowlands has mechanisms put in place for allowing players to catch up on Renown,
              the system of gaining favor and unlocking rewards, Campaign chapters, and soulbinds
              within your Covenant. This system works for main characters who have started late, for
              alts, for players who have switched Covenants and are starting over, and for players
              who have simply missed weekly quests for earning Renown due to being away from the
              game. I am a message a very long message - Shadowlands has mechanisms put in place for
              allowing players to catch up on Renown, the system of gaining favor and unlocking
              rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
              main characters who have started late, for alts, for players who have switched
              Covenants and are starting over, and for players who have simply missed weekly quests
              for earning Renown due to being away from the game.
            </div>
          </ReqorePanel>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

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
          <ReqorePanel {...args} rounded label='I am a title' icon='UserFill'>
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
          <h4>Padded</h4>
          <ReqorePanel {...args} rounded label='I am a title' icon='UserFill' padded>
            I am a message a very long message - Shadowlands has mechanisms put in place for
            allowing players to catch up on Renown, the system of gaining favor and unlocking
            rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
            main characters who have started late, for alts, for players who have switched Covenants
            and are starting over, and for players who have simply missed weekly quests for earning
            Renown due to being away from the game.
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
          <h4>Callback when collapsed</h4>
          <ReqorePanel
            {...args}
            rounded
            onClose={noop}
            collapsible
            onCollapseChange={(isCollapsed) => {
              alert(`Content is collapsed: ${isCollapsed.toString()}`);
            }}
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
          <h4>React element as label</h4>
          <ReqorePanel
            {...args}
            rounded
            onClose={noop}
            collapsible
            flat
            label={<ReqoreButton>Hello</ReqoreButton>}
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
            label='Warning panel'
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
            label='DANGER'
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

export const Fill = SingleTemplate.bind({});
Fill.args = {
  fill: true,
  flat: true,
  rounded: true,
  label: 'Fills the whole space',
  collapsible: true,
};
