import { StoryFn, StoryObj } from '@storybook/react';
import { fireEvent } from '@storybook/testing-library';
import { noop } from 'lodash';
import ReqoreControlGroup from '../../components/ControlGroup';
import ReqoreInput, { IReqoreInputProps } from '../../components/Input';
import { IReqorePanelAction, IReqorePanelProps, ReqorePanel } from '../../components/Panel';
import { ReqoreVerticalSpacer } from '../../components/Spacer';
import ReqoreTag from '../../components/Tag';
import { IReqoreIconName } from '../../types/icons';
import { StoryMeta } from '../utils';
import { FlatArg, IconArg, IntentArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqorePanelProps>();

const message =
  'Shadowlands has mechanisms put in place for allowing players to catch up on Renown, the system of gaining favor and unlocking rewards, Campaign chapters, and soulbinds within your Covenant. This system works for main characters who have started late, for alts, for players who have switched Covenants and are starting over, and for players who have simply missed weekly quests for earning Renown due to being away from the game. I am a message a very long message - Shadowlands has mechanisms put in place for allowing players to catch up on Renown, the system of gaining favor and unlocking rewards, Campaign chapters, and soulbinds within your Covenant. This system works for main characters who have started late, for alts, for players who have switched Covenants and are starting over, and for players who have simply missed weekly quests for earning Renown due to being away from the game. I am a message a very long message - Shadowlands has mechanisms put in place for allowing players to catch up on Renown, the system of gaining favor and unlocking rewards, Campaign chapters, and soulbinds within your Covenant. This system works for main characters who have started late, for alts, for players who have switched Covenants and are starting over, and for players who have simply missed weekly quests for earning Renown due to being away from the game. I am a message a very long message - Shadowlands has mechanisms put in place for allowing players to catch up on Renown, the system of gaining favor and unlocking rewards, Campaign chapters, and soulbinds within your Covenant. This system works for main characters who have started late, for alts, for players who have switched Covenants and are starting over, and for players who have simply missed weekly quests for earning Renown due to being away from the game. I am a message a very long message - Shadowlands has mechanisms put in place for allowing players to catch up on Renown, the system of gaining favor and unlocking rewards, Campaign chapters, and soulbinds within your Covenant. This system works for main characters who have started late, for alts, for players who have switched Covenants and are starting over, and for players who have simply missed weekly quests for earning Renown due to being away from the game. I am a message a very long message - Shadowlands has mechanisms put in place for allowing players to catch up on Renown, the system of gaining favor and unlocking rewards, Campaign chapters, and soulbinds within your Covenant. This system works for main characters who have started late, for alts, for players who have switched Covenants and are starting over, and for players who have simply missed weekly quests for earning Renown due to being away from the game.';

const meta = {
  title: 'Layout/Panel/Stories',
  component: ReqorePanel,
  parameters: {
    chromatic: {
      viewports: [450, 600, 1440],
    },
  },
  args: {
    padded: true,
    rounded: true,
    collapsible: true,
    minimal: false,
    label: 'Reqore panel component',
    onClick: noop,
    icon: '24HoursFill',
  },
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
} as StoryMeta<typeof ReqorePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqorePanelProps> = (args: IReqorePanelProps) => {
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
        <ReqoreControlGroup>
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
          <ReqorePanel
            {...args}
            style={{ width: 400 }}
            fluid={false}
            label='This is a simple test to establish the proper balance of your loud speakers'
            responsiveActions={false}
            responsiveTitle={false}
            collapsible={false}
            actions={[
              {
                as: ReqoreTag,
                props: {
                  icon: 'AlarmLine' as IReqoreIconName,
                  intent: 'danger',
                },
              },
              {
                group: [
                  {
                    icon: 'EditLine',
                  },
                  {
                    icon: 'DeleteBinLine',
                  },
                ],
              },
            ]}
          >
            Thisisnotafluidpanelbutapanelthathasalongstringwithoutspacesthatneedstobewrapperotherwiseitwilladdahorizontalscrollbar
          </ReqorePanel>
        </ReqoreControlGroup>
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
            { label: 'Sub Test', icon: 'FileDownloadLine' },
            { label: 'Sub Test 2', icon: 'FileDownloadLine', intent: 'success' },
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
            { label: 'Sub Test', icon: 'FileDownloadLine', intent: 'success' },
            { label: 'Sub Test 2', icon: 'FileDownloadLine' },
          ],
        },
      ]}
      {...args}
    >
      {args.children || message}
    </ReqorePanel>
  );
};

export const Basic: Story = {
  render: Template,
  args: {
    customTheme: { main: '#333' },
  },
};

export const NoPadding: Story = {
  render: Template,

  args: {
    padded: false,
  },
};

export const Flat: Story = {
  render: Template,

  args: {
    flat: true,
  },
};

export const NoBars: Story = {
  render: Template,

  args: {
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
  },
};

export const Transparent: Story = {
  render: Template,

  args: {
    transparent: true,
  },
};

export const Intent: Story = {
  render: Template,

  args: {
    intent: 'success',
    iconColor: 'success:lighten:2',
    transparent: true,
    flat: true,
  },
};

export const Minimal: Story = {
  render: Template,

  args: {
    minimal: true,
    flat: true,
  },
};

export const MinimalCollapsed: Story = {
  render: Template,

  args: {
    minimal: true,
    flat: true,
    isCollapsed: true,
  },
};

export const MinimalOnlyContent: Story = {
  render: Template,

  args: {
    label: undefined,
    badge: undefined,
    icon: undefined,
    minimal: true,
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
  },
};

export const MinimalOnlyTopBar: Story = {
  render: Template,

  args: {
    label: undefined,
    badge: undefined,
    icon: undefined,
    minimal: true,
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
  },
};

export const MinimalOnlyBottomBar: Story = {
  render: Template,

  args: {
    label: undefined,
    badge: undefined,
    icon: undefined,
    minimal: true,
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
    collapsible: false,
  },
};

export const MinimalWithIntent: Story = {
  render: Template,

  args: {
    minimal: true,
    flat: true,
    intent: 'info',
    transparent: true,
  },
};

export const WithOpacity: Story = {
  render: Template,

  args: {
    opacity: 0.5,
  },
};

export const Disabled: Story = {
  render: Template,

  args: {
    disabled: true,
  },
};

export const NonResponsiveActions: Story = {
  render: Template,

  args: {
    responsiveActions: false,
    label:
      'This is a really long title that should stretch all the way to the right of the panel, all the way to the end and not end in the middle',
    badge: undefined,
    actions: [
      {
        fluid: false,
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
        fluid: false,
        group: [
          { label: 'Stacked Action 1', icon: 'BallPenLine', intent: 'warning' },
          { icon: 'CopperCoinFill', intent: 'danger' },
        ],
      },
    ],
  },
};

export const ActionsShownOnHover: Story = {
  render: Template,

  args: {
    style: { minWidth: 400, maxWidth: 600 },
    label: 'This is a simple test to',
    collapsible: false,
    responsiveActions: false,
    actions: [{ label: 'test', show: 'hover' }],
    children: 'This is a panel',
    bottomActions: [
      {
        position: 'right',
        show: 'hover',
        fluid: false,
        group: [
          { label: 'test 2', show: true },
          { label: 'test 3', show: true },
        ],
      },
    ],
  },
};

export const ActionsShownOnlyWhenExpanded: Story = {
  render: (args) => (
    <ReqoreControlGroup verticalAlign='flex-start'>
      <ReqorePanel {...args} isCollapsed fluid />
      <ReqorePanel {...args} fluid />
    </ReqoreControlGroup>
  ),

  args: {
    collapsible: true,
    showActionsWhenCollapsed: false,
    actions: [{ label: 'test' }],
    children: 'This is a panel',
    bottomActions: [
      {
        position: 'right',
        fluid: false,
        group: [
          { label: 'test 2', show: true },
          { label: 'test 3', show: true },
        ],
      },
    ],
  },
};

export const TransparentFlat: Story = {
  render: Template,

  args: {
    transparent: true,
    flat: true,
  },
};

export const Fluid: Story = {
  render: Template,

  args: {
    fluid: true,
  },
};

export const Size: Story = {
  render: Template,

  args: {
    size: 'small',
  },
};

export const NoActions: Story = {
  render: Template,

  args: {
    collapsible: false,
    actions: [],
    label:
      'This is a really long title that should stretch all the way to the right of the panel, all the way to the end and not end in the middle',
  },
};

export const NoLabel: Story = {
  render: Template,

  args: {
    collapsible: false,
    actions: [
      {
        responsive: false,
        group: [
          { label: 'Stacked Action 1', icon: 'BallPenLine', intent: 'warning' },
          { icon: 'CopperCoinFill', intent: 'danger' },
        ],
      },
    ],
    label: undefined,
    icon: undefined,
    badge: undefined,
  },
};

export const ImageAsIconLinkAsHeader: Story = {
  render: Template,

  args: {
    iconImage:
      'https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4',
    iconProps: {
      size: '30px',
    },
    headerProps: {
      as: 'a',
      href: 'https://qoretechnologies.com',
      target: '_blank',
    } as React.HTMLAttributes<HTMLAnchorElement>,
  },
};

export const ContentSize: Story = {
  render: Template,

  args: {
    contentSize: 'big',
  },
};

export const WithBreadcrumbs: Story = {
  render: Template,

  args: {
    breadcrumbs: {
      items: [
        {
          label: 'Home',
          icon: 'HomeLine',
        },
        {
          label: 'Panel Item',
          icon: 'GitRepositoryCommitsLine',
        },
      ],
    },
  },
};

export const WithBreadcrumbsAndTabs: Story = {
  render: Template,

  args: {
    breadcrumbs: {
      items: [
        {
          label: 'Home',
          icon: 'HomeLine',
        },
        {
          label: 'Panel Item',
          icon: 'GitRepositoryCommitsLine',
        },
        {
          withTabs: {
            activeTab: 'tab1',
            onTabChange: noop,
            tabs: [
              {
                label: 'Tab 1',
                active: true,
                id: 'tab1',
              },
              {
                label: 'Tab 2',
                id: 'tab2',
              },
            ],
          },
        },
      ],
    },
  },
};

export const WithEffect: Story = {
  render: Template,

  args: {
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
  },
};

export const Resizable: Story = {
  render: Template,

  args: {
    resizable: {
      minWidth: 400,
      maxWidth: 600,
      defaultSize: { width: 400, height: '100%' },
      enable: { right: true },
    },
  },
};

export const EditableLabel: Story = {
  render: Template,

  args: {
    onLabelEdit: (label) => console.log(label),
    badge: undefined,
  },
  play: async ({ canvasElement }) => {
    await fireEvent.click(canvasElement.querySelector('.reqore-label-editor'));
  },
};

export const Loading: Story = {
  render: Template,

  args: {
    loading: true,
  },
};
