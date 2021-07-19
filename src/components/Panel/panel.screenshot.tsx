import { noop } from 'lodash';
import { ReqorePanel } from '.';

export const SomePanel = () => (
  <ReqorePanel
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
      I am a message a very long message - Shadowlands has mechanisms put in
      place for allowing players to catch up on Renown, the system of gaining
      favor and unlocking rewards, Campaign chapters, and soulbinds within your
      Covenant. This system works for main characters who have started late, for
      alts, for players who have switched Covenants and are starting over, and
      for players who have simply missed weekly quests for earning Renown due to
      being away from the game.
    </div>
  </ReqorePanel>
);
