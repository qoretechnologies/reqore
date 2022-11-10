import { Meta, Story } from '@storybook/react/types-6-0';
import ReqoreInput from '../../components/Input';
import { IReqorePanelProps, ReqorePanel } from '../../components/Panel';
import { argManager, FlatArg, IconArg, IntentArg } from '../utils/args';

const { createArg } = argManager<IReqorePanelProps>();

export default {
  title: 'Components/Panel',
  argTypes: {
    ...IntentArg,
    ...FlatArg,
    ...createArg('padded', {
      type: 'boolean',
      defaultValue: true,
      name: 'Padded',
      description: 'If the panel should have padding',
    }),
    ...createArg('rounded', {
      type: 'boolean',
      defaultValue: true,
      name: 'Rounded',
      description: 'If the panel should have rounded corners',
    }),
    ...createArg('collapsible', {
      type: 'boolean',
      defaultValue: true,
      name: 'Collapsible',
      description: 'If the panel should be collapsible',
    }),
    ...createArg('label', {
      type: 'string',
      defaultValue: 'Reqore panel component',
      name: 'Label',
      description: 'The title of the panel component',
    }),
    ...createArg('opacity', {
      type: 'number',
      defaultValue: 1,
      name: 'Opacity',
      description: 'The opacity of the panel',
    }),
    ...createArg('headerSize', {
      type: 'number',
      defaultValue: 4,
      name: 'Header Size',
      description: 'The size of the header',
    }),
    ...IconArg(),
  },
} as Meta<IReqorePanelProps>;

const Template: Story<IReqorePanelProps> = (args: IReqorePanelProps) => {
  return (
    <ReqorePanel
      {...args}
      actions={[
        { label: 'Test', icon: '24HoursFill', intent: 'info' },
        [
          { label: 'Stacked Action 1', icon: 'BallPenLine', intent: 'warning' },
          { label: 'Stacked Action 2', icon: 'CopperCoinFill', intent: 'danger' },
        ],
        {
          customContent: () => (
            <ReqoreInput placeholder={`Custom action!`} icon='Search2Line' minimal={false} />
          ),
        },
        {
          label: 'More actions',
          actions: [
            { label: 'Sub Test', icon: 'FileDownloadLine' },
            { label: 'Sub Test 2', icon: 'FileDownloadLine', intent: 'success' },
          ],
          intent: 'info',
        },
      ]}
      bottomActions={[
        { label: 'Test', icon: '24HoursFill', position: 'left' },
        {
          label: 'More actions',
          position: 'right',
          actions: [
            { label: 'Sub Test', icon: 'FileDownloadLine', intent: 'success' },
            { label: 'Sub Test 2', icon: 'FileDownloadLine' },
          ],
        },
      ]}
    >
      Shadowlands has mechanisms put in place for allowing players to catch up on Renown, the system
      of gaining favor and unlocking rewards, Campaign chapters, and soulbinds within your Covenant.
      This system works for main characters who have started late, for alts, for players who have
      switched Covenants and are starting over, and for players who have simply missed weekly quests
      for earning Renown due to being away from the game. I am a message a very long message -
      Shadowlands has mechanisms put in place for allowing players to catch up on Renown, the system
      of gaining favor and unlocking rewards, Campaign chapters, and soulbinds within your Covenant.
      This system works for main characters who have started late, for alts, for players who have
      switched Covenants and are starting over, and for players who have simply missed weekly quests
      for earning Renown due to being away from the game. I am a message a very long message -
      Shadowlands has mechanisms put in place for allowing players to catch up on Renown, the system
      of gaining favor and unlocking rewards, Campaign chapters, and soulbinds within your Covenant.
      This system works for main characters who have started late, for alts, for players who have
      switched Covenants and are starting over, and for players who have simply missed weekly quests
      for earning Renown due to being away from the game. I am a message a very long message -
      Shadowlands has mechanisms put in place for allowing players to catch up on Renown, the system
      of gaining favor and unlocking rewards, Campaign chapters, and soulbinds within your Covenant.
      This system works for main characters who have started late, for alts, for players who have
      switched Covenants and are starting over, and for players who have simply missed weekly quests
      for earning Renown due to being away from the game. I am a message a very long message -
      Shadowlands has mechanisms put in place for allowing players to catch up on Renown, the system
      of gaining favor and unlocking rewards, Campaign chapters, and soulbinds within your Covenant.
      This system works for main characters who have started late, for alts, for players who have
      switched Covenants and are starting over, and for players who have simply missed weekly quests
      for earning Renown due to being away from the game.
    </ReqorePanel>
  );
};

export const Basic = Template.bind({});
export const NoPadding = Template.bind({});
NoPadding.args = {
  padded: false,
};
export const Flat = Template.bind({});
Flat.args = {
  flat: true,
};
export const NoLabel: Story<IReqorePanelProps> = Template.bind({});
NoLabel.args = {
  label: undefined,
};
