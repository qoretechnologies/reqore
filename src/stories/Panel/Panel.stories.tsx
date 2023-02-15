import { Meta, Story } from '@storybook/react/types-6-0';
import { noop } from 'lodash';
import ReqoreInput, { IReqoreInputProps } from '../../components/Input';
import { IReqorePanelAction, IReqorePanelProps, ReqorePanel } from '../../components/Panel';
import { ReqoreVerticalSpacer } from '../../components/Spacer';
import { argManager, FlatArg, IconArg, IntentArg, SizeArg } from '../utils/args';

const { createArg } = argManager<IReqorePanelProps>();

export default {
  title: 'Components/Panel',
  argTypes: {
    ...IntentArg,
    ...FlatArg,
    ...SizeArg,
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
      type: 'string',
      defaultValue: undefined,
      name: 'Header Size',
      description: 'The size of the header',
    }),
    ...createArg('onClick', {
      type: 'function',
      defaultValue: noop,
      name: 'On click',
      description: 'The function to call when the panel is clicked',
    }),
    ...IconArg(),
  },
} as Meta<IReqorePanelProps>;

const Template: Story<IReqorePanelProps> = (args: IReqorePanelProps) => {
  if (args.fluid) {
    const actions: IReqorePanelAction[] = [
      {
        icon: 'GiftFill',
        label: 'Visible',
        responsive: false,
      },
      {
        label: 'Hidden when small',
        icon: 'EyeCloseLine',
      },
      {
        label: 'Hidden when small',
        icon: 'EyeCloseLine',
      },
      {
        label: 'Hidden when small',
        icon: 'EyeCloseLine',
      },
      {
        label: 'Hidden when small',
        icon: 'EyeCloseLine',
      },
    ];

    return (
      <>
        <ReqorePanel
          {...args}
          badge='Fluid'
          actions={actions}
          bottomActions={[
            ...actions,
            ...actions.map((action) => ({ ...action, position: 'right' })),
          ]}
        >
          This is a fluid panel
        </ReqorePanel>
        <ReqoreVerticalSpacer height={10} />
        <ReqorePanel
          {...args}
          style={{ width: 400 }}
          fluid={false}
          badge='Not Fluid'
          actions={actions}
          bottomActions={[
            ...actions,
            ...actions.map((action) => ({ ...action, position: 'right' })),
          ]}
        >
          Thisisnotafluidpanelbutapanelthathasalongstringwithoutspacesthatneedstobewrapperotherwiseitwilladdahorizontalscrollbar
        </ReqorePanel>
        <ReqoreVerticalSpacer height={10} />
        <ReqorePanel
          {...args}
          style={{ width: 1000 }}
          fluid={false}
          badge='Non Responsive'
          actions={actions}
          responsiveActions={false}
          bottomActions={[
            ...actions,
            ...actions.map((action) => ({ ...action, position: 'right' })),
          ]}
        >
          This panel has non-responsive actions
        </ReqorePanel>
      </>
    );
  }

  return (
    <ReqorePanel
      badge={[
        10,
        0,
        {
          effect: {
            gradient: {
              colors: { 0: '#f98304', 100: '#ffc20c' },
              direction: 'to right bottom',
            },
            spaced: 2,
            uppercase: true,
          },
          labelKey: 'Cool',
          label: 1234,
          actions: [{ icon: 'ShuffleLine', onClick: noop }],
        },
      ]}
      actions={[
        {
          responsive: false,
          group: [
            {
              label: 'Non responsive',
              icon: '24HoursFill',
              customTheme: { main: '#eb0e8c' },
            },
            {
              icon: 'FullscreenExitLine',
              customTheme: { main: '#a40a62' },
              fixed: true,
            },
          ],
        },
        {
          fixed: true,
          group: [
            { label: 'Stacked Action 1', icon: 'BallPenLine', intent: 'warning' },
            { icon: 'CopperCoinFill', intent: 'danger' },
          ],
        },
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
        {
          position: 'left',
          intent: 'success',
          group: [
            { label: 'Test 1', icon: '24HoursFill', fixed: true },
            { label: 'Test 2', icon: '24HoursFill' },
          ],
        },
        {
          label: 'More actions',
          position: 'right',
          actions: [
            { value: 'Sub Test', icon: 'FileDownloadLine', intent: 'success' },
            { value: 'Sub Test 2', icon: 'FileDownloadLine' },
          ],
        },
      ]}
      {...args}
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
export const NoBars: Story<IReqorePanelProps> = Template.bind({});
NoBars.args = {
  label: undefined,
  badge: undefined,
  icon: undefined,
  actions: [
    { label: 'test', show: false },
    {
      show: false,
      group: [
        { label: 'test 2', show: true },
        { label: 'test 3', show: true },
      ],
    },
  ],
  bottomActions: [
    { label: 'test', show: false, position: 'left' },
    {
      position: 'right',
      show: false,
      group: [
        { label: 'test 2', show: true },
        { label: 'test 3', show: true },
      ],
    },
  ],
  collapsible: false,
};

export const Transparent: Story<IReqorePanelProps> = Template.bind({});
Transparent.args = {
  transparent: true,
};

export const Intent: Story<IReqorePanelProps> = Template.bind({});
Intent.args = {
  intent: 'success',
  iconColor: 'success:lighten:2',
  transparent: true,
  flat: true,
};

export const Minimal: Story<IReqorePanelProps> = Template.bind({});
Minimal.args = {
  minimal: true,
  flat: true,
};

export const NonResponsiveActions: Story<IReqorePanelProps> = Template.bind({});
NonResponsiveActions.args = {
  responsiveActions: false,
  label:
    'This is a really long title that should stretch all the way to the right of the panel, all the way to the end and not end in the middle',
  badge: undefined,
  actions: [
    {
      responsive: false,
      group: [
        {
          label: 'Non responsive',
          icon: '24HoursFill',
          customTheme: { main: '#eb0e8c' },
        },
        {
          icon: 'FullscreenExitLine',
          customTheme: { main: '#a40a62' },
        },
      ],
    },
    {
      group: [
        { label: 'Stacked Action 1', icon: 'BallPenLine', intent: 'warning' },
        { icon: 'CopperCoinFill', intent: 'danger' },
      ],
    },
  ],
};

export const TransparentFlat: Story<IReqorePanelProps> = Template.bind({});
TransparentFlat.args = {
  transparent: true,
  flat: true,
};

export const Fluid: Story<IReqorePanelProps> = Template.bind({});
Fluid.args = {
  fluid: true,
};

export const Size: Story<IReqorePanelProps> = Template.bind({});
Size.args = {
  size: 'small',
};

export const NoActions: Story<IReqorePanelProps> = Template.bind({});
NoActions.args = {
  collapsible: false,
  actions: [],
  label:
    'This is a really long title that should stretch all the way to the right of the panel, all the way to the end and not end in the middle',
};

export const ImageAsIcon: Story<IReqorePanelProps> = Template.bind({});
ImageAsIcon.args = {
  iconImage:
    'https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4',
  iconProps: {
    size: '30px',
  },
};

export const ContentSize: Story<IReqorePanelProps> = Template.bind({});
ContentSize.args = {
  contentSize: 'big',
};

export const WithEffect: Story<IReqorePanelProps> = Template.bind({});
WithEffect.args = {
  iconColor: 'info:lighten:2',
  minimal: true,
  contentEffect: {
    gradient: {
      type: 'radial',
      shape: 'ellipse',
      direction: 'at bottom center',
      colors: { 0: '#670079', 100: '#180222' },
      animate: 'hover',
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
