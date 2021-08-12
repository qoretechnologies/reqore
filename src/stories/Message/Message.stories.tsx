import { Meta, Story } from '@storybook/react/types-6-0';
import React, { useState } from 'react';
import ReqoreMessage from '../../components/Message';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../../index';

export default {
  title: 'ReQore/Message',
  args: {
    theme: {
      main: '#222222',
    },
  },
} as Meta;

const Template: Story<IReqoreUIProviderProps> = (args: IReqoreUIProviderProps) => {
  const [check, setCheck] = useState(false);

  return (
    <ReqoreUIProvider {...args}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ padding: '20px' }}>
          <h4>Default</h4>
          <ReqoreMessage> I am a message </ReqoreMessage>
          <br />
          <ReqoreMessage inverted> Inverted message without intent </ReqoreMessage>
          <br />
          <ReqoreMessage intent='info'> I am a message </ReqoreMessage>
          <br />
          <ReqoreMessage intent='danger'> I am a message </ReqoreMessage>
          <br />
          <ReqoreMessage intent='warning' title='Message with title'>
            {' '}
            I am a message a very long message - Shadowlands has mechanisms put in place for
            allowing players to catch up on Renown, the system of gaining favor and unlocking
            rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
            main characters who have started late, for alts, for players who have switched Covenants
            and are starting over, and for players who have simply missed weekly quests for earning
            Renown due to being away from the game.
          </ReqoreMessage>
          <br />
          <h4>Small</h4>
          <ReqoreMessage intent='info' size='small'>
            {' '}
            I am a message{' '}
          </ReqoreMessage>
          <br />
          <ReqoreMessage intent='danger' size='small' flat>
            {' '}
            I am a message{' '}
          </ReqoreMessage>
          <br />
          <ReqoreMessage intent='warning' title='Message with title' size='small' inverted>
            {' '}
            I am a message a very long message - Shadowlands has mechanisms put in place for
            allowing players to catch up on Renown, the system of gaining favor and unlocking
            rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
            main characters who have started late, for alts, for players who have switched Covenants
            and are starting over, and for players who have simply missed weekly quests for earning
            Renown due to being away from the game.
          </ReqoreMessage>
          <br />
          <h4>Big</h4>
          <ReqoreMessage intent='info' size='big'>
            {' '}
            I am a message{' '}
          </ReqoreMessage>
          <br />
          <ReqoreMessage intent='danger' size='big' flat>
            {' '}
            I am a message{' '}
          </ReqoreMessage>
          <br />
          <ReqoreMessage intent='warning' title='Message with title' size='big' inverted>
            {' '}
            I am a message a very long message - Shadowlands has mechanisms put in place for
            allowing players to catch up on Renown, the system of gaining favor and unlocking
            rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
            main characters who have started late, for alts, for players who have switched Covenants
            and are starting over, and for players who have simply missed weekly quests for earning
            Renown due to being away from the game.
          </ReqoreMessage>
          <br />
          <h4>Flat</h4>
          <ReqoreMessage intent='info' flat>
            {' '}
            I am a message{' '}
          </ReqoreMessage>
          <br />
          <ReqoreMessage intent='danger' flat>
            {' '}
            I am a message{' '}
          </ReqoreMessage>
          <br />
          <ReqoreMessage intent='warning' title='Message with title' flat>
            {' '}
            I am a message a very long message - Shadowlands has mechanisms put in place for
            allowing players to catch up on Renown, the system of gaining favor and unlocking
            rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
            main characters who have started late, for alts, for players who have switched Covenants
            and are starting over, and for players who have simply missed weekly quests for earning
            Renown due to being away from the game.
          </ReqoreMessage>
          <br />
          <h4>Inverted</h4>
          <ReqoreMessage intent='info' inverted>
            {' '}
            I am a message{' '}
          </ReqoreMessage>
          <br />
          <ReqoreMessage intent='danger' inverted>
            {' '}
            I am a message{' '}
          </ReqoreMessage>
          <br />
          <ReqoreMessage intent='warning' title='Message with title' flat inverted>
            {' '}
            I am a message a very long message - Shadowlands has mechanisms put in place for
            allowing players to catch up on Renown, the system of gaining favor and unlocking
            rewards, Campaign chapters, and soulbinds within your Covenant. This system works for
            main characters who have started late, for alts, for players who have switched Covenants
            and are starting over, and for players who have simply missed weekly quests for earning
            Renown due to being away from the game.
          </ReqoreMessage>
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
  theme: {
    main: '#0d0221',
    color: '#2de2e6',
  },
};
