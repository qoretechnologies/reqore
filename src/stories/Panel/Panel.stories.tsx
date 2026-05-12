import { StoryFn, StoryObj } from '@storybook/react';
import { fireEvent } from '@storybook/testing-library';
import { noop } from 'lodash';
import ReqoreControlGroup from '../../components/ControlGroup';
import ReqoreInput, { IReqoreInputProps } from '../../components/Input';
import { IReqorePanelAction, IReqorePanelProps, ReqorePanel } from '../../components/Panel';
import { ReqoreHorizontalSpacer, ReqoreVerticalSpacer } from '../../components/Spacer';
import ReqoreTag from '../../components/Tag';
import { IReqoreIconName } from '../../types/icons';
import { StoryMeta } from '../utils';
import {
  ALL_SIZES,
  FlatArg,
  IconArg,
  IntentArg,
  RadiusSizeArg,
  SizeArg,
  argManager,
} from '../utils/args';

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
    ...RadiusSizeArg,
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
    ...createArg('labelSize', {
      type: 'string',
      defaultValue: undefined,
      name: 'Label Size',
      description: 'The size of the label',
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
                as: ReqoreTag,
                show: 'hover',
                props: {
                  className: 'my-custom-className',
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
          as: ReqoreHorizontalSpacer,
          props: {
            width: 5,
            height: '80%',
            lineSize: 'tiny',
          },
        },
        {
          label: 'More actions',
          actions: [
            { label: 'Sub Test', icon: 'FileDownloadLine' },
            { label: 'Sub Test 2', icon: 'FileDownloadLine', intent: 'success' },
            { label: 'Sub Test 3', icon: 'FileDownloadLine', intent: 'danger', show: false },
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

export const HugePadding: Story = {
  render: Template,

  args: {
    padded: 'massive',
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
    description:
      'Hover over this panel to see actions on the right side of the header and the bottom bar, this is a very long description that should be wrapped and not overflow, but it should be long enough to test the wrapping',
    size: 'small',
    minimal: true,
    responsiveActions: false,
    actions: [{ label: 'test', show: 'hover', icon: '24HoursFill' }],
    children: 'This is a panel',
    bottomActions: [
      {
        position: 'right',
        show: 'hover',
        fluid: false,
        group: [
          { label: 'test 2', show: true, icon: '24HoursFill' },
          { label: 'test 3', show: true },
        ],
      },
    ],
  },
};

export const FloatingActions: Story = {
  render: Template,
  parameters: {
    chromatic: {
      disable: true,
    },
  },

  args: {
    style: { minWidth: 400, maxWidth: 600, marginTop: 50 },
    label: 'Panel with floating actions',
    customTheme: { main: '#0b3c5d' },
    collapsible: false,
    size: 'small',
    floatingActions: true,
    actions: [
      { label: 'Always visible' },
      { label: 'Edit', icon: 'EditLine', show: 'hover' },
      { label: 'Delete', icon: 'DeleteBinLine', show: 'hover', intent: 'danger' },
    ],
    children: 'Hover over this panel to see floating actions above it',
  },
};

export const FloatingActionsInScrollableContainer: Story = {
  render: (args) => (
    <div style={{ height: 300, overflow: 'auto', border: '1px solid #333', padding: 20 }}>
      <ReqoreControlGroup vertical gapSize='big' style={{ paddingTop: 50 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <ReqorePanel
            key={i}
            fluid
            {...args}
            label={`Panel ${i + 1}`}
            floatingActions
            actions={[
              { label: 'Visible', icon: 'Settings3Line' },
              { label: 'Edit', icon: 'EditLine', show: 'hover' },
              { label: 'Delete', icon: 'DeleteBinLine', show: 'hover', intent: 'danger' },
            ]}
          >
            Content for panel {i + 1}
          </ReqorePanel>
        ))}
      </ReqoreControlGroup>
    </div>
  ),

  parameters: {
    chromatic: {
      disable: true,
    },
  },

  args: {
    size: 'small',
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
    wrapperPadding: 'none',
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
    labelProps: {
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

export const WithTooltip: Story = {
  render: Template,

  args: {
    tooltip: 'I am a panel with tooltip',
  },
  play: async ({ canvasElement }) => {
    await fireEvent.mouseEnter(canvasElement.querySelector('.reqore-panel'));
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
    labelEffect: {
      gradient: {
        type: 'linear',
        colors: { 0: '#3b065e', 100: '#00d3c8' },
        direction: 'to right bottom',
      },
      uppercase: true,
      weight: 'normal',
      spaced: 2,
    },
    labelSize: 2,
  },
};

export const Resizable: Story = {
  render: Template,

  args: {
    isCollapsed: true,
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

export const Skeleton: Story = {
  render: Template,

  args: {
    skeleton: true,
  },
};

export const CollapsedSkeleton: Story = {
  render: Template,

  args: {
    isCollapsed: true,
    skeleton: true,
  },
};

export const WithDescription: Story = {
  render: Template,

  args: {
    description: 'This is a description',
  },
};

export const WithLongDescription: Story = {
  render: Template,

  args: {
    minimal: true,
    descriptionIntent: 'info',
    descriptionEffect: {
      uppercase: true,
      textSize: 'small',
    },
    description:
      'This is a very long description that should be wrapped and not overflow, but it should be long enough to test the wrapping',
  },
};

export const StickyHeaderOutsideScroll: Story = {
  parameters: {
    chromatic: {
      viewports: [600],
    },
  },
  render: () => {
    const panels = new Array(6).fill(null);

    return (
      <div
        style={{
          maxHeight: '600px',
          width: '600px',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
        data-testid='sticky-scroll-container'
      >
        {panels.map((_, index) => (
          <ReqorePanel
            key={index}
            label={`Sticky panel ${index + 1}`}
            stickyHeader
            icon='PushpinLine'
            padded
            fluid
          >
            {message}
          </ReqorePanel>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const container = canvasElement.querySelector('[data-testid="sticky-scroll-container"]');

    if (!container) {
      return;
    }

    container.scrollTop = 960;
    fireEvent.scroll(container);
    await new Promise((resolve) => setTimeout(resolve, 200));
  },
};

export const Raised: Story = {
  args: {
    label: 'Raised panel',
    children: 'Subtle inset highlight on top + inset shadow on bottom — best paired with `flat`.',
    flat: true,
    raised: true,
    padded: true,
  },
};

const ICON_LAYOUT_SIZES: IReqorePanelProps['size'][] = ['tiny', 'small', 'normal', 'big', 'huge'];

const renderIconLayoutMatrix = (
  variantArgs: Partial<IReqorePanelProps>,
  variantLabel: string
): StoryFn<IReqorePanelProps> => {
  return (args: IReqorePanelProps) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {ICON_LAYOUT_SIZES.map((size) => (
        <ReqorePanel
          key={size}
          {...args}
          {...variantArgs}
          size={size}
          icon='AlertLine'
          label={`${variantLabel} · size=${size}`}
          description='Unusual patterns we have noticed in your automation'
          minimal
          collapsible={false}
        />
      ))}
    </div>
  );
};

export const IconWithLabel: Story = {
  render: renderIconLayoutMatrix({ iconWithLabel: true }, 'iconWithLabel'),
};

export const IconAlignTop: Story = {
  render: renderIconLayoutMatrix({ iconVerticalAlign: 'top' }, "iconVerticalAlign='top'"),
};

export const IconAlignCenter: Story = {
  render: renderIconLayoutMatrix(
    { iconVerticalAlign: 'center' },
    "iconVerticalAlign='center' (default)"
  ),
};

export const IconAlignBottom: Story = {
  render: renderIconLayoutMatrix({ iconVerticalAlign: 'bottom' }, "iconVerticalAlign='bottom'"),
};

export const RadiusSize: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {ALL_SIZES.map((radiusSize) => (
        <ReqorePanel
          key={radiusSize}
          label={`radiusSize="${radiusSize}"`}
          icon='LayoutLine'
          size='normal'
          radiusSize={radiusSize}
          padded
          collapsible={false}
        >
          Corner roundness scales independently from the panel size.
        </ReqorePanel>
      ))}
    </div>
  ),
};

export const MultipleGradients: Story = {
  render: () => (
    <ReqorePanel
      label='Layered content gradient'
      icon='PaintBrushLine'
      size='big'
      radiusSize='huge'
      padded
      minimal
      collapsible={false}
      contentEffect={{
        gradient: [
          // Small blue sphere whose right edge leaks in from the left
          {
            type: 'radial',
            shape: 'circle',
            size: '320px',
            direction: 'at -30% 0%',
            colors: {
              0: '#0066ff:darken:1:0.95',
              60: '#0066ff:darken:1:0.35',
              100: '#0066ff:darken:1:0',
            },
          },
          // Small magenta sphere leaking in from the right
          {
            type: 'radial',
            shape: 'circle',
            size: '320px',
            direction: 'at 100% 250%',
            colors: {
              0: '#ff3da6:darken:1:0.95',
              60: '#ff3da6:darken:1:0.35',
              100: '#ff3da6:darken:1:0',
            },
          },
          // Linear gradient base — purple-ish middle to dark edges
          {
            type: 'linear',
            direction: 'to right',
            colors: {
              0: '#15151c',
              50: '#241a2b',
              100: '#15151c',
            },
          },
        ],
      }}
    >
      contentEffect.gradient accepts an array — each entry stacks as a CSS background-image layer in
      order. Border-image / readable-text / animation behaviour is driven by the first entry.
    </ReqorePanel>
  ),
};
