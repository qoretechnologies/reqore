import { StoryFn, StoryObj } from '@storybook/react';
import { expect, fireEvent, waitFor } from 'storybook/test';
import {
  IReqoreCollapsibleContentProps,
  ReqoreCollapsibleContent,
} from '../../components/CollapsibleContent';
import ReqoreControlGroup from '../../components/ControlGroup';
import { ReqoreP } from '../../components/Paragraph';
import { DEFAULT_INTENTS } from '../../constants/theme';
import { StoryMeta } from '../utils';
import { IntentArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreCollapsibleContentProps>();

const PARAGRAPH =
  'Shadowlands has mechanisms put in place for allowing players to catch up on Renown, the system of gaining favor and unlocking rewards, Campaign chapters, and soulbinds within your Covenant. This system works for main characters who have started late, for alts, for players who have switched Covenants and are starting over, and for players who have simply missed weekly quests for earning Renown due to being away from the game.';

const LongContent = ({ lines = 6 }: { lines?: number }) => (
  <ReqoreControlGroup vertical gapSize='normal'>
    {Array.from({ length: lines }).map((_, index) => (
      <ReqoreP key={index}>{PARAGRAPH}</ReqoreP>
    ))}
  </ReqoreControlGroup>
);

// Constrained column so paragraphs actually wrap and overflow on wide viewports — without this
// the "tall content" branch never triggers in matrix stories.
const ColumnWrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: 720, maxWidth: '100%' }}>{children}</div>
);

const meta = {
  title: 'Display/Collapsible Content',
  component: ReqoreCollapsibleContent,
  parameters: {
    chromatic: {
      viewports: [450, 1440],
    },
  },
  argTypes: {
    ...IntentArg,
    ...SizeArg,
    ...createArg('maxCollapsedHeight', {
      type: 'number',
      name: 'Max collapsed height',
      defaultValue: 300,
    }),
    ...createArg('defaultExpanded', {
      type: 'boolean',
      name: 'Default expanded',
      defaultValue: false,
    }),
    ...createArg('revealOn', {
      control: 'select',
      options: ['always', 'hover'],
      name: 'Reveal on',
      defaultValue: 'always',
    }),
    ...createArg('buttonAlign', {
      control: 'select',
      options: ['left', 'center', 'right'],
      name: 'Button align',
      defaultValue: 'center',
    }),
    ...createArg('buttonFluid', {
      type: 'boolean',
      name: 'Button fluid',
      defaultValue: false,
    }),
    ...createArg('animated', {
      type: 'boolean',
      name: 'Animated',
      defaultValue: false,
    }),
    ...createArg('transparent', {
      type: 'boolean',
      name: 'Transparent (no fade)',
      defaultValue: false,
    }),
    ...createArg('disabled', {
      type: 'boolean',
      name: 'Disabled',
      defaultValue: false,
    }),
    ...createArg('showMoreLabel', {
      type: 'string',
      name: 'Show more label',
      defaultValue: 'Show more',
    }),
    ...createArg('showLessLabel', {
      type: 'string',
      name: 'Show less label',
      defaultValue: 'Show less',
    }),
  },
} as StoryMeta<typeof ReqoreCollapsibleContent>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreCollapsibleContentProps> = (args) => (
  <ColumnWrapper>
    <ReqoreCollapsibleContent {...args}>
      <LongContent />
    </ReqoreCollapsibleContent>
  </ColumnWrapper>
);

// Baseline clipped state: tall content clips behind the fade with a visible reveal button.
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent in its default configuration.',
      },
    },
  },
  render: Template,
};

// Drives the reveal → "Show less" → reveal cycle; also the state Chromatic snapshots last.
export const Expands: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent and exercises its expand flow.',
      },
    },
  },
  render: Template,
  play: async ({ canvasElement }) => {
    const reveal = canvasElement.querySelector<HTMLButtonElement>(
      '.reqore-collapsible-content-reveal'
    );

    // Tall content starts clipped with a reveal button and no collapse button.
    await waitFor(() => expect(reveal).toBeTruthy());
    expect(canvasElement.querySelector('.reqore-collapsible-content-collapse')).toBeNull();

    await fireEvent.click(reveal!);

    // Expanding swaps the reveal for a "Show less" button and drops the fade.
    await waitFor(() =>
      expect(canvasElement.querySelector('.reqore-collapsible-content-collapse')).toBeTruthy()
    );
    expect(canvasElement.querySelector('.reqore-collapsible-content-fade')).toBeNull();
  },
};

export const ShortContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent with a small amount of content.',
      },
    },
  },
  render: (args) => (
    <ColumnWrapper>
      <ReqoreCollapsibleContent {...args}>
        <ReqoreP>{PARAGRAPH}</ReqoreP>
      </ReqoreCollapsibleContent>
    </ColumnWrapper>
  ),
};

export const DefaultExpanded: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent expanded by default.',
      },
    },
  },
  render: Template,
  args: {
    defaultExpanded: true,
  },
};

export const CustomThreshold: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent with a custom threshold value.',
      },
    },
  },
  render: Template,
  args: {
    maxCollapsedHeight: 140,
  },
};

export const CustomLabels: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent with custom labels on the elements.',
      },
    },
  },
  render: Template,
  args: {
    showMoreLabel: 'Read full notes',
    showLessLabel: 'Collapse notes',
    showMoreIcon: 'EyeLine',
    showLessIcon: 'EyeOffLine',
  },
};

// `intent` tints the fade gradient AND the buttons — the surface fades into the intent color
// so the disclosure visually carries meaning (danger fades into red, success into green, etc.).
export const Intents: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent at every intent (info, success, warning, danger, pending, muted) so the intent palette is visible side by side.',
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: 720, maxWidth: '100%' }}>
      {Object.keys(DEFAULT_INTENTS).map((intent) => (
        <ReqoreCollapsibleContent
          key={intent}
          {...args}
          intent={intent as IReqoreCollapsibleContentProps['intent']}
          maxCollapsedHeight={140}
        >
          <LongContent lines={4} />
        </ReqoreCollapsibleContent>
      ))}
    </ReqoreControlGroup>
  ),
};

// `size` scales the buttons AND the fade height so each row is visibly distinct from the next.
export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent at every size (tiny through huge) so the size scale is visible side by side.',
      },
    },
  },
  render: (args) => {
    const sizes = ['tiny', 'small', 'normal', 'big', 'huge'] as const;

    return (
      <ReqoreControlGroup vertical gapSize='big' style={{ width: 720, maxWidth: '100%' }}>
        {sizes.map((size) => (
          <ReqoreCollapsibleContent key={size} {...args} size={size} maxCollapsedHeight={160}>
            <LongContent lines={4} />
          </ReqoreCollapsibleContent>
        ))}
      </ReqoreControlGroup>
    );
  },
};

// `customTheme.main` controls the fade's surface color — match it to the parent's background
// for a seamless blend. This replaces the old bespoke `fadeColor` prop.
export const CustomTheme: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent with a custom theme override applied.',
      },
    },
  },
  render: () => {
    const CARD = '#0d0d0d';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
        <ReqoreP effect={{ weight: 'bold' }}>Default theme</ReqoreP>
        <div style={{ background: CARD, padding: 16, borderRadius: 8 }}>
          <ReqoreCollapsibleContent maxCollapsedHeight={160}>
            <LongContent lines={4} />
          </ReqoreCollapsibleContent>
        </div>
        <ReqoreP effect={{ weight: 'bold' }}>{`customTheme={{ main: '${CARD}' }}`}</ReqoreP>
        <div style={{ background: CARD, padding: 16, borderRadius: 8 }}>
          <ReqoreCollapsibleContent customTheme={{ main: CARD }} maxCollapsedHeight={160}>
            <LongContent lines={4} />
          </ReqoreCollapsibleContent>
        </div>
      </div>
    );
  },
};

// `transparent` drops the fade gradient entirely while keeping the disclosure button — useful
// when the content already has its own visual treatment that you don't want to wash out.
export const Transparent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent with a transparent background.',
      },
    },
  },
  render: Template,
  args: {
    transparent: true,
  },
};

// `disabled` dims the surface and short-circuits both reveal and collapse handlers.
export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent in its disabled state.',
      },
    },
  },
  render: Template,
  args: {
    disabled: true,
  },
};

export const ButtonAlignLeft: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent with the button aligned to the left.',
      },
    },
  },
  render: Template,
  args: {
    buttonAlign: 'left',
  },
};

export const ButtonAlignRight: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent with the button aligned to the right.',
      },
    },
  },
  render: Template,
  args: {
    buttonAlign: 'right',
  },
};

// `buttonFluid` stretches the reveal button to the full width of the overlay — works correctly
// because the fade overlay uses column-flex (so the button's cross-axis stretch is horizontal).
export const ButtonFluid: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent with a fluid button.',
      },
    },
  },
  render: Template,
  args: {
    buttonFluid: true,
  },
};

// `animated` smooths the expand / collapse with a `max-height` + opacity transition. Opt-in so
// the disclosure stays instant by default; honours the global `animations.dialogs` toggle and
// the OS `prefers-reduced-motion` preference automatically. Drives the reveal → "Show less"
// cycle so the snapshot captures both the closed and open states across the transition.
export const Animated: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent with animations enabled.',
      },
    },
  },
  render: Template,
  args: {
    animated: true,
  },
  play: async ({ canvasElement }) => {
    // Re-query inside waitFor so the loop actually retries until the reveal button is in the
    // DOM — capturing the result outside would just re-check the same null reference forever
    // and time out the first time mount happens after the first paint.
    const reveal = await waitFor(() => {
      const el = canvasElement.querySelector<HTMLButtonElement>(
        '.reqore-collapsible-content-reveal'
      );
      expect(el).toBeTruthy();
      return el!;
    });

    await fireEvent.click(reveal);

    await waitFor(() =>
      expect(canvasElement.querySelector('.reqore-collapsible-content-collapse')).toBeTruthy()
    );
  },
};

export const Fluid: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent with fluid set so it fills the available horizontal space.',
      },
    },
  },
  render: (args) => (
    <ReqoreCollapsibleContent {...args} fluid>
      <LongContent />
      <LongContent />
      <LongContent />
      <LongContent />
    </ReqoreCollapsibleContent>
  ),
};

export const WithEffect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent with a visual effect applied.',
      },
    },
  },
  render: Template,
  args: {
    effect: {
      gradient: {
        colors: { 0: 'info:darken:3', 100: 'main' },
      },
    },
  },
};

export const Tooltip: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent with a tooltip attached.',
      },
    },
  },
  render: Template,
  args: {
    tooltip: 'Collapsible content exposes the same tooltip prop as every other Reqore component.',
  },
};

// Opt-in ambient style: the button hides until hover / focus. The play focuses it so the
// revealed state is captured — without an interaction it would snapshot as a bare fade.
export const RevealOnHover: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders CollapsibleContent with elements that reveal on hover.',
      },
    },
  },
  render: Template,
  args: {
    revealOn: 'hover',
  },
  play: async ({ canvasElement }) => {
    const reveal = canvasElement.querySelector<HTMLButtonElement>(
      '.reqore-collapsible-content-reveal'
    );

    await waitFor(() => expect(reveal).toBeTruthy());
    reveal!.focus();
  },
};
