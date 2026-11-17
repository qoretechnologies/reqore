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

/** The colour of the nearest box behind `element` that paints one. */
const surfaceBehind = (element: Element): string => {
  for (let node: Element | null = element.parentElement; node; node = node.parentElement) {
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

  return { drawn, width: parseFloat(style.outlineWidth), style: style.outlineStyle, color: style.outlineColor };
};

export const DrawnForTheKeyboardOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a button, an interactive tag, a checkbox, a link and a tab bar. Tabbing through them draws one ring on each, in the readable text colour, at least 3:1 against the surface it sits on; a mouse click on the button draws none. Captured with the first button focused from the keyboard.',
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
      expect(
        getContrast(ringOnSurface(ring.color, surfaceBehind(ring.drawn)), surfaceBehind(ring.drawn)),
        `${focused.className}'s ring stands out`
      ).toBeGreaterThanOrEqual(3);
      seen.push(focused.tagName);
    }
    expect(seen.length).toBe(5);

    // End on the first control focused while the keyboard is in use, for the capture: the last
    // input was a key, so its focus is drawn as the keyboard's.
    first.focus();
    await waitFor(() => expect(ringOf(first).style).toBe('solid'));
  },
};
