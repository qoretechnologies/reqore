import { StoryFn, StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import { expect, fireEvent, waitFor } from 'storybook/test';
import ReqoreControlGroup from '../../components/ControlGroup';
import ReqoreInput, { IReqoreInputProps } from '../../components/Input';
import { IReqorePanelAction, IReqorePanelProps, ReqorePanel } from '../../components/Panel';
import { ReqoreP } from '../../components/Paragraph';
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
  title: 'Layout/Panel',
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
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel in its default configuration.',
      },
    },
  },
  render: Template,
  args: {
    customTheme: { main: '#333' },
  },
};

export const NoPadding: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel without padding.',
      },
    },
  },
  render: Template,

  args: {
    padded: false,
  },
};

export const HugePadding: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with a huge padding size.',
      },
    },
  },
  render: Template,

  args: {
    padded: 'massive',
  },
};

export const Flat: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel in its flat variant.',
      },
    },
  },
  render: Template,

  args: {
    flat: true,
  },
};

export const NoBars: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel without the bars visible.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with a transparent background.',
      },
    },
  },
  render: Template,

  args: {
    transparent: true,
  },
};

export const Intent: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel at a specific intent.',
      },
    },
  },
  render: Template,

  args: {
    intent: 'success',
    iconColor: 'success:lighten:2',
    transparent: true,
    flat: true,
  },
};

export const Minimal: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel in its minimal variant.',
      },
    },
  },
  render: Template,

  args: {
    minimal: true,
    flat: true,
  },
};

export const MinimalCollapsed: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel in the minimal collapsed variant.',
      },
    },
  },
  render: Template,

  args: {
    minimal: true,
    flat: true,
    isCollapsed: true,
  },
};

export const MinimalOnlyContent: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with only the content region visible.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with only the top bar visible.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with only the bottom bar visible.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel in the minimal variant with an intent applied.',
      },
    },
  },
  render: Template,

  args: {
    minimal: true,
    flat: true,
    intent: 'info',
    transparent: true,
  },
};

export const AccentStrip: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders panels with the accent strip instead of a full intent border — the intent paints a single edge (left or top) while the border stays neutral (or disappears on flat panels). The quiet "severity rail" look for accordions and stacked sections. Every strip uses the default 5px width except the explicitly-labelled accentSize comparison row.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical fluid gapSize='big'>
      {/* Every intent, identical panels — the strips must all render the same width */}
      <ReqorePanel
        label='Danger — flat + minimal (the accordion look)'
        icon='PlugLine'
        intent='danger'
        accentPosition='left'
        collapsible
        minimal
        flat
        size='small'
        badge={2}
      >
        A blocked prerequisite: the strip carries the severity, the border stays out of the way.
      </ReqorePanel>
      <ReqorePanel
        label='Warning — flat + minimal'
        icon='Settings3Line'
        intent='warning'
        accentPosition='left'
        collapsible
        minimal
        flat
        size='small'
        badge={3}
      >
        Attention wanted, nothing broken.
      </ReqorePanel>
      <ReqorePanel
        label='Info — flat + minimal'
        intent='info'
        accentPosition='left'
        collapsible
        minimal
        flat
        size='small'
      >
        Same default 5px strip as every other intent.
      </ReqorePanel>
      <ReqorePanel
        label='Success — flat + minimal'
        intent='success'
        accentPosition='left'
        collapsible
        minimal
        flat
        size='small'
      >
        Done and healthy.
      </ReqorePanel>
      <ReqorePanel
        label='Pending — flat + minimal'
        intent='pending'
        accentPosition='left'
        collapsible
        minimal
        flat
        size='small'
      >
        Waiting on something.
      </ReqorePanel>
      <ReqorePanel
        label='Muted — flat + minimal'
        intent='muted'
        accentPosition='left'
        collapsible
        minimal
        flat
        size='small'
      >
        De-emphasized but still railed.
      </ReqorePanel>
      <ReqorePanel label='No intent' accentPosition='left' size='small'>
        Without an intent the strip renders as a neutral highlight — same default 5px width.
      </ReqorePanel>

      {/* States: collapsed + disabled */}
      <ReqorePanel
        label='Collapsed — the strip spans just the header'
        icon='PlugLine'
        intent='danger'
        accentPosition='left'
        collapsible
        isCollapsed
        minimal
        flat
        size='small'
        badge={2}
      >
        Hidden while collapsed.
      </ReqorePanel>
      <ReqorePanel
        label='Collapsed — top accent'
        intent='warning'
        accentPosition='top'
        collapsible
        isCollapsed
        minimal
        flat
        size='small'
      >
        Hidden while collapsed.
      </ReqorePanel>
      <ReqorePanel
        label='Disabled — the strip dims with the panel'
        icon='ForbidLine'
        intent='warning'
        accentPosition='left'
        disabled
        minimal
        flat
        size='small'
      >
        Not interactive right now.
      </ReqorePanel>

      {/* Panel sizes — the strip width stays constant while the panel scales */}
      <ReqorePanel
        label='Small panel'
        intent='info'
        accentPosition='left'
        minimal
        flat
        size='small'
      >
        size=&quot;small&quot;, default 5px strip.
      </ReqorePanel>
      <ReqorePanel label='Normal panel' intent='info' accentPosition='left' minimal flat>
        size=&quot;normal&quot;, default 5px strip.
      </ReqorePanel>
      <ReqorePanel label='Big panel' intent='info' accentPosition='left' minimal flat size='big'>
        size=&quot;big&quot;, default 5px strip.
      </ReqorePanel>

      {/* accentSize — the ONLY panels with a non-default strip width, labelled as such */}
      <ReqorePanel
        label='accentSize={3} — thinner strip'
        intent='info'
        accentPosition='left'
        accentSize={3}
        minimal
        flat
        size='small'
      >
        Explicit 3px.
      </ReqorePanel>
      <ReqorePanel
        label='accentSize={8} — thicker strip'
        intent='info'
        accentPosition='left'
        accentSize={8}
        minimal
        flat
        size='small'
      >
        Explicit 8px.
      </ReqorePanel>
      <ReqorePanel
        label="accentSize='big' — TSizes name"
        intent='info'
        accentPosition='left'
        accentSize='big'
        minimal
        flat
        size='small'
      >
        String sizes resolve through ACCENT_SIZE_TO_PX — &apos;big&apos; is 7px, &apos;normal&apos;
        equals the 5px default.
      </ReqorePanel>

      {/* Bordered (flat unset) and the top flavor */}
      <ReqorePanel label='Bordered panel' intent='info' accentPosition='left' size='small'>
        With `flat` unset the panel keeps a neutral border; the intent lives only in the strip.
      </ReqorePanel>
      <ReqorePanel label='Top accent — success' intent='success' accentPosition='top' size='small'>
        The `top` flavor, mirroring ReqoreCallout&apos;s `accentPosition`.
      </ReqorePanel>
    </ReqoreControlGroup>
  ),
};

export const AccentStripStates: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The accent-strip combinations the main AccentStrip story does not reach, each of ' +
          'which used to render wrong. A clickable panel: hover must leave the border neutral, ' +
          'because the intent belongs to the strip alone. `raised`: it applies on an accent ' +
          'panel, which draws no border for the highlight to compete with, and is still ' +
          'suppressed once a border is present. `stickyHeader`: it forces the wrapper to stop ' +
          'clipping, so the strip rounds its own corners instead of poking out past the panel.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical fluid gapSize='big'>
      {/* Interactive — the hover border must stay neutral, never the intent */}
      <ReqorePanel
        label='Clickable — hover keeps the border neutral'
        icon='PlugLine'
        intent='danger'
        accentPosition='left'
        onClick={noop}
        size='small'
      >
        `onClick` makes the panel interactive. Hovering derives the border from the neutral
        surface, never from the intent — the strip carries the severity on its own.
      </ReqorePanel>
      <ReqorePanel
        label='Clickable + flat — no border to tint at all'
        icon='Settings3Line'
        intent='warning'
        accentPosition='left'
        onClick={noop}
        minimal
        flat
        size='small'
      >
        A flat accent panel draws no border, so hover has nothing to repaint.
      </ReqorePanel>

      {/* raised — gated on "no border is drawn", which an accent panel satisfies */}
      <ReqorePanel
        label='Raised + flat — the inset highlight applies'
        intent='info'
        accentPosition='left'
        flat
        raised
        size='small'
      >
        With `accentPosition` the panel has no border, so `raised` is free to add its subtle 3D
        inset highlight.
      </ReqorePanel>
      <ReqorePanel
        label='Raised + bordered — highlight suppressed'
        intent='info'
        accentPosition='left'
        raised
        size='small'
      >
        A visible border already defines the surface, so `raised` stays out of the way.
      </ReqorePanel>

      {/* stickyHeader — wrapper overflow goes visible, so the strip must round itself */}
      <div style={{ height: '160px', overflow: 'auto' }}>
        <ReqorePanel
          label='Sticky header — the strip keeps the panel corners'
          icon='PushpinLine'
          intent='success'
          accentPosition='left'
          stickyHeader
          size='small'
        >
          <ReqoreP>Scroll this panel: the header pins to the top of its container.</ReqoreP>
          <ReqoreP>
            A sticky header forces the wrapper to `overflow: visible` so the header can escape,
            which also stops the wrapper clipping the accent strip.
          </ReqoreP>
          <ReqoreP>
            The strip therefore carries its own corner radius here — inset by the border width so
            it lands on the wrapper&apos;s inner curve — instead of showing square corners poking
            out past the panel.
          </ReqoreP>
          <ReqoreP>
            The header stays pinned while these lines scroll underneath it, which is the whole
            reason the wrapper cannot clip its own children here.
          </ReqoreP>
          <ReqoreP>More content, so there is genuinely something to scroll.</ReqoreP>
          <ReqoreP>Still more, to push the panel well past its container height.</ReqoreP>
          <ReqoreP>And more again.</ReqoreP>
          <ReqoreP>Nearly there.</ReqoreP>
          <ReqoreP>The last line — by now the header has been pinned for a while.</ReqoreP>
        </ReqorePanel>
      </div>
    </ReqoreControlGroup>
  ),
};

export const WithOpacity: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with reduced opacity applied.',
      },
    },
  },
  render: Template,

  args: {
    opacity: 0.5,
  },
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel in its disabled state.',
      },
    },
  },
  render: Template,

  args: {
    disabled: true,
  },
};

export const NonResponsiveActions: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with actions rendered in a non-responsive layout.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with row actions that appear only on hover.',
      },
    },
  },
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
    docs: {
      description: {
        story: 'Renders Panel with floating actions shown next to the row.',
      },
    },
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
    docs: {
      description: {
        story: 'Renders Panel with floating actions inside a scrollable container.',
      },
    },
    chromatic: {
      disable: true,
    },
  },

  args: {
    size: 'small',
  },
};

export const ActionsShownOnlyWhenExpanded: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with actions that appear only when the row is expanded.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with both transparent and flat set.',
      },
    },
  },
  render: Template,

  args: {
    transparent: true,
    flat: true,
    wrapperPadding: 'none',
  },
};

export const Fluid: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with fluid set so it fills the available horizontal space.',
      },
    },
  },
  render: Template,

  args: {
    fluid: true,
  },
};

export const Size: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel at a specific size.',
      },
    },
  },
  render: Template,

  args: {
    size: 'small',
  },
};

export const NoActions: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel without action buttons.',
      },
    },
  },
  render: Template,

  args: {
    collapsible: false,
    actions: [],
    label:
      'This is a really long title that should stretch all the way to the right of the panel, all the way to the end and not end in the middle',
  },
};

export const NoLabel: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel without a label.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel using an image as the icon and a link as the header.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel sized to its content.',
      },
    },
  },
  render: Template,

  args: {
    contentSize: 'big',
  },
};

export const WithTooltip: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with a tooltip attached.',
      },
    },
  },
  render: Template,

  args: {
    tooltip: 'I am a panel with tooltip',
  },
  play: async ({ canvasElement }) => {
    await fireEvent.mouseEnter(canvasElement.querySelector('.reqore-panel'));
  },
};

export const WithBreadcrumbs: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with breadcrumbs mounted.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with both breadcrumbs and tabs mounted.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with a visual effect applied.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel in a resizable configuration.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with an editable label.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel in its loading state.',
      },
    },
  },
  render: Template,

  args: {
    loading: true,
  },
};

export const Skeleton: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel in its skeleton loading state.',
      },
    },
  },
  render: Template,

  args: {
    skeleton: true,
  },
};

export const CollapsedSkeleton: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel in its collapsed skeleton loading state.',
      },
    },
  },
  render: Template,

  args: {
    isCollapsed: true,
    skeleton: true,
  },
};

export const WithDescription: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with a description under the label.',
      },
    },
  },
  render: Template,

  args: {
    description: 'This is a description',
  },
};

export const WithLongDescription: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with a long description that exercises wrapping.',
      },
    },
  },
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

// Shared render for the two sticky-outside-scroll stories: stacked sticky-header
// panels in an outer scroll container. One story scrolls it (headers pinned →
// square corners), the other leaves it at rest (headers rounded) — so the two
// radius states are covered by reusing the exact same content.
const renderStickyOutsideScroll = () => (
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
    {new Array(6).fill(null).map((_, index) => (
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

export const StickyHeaderOutsideScroll: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Panel with a sticky header that stays visible outside the scroll region. Scrolled in the play, so a header is pinned (stuck) — its top corners go square while it moves with the scroll.',
      },
    },
    chromatic: {
      viewports: [600],
    },
  },
  render: renderStickyOutsideScroll,
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

// Same content as StickyHeaderOutsideScroll, but at rest (no scroll) — the
// headers sit un-pinned so their top corners stay rounded. The counterpart to
// the scrolled, stuck-and-square StickyHeaderOutsideScroll; together they cover
// both radius states. Scroll it by hand to watch a header go square as it pins.
export const StickyHeaderOutsideScrollAtRest: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same stacked sticky-header panels as StickyHeaderOutsideScroll, but at rest (no scroll). Each header keeps its rounded top corners; scroll the container by hand to watch them go square once a header pins.',
      },
    },
    chromatic: {
      viewports: [600],
    },
  },
  render: renderStickyOutsideScroll,
};

export const Raised: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with the raised effect.',
      },
    },
  },
  args: {
    label: 'Raised panel',
    children: 'Subtle inset highlight on top + inset shadow on bottom — best paired with `flat`.',
    flat: true,
    raised: true,
    padded: true,
  },
};

// `stickyHeader` + `minimal` / `transparent` previously left the header without any surface,
// so scrolling content slid straight under the label and made it unreadable. The header now
// auto-applies a backdrop blur in that combination — static appearance is unchanged, but
// scrolling content beneath is softened enough for the title to stay legible.
export const StickyHeaderTransparentBlur: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with a sticky, transparent, blurred header.',
      },
    },
    chromatic: {
      viewports: [600],
    },
  },
  render: () => {
    const panels = new Array(5).fill(null);

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
        data-testid='sticky-minimal-scroll-container'
      >
        {panels.map((_, index) => (
          <ReqorePanel
            key={index}
            label={`Minimal sticky panel ${index + 1}`}
            stickyHeader
            minimal
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
    const container = canvasElement.querySelector(
      '[data-testid="sticky-minimal-scroll-container"]'
    );

    if (!container) {
      return;
    }

    container.scrollTop = 720;
    fireEvent.scroll(container);
    await new Promise((resolve) => setTimeout(resolve, 200));
  },
};

export const RaisedMinimalFlat: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel in the raised + minimal + flat variant combination.',
      },
    },
  },
  args: {
    label: 'Raised panel',
    children: 'Subtle inset highlight on top + inset shadow on bottom — best paired with `flat`.',
    flat: true,
    raised: true,
    minimal: true,
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
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with an icon paired with a label.',
      },
    },
  },
  render: renderIconLayoutMatrix({ iconWithLabel: true }, 'iconWithLabel'),
};

export const IconAlignTop: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with the icon aligned to the top.',
      },
    },
  },
  render: renderIconLayoutMatrix({ iconVerticalAlign: 'top' }, "iconVerticalAlign='top'"),
};

export const IconAlignCenter: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with the icon aligned to the middle.',
      },
    },
  },
  render: renderIconLayoutMatrix(
    { iconVerticalAlign: 'center' },
    "iconVerticalAlign='center' (default)"
  ),
};

export const IconAlignBottom: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with the icon aligned to the bottom.',
      },
    },
  },
  render: renderIconLayoutMatrix({ iconVerticalAlign: 'bottom' }, "iconVerticalAlign='bottom'"),
};

export const RadiusSize: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel at every radius size to show the border-radius scale.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: 'Renders Panel with layered gradient effects.',
      },
    },
  },
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

/**
 * A `show: 'hover'` action is a desktop nicety, never the only route to the
 * action: the hover-hiding rule is gated on the pointer actually being able to
 * hover, so on a touch device the action stays visible instead of being
 * `display: none` with nothing on screen hinting it exists.
 */
export const HoverActionReachableWithoutHover: Story = {
  args: {
    label: 'Hover-gated action',
    actions: [{ label: 'Edit', icon: 'EditLine', show: 'hover', className: 'hover-gated-action' }],
    children: 'The Edit action hides until hover — but only where hover exists.',
  },
  parameters: {
    // No snapshot: the whole point of the story is that the action is HIDDEN at
    // rest on a hovering pointer, so the capture is a plain panel with nothing
    // to review — noise on the dashboard. The play test below is the real
    // coverage and still runs in CI; only the screenshot is skipped.
    // (Requested by Foxhoundn on qlip build #174.)
    qlip: { skip: true },
    docs: {
      description: {
        story:
          "Renders a panel whose Edit action is declared `show: 'hover'`. On a hovering pointer it is hidden at rest; the hover-hiding rule is wrapped in a `(hover: hover) and (pointer: fine)` query, so a touch device renders it visible rather than unreachable.",
      },
    },
  },
  play: async () => {
    const action = await waitFor(() => {
      const el = document.querySelector('.hover-gated-action') as HTMLElement;
      expect(el).toBeTruthy();
      return el;
    });

    // Desktop (this runner hovers): still hidden at rest. Guards the query from
    // being inverted or mistyped — a broken gate shows the action here.
    expect(getComputedStyle(action).display).toBe('none');

    // And the rule that hides it is inside the capability query, which is what
    // keeps it visible on touch. Asserted from the stylesheet because a
    // hovering runner cannot emulate a coarse pointer.
    const gated = Array.from(document.styleSheets).some((sheet) => {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        return false;
      }
      return Array.from(rules).some(
        (rule) =>
          rule instanceof CSSMediaRule &&
          rule.conditionText.includes('hover') &&
          rule.cssText.includes('reqore-panel-action-hidden')
      );
    });
    expect(gated).toBe(true);
  },
};
