import { Meta, Story } from '@storybook/react/types-6-0';
import ReqoreInput, { IReqoreInputProps } from '../../components/Input';
import { IReqorePanelProps, ReqorePanel } from '../../components/Panel';
import { FlatArg, IconArg, IntentArg, argManager } from '../utils/args';

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
    ...createArg('minimal', {
      type: 'boolean',
      defaultValue: false,
      name: 'Minimal',
      description: 'If the panel should be minimal',
    }),
    ...createArg('label', {
      type: 'string',
      defaultValue: 'Reqore panel component',
      name: 'Label',
      description: 'The title of the panel component',
    }),
    ...createArg('opacity', {
      type: 'number',
      defaultValue: undefined,
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
          as: ReqoreInput,
          props: {
            placeholder: 'Custom action!',
            icon: 'Search2Line',
            minimal: false,
          } as IReqoreInputProps,
        },
        {
          label: 'More actions',
          actions: [
            { value: 'Sub Test', icon: 'FileDownloadLine' },
            { value: 'Sub Test 2', icon: 'FileDownloadLine', intent: 'success' },
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
            { value: 'Sub Test', icon: 'FileDownloadLine', intent: 'success' },
            { value: 'Sub Test 2', icon: 'FileDownloadLine' },
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

export const Opaque: Story<IReqorePanelProps> = Template.bind({});
Opaque.args = {
  opacity: 0,
};

export const Minimal: Story<IReqorePanelProps> = Template.bind({});
Minimal.args = {
  minimal: true,
  flat: true,
};

export const WithEffect: Story<IReqorePanelProps> = Template.bind({});
WithEffect.args = {
  minimal: true,
  flat: true,
  contentEffect: {
    gradient: {
      type: 'radial',
      shape: 'ellipse',
      colors: { 0: '#670079', 100: '#180222' },
    },
  },
  headerEffect: {
    gradient: {
      type: 'linear',
      colors: { 0: '#3b065e', 100: '#00d3c8' },
      direction: 'to right bottom',
    },
    uppercase: true,
    weight: 'normal',
    spaced: 2,
  },
  headerSize: 2,
};
