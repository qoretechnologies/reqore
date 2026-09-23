import { StoryObj } from '@storybook/react';
import { ReactNode, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { IReqoreButtonRailProps } from '../../components/ButtonRail';
import { DEFAULT_INTENTS, TReqoreIntent } from '../../constants/theme';
import {
  ReqoreButton,
  ReqoreButtonRail,
  ReqoreControlGroup,
  ReqoreP,
  ReqoreSpan,
} from '../../index';
import { StoryMeta } from '../utils';
import {
  ALL_SIZES,
  DisabledArg,
  FlatArg,
  GapSizeArg,
  IntentArg,
  MinimalArg,
  RadiusSizeArg,
  SizeArg,
  argManager,
} from '../utils/args';

const { createArg } = argManager<IReqoreButtonRailProps>();

const meta = {
  title: 'Form/Button Rail',
  component: ReqoreButtonRail,
  parameters: {
    chromatic: {
      viewports: [450, 1440],
    },
  },
  argTypes: {
    ...SizeArg,
    ...IntentArg,
    ...GapSizeArg,
    ...RadiusSizeArg,
    ...FlatArg,
    ...MinimalArg(),
    ...DisabledArg,
    ...createArg('vertical', { type: 'boolean', name: 'Vertical', defaultValue: false }),
    ...createArg('transparent', { type: 'boolean', name: 'Transparent', defaultValue: false }),
    ...createArg('raised', { type: 'boolean', name: 'Raised', defaultValue: false }),
    ...createArg('elevated', { type: 'boolean', name: 'Elevated', defaultValue: true }),
    ...createArg('rounded', { type: 'boolean', name: 'Rounded', defaultValue: true }),
    ...createArg('opacity', { type: 'number', name: 'Surface opacity', defaultValue: 0.78 }),
    ...createArg('blur', { type: 'number', name: 'Backdrop blur (px)', defaultValue: 14 }),
    ...createArg('fluid', { type: 'boolean', name: 'Fluid', defaultValue: false }),
    ...createArg('responsive', { type: 'boolean', name: 'Responsive', defaultValue: false }),
  },
} as StoryMeta<typeof ReqoreButtonRail>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The editor's own rail: a labelled mode toggle, two icon-only history
 *  controls and a labelled panel toggle. A plain function returning a fragment,
 *  NOT a component: the rail (like a control group) hands its defaults to its
 *  DIRECT children, and a wrapper component would be that child instead of the
 *  buttons. */
const editorButtons = ({
  picking,
  historyOpen,
}: { picking?: boolean; historyOpen?: boolean } = {}) => (
  <>
    <ReqoreButton
      icon='CursorLine'
      active={picking}
      intent={picking ? 'success' : undefined}
      tooltip='Select an element on the page for your next message'
    >
      Select
    </ReqoreButton>
    <ReqoreButton icon='ArrowGoBackLine' aria-label='Undo' tooltip='Undo (⌘Z)' />
    <ReqoreButton icon='ArrowGoForwardLine' aria-label='Redo' tooltip='Nothing to redo' disabled />
    <ReqoreButton icon='HistoryLine' active={historyOpen} tooltip='Change history'>
      History
    </ReqoreButton>
  </>
);

/** A busy, colourful backdrop — a frosted surface only reads as frosted when
 *  there is something behind it to blur. */
const Backdrop = ({ children, height = 180 }: { children: ReactNode; height?: number }) => (
  <div
    style={{
      position: 'relative',
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderRadius: 12,
      background:
        'radial-gradient(circle at 20% 30%, #803a8a 0, transparent 45%), ' +
        'radial-gradient(circle at 80% 70%, #8db844 0, transparent 45%), ' +
        'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 12px, transparent 12px 24px)',
    }}
  >
    <ReqoreP
      style={{ position: 'absolute', inset: 16, opacity: 0.8, pointerEvents: 'none' }}
      effect={{ weight: 'bold' }}
    >
      Automation Intelligence captures every run as a business-tagged event. Ask the AI a question
      and act on the answer. Automation Intelligence captures every run as a business-tagged event.
      Ask the AI a question and act on the answer.
    </ReqoreP>
    <div style={{ position: 'relative' }}>{children}</div>
  </div>
);

/** A labelled row in a matrix story. */
const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <ReqoreControlGroup verticalAlign='center' gapSize='big'>
    <ReqoreSpan size='small' effect={{ opacity: 0.6 }} style={{ width: 140 }}>
      {label}
    </ReqoreSpan>
    {children}
  </ReqoreControlGroup>
);

const Matrix = ({ children }: { children: ReactNode }) => (
  <ReqoreControlGroup vertical gapSize='big'>
    {children}
  </ReqoreControlGroup>
);

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the default rail: a frosted, bordered pill with a floating shadow, hosting three flat pill buttons (one labelled, two icon-only).',
      },
    },
  },
  render: (args) => (
    <ReqoreButtonRail aria-label='Formatting' {...args}>
      <ReqoreButton icon='AddLine'>New</ReqoreButton>
      <ReqoreButton icon='FileCopyLine' aria-label='Copy' />
      <ReqoreButton icon='DeleteBin6Line' aria-label='Delete' intent='danger' />
    </ReqoreButtonRail>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('toolbar')).toBeTruthy();
  },
};

/** The rail the Qorus marketing site's page editor floats at the bottom of the page. */
export const EditorBar: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the page-editor rail — Select (active, in its success tint while picking), Undo, Redo (disabled: nothing to redo) and History — over a busy backdrop, so the frosted surface blurs what is behind it.',
      },
    },
  },
  render: (args) => (
    <Backdrop>
      <ReqoreButtonRail aria-label='Page editor' {...args}>
        {editorButtons({ picking: true })}
      </ReqoreButtonRail>
    </Backdrop>
  ),
};

/** The same rail on a light theme. */
export const LightTheme: Story = {
  args: { mainTheme: '#f4f4f4' } as Story['args'],
  parameters: {
    docs: {
      description: {
        story:
          'Renders the page-editor rail on a light theme: the surface, hairline and shadow are derived from the theme, so the rail is a light frosted pill with a soft shadow rather than a dark one.',
      },
    },
  },
  render: EditorBar.render,
};

export const Items: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a rail declared with the `items` prop (each entry is a `ReqoreButton`’s props) followed by an element child — the items come first and neither form is dropped.',
      },
    },
  },
  render: (args) => (
    <ReqoreButtonRail
      aria-label='Zoom'
      items={[
        { id: 'out', icon: 'ZoomOutLine', 'aria-label': 'Zoom out' },
        { id: 'fit', label: 'Fit', icon: 'FullscreenLine' },
        { id: 'in', icon: 'ZoomInLine', 'aria-label': 'Zoom in' },
      ]}
      {...args}
    >
      <ReqoreButton icon='Settings3Line' aria-label='Settings' />
    </ReqoreButtonRail>
  ),
};

export const Vertical: Story = {
  args: { vertical: true },
  parameters: {
    docs: {
      description: {
        story:
          'Renders a vertical rail: a column of icon buttons in a tall pill, announced as a vertical toolbar; the up / down arrow keys move between its buttons.',
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup gapSize='huge' verticalAlign='flex-start'>
      <ReqoreButtonRail aria-label='Tools' {...args}>
        <ReqoreButton icon='CursorLine' active />
        <ReqoreButton icon='PencilLine' />
        <ReqoreButton icon='ShapeLine' />
        <ReqoreButton icon='Text' />
      </ReqoreButtonRail>
      <ReqoreButtonRail aria-label='Tools, labelled' {...args}>
        <ReqoreButton icon='CursorLine' active>
          Select
        </ReqoreButton>
        <ReqoreButton icon='PencilLine'>Draw</ReqoreButton>
        <ReqoreButton icon='ShapeLine'>Shape</ReqoreButton>
      </ReqoreButtonRail>
    </ReqoreControlGroup>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the editor rail at every size, micro to massive: the padding, the gap between buttons and the buttons themselves all scale with the rail’s `size`.',
      },
    },
  },
  render: (args) => (
    <Matrix>
      {ALL_SIZES.map((size) => (
        <Row key={size} label={size}>
          <ReqoreButtonRail aria-label={`Editor ${size}`} {...args} size={size}>
            {editorButtons()}
          </ReqoreButtonRail>
        </Row>
      ))}
    </Matrix>
  ),
};

export const Intents: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a rail per intent: the intent tints the surface and its hairline, and — as in a control group — colours the buttons that do not set their own intent.',
      },
    },
  },
  render: (args) => (
    <Matrix>
      {(Object.keys(DEFAULT_INTENTS) as TReqoreIntent[]).map((intent) => (
        <Row key={intent} label={intent}>
          <ReqoreButtonRail aria-label={intent} {...args} intent={intent}>
            <ReqoreButton icon='CheckLine'>Approve</ReqoreButton>
            <ReqoreButton icon='ChatQuoteLine' aria-label='Comment' />
            <ReqoreButton icon='MoreLine' aria-label='More' />
          </ReqoreButtonRail>
        </Row>
      ))}
    </Matrix>
  ),
};

export const Surfaces: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the surface variants over a busy backdrop: the default frosted bordered pill, `flat` (no border), `flat` + `raised` (inset highlight), `opacity={1}` (solid, no frost), `elevated={false}` (no shadow), `transparent` (no surface) and `minimal` (no surface, minimal buttons).',
      },
    },
  },
  render: (args) => (
    <Backdrop height={520}>
      <Matrix>
        {(
          [
            ['default', {}],
            ['flat', { flat: true }],
            ['flat + raised', { flat: true, raised: true }],
            ['opacity 1', { opacity: 1 }],
            ['elevated false', { elevated: false }],
            ['transparent', { transparent: true }],
            ['minimal', { minimal: true }],
          ] as [string, Partial<IReqoreButtonRailProps>][]
        ).map(([label, props]) => (
          <Row key={label} label={label}>
            <ReqoreButtonRail aria-label={label} {...args} {...props}>
              {editorButtons()}
            </ReqoreButtonRail>
          </Row>
        ))}
      </Matrix>
    </Backdrop>
  ),
};

export const Shapes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the corner options: the default pill (buttons follow as pills), a fixed `radiusSize="big"` radius, and `rounded={false}`, which squares the rail and its buttons.',
      },
    },
  },
  render: (args) => (
    <Matrix>
      <Row label='pill (default)'>
        <ReqoreButtonRail aria-label='Pill' {...args}>
          {editorButtons()}
        </ReqoreButtonRail>
      </Row>
      <Row label='radiusSize big'>
        <ReqoreButtonRail aria-label='Radius' {...args} radiusSize='big'>
          {editorButtons()}
        </ReqoreButtonRail>
      </Row>
      <Row label='rounded false'>
        <ReqoreButtonRail aria-label='Square' {...args} rounded={false}>
          {editorButtons()}
        </ReqoreButtonRail>
      </Row>
    </Matrix>
  ),
};

export const WithEffects: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the rail with `effect`s: a brand gradient, two stacked gradients (the `gradient` array — a green radial glow on the right over a purple linear base), and a glow that shows together with the floating shadow instead of replacing it. The gradients show in the rail’s padding ring and between its buttons.',
      },
    },
  },
  render: (args) => (
    <Matrix>
      <Row label='gradient'>
        <ReqoreButtonRail
          aria-label='Gradient'
          {...args}
          effect={{ gradient: { colors: { 0: '#803a8a', 100: '#4a6b27' }, direction: 'to right' } }}
        >
          {editorButtons()}
        </ReqoreButtonRail>
      </Row>
      <Row label='gradient array'>
        <ReqoreButtonRail
          aria-label='Gradient array'
          {...args}
          effect={{
            gradient: [
              {
                type: 'radial',
                shape: 'ellipse',
                size: '60% 160%',
                direction: 'at 100% 50%',
                colors: { 0: '#8db844:darken:1:0.9', 100: '#8db844:darken:1:0' },
              },
              { colors: { 0: '#803a8a', 100: '#3d1a42' }, direction: 'to right' },
            ],
          }}
        >
          {editorButtons()}
        </ReqoreButtonRail>
      </Row>
      <Row label='glow'>
        <ReqoreButtonRail
          aria-label='Glow'
          {...args}
          effect={{ glow: { color: 'info', blur: 14, size: 1, opacity: 0.6 } }}
        >
          {editorButtons()}
        </ReqoreButtonRail>
      </Row>
    </Matrix>
  ),
};

export const WithActiveButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a view switcher: one button is `active` and the others are not, with a line under the rail naming the current view. Clicking another button moves the active state to it.',
      },
    },
  },
  render: (args) => {
    const ViewSwitcher = () => {
      const [view, setView] = useState('board');

      return (
        <ReqoreControlGroup vertical gapSize='big'>
          <ReqoreButtonRail aria-label='View' {...args}>
            {[
              ['list', 'ListCheck', 'List'],
              ['board', 'LayoutColumnLine', 'Board'],
              ['calendar', 'CalendarLine', 'Calendar'],
            ].map(([id, icon, label]) => (
              <ReqoreButton
                key={id}
                icon={icon as 'ListCheck'}
                active={view === id}
                onClick={() => setView(id)}
                data-view={id}
              >
                {label}
              </ReqoreButton>
            ))}
          </ReqoreButtonRail>
          <ReqoreSpan size='small' className='button-rail-view-readout' data-view-current={view}>
            Showing the {view} view
          </ReqoreSpan>
        </ReqoreControlGroup>
      );
    };

    return <ViewSwitcher />;
  },
  play: async ({ canvasElement }) => {
    const calendar = await waitFor(() => {
      const node = canvasElement.querySelector('[data-view="calendar"]') as HTMLElement;
      expect(node).toBeTruthy();
      return node;
    });

    await userEvent.click(calendar);
    await waitFor(() =>
      expect(
        canvasElement.querySelector('.button-rail-view-readout')?.getAttribute('data-view-current')
      ).toBe('calendar')
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: {
    docs: {
      description: {
        story:
          'Renders a disabled rail: every button in it is disabled (dimmed, not clickable, out of the tab order); the surface itself is left as it is so the buttons are not dimmed twice.',
      },
    },
  },
  render: (args) => (
    <ReqoreButtonRail aria-label='Page editor' {...args}>
      {editorButtons()}
    </ReqoreButtonRail>
  ),
};

export const Tooltip: Story = {
  args: { tooltip: 'Page editor — pick an element, undo, redo or open the history' },
  parameters: {
    docs: {
      description: {
        story:
          'Renders a rail with its own `tooltip`, shown when hovering the rail’s surface; each button keeps its own tooltip too.',
      },
    },
  },
  render: EditorBar.render,
};

export const CustomTheme: Story = {
  args: { customTheme: { main: '#4a1f55' } },
  parameters: {
    docs: {
      description: {
        story:
          'Renders a rail with `customTheme={{ main: "#4a1f55" }}`: the surface is derived from the purple main colour and the buttons inherit the same theme.',
      },
    },
  },
  render: (args) => (
    <ReqoreButtonRail aria-label='Page editor' {...args}>
      {editorButtons({ historyOpen: true })}
    </ReqoreButtonRail>
  ),
};

export const FluidAndFixed: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a `fluid` rail that spans its 600px container (its buttons grow to share the width) above a default rail that only takes the width it needs.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 600, maxWidth: '100%' }}>
      <Matrix>
        <ReqoreButtonRail aria-label='Fluid' {...args} fluid>
          {editorButtons()}
        </ReqoreButtonRail>
        <ReqoreButtonRail aria-label='Fit content' {...args}>
          {editorButtons()}
        </ReqoreButtonRail>
      </Matrix>
    </div>
  ),
};

export const KeyboardNavigation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the editor rail as a toolbar. With focus on Select, the right arrow skips the disabled Redo on its way through the buttons, and End jumps to History.',
      },
    },
  },
  render: EditorBar.render,
  play: async ({ canvasElement }) => {
    const buttons = await waitFor(() => {
      const nodes = canvasElement.querySelectorAll<HTMLButtonElement>(
        '.reqore-button-rail .reqore-button'
      );
      expect(nodes.length).toBe(4);
      return nodes;
    });

    buttons[0].focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(document.activeElement).toBe(buttons[1]));
    await userEvent.keyboard('{ArrowRight}');
    // Redo is disabled, so focus lands on History.
    await waitFor(() => expect(document.activeElement).toBe(buttons[3]));
    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(document.activeElement).toBe(buttons[0]));
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(document.activeElement).toBe(buttons[3]));
  },
};

export const Mobile: Story = {
  args: { responsive: true },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    qlip: { viewport: { width: 380, height: 700 } },
    docs: {
      description: {
        story:
          'Renders a long `responsive` rail on a phone-width screen (captured at 380px): the buttons that do not fit fold into an overflow menu button at the end of the rail instead of overflowing the screen.',
      },
    },
  },
  render: (args) => (
    <div style={{ padding: 12, maxWidth: '100%', boxSizing: 'border-box' }}>
      <ReqoreButtonRail aria-label='Page editor' {...args}>
        {editorButtons()}
        <ReqoreButton icon='Settings3Line'>Settings</ReqoreButton>
        <ReqoreButton icon='ShareLine'>Share</ReqoreButton>
        <ReqoreButton icon='EyeLine'>Preview</ReqoreButton>
      </ReqoreButtonRail>
    </div>
  ),
};
