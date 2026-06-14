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

const meta = {
  title: 'Display/CollapsibleContent',
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
    ...createArg('fadeColor', {
      type: 'string',
      name: 'Fade color',
    }),
  },
} as StoryMeta<typeof ReqoreCollapsibleContent>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreCollapsibleContentProps> = (args) => (
  <div style={{ width: 720, maxWidth: '100%' }}>
    <ReqoreCollapsibleContent {...args}>
      <LongContent />
    </ReqoreCollapsibleContent>
  </div>
);

// Baseline clipped state: tall content clips behind the fade with a visible reveal button.
export const Default: Story = {
  render: Template,
};

// Drives the reveal → "Show less" → reveal cycle; also the state Chromatic snapshots last.
export const Expands: Story = {
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
  render: (args) => (
    <div style={{ width: 720, maxWidth: '100%' }}>
      <ReqoreCollapsibleContent {...args}>
        <ReqoreP>{PARAGRAPH}</ReqoreP>
      </ReqoreCollapsibleContent>
    </div>
  ),
};

export const DefaultExpanded: Story = {
  render: Template,
  args: {
    defaultExpanded: true,
  },
};

export const CustomThreshold: Story = {
  render: Template,
  args: {
    maxCollapsedHeight: 140,
  },
};

export const CustomLabels: Story = {
  render: Template,
  args: {
    showMoreLabel: 'Read full notes',
    showLessLabel: 'Collapse notes',
    showMoreIcon: 'EyeLine',
    showLessIcon: 'EyeOffLine',
  },
};

// The card is darker than reqore's #333 surface, so the default fade ends in mid-grey and leaves
// a visible band; matching fadeColor to the card removes it. Shown without vs with the prop.
const CARD = '#0d0d0d';

const FadeCard = ({ fadeColor }: { fadeColor?: string }) => (
  <div style={{ background: CARD, padding: 16, borderRadius: 8 }}>
    <ReqoreCollapsibleContent fadeColor={fadeColor} maxCollapsedHeight={160}>
      <LongContent lines={4} />
    </ReqoreCollapsibleContent>
  </div>
);

export const CustomFadeColor: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
      <ReqoreP effect={{ weight: 'bold' }}>Without fadeColor</ReqoreP>
      <FadeCard />
      <ReqoreP effect={{ weight: 'bold' }}>{`With fadeColor="${CARD}"`}</ReqoreP>
      <FadeCard fadeColor={CARD} />
    </div>
  ),
};

export const Intents: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical fluid gapSize='big'>
      {Object.keys(DEFAULT_INTENTS).map((intent) => (
        <ReqoreCollapsibleContent
          key={intent}
          {...args}
          intent={intent as IReqoreCollapsibleContentProps['intent']}
          maxCollapsedHeight={120}
        >
          <LongContent lines={3} />
        </ReqoreCollapsibleContent>
      ))}
    </ReqoreControlGroup>
  ),
};

export const Sizes: Story = {
  render: (args) => {
    const sizes = ['tiny', 'small', 'normal', 'big', 'huge'] as const;

    return (
      <ReqoreControlGroup vertical fluid gapSize='big'>
        {sizes.map((size) => (
          <ReqoreCollapsibleContent key={size} {...args} size={size} maxCollapsedHeight={120}>
            <LongContent lines={3} />
          </ReqoreCollapsibleContent>
        ))}
      </ReqoreControlGroup>
    );
  },
};

export const Fluid: Story = {
  render: (args) => (
    <ReqoreCollapsibleContent {...args} fluid>
      <LongContent />
    </ReqoreCollapsibleContent>
  ),
};

export const WithEffect: Story = {
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
  render: Template,
  args: {
    tooltip: 'Collapsible content exposes the same tooltip prop as every other Reqore component.',
  },
};

export const CustomTheme: Story = {
  render: Template,
  args: {
    customTheme: { main: '#1c1c2b' },
  },
};

// Opt-in ambient style: the button hides until hover / focus. The play focuses it so the
// revealed state is captured — without an interaction it would snapshot as a bare fade.
export const RevealOnHover: Story = {
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
