import { StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { CSSProperties } from 'react';
import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreH3,
  ReqoreP,
  ReqorePanel,
  ReqoreSpan,
  ReqoreTable,
  REQORE_MARQUEE_OPT_OUT,
} from '../../index';
import { MARQUEE_STATE_ATTRIBUTE } from '../../hooks/useMarqueeOnHover';
import { StoryMeta } from '../utils';

const LONG = 'Deploy the order-router workflow to the production cluster';
const LONGER =
  'Quarterly reconciliation of partner invoices against the ledger, with retries';

/** A single-line clip an app might put on any text element of its own. */
const CLIP: CSSProperties = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

/** The kinds of truncated text Reqore renders, squeezed into a narrow column
 *  so each one is clipped — the surfaces the hover marquee applies to. (A tag
 *  is absent only because ReqoreTag does not clip its label in a column like
 *  this; once it does, it joins by the same rule.) */
const Column = ({ optOut }: { optOut?: boolean }) => (
  <div style={{ width: 240 }} {...(optOut ? REQORE_MARQUEE_OPT_OUT : {})}>
    <ReqoreControlGroup vertical fluid gapSize='big'>
      <ReqoreButton icon='RocketLine' fluid>
        {LONG}
      </ReqoreButton>
      <ReqorePanel label={LONGER} size='small' minimal flat>
        <ReqoreP style={CLIP}>{LONG}</ReqoreP>
      </ReqorePanel>
      <ReqoreTable
        size='small'
        height={90}
        columns={[
          { dataId: 'name', header: { label: 'Name' }, width: 120 },
          { dataId: 'status', header: { label: 'Status' }, width: 100 },
        ]}
        data={[{ name: LONGER, status: 'running' }]}
      />
      <ReqoreH3 style={CLIP}>{LONGER}</ReqoreH3>
      <ReqoreSpan style={{ ...CLIP, display: 'block' }}>{LONG}</ReqoreSpan>
    </ReqoreControlGroup>
  </div>
);

const meta = {
  title: 'Utilities/Marquee On Hover',
  component: Column,
  parameters: {
    docs: {
      description: {
        component:
          "Truncated text scrolls into view while the pointer rests on it — right to left at a constant speed, easing out at the end, holding a second, snapping back and repeating. A `ReqoreUIProvider` behaviour (`options.animations.marquee`, on by default), installed once on the document and keyed off the actual CSS truncation, so a button label, a tag, a table cell, a panel title, a heading or any element with `text-overflow: ellipsis` gets it with nothing wired per component. Pointer devices only; never under `prefers-reduced-motion`; `data-reqore-marquee='false'` opts an element out.",
      },
    },
  },
} as StoryMeta<typeof Column>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The truncated text scrolls into view while the pointer rests on it. */
const scrolledToTheEnd = async (canvasElement: HTMLElement, text: RegExp) => {
  const canvas = within(canvasElement);
  const target = canvas.getAllByText(text)[0];
  await userEvent.hover(target);
  await waitFor(
    () => {
      const box = canvasElement.querySelector(`[${MARQUEE_STATE_ATTRIBUTE}]`) as HTMLElement;
      expect(box).not.toBeNull();
      expect(box.getAttribute(MARQUEE_STATE_ATTRIBUTE)).toBe('end');
    },
    { timeout: 15000 }
  );
};

/** RESTING — every clipped surface as it looks with the pointer elsewhere:
 *  ellipsis, exactly as before. */
export const Resting: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a 240px column of truncated Reqore text — a button label, a panel title and its paragraph, a table cell, a heading and a span — with the pointer elsewhere: each shows its ellipsis exactly as before, since the marquee only runs while hovered.',
      },
    },
  },
};

/** SCROLLS — rest the pointer on the button's label: it scrolls to its tail,
 *  eases out and holds (the story holds for a minute, so the snapshot shows the
 *  fully revealed text). */
export const Scrolls: Story = {
  args: { options: { animations: { marquee: { pause: 60000 } } } },
  parameters: {
    docs: {
      description: {
        story:
          "Renders the column and rests the pointer on the button's label (play): the clipped label scrolls right to left to its tail with the ellipsis gone and the clipped edge fading, eases out and holds — the story's provider holds for a minute, so the snapshot shows the button label fully revealed at its end while everything else keeps its ellipsis.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await scrolledToTheEnd(canvasElement, /Deploy the order-router/);
  },
};

/** HEADINGS — the same on an app's own clipped heading. */
export const Headings: Story = {
  args: { options: { animations: { marquee: { pause: 60000 } } } },
  parameters: {
    docs: {
      description: {
        story:
          "Renders the column and rests the pointer on the clipped ReqoreH3 (play): nothing was added to the heading — it is an element with `text-overflow: ellipsis` like any other — and it scrolls to its tail and holds, which the snapshot captures.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole('heading', { level: 3 }));
    await waitFor(
      () =>
        expect(canvas.getByRole('heading', { level: 3 })).toHaveAttribute(
          MARQUEE_STATE_ATTRIBUTE,
          'end'
        ),
      { timeout: 15000 }
    );
  },
};

/** RETURNS ON LEAVE — moving the pointer away snaps the text back and puts the
 *  ellipsis back. Behaviour-only: its end state is the resting one. */
export const ReturnsOnLeave: Story = {
  parameters: {
    qlip: { skip: true },
    docs: {
      description: {
        story:
          "Drives the marquee live (play): hovers the button's label until it has scrolled, then moves the pointer away and asserts the text is back at its start with the ellipsis restored. No snapshot — its end state is the Resting one.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getAllByText(/Deploy the order-router/)[0];
    await userEvent.hover(label);
    await waitFor(() => {
      const box = canvasElement.querySelector(`[${MARQUEE_STATE_ATTRIBUTE}]`) as HTMLElement;
      expect(box).not.toBeNull();
      expect(box.scrollLeft).toBeGreaterThan(0);
    });
    const box = canvasElement.querySelector(`[${MARQUEE_STATE_ATTRIBUTE}]`) as HTMLElement;
    await userEvent.unhover(label);
    await waitFor(() => {
      expect(box.scrollLeft).toBe(0);
      expect(box).not.toHaveAttribute(MARQUEE_STATE_ATTRIBUTE);
      expect(getComputedStyle(box).textOverflow).toBe('ellipsis');
    });
  },
};

/** OPT OUT — `data-reqore-marquee="false"` on an ancestor keeps every clipped
 *  text under it still. Behaviour-only. */
export const OptOut: Story = {
  args: { optOut: true },
  parameters: {
    qlip: { skip: true },
    docs: {
      description: {
        story:
          "Renders the column inside an element carrying `data-reqore-marquee='false'` and hovers the button's label (play): nothing scrolls and no marquee state appears — the opt-out covers the element and everything under it. No snapshot — it looks like Resting.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getAllByText(/Deploy the order-router/)[0]);
    await new Promise((resolve) => setTimeout(resolve, 800));
    await expect(canvasElement.querySelector(`[${MARQUEE_STATE_ATTRIBUTE}]`)).toBeNull();
  },
};
