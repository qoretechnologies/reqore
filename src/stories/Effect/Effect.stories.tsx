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
