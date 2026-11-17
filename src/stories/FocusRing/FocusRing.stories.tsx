import { StoryObj } from '@storybook/react';
import { getContrast } from 'polished';
import { expect, userEvent, waitFor } from 'storybook/test';
import {
  ReqoreButton,
  ReqoreCheckbox,
  ReqoreControlGroup,
  ReqoreLink,
  ReqoreTabs,
  ReqoreTabsContent,
  ReqoreTag,
} from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Utilities/Focus Ring',
  component: ReqoreButton,
} as StoryMeta<typeof ReqoreButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The colour of the nearest box that paints one, from `element` outwards. */
const surfaceFrom = (element: Element | null): string => {
  for (let node: Element | null = element; node; node = node.parentElement) {
    const { backgroundColor } = getComputedStyle(node);
    if (backgroundColor && !/rgba\(.*, 0\)$|transparent/.test(backgroundColor)) {
      return backgroundColor;
    }
  }
  return getComputedStyle(document.body).backgroundColor;
};

/** The ring as it is drawn over the surface: a translucent colour blended onto what is behind it. */
const ringOnSurface = (ring: string, surface: string): string => {
  const [r, g, b, a = 1] = ring.match(/[\d.]+/g)!.map(Number);
  const [sr, sg, sb] = surface.match(/[\d.]+/g)!.map(Number);
  const mix = (top: number, bottom: number) => Math.round(top * a + bottom * (1 - a));

  return `rgb(${mix(r, sr)}, ${mix(g, sg)}, ${mix(b, sb)})`;
};

/** Where focus is drawn, for the control that has it: its own outline, or (a checkbox) its box's. */
const ringOf = (focused: Element) => {
  const drawn = focused.matches('.reqore-checkbox-input')
    ? (focused.nextElementSibling as HTMLElement)
    : (focused as HTMLElement);
  const style = getComputedStyle(drawn);

  const width = parseFloat(style.outlineWidth);
  // How far the ring reaches past the control's edge: 0 or less is a ring drawn inside it.
  const reach = parseFloat(style.outlineOffset) + width;

  return {
    drawn,
    width,
    reach,
    style: style.outlineStyle,
    color: style.outlineColor,
    // A ring inside the edge is seen against the control's own fill; one outside, against what is
    // behind the control.
    surface: reach <= 0 ? surfaceFrom(drawn) : surfaceFrom(drawn.parentElement),
  };
};

export const DrawnForTheKeyboardOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a button, an interactive tag, a checkbox, a link and a tab bar. Tabbing through them draws one ring on each, in the readable text colour, at least 3:1 against the surface it sits on, at once rather than eased in; a mouse click on the button draws none. Captured with the first button focused from the keyboard.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big'>
      <ReqoreControlGroup>
        <ReqoreButton className='story-first'>Save</ReqoreButton>
        <ReqoreTag label='Filter: failing' onClick={() => undefined} />
        <ReqoreCheckbox label='Only mine' checked={false} onClick={() => undefined} />
        <ReqoreLink href='#help'>Help</ReqoreLink>
      </ReqoreControlGroup>
      <ReqoreTabs
        tabs={[
          { id: 'one', label: 'Overview' },
          { id: 'two', label: 'History' },
        ]}
      >
        <ReqoreTabsContent tabId='one'>Overview</ReqoreTabsContent>
        <ReqoreTabsContent tabId='two'>History</ReqoreTabsContent>
      </ReqoreTabs>
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const first = await waitFor(() => {
      const element = canvasElement.querySelector<HTMLButtonElement>('.story-first');
      expect(element).toBeTruthy();
      return element!;
    });

    /* A click with the browser's own mouse draws no ring (a dispatched click does not count as a
       pointer to the browser, so it is only checked where the real mouse is there to move). The
       mouse then leaves the page: hovering draws a button's own outline. */
    let browser:
      | {
          userEvent: { click(element: Element): Promise<void>; tab(): Promise<void> };
          cdp(): { send(method: string, params?: Record<string, unknown>): Promise<unknown> };
        }
      | undefined;
    try {
      browser = (await import('vitest/browser')) as never;
    } catch {
      browser = undefined;
    }
    if (browser) {
      await browser.userEvent.click(first);
      await browser.cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: -1, y: -1 });
      expect(document.activeElement).toBe(first);
      await waitFor(() => expect(ringOf(first).style).toBe('none'));
    }

    // The keyboard (the browser's own, where it is there): a ring on every control, readable
    // against its surface.
    const tab = () => (browser ? browser.userEvent.tab() : userEvent.tab());
    first.blur();
    const seen: string[] = [];
    for (let index = 0; index < 5; index += 1) {
      await tab();
      const focused = document.activeElement!;
      const ring = ringOf(focused);

      expect(ring.style, `${focused.className} draws a ring`).toBe('solid');
      expect(ring.width).toBeGreaterThanOrEqual(2);
      // Settled, not part way through the colour fading in.
      await waitFor(() =>
        expect(
          getContrast(ringOnSurface(ringOf(focused).color, ring.surface), ring.surface),
          `${focused.className}'s ring stands out`
        ).toBeGreaterThanOrEqual(3)
      );
      seen.push(focused.tagName);
    }
    expect(seen.length).toBe(5);

    // End on the first control focused while the keyboard is in use, for the capture: the last
    // input was a key, so its focus is drawn as the keyboard's.
    first.blur();
    first.focus();
    await waitFor(() => expect(ringOf(first).style).toBe('solid'));
    // Drawn at once, in its settled colour: no fade a capture (or a reader) could catch part way.
    const atOnce = ringOf(first).color;
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(ringOf(first).color).toBe(atOnce);
  },
};

export const KeptInsideAClippingBox: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders three buttons and a tag flush in a box that clips (`overflow: hidden`, no padding), as a table cell, a field, a scrolling action group or a segmented control holds them. Tabbing to each draws its whole ring: the ring is inside the control\'s edge, so the box cannot cut any of it away. Captured with the middle button focused.',
      },
    },
  },
  render: () => (
    <div className='story-clipping-box' style={{ overflow: 'hidden', display: 'inline-flex' }}>
      <ReqoreControlGroup stack>
        <ReqoreButton className='story-first'>Run</ReqoreButton>
        <ReqoreButton className='story-middle' icon='PlayLine' tooltip='Start' />
        <ReqoreButton>Stop</ReqoreButton>
        <ReqoreTag label='Failing' onClick={() => undefined} />
      </ReqoreControlGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector<HTMLElement>('.story-clipping-box')!;
    const first = await waitFor(() => {
      const element = box.querySelector<HTMLButtonElement>('.story-first');
      expect(element).toBeTruthy();
      return element!;
    });
    const edge = box.getBoundingClientRect();

    first.focus();
    for (let index = 0; index < 4; index += 1) {
      if (index > 0) {
        await userEvent.tab();
      }
      const focused = document.activeElement as HTMLElement;
      const ring = ringOf(focused);
      const rect = focused.getBoundingClientRect();
      const out = Math.max(0, ring.reach);

      expect(box.contains(focused)).toBe(true);
      expect(ring.style, `${focused.className} draws a ring`).toBe('solid');
      // Every side of the ring is inside the clipping box.
      expect(rect.left - out).toBeGreaterThanOrEqual(edge.left - 0.5);
      expect(rect.top - out).toBeGreaterThanOrEqual(edge.top - 0.5);
      expect(rect.right + out).toBeLessThanOrEqual(edge.right + 0.5);
      expect(rect.bottom + out).toBeLessThanOrEqual(edge.bottom + 0.5);
    }

    const middle = box.querySelector<HTMLButtonElement>('.story-middle')!;
    middle.focus();
    await waitFor(() => expect(ringOf(middle).style).toBe('solid'));
  },
};
