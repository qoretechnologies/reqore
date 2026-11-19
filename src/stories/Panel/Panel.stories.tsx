import { StoryFn, StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import { Profiler, useEffect, useState } from 'react';
import { expect, fireEvent, userEvent, waitFor } from 'storybook/test';
import ReqoreButton, { TReqoreBadge } from '../../components/Button';
import ReqoreControlGroup from '../../components/ControlGroup';
import { ReqoreH4 } from '../../components/Header';
import ReqoreInput, { IReqoreInputProps } from '../../components/Input';
import ReqoreSegmentedControl from '../../components/SegmentedControl';
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
import { expectDrawnRed, expectNotDrawnRed, openMenuItems } from '../utils/drawnRed';
import { requiredElement } from '../utils/required';
import { PHONE_STORY } from '../utils/touchScreen';
import { findDrawnOverStickyHeader, stickyHeaderOf } from '../utils/stickyStacking';
import {
  expectBadgesBesideTitle,
  expectBadgesUnderTitle,
  expectIconBesideTitle,
  expectTitleWhole,
} from '../utils/titleBadges';

import { ThemedSurfaceComparison } from '../utils/themedSurface';
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
      <ReqorePanel
        label='No intent — flat + minimal'
        accentPosition='left'
        collapsible
        minimal
        flat
        size='small'
      >
        Without an intent the strip renders as a neutral highlight. Styled exactly like the
        intent rows above so the widths are directly comparable — a bordered panel insets its
        strip by the border, which reads as a different width (see &quot;Bordered panel&quot;
        below).
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
      <div style={{ height: '160px', width: '460px', maxWidth: '100%', overflow: 'auto' }}>
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

/** What the story's widening action listens for: it widens its own label, and nothing of its panel changes. */
const WIDEN_FLOATING_ACTION_EVENT = 'reqore-story-widen-floating-action';

/** A floating action whose content widens by itself, as one does when its label, an icon or a font loads. */
const ActionThatWidensItself = ({ className, customTheme, fixed }: Partial<IReqorePanelAction>) => {
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const widen = () => setWide(true);
    window.addEventListener(WIDEN_FLOATING_ACTION_EVENT, widen);
    return () => window.removeEventListener(WIDEN_FLOATING_ACTION_EVENT, widen);
  }, []);

  return (
    <ReqoreButton className={className} customTheme={customTheme} fixed={fixed} icon='EditLine'>
      {wide ? 'Edit this panel and everything in it' : 'Edit'}
    </ReqoreButton>
  );
};

const FOLLOWING_PANEL_ACTIONS: IReqorePanelAction[] = [
  { label: 'Always visible' },
  { as: ActionThatWidensItself, show: 'hover' },
  { label: 'Delete', icon: 'DeleteBinLine', show: 'hover', intent: 'danger' },
];

const FOLLOWING_PANEL_FRAME_STYLE = { width: 640, marginTop: 60 };

export const FloatingActionsFollowTheirPanel: Story = {
  render: () => (
    <div className='floating-actions-follow-frame' style={FOLLOWING_PANEL_FRAME_STYLE}>
      <ReqorePanel
        fluid
        size='small'
        label='Panel whose actions follow it'
        floatingActions
        actions={FOLLOWING_PANEL_ACTIONS}
      >
        Its actions float above its top-right corner, and stay there as it narrows and as they
        widen.
      </ReqorePanel>
    </div>
  ),

  parameters: {
    docs: {
      description: {
        story:
          "Hovers a panel with floating actions, then narrows it and widens one of its actions, neither of which re-renders the panel: the actions follow its top-right corner each time, their right edge on the panel's. They are fixed to the screen, and were placed only as they were shown, when the actions changed and on a scroll, so a panel that resized or a window that did left them where the panel had been, and actions that widened reached past its edge.",
      },
    },
  },

  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector('.floating-actions-follow-frame') as HTMLElement;
    const panel = frame.querySelector('.reqore-panel') as HTMLElement;
    // portalled to the document's body, out of the canvas
    const floatingActions = () =>
      canvasElement.ownerDocument.querySelector(
        '.reqore-panel-floating-actions'
      ) as HTMLElement | null;
    const onThePanelsCorner = () => {
      const actions = floatingActions();
      expect(actions).not.toBeNull();
      expect(actions!.style.display).toBe('flex');
      const actionsRect = actions!.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      expect(Math.abs(actionsRect.right - panelRect.right)).toBeLessThanOrEqual(1);
      expect(Math.abs(actionsRect.bottom - (panelRect.top + 1))).toBeLessThanOrEqual(1);
    };

    await userEvent.hover(panel);
    await waitFor(onThePanelsCorner);

    // the panel narrows: its container does, and nothing of the panel re-renders
    frame.style.width = '420px';
    await waitFor(() => expect(panel.getBoundingClientRect().width).toBeLessThanOrEqual(420));
    await waitFor(onThePanelsCorner);

    // an action widens by itself
    window.dispatchEvent(new Event(WIDEN_FLOATING_ACTION_EVENT));
    await waitFor(() => expect(floatingActions()!.textContent).toContain('everything in it'));
    await waitFor(onThePanelsCorner);
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
const STICKY_DEMO_BODY_STYLE = { minHeight: 960 };

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
        // Tall enough to pin in the 600px area (more than 1.5 screens of it).
        contentStyle={STICKY_DEMO_BODY_STYLE}
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

// The host shape every other sticky story omits: a scroll container that carries
// its OWN padding. `position: sticky; top: 0` resolves against a scrollport's
// CONTENT box, so an uncompensated header parks below that padding and content
// scrolls through the gap. This is not exotic — StyledPanelContent puts padding
// and overflow on one element, so every default panel, drawer and modal body is
// this shape.
export const StickyHeaderInPaddedScrollport: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders sticky-header panels inside a scroll container whose own 24px padding is tinted so it is visible. Scrolled in the play — the pinned header covers the tinted band completely, sitting flush with the container’s visible top edge rather than below its padding, and its top corners are square while stuck.',
      },
    },
    chromatic: { viewports: [600] },
  },
  render: () => (
    // The scrollport's own 24px padding is given a contrasting background on
    // purpose: it is the thing under test. A pinned header must cover the top
    // band completely. If it pins low, that band shows as a stripe above the
    // header with content sliding through it — which is what the bug looked
    // like, and what a snapshot with no visible padding could never show.
    <div
      style={{
        height: 320,
        overflow: 'auto',
        padding: 24,
        background: '#7b341e',
        border: '1px solid #333',
      }}
      data-testid='padded-sticky-scrollport'
    >
      {new Array(6).fill(null).map((_, index) => (
        <ReqorePanel
          key={index}
          label={`Sticky panel ${index + 1}`}
          stickyHeader
          icon='PushpinLine'
          padded
          fluid
          // A FIXED body height, not text. Panel height decided by how the copy
          // happens to wrap is viewport-dependent, and the scroll offset that
          // lands inside the stuck window at one width falls outside it at
          // another — which is exactly how this story passed locally and failed
          // in CI.
          // Tall enough to pin: a header pins only while its panel is more than
          // STICKY_HEADER_TALL_SCREENS times the scrollport's visible height
          // (272px here), so a 160px body no longer pins at all.
          contentStyle={{ minHeight: 480 }}
        >
          {/* Sized deliberately: tall enough that a panel can scroll under its
              own header (so "stuck" is reachable and lasts), short enough that
              several panels share the scrollport (so the pin is visible). The
              full-length fixture made every panel taller than the container —
              one header, nothing to see; trimming it to one line went too far
              the other way and left almost nothing to scroll. */}
          Panel {index + 1}. This panel is tall enough to scroll beneath its own
          header, so the header is genuinely pinned rather than merely sitting at
          the top. Scroll and the header stays put until the next panel pushes it
          away. Padding around the scrollport is tinted so a low pin would show
          as a stripe above this header.
        </ReqorePanel>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const port = canvasElement.querySelector(
      '[data-testid="padded-sticky-scrollport"]'
    ) as HTMLElement;
    if (!port) return;

    // Target ONE panel and scroll until its own header must be pinned, instead
    // of scrolling a fixed distance and asserting on "whichever header is near
    // the top". The fixed-distance version clamped when the content was short,
    // left a header merely SITTING at the line rather than stuck, and passed or
    // failed on how the fixture happened to lay out.
    const panels = Array.from(port.querySelectorAll('.reqore-panel')) as HTMLElement[];
    await expect(panels.length).toBeGreaterThan(2);
    const target = panels[1];
    const offsetInScroller =
      target.getBoundingClientRect().top - port.getBoundingClientRect().top + port.scrollTop;
    // Scroll into the middle of the panel's STUCK WINDOW, derived rather than
    // guessed. The window opens once the panel's top passes the line by more
    // than the scrollport's padding (below that, a header pinning low is still
    // at its natural position and proves nothing) and closes when the panel's
    // bottom reaches the header and pushes it out. Measured here: 94px panel,
    // 40px header, 24px padding — stuck from 24 to 54, and a fixed
    // `offsetHeight / 2` sat at 47, one wrap away from the edge.
    const headerEl = target.querySelector('.reqore-panel-title') as HTMLElement;
    const pad = parseFloat(getComputedStyle(port).paddingTop) || 0;
    const windowOpens = pad;
    const windowCloses = target.offsetHeight - headerEl.offsetHeight;
    port.scrollTop = offsetInScroller + (windowOpens + windowCloses) / 2;
    fireEvent.scroll(port);

    await waitFor(async () => {
      const header = headerEl;
      // The line a sticky header must pin to: the scrollport's visible top edge.
      const line =
        port.getBoundingClientRect().top +
        (parseFloat(getComputedStyle(port).borderTopWidth) || 0);

      // TWO-SIDED on purpose. A one-sided `>= line` bound passes happily at
      // +24px, which is exactly the bug — and is how this shipped unnoticed.
      await expect(
        Math.abs(header.getBoundingClientRect().top - line)
      ).toBeLessThanOrEqual(1);

      // The stuck detector shares the defect: comparing against the bare border
      // box flips `isHeaderStuck` late by the same inset, so a pinned header
      // would keep its rounded corners across the whole gap.
      await expect(getComputedStyle(header).borderTopLeftRadius).toBe('0px');
    });
  },
};

const SHORT_AND_TALL_PANELS = [
  { label: 'Short panel', height: 120 },
  { label: 'Tall panel', height: 720 },
  { label: 'Another short panel', height: 120 },
];

export const StickyHeaderPinsOnlyWhenTall: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders three sticky-header panels in a 320px scroll area: a short one, a tall one and another short one. Scrolled into the tall panel, its header pins at the top; the short panels' headers never pin and scroll away with their panels, because a heading pins only while its panel is more than one and a half times the height its scroll area shows.",
      },
    },
    chromatic: { viewports: [600] },
  },
  render: () => (
    <div
      style={{ height: 320, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}
      data-testid='short-and-tall-scrollport'
    >
      {SHORT_AND_TALL_PANELS.map(({ label, height }) => (
        <ReqorePanel
          key={label}
          label={label}
          stickyHeader
          icon='PushpinLine'
          padded
          fluid
          contentStyle={{ minHeight: height }}
        >
          {label}
        </ReqorePanel>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const port = canvasElement.querySelector('[data-testid="short-and-tall-scrollport"]') as HTMLElement;
    const headers = Array.from(port.querySelectorAll<HTMLElement>('.reqore-panel-title'));
    await expect(headers).toHaveLength(SHORT_AND_TALL_PANELS.length);
    const [short, tall, anotherShort] = headers;
    await waitFor(() => expect(tall.getAttribute('data-pins-header')).toBe('true'));
    await expect(short.getAttribute('data-pins-header')).toBe('false');
    await expect(anotherShort.getAttribute('data-pins-header')).toBe('false');
    await expect(getComputedStyle(short).position).not.toBe('sticky');

    // Into the tall panel: its header holds the top of the scroll area.
    const tallPanel = tall.closest('.reqore-panel') as HTMLElement;
    port.scrollTop =
      tallPanel.getBoundingClientRect().top - port.getBoundingClientRect().top + port.scrollTop + 200;
    fireEvent.scroll(port);
    await waitFor(() =>
      expect(Math.abs(tall.getBoundingClientRect().top - port.getBoundingClientRect().top)).toBeLessThanOrEqual(1)
    );
  },
};

export const StickyHeaderAboveItsBody: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A panel with a sticky header, a label and a menu, whose body holds a row raised with a z-index of its ' +
          'own and a row pinned to its left side, as a table pins a column. Scrolled, each passes under the ' +
          'header, and the header with its label and its menu stays above both: the story ends scrolled with ' +
          'the raised row half under the header, which hides its top half.',
      },
    },
    chromatic: { viewports: [600] },
  },
  render: () => (
    <div data-testid='sticky-body-scroller' style={{ height: 320, width: 500, overflow: 'auto' }}>
      <ReqorePanel
        label='Sticky panel'
        icon='PushpinLine'
        stickyHeader
        padded
        fluid
        actions={[
          {
            label: 'Menu',
            icon: 'MenuLine',
            actions: [{ label: 'Refresh', icon: 'RefreshLine' }],
          },
        ]}
      >
        <ReqoreP>{message.slice(0, 400)}</ReqoreP>
        <ReqoreVerticalSpacer height={10} />
        <div
          data-testid='raised-row'
          style={{ position: 'relative', zIndex: 5, padding: 10, background: '#1d3557' }}
        >
          A row raised with a z-index of 5
        </div>
        <ReqoreVerticalSpacer height={10} />
        <div
          data-testid='pinned-row'
          style={{ position: 'sticky', left: 0, zIndex: 2, padding: 10, background: '#264653' }}
        >
          A row pinned to the left with a z-index of 2
        </div>
        <ReqoreVerticalSpacer height={10} />
        <ReqoreP>{message.slice(0, 1200)}</ReqoreP>
      </ReqorePanel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector<HTMLElement>('.reqore-panel');

    await expect(stickyHeaderOf(panel)).toHaveTextContent('Sticky panel');
    await expect(
      findDrawnOverStickyHeader(panel, canvasElement.querySelector('[data-testid="raised-row"]'))
    ).toEqual([]);
    await expect(
      findDrawnOverStickyHeader(panel, canvasElement.querySelector('[data-testid="pinned-row"]'))
    ).toEqual([]);

    // Left scrolled for the frame: the raised row's middle at the stuck header's bottom edge, its top half
    // under the header, and the header drawn over it there.
    const scroller = requiredElement(
      '[data-testid="sticky-body-scroller"]',
      'the scroller',
      canvasElement
    );
    const header = stickyHeaderOf(panel);
    const raised = requiredElement('[data-testid="raised-row"]', 'the raised row', canvasElement);
    scroller.scrollTop += raised.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    scroller.scrollTop +=
      raised.getBoundingClientRect().top +
      raised.getBoundingClientRect().height / 2 -
      header.getBoundingClientRect().bottom;
    await waitFor(() => {
      const stuck = header.getBoundingClientRect();
      const row = raised.getBoundingClientRect();
      expect(row.top).toBeLessThan(stuck.bottom - 4);
      expect(row.bottom).toBeGreaterThan(stuck.bottom + 4);
      // where the two overlap, what is drawn is the header
      const drawn = document.elementFromPoint(stuck.left + 40, (row.top + stuck.bottom) / 2);
      expect(drawn && header.contains(drawn)).toBe(true);
    });
  },
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
        story:
          "Renders minimal sticky-header panels tall enough to pin, scrolled so the first panel's transparent header is pinned at the top and blurs its own text scrolling beneath it.",
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
            // Tall enough to pin in the 600px area (more than 1.5 screens of it).
            contentStyle={STICKY_DEMO_BODY_STYLE}
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

    // Into the first panel's text, so the text runs under its pinned header.
    container.scrollTop = 160;
    fireEvent.scroll(container);
    // The first panel's header is pinned at the top, over its own text scrolling beneath it.
    const header = stickyHeaderOf(container.querySelector('.reqore-panel') as HTMLElement);
    await waitFor(() => {
      expect(header.getAttribute('data-pins-header')).toBe('true');
      expect(
        Math.abs(header.getBoundingClientRect().top - container.getBoundingClientRect().top)
      ).toBeLessThanOrEqual(1);
    });
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

/** A real sentence rather than a few words: a description that was never going to wrap tells you
 *  nothing about how the bar handles one, and the whole question here is what happens when the
 *  title and the text under it compete for the same column. Shared by all four columns so their
 *  heights compare. */
const PANEL_DESCRIPTION =
  'Share this Qog with your team and publish it to the marketplace so anyone can install it.';

export const FitLabelComparison: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The whole title cascade, engaged, at four widths. Left sets nothing at all: the action group takes a content-width basis but stays shrinkable, so it never claims the row's remainder and still folds into the `…` menu once the row is contended — and the title wraps to two lines before it shrinks, shrinks before it truncates, with the description clamped to two lines so it cannot run away underneath. Right adds the one thing still opt-in, `descriptionPosition='below'`, which gives the description a row of its own under the bar. A clamped description opens on click, without collapsing the panel.",
      },
    },
  },
  render: () => (
    <ReqoreControlGroup gapSize='big' verticalAlign='flex-start'>
      {[
        { title: 'Nothing set', below: false },
        { title: "descriptionPosition='below'", below: true },
      ].map((variant) => (
        <ReqoreControlGroup key={variant.title} vertical gapSize='normal' fixed>
          <ReqoreP style={{ margin: 0, opacity: 0.7 }}>{variant.title}</ReqoreP>
          {[440, 360, 300, 260].map((w) => (
            <div key={w} style={{ width: `${w}px` }}>
              <ReqorePanel
                {...(variant.below ? { descriptionPosition: 'below' as const } : {})}
                label='Publish this Qog to the Template Marketplace'
                description={PANEL_DESCRIPTION}
                icon='Upload2Line'
                collapsible
                onClose={noop}
                actions={[{ label: 'Preview', icon: 'EyeLine' }]}
              >
                {w}px
              </ReqorePanel>
            </div>
          ))}
        </ReqoreControlGroup>
      ))}
    </ReqoreControlGroup>
  ),
};

export const DescriptionExpandsOnClick: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A description cut by `descriptionMaxLines` opens on click so the whole of it can be read, and closes again on the next one — on a phone there is no hover to reveal it with. Captured AFTER the click, so the snapshot shows the open state. The panel is collapsible, and its content is still on screen underneath: the click that opens the description is stopped before it reaches the bar, because opening the text and folding the panel away in one gesture would be the worst of both. A description that fits in its lines is not interactive and a click on it still collapses the panel as it always did.",
      },
    },
  },
  render: () => (
    <div style={{ width: '300px' }}>
      <ReqorePanel
        label='Publish this Qog'
        description={`${PANEL_DESCRIPTION} Anyone in the organisation can then find it in the marketplace, preview the flow, and install it into their own instance with one click.`}
        icon='Upload2Line'
        collapsible
        actions={[{ label: 'Preview', icon: 'EyeLine' }]}
      >
        Content stays put when the description opens.
      </ReqorePanel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const description = canvasElement.querySelector<HTMLElement>(
      '.reqore-panel-title-description'
    );

    // Cut, and therefore interactive — the clamp is only worth a click when it hides text.
    await waitFor(() => expect(description.getAttribute('role')).toBe('button'));
    expect(description.scrollHeight).toBeGreaterThan(description.clientHeight);

    await fireEvent.click(description);

    await waitFor(() => expect(description.getAttribute('aria-expanded')).toBe('true'));
    // Open: the whole text is in the box, nothing left to scroll to.
    expect(description.scrollHeight).toBe(description.clientHeight);
    // And the panel did not collapse under it.
    expect(canvasElement.querySelector('.reqore-panel-content')).toBeVisible();
  },
};

export const CompactTitleWhenNarrow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "What a title bar gives up, in order, as its box shrinks — four widths of the same panel, then the opt-in last resort. 520px: everything fits, actions labelled, title at its natural 19px. 380px: the ACTION LABELS go first and the buttons keep their icons with the label moved to the tooltip — an action is a verb its icon already carries, while the title is the only thing naming what the panel is. 300px: the title WRAPS to a second line, which costs height but keeps every character at full size. 220px: only once two lines will not hold it does the title shrink toward a floor and then ellipsize. The fifth panel is `compactTitle`, for a bar too narrow to ellipsize into: the title gives up its space entirely and the icon stands in, with the label surviving as that icon's tooltip.",
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize="big" fluid>
      {[
        { w: 520, note: 'Everything fits: labelled actions, title at 19px.' },
        { w: 380, note: 'Action labels go first — icons keep them in tooltips.' },
        { w: 300, note: 'Title wraps to a second line — nothing is lost yet.' },
        { w: 220, note: 'Two lines no longer hold it: the title shrinks, then ellipsizes.' },
      ].map(({ w, note }) => (
        <div key={w} style={{ width: `${w}px` }}>
          <ReqorePanel
            label="Publish as Template"
            icon="Upload2Line"
            collapsible
            onClose={noop}
            actions={[{ label: 'Preview', icon: 'EyeLine' }]}
          >
            {w}px — {note}
          </ReqorePanel>
        </div>
      ))}
      <div style={{ width: '220px' }}>
        <ReqorePanel
          compactTitle
          label="Publish as Template"
          icon="Upload2Line"
          collapsible
          onClose={noop}
          actions={[{ label: 'Preview', icon: 'EyeLine' }]}
        >
          220px, compactTitle — the icon takes the title's place.
        </ReqorePanel>
      </div>
    </ReqoreControlGroup>
  ),
};

/** A tile's title bar, as a dashboard draws it: a quiet period after the title, a help button and
 *  one "more" menu. */
const TILE_BADGE: TReqoreBadge = {
  label: 'Last 30 days',
  appearance: 'text',
  labelEffect: { weight: 'normal' },
};

const TILE_ACTIONS: IReqorePanelAction[] = [
  { icon: 'QuestionLine', tooltip: 'What this counts', minimal: true, flat: true },
  {
    icon: 'MoreLine',
    tooltip: 'More',
    minimal: true,
    flat: true,
    actions: [{ label: 'Copy a link to this view', icon: 'LinksLine' }],
  },
];

const TILE_TITLE = 'Deliveries by channel';

const TILE_VARIANTS: {
  id: string;
  width: number;
  label: IReqorePanelProps['label'];
  icon?: IReqoreIconName;
}[] = [
  { id: 'string', width: 200, label: TILE_TITLE },
  {
    id: 'element',
    width: 200,
    // A title the caller draws itself, as the admin portal's tiles do: one line, cut by its own
    // ellipsis when it has to be.
    label: (
      <ReqoreH4
        effect={{ noWrap: true }}
        style={{ display: 'block', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        Deliveries
      </ReqoreH4>
    ),
  },
  { id: 'icon', width: 200, label: TILE_TITLE, icon: 'MailLine' },
  { id: 'wide', width: 480, label: TILE_TITLE },
];

export const AFullBleedChildMeetsItsEdges: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders a small and a normal bordered panel under a theme with a 14px panel corner, each holding a list whose rows reach the panel's sides: the list takes back the inset the panel says it padded its content by (`margin-inline: calc(-1 * var(--reqore-panel-inset-x))`). The small panel pads 13px to clear its corner, not its size's padding, and the rows still meet both sides exactly; a list that took back a fixed 16px ran 3px past them.",
      },
    },
  },
  args: {
    otherThemeOptions: { panel: { radius: 14 } },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big'>
      {(['small', 'normal'] as const).map((size) => (
        <div key={size} style={{ width: 480 }}>
          <ReqorePanel label={`Set (${size})`} size={size} flat={false} className={`story-${size}`}>
            <div
              className='story-bleed'
              style={{ margin: '0 calc(-1 * var(--reqore-panel-inset-x))' }}
            >
              {['Client name', 'Redirect URI', 'Scopes'].map((name) => (
                <div
                  key={name}
                  className='story-bleed-row'
                  style={{
                    padding: '10px var(--reqore-panel-inset-x)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                >
                  {name}
                </div>
              ))}
            </div>
          </ReqorePanel>
        </div>
      ))}
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    for (const size of ['small', 'normal']) {
      const content = await waitFor(() =>
        requiredElement<HTMLElement>(
          `.story-${size} .reqore-panel-content`,
          `the ${size} panel's content`,
          canvasElement
        )
      );
      const style = getComputedStyle(content);
      const inset = style.getPropertyValue('--reqore-panel-inset-x').trim();
      const edge = content.getBoundingClientRect();

      // The inset said is the inset padded.
      await expect(inset, size).toBe(style.paddingLeft);
      for (const row of content.querySelectorAll<HTMLElement>('.story-bleed-row')) {
        const rect = row.getBoundingClientRect();

        await expect(Math.abs(rect.left - edge.left), `${size} row's left`).toBeLessThanOrEqual(0.5);
        await expect(Math.abs(rect.right - edge.right), `${size} row's right`).toBeLessThanOrEqual(
          0.5
        );
      }
      // Under the 14px corner the small panel pads to clear it, past its size's padding.
      if (size === 'small') {
        await expect(parseFloat(inset)).toBeGreaterThanOrEqual(13);
      }
    }
  },
};

export const BadgesGiveWayToTheTitle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a dashboard tile at 200px three ways — a plain title, a title the caller draws itself (a `ReactElement`), and a title with an icon — each with a quiet "Last 30 days" badge, a help button and a "more" menu, then the same tile at 480px, each keeping its bar on one line (`wrapActionsBelowTitle={false}`; by default the actions would go under the title). At 200px the title and the badge do not fit on one line, so the badge moves to a line under the title, its words on the title\'s left edge (past the icon, which stays centred on the title), and the title is whole at its natural size. At 480px the badge sits beside the title.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big' verticalAlign='flex-start'>
      {TILE_VARIANTS.map(({ id, width, label, icon }) => (
        <div key={id} data-tile={id} style={{ width }}>
          <ReqorePanel
            size='small'
            label={label}
            icon={icon}
            badge={TILE_BADGE}
            actions={TILE_ACTIONS}
            responsiveActions={false}
            // the bar that keeps one line: what gives way beside the actions
            wrapActionsBelowTitle={false}
            padded
          >
            {width}px
          </ReqorePanel>
        </div>
      ))}
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const tile = (id: string) =>
      canvasElement.querySelector(`[data-tile="${id}"] .reqore-panel`) as HTMLElement;

    for (const id of ['string', 'element', 'icon']) {
      await expectBadgesUnderTitle(tile(id));
      await expectTitleWhole(tile(id));
    }

    // The icon stays beside the title, not the badge's line under it.
    await expectIconBesideTitle(tile('icon'));

    await expectBadgesBesideTitle(tile('wide'));
    await expectTitleWhole(tile('wide'));

    // The badge moved before the title shrank: it is at the size it has with room to spare.
    const fontSize = (id: string) =>
      getComputedStyle(tile(id).querySelector('.reqore-panel-title .reqore-heading') as HTMLElement)
        .fontSize;

    expect(fontSize('string')).toBe(fontSize('wide'));
  },
};


export const ATitleShrinksBeforeItsWordsAreCut: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A 190px tile under the calm heading sizes (`typeScale.heading[3]: 16`), titled "Design changes built" with a "Last 30 days" badge, a help button and a "more" menu, as the admin portal draws it, its bar kept on one line (`wrapActionsBelowTitle={false}`). The badge moves under the title, and the title has two lines of 98px. Its length (about 160px) fits those two lines, but its words do not: at 16px they break "Design / changes / built", and the clamp at two lines cut "built" from a title kept at full size. The fit now packs the words as the browser breaks them, so the title shrinks until they fit two lines, and reads whole (decision 029: wrap, then shrink, then cut).',
      },
    },
  },
  args: {
    otherThemeOptions: { typeScale: { heading: { 3: 16 }, headingWeight: 600 } },
  },
  render: () => (
    <div data-tile='words' style={{ width: 190 }}>
      <ReqorePanel
        size='small'
        label='Design changes built'
        labelSize={3}
        badge={TILE_BADGE}
        actions={TILE_ACTIONS}
        responsiveActions={false}
        // the bar that keeps one line: the title's own wrap, shrink and cut beside the actions
        wrapActionsBelowTitle={false}
        padded
      >
        12 designs
      </ReqorePanel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tile = canvasElement.querySelector('[data-tile="words"] .reqore-panel') as HTMLElement;

    await expectBadgesUnderTitle(tile);
    // every word of it, none cut
    await expectTitleWhole(tile);

    const heading = tile.querySelector('.reqore-panel-title .reqore-heading') as HTMLElement;

    // ...because it shrank below the 16px it has with room, and no further than the floor
    await waitFor(() => expect(parseFloat(getComputedStyle(heading).fontSize)).toBeLessThan(16));
    expect(parseFloat(getComputedStyle(heading).fontSize)).toBeGreaterThanOrEqual(11);
  },
};

/** The panels of `ATitleSettlesWhenItsBoxFollowsItsText`, and how many times each has drawn. */
const SETTLING_TITLES = ['Notifications', 'Reviewers', 'Tokens', 'Preferences'];
const settlingCommits = new Map<string, number>();
/** More draws than this is not a panel settling: it is a panel that never will. */
const SETTLING_COMMIT_BOUND = 60;

/**
 * Counts each panel's draws, and stops one that will not stop. Under React's `act`, as a story's
 * play runs, a panel that kept measuring itself into a new state blocked the page for good: no
 * timer of the test's could fire, and the run hung on the file instead of failing. Thrown here, in
 * the commit, the loop ends with an error the story reports.
 */
const countSettlingCommits = (title: string) => {
  const commits = (settlingCommits.get(title) ?? 0) + 1;

  settlingCommits.set(title, commits);

  if (commits > SETTLING_COMMIT_BOUND) {
    throw new Error(`"${title}" is still drawing itself after ${commits} commits`);
  }
};

export const ATitleSettlesWhenItsBoxFollowsItsText: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Four collapsed panels at a phone\'s width (343px), each with a "this browser" badge, in a host that lays its title bars out as a column, so a title\'s box is as wide as what it holds - as qlip-ui\'s pages do on a phone. Each title and its badge settle: the badge goes under the title, the title keeps that line at its own size, and each panel draws a handful of times and stops. A title that shrank to fit beside its badge took its line, fitted there at full size, gave the line back, no longer fitted, and shrank again, forever: "Notifications", "Reviewers" and "Tokens" did, and under the play\'s `act` the page never came back (board f64).',
      },
    },
  },
  beforeEach: () => {
    settlingCommits.clear();
  },
  render: () => (
    <div className='column-title-bars' style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* the host's own layout of a title bar, which Reqore does not draw itself */}
      <style>
        {'.column-title-bars .reqore-panel-title { flex-direction: column; align-items: flex-start; gap: 8px; }'}
      </style>
      {SETTLING_TITLES.map((title) => (
        <div key={title} data-settling={title} style={{ width: 343 }}>
          <Profiler id={title} onRender={() => countSettlingCommits(title)}>
            <ReqorePanel
              label={title}
              icon='Notification3Line'
              collapsible
              isCollapsed
              flat
              padded='normal'
              rounded
              badge={[{ label: 'this browser', intent: 'muted' }]}
            >
              Preferences are kept in this browser.
            </ReqorePanel>
          </Profiler>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const drawn = () => SETTLING_TITLES.map((title) => settlingCommits.get(title) ?? 0);

    // every panel has drawn, and a little later none has drawn again
    await waitFor(() => expect(drawn().every((commits) => commits > 0)).toBe(true));
    let before: number[] = [];
    await waitFor(
      async () => {
        before = drawn();
        await new Promise((resolve) => setTimeout(resolve, 300));
        expect(drawn()).toEqual(before);
      },
      { timeout: 5000 }
    );
    before.forEach((commits) => expect(commits).toBeLessThan(SETTLING_COMMIT_BOUND));

    for (const title of SETTLING_TITLES) {
      const panel = canvasElement.querySelector(`[data-settling="${title}"] .reqore-panel`) as HTMLElement;
      // the title reads whole, whichever line its badge settled on
      await expectTitleWhole(panel);
    }
  },
};

/** The IDE's titles: 16px at weight 600, in the platform's own face (its `TYPE_SCALE`). */
const IDE_TITLE_THEME = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  typeScale: { heading: { 3: 16 }, headingWeight: 600, lineHeight: 1.45 },
  uppercaseLabels: false,
};
const SECTION_TITLES = ['Address', 'Name', 'Security'];
const SECTION_WIDTHS = [590, 600];

export const ATitleBesideALongDescriptionSettles: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Six small sections in an IDE drawer\'s width (590px and 600px), titled "Address", "Name" and "Security", each with a sentence beside its title too long for the line, under the IDE\'s 16px titles. Each title settles at its size and each panel draws a handful of times. Its box was as wide as the title, so it read its room a pixel short and shrank; a smaller title shrinks its description with it, which left the header room to grow back into, and the title took turns between the two for ever - "Address" measured 56, 52, 80, 56... and the IDE\'s Add Server story hung (t-96). A room the title has already been given, for the same title, description, actions and width, now ends the turns: it keeps the most room it was given.',
      },
    },
  },
  args: {
    otherThemeOptions: IDE_TITLE_THEME,
  },
  beforeEach: () => {
    settlingCommits.clear();
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {SECTION_WIDTHS.flatMap((width) =>
        SECTION_TITLES.map((title) => (
          <div key={`${width}-${title}`} data-settling={`${width}-${title}`} style={{ width }}>
            <Profiler
              id={`${width}-${title}`}
              onRender={() => countSettlingCommits(`${width}-${title}`)}
            >
              <ReqorePanel
                flat
                minimal
                raised
                rounded
                padded='normal'
                size='small'
                stickyHeader
                label={title}
                description='The base URL every path in this contract hangs off, and what a generated client uses when nothing overrides it.'
              >
                https://api.example.com/v1
              </ReqorePanel>
            </Profiler>
          </div>
        ))
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const ids = SECTION_WIDTHS.flatMap((width) => SECTION_TITLES.map((title) => `${width}-${title}`));
    const drawn = () => ids.map((id) => settlingCommits.get(id) ?? 0);

    await waitFor(() => expect(drawn().every((commits) => commits > 0)).toBe(true));
    let before: number[] = [];
    await waitFor(
      async () => {
        before = drawn();
        await new Promise((resolve) => setTimeout(resolve, 300));
        expect(drawn()).toEqual(before);
      },
      { timeout: 5000 }
    );
    before.forEach((commits) => expect(commits).toBeLessThan(SETTLING_COMMIT_BOUND));

    for (const id of ids) {
      await expectTitleWhole(
        canvasElement.querySelector(`[data-settling="${id}"] .reqore-panel`) as HTMLElement
      );
    }
  },
};

/** A page head's actions on a phone: the two that matter keep their words, the rest may fold. */
const PAGE_HEAD_ACTIONS: IReqorePanelAction[] = [
  { label: 'Review next pending', icon: 'EyeLine', size: 'small', responsive: false },
  { label: 'Save', icon: 'SaveLine', size: 'small', responsive: false },
  { label: 'Upload', icon: 'UploadLine', size: 'small' },
  { label: 'Settings', icon: 'Settings3Line', size: 'small' },
];

export const APageHeadsActionsFitAPhone: Story = {
  tags: ['touch'],
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          "A page's head on a phone (390 px), as Qlip's build page draws it: a large title with a sentence under it and four actions. The two that matter, Review next pending and Save, keep their words (`responsive: false`); Upload and Settings may give theirs up, and go into the \"⋯\" when there is no room for them at all; the \"⋯\" is their size, as Qlip draws it. Every action, the \"⋯\" whole, stays inside the panel, and the panel draws a handful of times and stops. With all four keeping their words nothing could give way, and the fourth ran off the screen (f65, Filip: fold into \"⋯\").",
      },
    },
  },
  beforeEach: () => {
    settlingCommits.clear();
  },
  render: () => (
    <div data-settling='page-head' style={{ padding: '12px 16px' }}>
      <Profiler id='page-head' onRender={() => countSettlingCommits('page-head')}>
        <ReqorePanel
          transparent
          flat
          rounded={false}
          label='Build #507 · feature/144'
          iconWithLabel
          isCollapsed
          size='huge'
          labelSize={2}
          icon='Image2Line'
          padded={false}
          description='Snapshots captured for this build, against the baseline on develop.'
          actions={PAGE_HEAD_ACTIONS}
          // the "⋯" is a head action like the others, at their size (as qlip-ui draws it)
          responsiveActionsWrapperProps={{ size: 'small' }}
        />
      </Profiler>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector('[data-settling="page-head"] .reqore-panel') as HTMLElement;

    await waitFor(() => expect(settlingCommits.get('page-head') ?? 0).toBeGreaterThan(0));
    let before = 0;
    await waitFor(
      async () => {
        before = settlingCommits.get('page-head') ?? 0;
        await new Promise((resolve) => setTimeout(resolve, 300));
        expect(settlingCommits.get('page-head')).toBe(before);
      },
      { timeout: 5000 }
    );
    expect(before).toBeLessThan(SETTLING_COMMIT_BOUND);

    const edge = panel.getBoundingClientRect().right;
    const buttons = Array.from(panel.querySelectorAll<HTMLElement>('.reqore-panel-title .reqore-button'));
    buttons.forEach((button) => expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(edge + 1));
    // the two that matter say what they do
    const words = buttons.map((button) => button.textContent?.trim());
    expect(words).toContain('Review next pending');
    expect(words).toContain('Save');
  },
};

/* ------------------------------------------------------------------------------------------------
 * media — a cover clipped to the panel's corners
 * ---------------------------------------------------------------------------------------------- */

/** A self-contained 16:9 landscape as a `data:` URI, so the stories need no network. */
const cover = (sky: string, hill: string, sun: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360' width='640' height='360'>` +
      `<defs><linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'>` +
      `<stop offset='0' stop-color='${sky}'/><stop offset='1' stop-color='${hill}'/>` +
      `</linearGradient></defs>` +
      `<rect width='640' height='360' fill='url(#sky)'/>` +
      `<circle cx='470' cy='120' r='54' fill='${sun}'/>` +
      `<path d='M0 270 Q160 190 320 260 T640 240 V360 H0 Z' fill='${hill}'/>` +
      `<path d='M0 310 Q200 250 420 300 T640 300 V360 H0 Z' fill='#000000' opacity='0.25'/>` +
      `</svg>`
  )}`;

const DUSK = cover('#2b2350', '#7b4f8f', '#f2a874');
const DAY = cover('#9fd3f2', '#5ec0a5', '#ffe08a');

const MediaCards = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: 20,
      maxWidth: 1000,
      alignItems: 'start',
    }}
  >
    <ReqorePanel
      media={DUSK}
      mediaAlt='Hills at dusk'
      label='Why orders double-ship'
      description='September 10, 2026 · 7 min read'
      descriptionPosition='below'
      bottomActions={[
        {
          label: 'Read the article',
          rightIcon: 'ArrowRightLine',
          position: 'right',
          responsive: false,
        },
      ]}
      flat
      radiusSize='huge'
    >
      A retry that resends the whole order ships it twice. Here is who is responsible.
    </ReqorePanel>
    <ReqorePanel media={DAY} mediaAspectRatio='4 / 3' padded={false} flat radiusSize='huge' />
    <ReqorePanel
      media={DAY}
      mediaPosition='bottom'
      mediaAspectRatio='21 / 9'
      label='Bottom media'
      icon='Image2Line'
    >
      The cover sits under everything, its bottom corners following the panel.
    </ReqorePanel>
  </div>
);

const mediaFrames = (canvasElement: HTMLElement) =>
  Array.from(canvasElement.querySelectorAll('.reqore-panel-media')) as HTMLElement[];

const imagesLoaded = (canvasElement: HTMLElement) =>
  waitFor(() =>
    Array.from(canvasElement.querySelectorAll('.reqore-panel-media img')).forEach((image) => {
      expect((image as HTMLImageElement).complete).toBe(true);
      expect((image as HTMLImageElement).naturalWidth).toBeGreaterThan(0);
    })
  );

/** The frame spans the panel inside its border, flush with the edge it sits on. */
const expectEdgeToEdge = (frame: HTMLElement, edge: 'top' | 'bottom') => {
  const panel = frame.closest('.reqore-panel') as HTMLElement;
  const panelBox = panel.getBoundingClientRect();
  const frameBox = frame.getBoundingClientRect();
  const border = parseFloat(getComputedStyle(panel).borderTopWidth) || 0;

  expect(Math.abs(frameBox.width - panel.clientWidth)).toBeLessThanOrEqual(1);
  expect(Math.abs(frameBox.left - (panelBox.left + border))).toBeLessThanOrEqual(1);

  if (edge === 'top') {
    expect(Math.abs(frameBox.top - (panelBox.top + border))).toBeLessThanOrEqual(1);
  } else {
    expect(Math.abs(panelBox.bottom - border - frameBox.bottom)).toBeLessThanOrEqual(1);
  }
};

const expectMediaCards = async (canvasElement: HTMLElement) => {
  await imagesLoaded(canvasElement);

  const [article, photo, bottom] = mediaFrames(canvasElement);

  expectEdgeToEdge(article, 'top');
  expectEdgeToEdge(photo, 'top');
  expectEdgeToEdge(bottom, 'bottom');

  // The cover is above the title bar, and the image is decorative only when no alt is given.
  expect(article.nextElementSibling?.classList.contains('reqore-panel-title')).toBe(true);
  expect(article.querySelector('img')?.getAttribute('alt')).toBe('Hills at dusk');
  expect(photo.querySelector('img')?.getAttribute('alt')).toBe('');
  // A flat 'huge' panel: the frame's corners are the panel's own radius.
  expect(getComputedStyle(article).borderTopLeftRadius).toBe(
    getComputedStyle(article.closest('.reqore-panel') as HTMLElement).borderTopLeftRadius
  );
  // An aspect ratio fixes the frame, and the image covers it.
  const photoBox = photo.getBoundingClientRect();
  expect(Math.abs(photoBox.width / photoBox.height - 4 / 3)).toBeLessThan(0.02);
  expect(getComputedStyle(photo.querySelector('img') as HTMLElement).objectFit).toBe('cover');
};

export const Media: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders three panels with `media`: an article card with the cover above its title bar, a photo card that is only the image (4:3, unpadded), and a panel with the cover at the bottom (21:9). Each cover runs edge to edge and is clipped to the panel\'s rounded corners.',
      },
    },
  },
  render: MediaCards,
  play: async ({ canvasElement }) => expectMediaCards(canvasElement),
};

export const MediaLight: Story = {
  args: { mainTheme: '#f4f4f4' } as Story['args'],
  parameters: {
    docs: {
      description: {
        story:
          'Renders the three media panels on a light theme: the covers sit on white-grey cards, edge to edge and clipped to the corners.',
      },
    },
  },
  render: MediaCards,
  play: async ({ canvasElement }) => expectMediaCards(canvasElement),
};

export const MediaMobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    qlip: { viewport: { width: 380, height: 1000 } },
    docs: {
      description: {
        story:
          'Renders the media panels on a phone-width screen (380px): one column, each cover the full width of its card, and nothing wider than the screen.',
      },
    },
  },
  render: MediaCards,
  play: async ({ canvasElement }) => {
    await expectMediaCards(canvasElement);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1);
  },
};

export const ThemedPanelSurface: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders panels on the default and on the themed surface — plain, collapsible, with an intent, with a top accent and with a customTheme: the plain ones take the panel surface (title bar included) and hairline; the intent, the accent strip and the customTheme still win.',
      },
    },
  },
  render: () => (
    <ThemedSurfaceComparison>
      <ReqorePanel label='Plain panel' padded>
        The surface and the hairline come from the theme.
      </ReqorePanel>
      <ReqorePanel label='Collapsible panel' collapsible padded>
        The title bar shares the surface.
      </ReqorePanel>
      <ReqorePanel label='Danger intent' intent='danger' padded>
        The intent still tints the edge.
      </ReqorePanel>
      <ReqorePanel label='Top accent' intent='info' accentPosition='top' padded>
        The strip carries the intent; the edge is the hairline.
      </ReqorePanel>
      <ReqorePanel label='customTheme' customTheme={{ main: '#1e2a3a' }} padded>
        A panel with its own surface keeps it.
      </ReqorePanel>
    </ThemedSurfaceComparison>
  ),
};

/* ------------------------------------------------------------------------------------------------
 * the page's order, whichever actions may fold (board f67)
 * ---------------------------------------------------------------------------------------------- */

/** A build page's head actions, as qlip-ui lists them: its primary first, keeping its words. */
const ORDERED_ACTIONS: IReqorePanelAction[] = [
  {
    label: 'Start review',
    icon: 'PlayLine',
    className: 'order-start-review',
    responsive: false,
  },
  { label: 'Show summary', icon: 'FileList3Line', className: 'order-show-summary' },
  { label: 'Settings', icon: 'Settings3Line', className: 'order-settings' },
];

/** Its bottom bar, each side with one that keeps its words and one that may fold, in two orders. */
const ORDERED_BOTTOM_ACTIONS: IReqorePanelProps['bottomActions'] = [
  { label: 'Help', icon: 'QuestionLine', className: 'order-help', position: 'left' },
  {
    label: 'Keep',
    icon: 'CheckLine',
    className: 'order-keep',
    position: 'left',
    responsive: false,
  },
  {
    label: 'Discard',
    icon: 'DeleteBinLine',
    className: 'order-discard',
    position: 'right',
    responsive: false,
  },
  { label: 'Preview', icon: 'EyeLine', className: 'order-preview', position: 'right' },
];

const OrderedActionsPanel = () => (
  <ReqorePanel
    label='Build #507'
    icon='Image2Line'
    actions={ORDERED_ACTIONS}
    bottomActions={ORDERED_BOTTOM_ACTIONS}
  >
    Snapshots captured for this build, against the baseline on develop.
  </ReqorePanel>
);

/** The left edges of the buttons with these classes that are drawn in `root`, in that order. */
const leftsOf = (root: HTMLElement, classes: string[]) =>
  classes.map((name) => {
    const button = root.querySelector<HTMLElement>(`.reqore-button.${name}`);

    expect(button, `${name} is drawn`).toBeTruthy();

    return button!.getBoundingClientRect().left;
  });

/** Each is to the right of the one before it. */
const expectLeftToRight = (lefts: number[]) =>
  lefts.slice(1).forEach((left, index) => expect(left).toBeGreaterThan(lefts[index]));

export const ActionsKeepThePagesOrder: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A panel whose title bar lists Start review (it keeps its words, `responsive: false`), then Show summary and Settings (they may fold), and whose bottom bar lists Help then Keep on the left and Discard then Preview on the right. Each bar draws them in that order. The title bar drew the folding ones first, so Show summary came before Start review although the page lists them the other way round (board f67, qlip-ui\'s build page); the bottom bar\'s right side did the same with Discard.',
      },
    },
  },
  render: OrderedActionsPanel,
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const title = canvasElement.querySelector<HTMLElement>('.reqore-panel-title')!;
      expectLeftToRight(
        leftsOf(title, ['order-start-review', 'order-show-summary', 'order-settings'])
      );
      const bottom = canvasElement.querySelector<HTMLElement>('.reqore-panel-bottom-actions')!;
      expectLeftToRight(leftsOf(bottom, ['order-help', 'order-keep']));
      expectLeftToRight(leftsOf(bottom, ['order-discard', 'order-preview']));
    });
    // every one says its words where there is room
    const words = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('.reqore-panel-title .reqore-button')
    ).map((button) => button.textContent?.trim());
    expect(words).toEqual(['Start review', 'Show summary', 'Settings']);
  },
};

export const ActionsKeepThePagesOrderOnAPhone: Story = {
  tags: ['touch'],
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          'The same panel on a phone (390 px). Start review keeps its words and stays first; Show summary and Settings give theirs up for their icons, or go into the "⋯" where there is no room, after it. Nothing runs off the panel (board f67).',
      },
    },
  },
  render: OrderedActionsPanel,
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector<HTMLElement>('.reqore-panel')!;
    const title = panel.querySelector<HTMLElement>('.reqore-panel-title')!;

    await waitFor(() => {
      const start = title.querySelector<HTMLElement>('.reqore-button.order-start-review')!;
      expect(start.textContent?.trim()).toBe('Start review');
      // every other button in the bar - an action's icon, the "⋯" - is after it
      const others = Array.from(title.querySelectorAll<HTMLElement>('.reqore-button')).filter(
        (button) => button !== start
      );
      expect(others.length).toBeGreaterThan(0);
      others.forEach((button) =>
        expect(button.getBoundingClientRect().left).toBeGreaterThan(
          start.getBoundingClientRect().left
        )
      );
      // the folding ones that are drawn keep their order among themselves
      const drawn = ['order-show-summary', 'order-settings'].filter((name) =>
        title.querySelector(`.reqore-button.${name}`)
      );
      expectLeftToRight(leftsOf(title, drawn));
    });

    const edge = panel.getBoundingClientRect().right;
    panel
      .querySelectorAll<HTMLElement>('.reqore-panel-title .reqore-button')
      .forEach((button) => expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(edge + 1));
    const bottom = panel.querySelector<HTMLElement>('.reqore-panel-bottom-actions')!;
    expectLeftToRight(leftsOf(bottom, ['order-discard', 'order-preview']));
  },
};

/* ------------------------------------------------------------------------------------------------
 * the actions go under a title they do not fit beside (board f66)
 * ---------------------------------------------------------------------------------------------- */

/** A pull request's page head on Qlip: its primary and its way back keep their words. */
const PULL_REQUEST_ACTIONS: IReqorePanelAction[] = [
  { label: 'Start review', icon: 'PlayLine', size: 'small', responsive: false },
  { label: 'Pull request', icon: 'GitPullRequestLine', size: 'small', responsive: false },
  { label: 'Upload', icon: 'UploadLine', size: 'small' },
  { label: 'Settings', icon: 'Settings3Line', size: 'small' },
];

/**
 * A page head as qlip-ui draws it, its actions going under the title where both do not fit: the default
 * since 18 Nov; `wrap={false}` is a page that opts out.
 */
const WrappingPageHead = ({
  id,
  label,
  actions,
  description,
  wrap,
}: {
  id: string;
  label: string;
  actions: IReqorePanelAction[];
  description?: string;
  wrap?: boolean;
}) => (
  <div data-head={id}>
    <Profiler id={id} onRender={() => countSettlingCommits(id)}>
      <ReqorePanel
        transparent
        flat
        rounded={false}
        label={label}
        iconWithLabel
        isCollapsed
        size='huge'
        labelSize={2}
        icon='GitBranchLine'
        padded={false}
        description={description}
        actions={actions}
        // the "⋯" is a head action like the others, at their size (as qlip-ui draws it)
        responsiveActionsWrapperProps={{ size: 'small' }}
        {...(wrap === undefined ? {} : { wrapActionsBelowTitle: wrap })}
      />
    </Profiler>
  </div>
);

/** The panel of a page head, its title header and the box its actions are in. */
const pageHead = (root: HTMLElement, id: string) => {
  const panel = root.querySelector<HTMLElement>(`[data-head="${id}"] .reqore-panel`)!;
  const header = panel.querySelector<HTMLElement>('.reqore-panel-title-header')!;
  const actions = panel.querySelector<HTMLElement>('.reqore-panel-title-actions');

  return { panel, header, actions };
};

/** Every draw of these heads has stopped, and a handful did it. */
const expectHeadsSettled = async (ids: string[]) => {
  await waitFor(() => ids.forEach((id) => expect(settlingCommits.get(id) ?? 0).toBeGreaterThan(0)));
  await waitFor(
    async () => {
      const before = ids.map((id) => settlingCommits.get(id) ?? 0);
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(ids.map((id) => settlingCommits.get(id) ?? 0)).toEqual(before);
    },
    { timeout: 5000 }
  );
  ids.forEach((id) => expect(settlingCommits.get(id)).toBeLessThan(SETTLING_COMMIT_BOUND));
};

/** The head's actions are on the line under its title, at the line's end. */
const expectActionsUnderTitle = (root: HTMLElement, id: string) => {
  const { panel, header, actions } = pageHead(root, id);

  expect(actions, `${id}: its actions are in a box of their own`).toBeTruthy();
  expect(actions!.getBoundingClientRect().top).toBeGreaterThanOrEqual(
    header.getBoundingClientRect().bottom - 1
  );
  const bar = panel.querySelector<HTMLElement>('.reqore-panel-title')!;
  const buttons = Array.from(actions!.querySelectorAll<HTMLElement>('.reqore-button'));
  const right = Math.max(...buttons.map((button) => button.getBoundingClientRect().right));
  expect(right).toBeGreaterThan(bar.getBoundingClientRect().right - 2);
  buttons.forEach((button) =>
    expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(
      panel.getBoundingClientRect().right + 1
    )
  );
};

/** The head's actions share its title's line, after it. */
const expectActionsBesideTitle = (root: HTMLElement, id: string) => {
  const { panel, header } = pageHead(root, id);
  const headerBox = header.getBoundingClientRect();
  const buttons = Array.from(
    panel.querySelectorAll<HTMLElement>('.reqore-panel-title .reqore-button')
  ).filter((button) => !header.contains(button));

  expect(buttons.length).toBeGreaterThan(0);
  buttons.forEach((button) => {
    const box = button.getBoundingClientRect();
    expect(box.top).toBeLessThan(headerBox.bottom);
    expect(box.left).toBeGreaterThanOrEqual(headerBox.right - 1);
  });
};

export const ActionsGoUnderATitleTheyDoNotFitBeside: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Three page heads with `wrapActionsBelowTitle`, as Qlip draws a pull request\'s: at 900px the title and its four actions share a line, and the description under the title has the room the actions leave, on one line. In a 360px column the four do not fit beside "feature/mvp #42", so they go to the line under it, at its end, together and in order, and the title keeps its words at its own size. "Logs" and one action fit on one line, and stay there (board f66; decision 029: the title keeps its words, what is beside it gives way first).',
      },
    },
  },
  beforeEach: () => {
    settlingCommits.clear();
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big'>
      <div style={{ width: 900 }}>
        <WrappingPageHead
          id='wide'
          label='feature/mvp #42'
          description='12 snapshots changed · main ← feature/mvp'
          actions={PULL_REQUEST_ACTIONS}
        />
      </div>
      <div style={{ width: 360 }}>
        <WrappingPageHead
          id='narrow'
          label='feature/mvp #42'
          description='12 snapshots changed · main ← feature/mvp'
          actions={PULL_REQUEST_ACTIONS}
        />
      </div>
      <div style={{ width: 360 }}>
        <WrappingPageHead
          id='short'
          label='Logs'
          actions={[{ icon: 'DownloadLine', tooltip: 'Download', size: 'small' }]}
        />
      </div>
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    await expectHeadsSettled(['wide', 'narrow', 'short']);
    await waitFor(() => {
      expectActionsBesideTitle(canvasElement, 'wide');
      expectActionsUnderTitle(canvasElement, 'narrow');
      expectActionsBesideTitle(canvasElement, 'short');
    });
    await expectTitleWhole(pageHead(canvasElement, 'narrow').panel);
    // beside the actions, the description has the title's line, not half of it: one line at 900px
    const wideDescription = pageHead(canvasElement, 'wide').panel.querySelector<HTMLElement>(
      '.reqore-panel-title-description'
    )!;
    const descriptionLines = document.createRange();
    descriptionLines.selectNodeContents(wideDescription);
    expect(
      new Set(
        Array.from(descriptionLines.getClientRects())
          .filter((rect) => rect.width > 0)
          .map((rect) => Math.round(rect.top))
      ).size
    ).toBe(1);
    // under the title, the actions keep the page's order and their words where they have room
    const narrowWords = Array.from(
      pageHead(canvasElement, 'narrow').actions!.querySelectorAll<HTMLElement>('.reqore-button')
    )
      .map((button) => button.textContent?.trim())
      .filter(Boolean);
    expect(narrowWords.slice(0, 2)).toEqual(['Start review', 'Pull request']);
  },
};

export const ActionsGoUnderATitleOnAPhone: Story = {
  tags: ['touch'],
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          'Qlip\'s pull request page head on a phone (390 px), with `wrapActionsBelowTitle`. "feature/mvp #42" has its line to itself at its own size, whole; Start review and Pull request keep their words on the line under it, at its end, and Upload and Settings give theirs up or go into the "⋯". Without the option the title was squeezed beside the actions and ran to two lines in 130px (board f66). A second head whose only action is a destructive Delete keeps it at the end of the title\'s line, its bin alone, as a row keeps a lone Delete on a phone (r-qs-19).',
      },
    },
  },
  beforeEach: () => {
    settlingCommits.clear();
  },
  render: () => (
    <div style={{ padding: '12px 16px' }}>
      <WrappingPageHead
        id='phone'
        label='feature/mvp #42'
        description='12 snapshots changed · main ← feature/mvp'
        actions={PULL_REQUEST_ACTIONS}
      />
      <ReqoreVerticalSpacer height={24} />
      <WrappingPageHead
        id='lone-delete'
        label='Order sync template'
        actions={[
          {
            icon: 'DeleteBinLine',
            tooltip: 'Delete template',
            'aria-label': 'Delete template',
            flat: true,
            transparent: true,
            iconColor: 'danger',
            destructive: true,
            size: 'small',
            className: 'lone-delete',
          },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeadsSettled(['phone', 'lone-delete']);
    await waitFor(() => expectActionsUnderTitle(canvasElement, 'phone'));
    const { panel } = pageHead(canvasElement, 'phone');
    await expectTitleWhole(panel);
    // the title is on one line: it did not wrap beside the actions
    const title = panel.querySelector<HTMLElement>('.reqore-panel-title-label-and-badges')!;
    const range = document.createRange();
    range.selectNodeContents(title.firstElementChild!);
    const lineTops = new Set(
      Array.from(range.getClientRects())
        .filter((rect) => rect.width > 0)
        .map((rect) => Math.round(rect.top))
    );
    expect(lineTops.size).toBe(1);
    const words = Array.from(panel.querySelectorAll<HTMLElement>('.reqore-panel-title .reqore-button'))
      .map((button) => button.textContent?.trim())
      .filter(Boolean);
    expect(words).toContain('Start review');
    expect(words).toContain('Pull request');

    // the lone destructive action stays on its title's line, at its end, its bin alone
    const lone = pageHead(canvasElement, 'lone-delete');
    const bin = lone.panel.querySelector<HTMLElement>('.reqore-button.lone-delete')!;
    expect(lone.actions).toBeNull();
    expect(bin.getBoundingClientRect().top).toBeLessThan(lone.header.getBoundingClientRect().bottom);
    expect(bin.getBoundingClientRect().width).toBeLessThan(56);
    expect(bin.getAttribute('aria-label')).toBe('Delete template');
    expect(bin.hasAttribute('destructive')).toBe(false);
  },
};

/* ------------------------------------------------------------------------------------------------
 * a destructive action says so in a panel action's own menu (r-qs-19)
 * ---------------------------------------------------------------------------------------------- */

export const ADestructiveEntryInAPanelActionsMenu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A template panel whose "⋯" action opens a menu of Rename and Delete template. Delete template is marked `destructive` and gives no intent: in the menu, where a calm red icon is not drawn, it is drawn in danger. Rename is not. The marker never reaches the DOM (r-qs-19: it means the same wherever an action is drawn).',
      },
    },
  },
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <ReqorePanel
        label='Order sync template'
        icon='FileList3Line'
        actions={[
          {
            icon: 'MoreLine',
            className: 'template-menu',
            tooltip: 'More',
            actions: [
              { label: 'Rename', icon: 'EditLine' },
              { label: 'Delete template', icon: 'DeleteBinLine', destructive: true },
            ],
          },
        ]}
      >
        Copies the day's orders to the warehouse at 6:00.
      </ReqorePanel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(canvasElement.querySelector<HTMLElement>('.template-menu')!);
    const items = await waitFor(() => {
      const found = openMenuItems();
      expect(found).toHaveLength(2);
      return found;
    });
    const [rename, remove] = items;
    expect(remove.textContent?.trim()).toBe('Delete template');
    expectDrawnRed(remove);
    expectNotDrawnRed(rename);
    expect(remove.hasAttribute('destructive')).toBe(false);
  },
};

/* ------------------------------------------------------------------------------------------------
 * under `wrapActionsBelowTitle`, a title that fits keeps its size, and its badges give way first
 * ---------------------------------------------------------------------------------------------- */

/** Short names an app drawer is titled with: "slack" was 50.4px wide and shrank a step in 50. */
const SHORT_NAMES = ['slack', 'Slack', 'Telegram', 'NewApp', 'Order sync'];

/** An app drawer's head, as the admin portal draws it: a status, a copy button and a close. */
const AppHead = ({ name, wrap }: { name: string; wrap: boolean }) => (
  <ReqorePanel
    className={`app-head${wrap ? ' app-head-wrap' : ''}`}
    data-name={name}
    label={name}
    icon='KeyLine'
    isCollapsed
    onClose={noop}
    wrapActionsBelowTitle={wrap}
    actions={[
      {
        label: 'Published',
        icon: 'CheckLine',
        actions: [{ label: 'Unpublish', icon: 'CloseLine' }],
      },
      { icon: 'FileCopyLine', tooltip: 'Copy the client ID' },
    ]}
  />
);

/** The px a panel's title is drawn at. */
const titlePx = (panel: HTMLElement) =>
  parseFloat(
    getComputedStyle(
      panel.querySelector<HTMLElement>('.reqore-panel-title-label-box')!.firstElementChild as HTMLElement
    ).fontSize
  );

export const AShortTitleKeepsItsSizeWhereActionsMayGoUnder: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'App drawer heads (a key icon, a status, a copy button and a close) titled slack, Slack, Telegram, NewApp and Order sync, in a 390px and a 1440px box, each drawn with `wrapActionsBelowTitle` and without. Every title fits, and each is drawn at the same size both ways. With the option, "slack" (50.4px wide) was drawn a step smaller, 19px for 20: the room its fit measured was its own width rounded down (the admin portal, f66).',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big' fluid>
      {[390, 1440].map((width) => (
        <div key={width} className={`heads-${width}`} style={{ width, maxWidth: '100%' }}>
          <ReqoreControlGroup vertical fluid>
            {SHORT_NAMES.map((name) => (
              <ReqoreControlGroup key={name} vertical fluid>
                <AppHead name={name} wrap={false} />
                <AppHead name={name} wrap />
              </ReqoreControlGroup>
            ))}
          </ReqoreControlGroup>
        </div>
      ))}
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.app-head .reqore-panel-title-label-box')).toHaveLength(
        SHORT_NAMES.length * 4
      )
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
    for (const width of [390, 1440]) {
      const box = canvasElement.querySelector<HTMLElement>(`.heads-${width}`)!;
      for (const name of SHORT_NAMES) {
        const [plain, wrapping] = Array.from(
          box.querySelectorAll<HTMLElement>(`.app-head[data-name="${name}"]`)
        );
        await waitFor(() =>
          expect(titlePx(wrapping), `${name} at ${width}px`).toBe(titlePx(plain))
        );
      }
    }
  },
};

export const BadgesGiveWayBeforeTheActionsOnAPhone: Story = {
  tags: ['touch'],
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'A template drawer\'s head on a phone (390 px, the screen\'s width), with `wrapActionsBelowTitle`: "Order Sync Template", its badges Submitted, v3 and flow, a sentence under it, a copy button and a close. The name and the actions fit on one line and the badges do not, so the badges go under the name (decision 029) and the actions stay beside it. The actions went under too, below the description, a line taller for nothing: the title claimed the width of its name and its badges (the admin portal, f66).',
      },
    },
  },
  render: () => (
    // a drawer on a phone: the screen's whole width
    <div style={{ width: '100%' }}>
      <ReqorePanel
        className='template-head'
        label='Order Sync Template'
        icon='FileList3Line'
        isCollapsed
        onClose={noop}
        wrapActionsBelowTitle
        description='Copies the day’s orders to the warehouse at 6:00.'
        badge={[
          { label: 'Submitted', intent: 'warning' },
          { label: 'v3' },
          { label: 'flow' },
        ]}
        actions={[{ icon: 'FileCopyLine', tooltip: 'Copy the template ID' }]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector<HTMLElement>('.template-head')!;
    await expectBadgesUnderTitle(panel);
    await expectTitleWhole(panel);
    await waitFor(() => {
      const header = panel.querySelector<HTMLElement>('.reqore-panel-title-header')!;
      const headerBox = header.getBoundingClientRect();
      // the copy button and the close are beside the name and its badges, at the line's end: not under them
      const buttons = Array.from(
        panel.querySelectorAll<HTMLElement>('.reqore-panel-title .reqore-button')
      ).filter((button) => !header.contains(button));
      expect(buttons.length).toBeGreaterThanOrEqual(2);
      buttons.forEach((button) => {
        const box = button.getBoundingClientRect();
        expect(box.top).toBeLessThan(headerBox.bottom);
        expect(box.left).toBeGreaterThanOrEqual(headerBox.right - 1);
        expect(box.right).toBeLessThanOrEqual(panel.getBoundingClientRect().right + 1);
      });
    });
  },
};

export const ActionsGoUnderATitleByDefault: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Two page heads in a 360px column, neither naming `wrapActionsBelowTitle`. The first takes the default: its four actions do not fit beside "feature/mvp #42", so they go to the line under it and the title keeps its line and its size. The second opts out (`wrapActionsBelowTitle={false}`) and keeps one line, the title squeezed beside the actions, as every bar did before the default (Filip, 18 Nov).',
      },
    },
  },
  beforeEach: () => {
    settlingCommits.clear();
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big'>
      <div style={{ width: 360 }}>
        <WrappingPageHead id='by-default' label='feature/mvp #42' actions={PULL_REQUEST_ACTIONS} />
      </div>
      <div style={{ width: 360 }}>
        <WrappingPageHead
          id='opted-out'
          label='feature/mvp #42'
          actions={PULL_REQUEST_ACTIONS}
          wrap={false}
        />
      </div>
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    await expectHeadsSettled(['by-default', 'opted-out']);
    await waitFor(() => {
      expectActionsUnderTitle(canvasElement, 'by-default');
      expectActionsBesideTitle(canvasElement, 'opted-out');
    });
    await expectTitleWhole(pageHead(canvasElement, 'by-default').panel);
  },
};

export const AnObviousActionIsItsIcon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A page head whose Refresh and Settings say what they do with their icon (`iconOnly`): each is drawn as its icon at every width, its words its tooltip and its accessible name. "Compare with period before" is a mode the icon cannot carry, so it keeps its words (FRONTEND "Obvious actions are icons only", board f65).',
      },
    },
  },
  beforeEach: () => {
    settlingCommits.clear();
  },
  render: () => (
    <div style={{ width: 900 }}>
      <WrappingPageHead
        id='obvious'
        label='Orders this week'
        actions={[
          { label: 'Refresh', icon: 'RefreshLine', size: 'small', iconOnly: true, className: 'story-refresh' },
          {
            label: 'Compare with period before',
            icon: 'ArrowLeftRightLine',
            size: 'small',
            responsive: false,
            className: 'story-compare',
          },
          { label: 'Settings', icon: 'Settings3Line', size: 'small', iconOnly: true, className: 'story-settings' },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeadsSettled(['obvious']);
    const button = (name: string) =>
      canvasElement.querySelector<HTMLElement>(`.story-${name}`) as HTMLElement;

    await waitFor(() => expect(button('refresh')).toBeTruthy());
    for (const [name, words] of [
      ['refresh', 'Refresh'],
      ['settings', 'Settings'],
    ]) {
      expect(button(name).textContent?.trim()).toBe('');
      expect(button(name).getAttribute('aria-label')).toBe(words);
    }
    expect(button('compare').textContent).toContain('Compare with period before');
  },
};

/** How many lines `element`'s words are on. */
const linesOf = (element: HTMLElement) => {
  const range = document.createRange();
  range.selectNodeContents(element);

  return new Set(
    Array.from(range.getClientRects())
      .filter((rect) => rect.width > 0)
      .map((rect) => Math.round(rect.top))
  ).size;
};

export const ActionsStayBesideATitleThatNeedsTwoLinesAnyway: Story = {
  tags: ['touch'],
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          'On a phone (390 px), a widget titled "Hero: Qonsole input vs problem wizard" with its help and "more" buttons, and a short one, "Visitors", with the same two. The long title needs two lines even with the whole line to itself, and two beside the buttons, so the buttons going under it would save it nothing and cost the panel a line: they stay beside it, and the title takes its two lines there at its own size. "Visitors" fits beside them on one line. (The admin portal\'s experiment drawer and funnel widget on a phone lost 43px and 37px this way.)',
      },
    },
  },
  render: () => (
    <div style={{ padding: '12px 16px', display: 'grid', gap: 16 }}>
      {/* full-width tiles, as a dashboard lays its widgets out on a phone */}
      <div data-widget='long'>
          <ReqorePanel
            label='Hero: Qonsole input vs problem wizard'
            labelSize={3}
            actions={[
              { icon: 'QuestionLine', tooltip: 'What this shows', size: 'small', flat: true },
              { icon: 'MoreLine', tooltip: 'More', size: 'small', flat: true },
            ]}
            responsiveActions={false}
            padded
          >
            12.4%
          </ReqorePanel>
        </div>
        <div data-widget='short'>
          <ReqorePanel
            label='Visitors'
            labelSize={3}
            actions={[
              { icon: 'QuestionLine', tooltip: 'What this shows', size: 'small', flat: true },
              { icon: 'MoreLine', tooltip: 'More', size: 'small', flat: true },
            ]}
            responsiveActions={false}
            padded
          >
            322
          </ReqorePanel>
        </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const parts = (id: string) => {
      const panel = canvasElement.querySelector<HTMLElement>(`[data-widget="${id}"] .reqore-panel`)!;
      const header = panel.querySelector<HTMLElement>('.reqore-panel-title-header')!;
      const heading = panel.querySelector<HTMLElement>('.reqore-panel-title .reqore-heading')!;
      const buttons = Array.from(
        panel.querySelectorAll<HTMLElement>('.reqore-panel-title .reqore-button')
      );

      return { panel, header, heading, buttons };
    };

    for (const id of ['long', 'short']) {
      await waitFor(() => {
        const { header, buttons } = parts(id);
        const headerBox = header.getBoundingClientRect();

        expect(buttons.length).toBe(2);
        // beside the title, on its first line, not on a line of their own under it
        buttons.forEach((button) =>
          expect(
            button.getBoundingClientRect().top,
            `${id}: header ${Math.round(headerBox.top)}-${Math.round(headerBox.bottom)}`
          ).toBeLessThan(headerBox.top + 20)
        );
      });
    }
    await waitFor(() => expect(linesOf(parts('long').heading)).toBe(2));
    expect(linesOf(parts('short').heading)).toBe(1);
    await expectTitleWhole(parts('long').panel);
  },
};

export const APanelWithNoActionsDrawsNoActionsRow: Story = {
  tags: ['touch'],
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          'On a phone (390 px), a panel titled "Leaders this month by the revenue their deals closed" and no actions at all. Its bar is its title: no empty actions row under a title of two lines (it made the admin portal\'s leader panel 5px taller).',
      },
    },
  },
  render: () => (
    <div style={{ padding: '12px 16px' }} data-widget='bare'>
      <ReqorePanel label='Leaders this month by the revenue their deals closed' labelSize={3} padded>
        Dana · 42 deals
      </ReqorePanel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const panel = await waitFor(() => {
      const element = canvasElement.querySelector<HTMLElement>('[data-widget="bare"] .reqore-panel');

      expect(element).toBeTruthy();

      return element!;
    });

    expect(panel.querySelector('.reqore-panel-title-actions')).toBeNull();
    const bar = panel.querySelector<HTMLElement>('.reqore-panel-title')!;
    const header = panel.querySelector<HTMLElement>('.reqore-panel-title-header')!;
    const barStyle = getComputedStyle(bar);
    // the bar is as tall as its title and its own padding, nothing more
    expect(bar.getBoundingClientRect().height).toBeLessThanOrEqual(
      header.getBoundingClientRect().height +
        (parseFloat(barStyle.paddingTop) || 0) +
        (parseFloat(barStyle.paddingBottom) || 0) +
        1
    );
  },
};

/* ------------------------------------------------------------------------------------------------
 * under the actions' default: a description below, a caption, a filter, and icons beside a title (f66)
 * ---------------------------------------------------------------------------------------------- */

/** A section heading as the IDE's dashboard draws it: a name, its count, a filter, a sentence under it. */
const SectionHeading = ({ wrap, width }: { wrap?: boolean; width: number }) => (
  <div
    data-heading={`${width}-${wrap === false ? 'off' : 'default'}`}
    style={{ width, maxWidth: '100%' }}
  >
    <ReqorePanel
      label='Needs you'
      badge={{ label: '25', appearance: 'text' } as TReqoreBadge}
      description='What needs a person now: failures with a prepared fix, held orders and open questions.'
      descriptionPosition='below'
      descriptionMaxLines={0}
      actions={[{ icon: 'FilterLine', label: 'All areas', flat: true, responsive: false }]}
      responsiveActions={false}
      responsiveTitle={false}
      {...(wrap === false ? { wrapActionsBelowTitle: false } : {})}
      transparent
      flat
      minimal
      padded={false}
      fluid
    />
  </div>
);

export const ADescriptionBelowTakesTheWholeWidth: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A dashboard section heading ("Needs you", its count 25 and an "All areas" filter) with a sentence under it (`descriptionPosition=\'below\'`), at 1440px and 390px, drawn with the actions\' default and with `wrapActionsBelowTitle={false}`. The sentence takes the full width under the name and the filter both ways, and reads on the same lines. Under the default it was laid out 0px wide, a word to a line ("What / needs / a / person…", the IDE\'s operator dashboard, f66).',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big' fluid>
      {[1440, 390].map((width) => (
        <ReqoreControlGroup key={width} vertical fluid>
          <SectionHeading width={width} />
          <SectionHeading width={width} wrap={false} />
        </ReqoreControlGroup>
      ))}
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const sentence = (id: string) =>
      canvasElement.querySelector<HTMLElement>(
        `[data-heading="${id}"] .reqore-panel-title-description`
      )!;

    for (const width of [1440, 390]) {
      await waitFor(() => {
        const [byDefault, off] = [sentence(`${width}-default`), sentence(`${width}-off`)];
        const bar = byDefault.closest<HTMLElement>('.reqore-panel-title')!;

        expect(byDefault, `${width}px`).toBeTruthy();
        // as wide as with the default off, on as many lines: one at 1440px, the bar's width on a phone
        expect(Math.round(byDefault.getBoundingClientRect().width)).toBe(
          Math.round(off.getBoundingClientRect().width)
        );
        expect(linesOf(byDefault), `${width}px`).toBe(linesOf(off));
        expect(linesOf(byDefault), `${width}px`).toBeLessThanOrEqual(width < 600 ? 3 : 1);
        if (width < 600) {
          expect(byDefault.getBoundingClientRect().width).toBeGreaterThan(bar.clientWidth * 0.8);
        }
      });
    }
  },
};

/** Every word of `element` on one line: its text's boxes all start within a few px of the same top. */
const onOneLine = (element: HTMLElement) => {
  const range = document.createRange();

  range.selectNodeContents(element);
  const tops = Array.from(range.getClientRects())
    .filter((rect) => rect.width > 0)
    .map((rect) => rect.top);

  return tops.length > 0 && Math.max(...tops) - Math.min(...tops) < 4;
};

/** The IDE's recent orders section: a name, its count, which orders it holds, a folding filter, a link. */
const OrdersSection = ({ width }: { width: number }) => {
  const [filter, setFilter] = useState<string | undefined>('all');

  return (
    <div data-orders={width} style={{ width, maxWidth: '100%' }}>
      <ReqorePanel
        label='Recent orders'
        badge={{ label: '4 failing', appearance: 'text' } as TReqoreBadge}
        description='Newest 4 of 120'
        descriptionPosition='below'
        descriptionMaxLines={0}
        collapsible
        actions={[
          {
            as: ReqoreSegmentedControl,
            props: {
              foldToFit: true,
              size: 'small',
              value: filter,
              onChange: setFilter,
              items: [
                { value: 'all', label: 'All 120' },
                { value: 'failed', label: 'Failed 4' },
                { value: 'active', label: 'In progress 12' },
                { value: 'complete', label: 'Complete 101' },
                { value: 'canceled', label: 'Canceled 3' },
              ],
            },
            responsive: false,
          },
          { icon: 'TableLine', label: 'Browse orders', minimal: true, flat: true, responsive: false },
        ]}
        responsiveActions={false}
        responsiveTitle={false}
        transparent
        flat
        minimal
        padded={false}
        fluid
      />
    </div>
  );
};

export const ACaptionAndAFilterKeepTheirRoomWhenTheActionsGoUnder: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A detail page\'s "Recent orders" section at 1440px and 390px: its count ("4 failing") beside the name, which orders it holds ("Newest 4 of 120") under it, a filter that folds to its room and "Browse orders". At 1440px the actions sit beside the name; at 390px they go under it, and the filter folds into that line. The count and the caption keep their width and their one line both ways, and the filter stays inside the panel. Under the default the caption was drawn a letter to a line ("N e w e s t 4"), and on a phone the filter kept its whole width under the name and ran off the panel\'s left edge (the IDE\'s detail pages, f66).',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big' fluid>
      {[1440, 390].map((width) => (
        <OrdersSection key={width} width={width} />
      ))}
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    for (const width of [1440, 390]) {
      const box = canvasElement.querySelector<HTMLElement>(`[data-orders="${width}"]`)!;

      await waitFor(() => {
        const bar = box.querySelector<HTMLElement>('.reqore-panel-title')!;
        const barBox = bar.getBoundingClientRect();
        const caption = bar.querySelector<HTMLElement>('.reqore-panel-title-description')!;
        const count = Array.from(
          bar.querySelectorAll<HTMLElement>('.reqore-panel-title-header .reqore-tag')
        ).find((tag) => tag.textContent?.includes('4 failing'))!;
        const filter = bar.querySelector<HTMLElement>('.reqore-segmented-control-slot')!;
        const heading = bar.querySelector<HTMLElement>('.reqore-heading')!;

        expect(caption && count && filter && heading, `${width}px`).toBeTruthy();
        // the caption and the count on one line each, at their own width
        expect(onOneLine(caption), `${width}px caption`).toBe(true);
        expect(onOneLine(count), `${width}px count`).toBe(true);
        expect(count.scrollWidth, `${width}px count`).toBeLessThanOrEqual(count.clientWidth + 1);
        // the filter inside the panel, on the name's line at 1440px and under it at 390px
        const filterBox = filter.getBoundingClientRect();

        expect(filterBox.left, `${width}px filter`).toBeGreaterThanOrEqual(barBox.left - 1);
        expect(filterBox.right, `${width}px filter`).toBeLessThanOrEqual(barBox.right + 1);
        if (width === 1440) {
          expect(filterBox.top).toBeLessThan(heading.getBoundingClientRect().bottom);
        } else {
          expect(filterBox.top).toBeGreaterThanOrEqual(heading.getBoundingClientRect().bottom - 1);
        }
      });
    }
    await expectTitleWhole(
      canvasElement.querySelector<HTMLElement>('[data-orders="390"] .reqore-panel')!
    );
  },
};

/** An issue drawer's head, as the IDE draws it: an icon, a name, its state, a help button and a close. */
const IssueHead = ({ id, width, words }: { id: string; width: number; words?: boolean }) => (
  <div data-issue={id} style={{ width, maxWidth: '100%' }}>
    <ReqorePanel
      label='#24011 in Order-to-Cash → payment-author'
      icon='AlertLine'
      badge={{ label: 'Open', appearance: 'text' } as TReqoreBadge}
      isCollapsed
      onClose={noop}
      closeButtonProps={{ flat: true, transparent: true }}
      actions={[
        words
          ? { icon: 'QuestionLine', label: 'Help', flat: true, size: 'small', responsive: false }
          : { icon: 'QuestionLine', tooltip: 'What this shows', flat: true, size: 'small' },
      ]}
    />
  </div>
);

/** The px the issue head `id`'s title is drawn at. */
const issueTitlePx = (canvasElement: HTMLElement, id: string) =>
  parseFloat(
    getComputedStyle(
      canvasElement.querySelector<HTMLElement>(`[data-issue="${id}"] .reqore-heading`)!
    ).fontSize
  );

export const IconActionsStayBesideATitleThatFitsALittleSmaller: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'An issue drawer\'s head (an alert icon, "#24011 in Order-to-Cash → payment-author", its state "Open", a help button drawn as its icon and a close), each in a box sized from the wide one\'s own parts. At 1440px everything fits on one line. In a box 4px too narrow for the name beside the two icons at its own size (the IDE\'s issue drawer at 599px), the icons stay beside it and the name is drawn a step smaller, on one line and whole, its state under it. They went to a row of their own, a row lost for 4px (f66). A name may be drawn up to a tenth smaller for icons (Filip, 18 Nov). In a box where it would have to be drawn smaller than that, the icons go under it; and a help button that keeps its word ("Help") goes under in the 4px-short box, as actions with words always have.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big' fluid>
      <IssueHead id='wide' width={1440} />
      <IssueHead id='wide-words' width={1440} words />
      <IssueHead id='icons' width={599} />
      <IssueHead id='narrow' width={460} />
      <IssueHead id='words' width={599} words />
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const parts = (id: string) => {
      const panel = canvasElement.querySelector<HTMLElement>(`[data-issue="${id}"] .reqore-panel`)!;
      const header = panel.querySelector<HTMLElement>('.reqore-panel-title-header')!;
      const heading = panel.querySelector<HTMLElement>('.reqore-heading')!;
      const buttons = Array.from(
        panel.querySelectorAll<HTMLElement>('.reqore-panel-title-actions .reqore-button')
      );

      return { panel, header, heading, buttons };
    };
    const beside = (id: string) => {
      const { heading, buttons } = parts(id);

      return buttons.every(
        (button) => button.getBoundingClientRect().top < heading.getBoundingClientRect().bottom
      );
    };

    await waitFor(() => expect(parts('wide').buttons).toHaveLength(2));
    await new Promise((resolve) => setTimeout(resolve, 300));
    const naturalPx = issueTitlePx(canvasElement, 'wide');
    /* The widths are the heads' own, read off the wide ones, so the name misses its line by the same few px
       whatever font draws it: the bar's padding, the icon, the name, the gap and the actions. */
    const widthFor = (wideId: string, nameShare: number, short: number) => {
      const { panel, header, heading } = parts(wideId);
      const bar = panel.querySelector<HTMLElement>('.reqore-panel-title')!;
      const barStyle = getComputedStyle(bar);
      const actions = panel.querySelector<HTMLElement>('.reqore-panel-title-actions')!;
      const before = heading.getBoundingClientRect().left - header.getBoundingClientRect().left;

      return (
        (parseFloat(barStyle.paddingLeft) || 0) +
        (parseFloat(barStyle.paddingRight) || 0) +
        before +
        heading.getBoundingClientRect().width * nameShare +
        (parseFloat(barStyle.columnGap) || 0) +
        actions.getBoundingClientRect().width -
        short
      );
    };
    const resize = (id: string, width: number) => {
      canvasElement.querySelector<HTMLElement>(`[data-issue="${id}"]`)!.style.width = `${width}px`;
    };

    // 4px short at the name's own size; and short even at four fifths of it
    resize('icons', widthFor('wide', 1, 4));
    resize('words', widthFor('wide-words', 1, 4));
    resize('narrow', widthFor('wide', 0.8, 0));
    await new Promise((resolve) => setTimeout(resolve, 500));

    await waitFor(() => {
      expect(beside('wide'), 'wide').toBe(true);
      expect(beside('icons'), 'icons').toBe(true);
      expect(linesOf(parts('icons').heading)).toBe(1);
      expect(issueTitlePx(canvasElement, 'icons')).toBeLessThan(naturalPx);
      expect(issueTitlePx(canvasElement, 'icons')).toBeGreaterThanOrEqual(
        Math.floor(naturalPx * 0.9)
      );
      expect(beside('narrow'), 'narrow').toBe(false);
      expect(beside('words'), 'words').toBe(false);
      expect(issueTitlePx(canvasElement, 'words')).toBe(naturalPx);
    });
    await expectTitleWhole(parts('icons').panel);
    await expectBadgesUnderTitle(parts('icons').panel);
  },
};

/* ------------------------------------------------------------------------------------------------
 * icons beside a title kept to one line: the title never wraps beside them (queue item 28)
 * ---------------------------------------------------------------------------------------------- */

/** A dashboard tile, as the admin portal's WidgetFrame draws one: its name, help and "more" as icons. */
const IconTile = ({ id, label, width }: { id: string; label: string; width: number }) => (
  <div data-tile={id} style={{ width, maxWidth: '100%' }}>
    <ReqorePanel
      label={label}
      labelSize={3}
      labelEffect={{ color: '#e8e8e8' }}
      responsiveTitle={false}
      actions={[
        { icon: 'QuestionLine', tooltip: 'What this shows', size: 'small', flat: true },
        { icon: 'MoreLine', tooltip: 'More', size: 'small', flat: true },
      ]}
      padded
    >
      12.4%
    </ReqorePanel>
  </div>
);

const TILE_TITLES = { wizard: 'Problem wizard', revenue: 'Monthly revenue gained and lost' };

/** What the controls in a bar's actions box span, without the sliver of the line the box grows by. */
const controlsWidth = (actions: HTMLElement) => {
  const groups = Array.from(actions.children) as HTMLElement[];

  return (
    groups.reduce((sum, group) => sum + group.getBoundingClientRect().width, 0) +
    (parseFloat(getComputedStyle(actions).columnGap) || 0) * Math.max(0, groups.length - 1)
  );
};

export const IconsBesideATitleKeepItOnOneLine: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Dashboard tiles titled "Problem wizard" and "Monthly revenue gained and lost", with a help and a "more" button drawn as icons, at 330px and 218px, and in boxes 1px too narrow for each title beside the icons at its own size (sized from the wide tile\'s own parts). Wherever the icons sit beside a title, the title is on one line and whole, a step smaller where it must be. In the 1px-short boxes the title fitted with the one-line fit\'s 2px of slack, kept its size and wrapped its last word beside the icons ("Problem / wizard", "… gained and / lost", the admin portal on a phone).',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big' fluid>
      {Object.entries(TILE_TITLES).map(([key, label]) => (
        <ReqoreControlGroup key={key} vertical fluid>
          <IconTile id={`${key}-wide`} label={label} width={1440} />
          <IconTile id={`${key}-330`} label={label} width={330} />
          <IconTile id={`${key}-218`} label={label} width={218} />
          <IconTile id={`${key}-short`} label={label} width={330} />
        </ReqoreControlGroup>
      ))}
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const parts = (id: string) => {
      const panel = canvasElement.querySelector<HTMLElement>(`[data-tile="${id}"] .reqore-panel`)!;

      return {
        panel,
        bar: panel.querySelector<HTMLElement>('.reqore-panel-title')!,
        header: panel.querySelector<HTMLElement>('.reqore-panel-title-header')!,
        heading: panel.querySelector<HTMLElement>('.reqore-panel-title .reqore-heading')!,
        actions: panel.querySelector<HTMLElement>('.reqore-panel-title-actions')!,
        buttons: Array.from(
          panel.querySelectorAll<HTMLElement>('.reqore-panel-title-actions .reqore-button')
        ),
      };
    };
    const beside = (id: string) => {
      const { heading, buttons } = parts(id);

      return buttons.every(
        (button) => button.getBoundingClientRect().top < heading.getBoundingClientRect().bottom
      );
    };

    await waitFor(() => expect(parts('wizard-wide').buttons).toHaveLength(2));
    await new Promise((resolve) => setTimeout(resolve, 300));
    // 1px short of each title beside the icons at its own size, measured off the wide tile
    for (const key of Object.keys(TILE_TITLES)) {
      const { bar, header, heading, actions } = parts(`${key}-wide`);
      const barStyle = getComputedStyle(bar);
      // the tile's own edge (its border) and the bar's sides, the title, the gap and the controls
      const edge =
        canvasElement.querySelector<HTMLElement>(`[data-tile="${key}-wide"]`)!.getBoundingClientRect()
          .width - bar.getBoundingClientRect().width;
      const width =
        edge +
        (parseFloat(barStyle.paddingLeft) || 0) +
        (parseFloat(barStyle.paddingRight) || 0) +
        (heading.getBoundingClientRect().left - header.getBoundingClientRect().left) +
        heading.getBoundingClientRect().width +
        (parseFloat(barStyle.columnGap) || 0) +
        controlsWidth(actions) -
        1;

      canvasElement.querySelector<HTMLElement>(`[data-tile="${key}-short"]`)!.style.width = `${width}px`;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));

    const naturalPx = parseFloat(getComputedStyle(parts('wizard-wide').heading).fontSize);

    for (const key of Object.keys(TILE_TITLES)) {
      for (const at of ['330', '218', 'short']) {
        const id = `${key}-${at}`;

        await waitFor(() => {
          // icons beside a title: the title on one line
          if (beside(id)) {
            expect(linesOf(parts(id).heading), id).toBe(1);
          }
        });
        if (beside(id)) {
          await expectTitleWhole(parts(id).panel);
        }
      }
      // the short box keeps its icons beside the title, a step smaller
      await waitFor(() => {
        expect(beside(`${key}-short`), `${key}-short`).toBe(true);
        expect(
          parseFloat(getComputedStyle(parts(`${key}-short`).heading).fontSize),
          `${key}-short`
        ).toBeLessThan(naturalPx);
      });
    }
  },
};

/** A collapsible panel whose head holds a segmented choice and a tag: custom (`as`) actions with no `onClick`. */
const RunHistory = () => {
  const [range, setRange] = useState<string | undefined>('day');

  return (
    <ReqorePanel
      label='Run history'
      collapsible
      actions={[
        {
          as: ReqoreSegmentedControl,
          props: {
            size: 'small',
            value: range,
            onChange: setRange,
            items: [
              { value: 'day', label: 'Today' },
              { value: 'week', label: 'This week' },
            ],
          },
          responsive: false,
        },
        { as: ReqoreTag, props: { label: 'Draft', className: 'run-history-draft' }, responsive: false },
      ]}
    >
      <ReqoreP className='run-history-body'>
        {range === 'week' ? 'Eighty runs this week' : 'Twelve runs today'}, all of them on time.
      </ReqoreP>
    </ReqorePanel>
  );
};

/** Whether the panel's body is on screen (a folded panel hides or drops it). */
const runHistoryShown = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>('.run-history-body')?.checkVisibility() ?? false;

export const ACustomActionsClickNeverFoldsThePanel: Story = {
  render: () => <RunHistory />,
  parameters: {
    docs: {
      description: {
        story:
          'Renders a collapsible panel whose head holds a segmented choice and a tag, custom actions with no onClick of their own. Choosing "This week" and clicking the tag leave the panel open on its week; a click on the title still folds it, and another opens it again.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(runHistoryShown(canvasElement)).toBe(true));

    const segment = [...canvasElement.querySelectorAll<HTMLElement>('button')].find((button) =>
      button.textContent?.includes('This week')
    );
    // used, each action leaves the panel open (two folds would cancel out, so each is checked on its own)
    for (const action of [segment, canvasElement.querySelector<HTMLElement>('.run-history-draft')]) {
      await userEvent.click(action as HTMLElement);
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(runHistoryShown(canvasElement)).toBe(true);
    }
    // on what was chosen
    expect(canvasElement.querySelector('.run-history-body')?.textContent).toContain('this week');

    // the bar itself still folds it, and opens it again
    const title = () =>
      [...canvasElement.querySelectorAll<HTMLElement>('.reqore-panel-title h4, .reqore-panel-title span')].find(
        (element) => element.textContent === 'Run history'
      ) as HTMLElement;
    await userEvent.click(title());
    await waitFor(() => expect(runHistoryShown(canvasElement)).toBe(false));
    await userEvent.click(title());
    await waitFor(() => expect(runHistoryShown(canvasElement)).toBe(true));
  },
};
