import { StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';
import { ReqoreSpan } from '../../components/Span';
import {
  ReqoreButton,
  ReqoreCallout,
  ReqoreControlGroup,
  ReqoreEntityRow,
  ReqoreTag,
  ReqoreVerticalSpacer,
} from '../../index';
import { StoryMeta } from '../utils';

/**
 * `effect` is not a component, so its stories are grouped by the effect
 * itself rather than by whichever component happens to demonstrate it.
 * An effect that only ever appears in one component's stories reads as
 * that component's feature, which is exactly the wrong impression when
 * the whole point is that it works everywhere.
 */
const meta = {
  title: 'Utilities/Effect',
  component: ReqoreSpan,
} as StoryMeta<typeof ReqoreSpan>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BorderStyle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`effect.borderStyle` sets how a border is drawn on ANY effect-aware surface. A dashed or dotted border reads as \"this is a slot, not a thing\" — the convention for an *add* affordance, where the control stands in for content that does not exist yet. It sets the style only and never draws a border that was not there, so a `flat` surface is unaffected; the last row shows that.",
      },
    },
  },
  render: () => (
    <>
      <ReqoreSpan>Buttons — solid (default), dashed, dotted</ReqoreSpan>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreControlGroup>
        <ReqoreButton label='Solid' icon='AddLine' />
        <ReqoreButton effect={{ borderStyle: 'dashed' }} label='Dashed' icon='AddLine' />
        <ReqoreButton effect={{ borderStyle: 'dotted' }} label='Dotted' icon='AddLine' />
      </ReqoreControlGroup>

      <ReqoreVerticalSpacer height={20} />
      {/* Deliberately not ReqorePanel: it takes `contentEffect`, which
          styles its content wrapper, not its own border — so it is not an
          effect-aware surface for this and showing it would be a lie. */}
      <ReqoreSpan>The same effect on other effect-aware surfaces</ReqoreSpan>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreControlGroup verticalAlign='center'>
        <ReqoreTag effect={{ borderStyle: 'dashed' }} label='A tag' />
        <ReqoreTag effect={{ borderStyle: 'dotted' }} label='Dotted tag' intent='info' />
      </ReqoreControlGroup>

      <ReqoreVerticalSpacer height={10} />
      <ReqoreCallout
        effect={{ borderStyle: 'dashed' }}
        intent='info'
        label='A callout'
        description='Its border is dashed too.'
      />

      <ReqoreVerticalSpacer height={10} />
      <ReqoreEntityRow
        effect={{ borderStyle: 'dotted' }}
        icon='AddLine'
        label='An entity row'
        description='Nothing here yet.'
      />

      <ReqoreVerticalSpacer height={20} />
      <ReqoreSpan>
        Composes with intent, size and minimal — it is a prop, not a variant
      </ReqoreSpan>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreControlGroup>
        <ReqoreButton effect={{ borderStyle: 'dashed' }} intent='info' label='Info' />
        <ReqoreButton effect={{ borderStyle: 'dashed' }} intent='success' label='Success' />
        <ReqoreButton effect={{ borderStyle: 'dashed' }} minimal label='Minimal' />
        <ReqoreButton effect={{ borderStyle: 'dashed' }} size='small' label='Small' />
      </ReqoreControlGroup>

      <ReqoreVerticalSpacer height={20} />
      <ReqoreSpan>`flat` draws no border, so there is nothing to style — inert, not wrong</ReqoreSpan>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreControlGroup>
        <ReqoreButton flat effect={{ borderStyle: 'dashed' }} label='Flat button' icon='AddLine' />
      </ReqoreControlGroup>
    </>
  ),
  play: async ({ canvasElement }) => {
    const buttons = canvasElement.querySelectorAll('button');
    // The computed style, not the prop — the pixels are what is claimed.
    await expect(getComputedStyle(buttons[0]).borderStyle).toBe('solid');
    await expect(getComputedStyle(buttons[1]).borderStyle).toBe('dashed');
    await expect(getComputedStyle(buttons[2]).borderStyle).toBe('dotted');

    // Inert on flat: no border width, so nothing is drawn either way.
    const flatButton = buttons[buttons.length - 1];
    await expect(getComputedStyle(flatButton).borderTopWidth).toBe('0px');
  },
};

export const GradientRing: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`gradient.surface` paints the first gradient on the BORDER only and fills the surface with a plain colour: a gradient ring around a normal surface. The top row is the default (the gradient fills the button and a lighter echo of it draws the border); the second row is the same gradient as a ring around a dark surface; the third animates the ring (`animate: \'always\'`). The readable text colour follows the surface, not the gradient. A ring needs a border to draw on: on a surface without one (a flat surface, a tag) there is nothing to paint.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big'>
      <ReqoreControlGroup>
        <ReqoreButton label='Filled (default)' effect={{ gradient: { colors: { 0: '#a45fae', 50: '#8db844', 100: '#a45fae' } } }} />
      </ReqoreControlGroup>
      <ReqoreControlGroup>
        <ReqoreButton
          label='Ring'
          data-testid='ring'
          effect={{ gradient: { colors: { 0: '#a45fae', 50: '#8db844', 100: '#a45fae' }, surface: '#15121c' } }}
        />
      </ReqoreControlGroup>
      <ReqoreControlGroup>
        <ReqoreButton
          label='Flowing ring'
          effect={{
            gradient: { colors: { 0: '#a45fae', 50: '#8db844', 100: '#a45fae' }, surface: '#15121c', animate: 'always', animationSpeed: 3 },
          }}
        />
      </ReqoreControlGroup>
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const ring = canvasElement.querySelector('[data-testid="ring"]') as HTMLElement;
    const style = getComputedStyle(ring);
    // The surface colour fills the padding box; the gradient is only on the border box.
    await expect(style.backgroundImage).toMatch(/linear-gradient\(rgb\(21, 18, 28\), rgb\(21, 18, 28\)\).*linear-gradient/);
    await expect(style.backgroundClip).toContain('padding-box');
    await expect(style.backgroundClip).toContain('border-box');
  },
};

export const GlowList: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`glow` takes a list as well as a single glow, painted together, and each glow can be offset (`x`, `y`). Two offset glows make a two-tone shadow: purple to the left, green to the right. The single centred glow next to it is the familiar default. A list follows the first glow\'s `when`.',
      },
    },
  },
  render: () => (
    <div style={{ padding: 40 }}>
      <ReqoreControlGroup gapSize='huge'>
        <ReqoreButton label='One glow' effect={{ glow: { color: '#a45fae', blur: 24, opacity: 0.6 } }} />
        <ReqoreButton
          label='Two-tone glow'
          data-testid='two-tone'
          effect={{
            glow: [
              { color: '#a45fae', blur: 34, x: -14, y: 6, opacity: 0.55 },
              { color: '#8db844', blur: 34, x: 14, y: 6, opacity: 0.5 },
            ],
          }}
        />
      </ReqoreControlGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('[data-testid="two-tone"]') as HTMLElement;
    const shadow = getComputedStyle(el).boxShadow;
    // Both glows, each at its own offset.
    await expect(shadow).toMatch(/-14px 6px 34px/);
    await expect(shadow).toMatch(/14px 6px 34px/);
  },
};
