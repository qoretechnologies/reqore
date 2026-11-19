import { StoryObj } from '@storybook/react';
import { ReactNode } from 'react';
import { expect, userEvent } from 'storybook/test';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreUIProvider from '../../containers/UIProvider';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreLayoutContent,
  ReqoreMenu,
  ReqoreMenuItem,
  ReqoreP,
  ReqorePanel,
} from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Theme/Intent look',
  component: ReqoreUIProvider,
  parameters: {
    docs: {
      description: {
        component:
          '`theme.buttons.intentLook` draws an intent as a fill (the default), as text or as an outline. With `{ danger: "text" }` a destructive button is red words on a plain button, and an icon-only bin is an ordinary icon that turns red only under the pointer.',
      },
    },
  },
} as StoryMeta<typeof ReqoreUIProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

const FILL: Partial<IReqoreTheme> = { main: '#121212' };
const TEXT: Partial<IReqoreTheme> = { main: '#121212', buttons: { intentLook: { danger: 'text' } } };
const OUTLINE: Partial<IReqoreTheme> = {
  main: '#121212',
  buttons: { intentLook: { danger: 'outline' } },
};

/** The red channel of a computed colour (`rgb()` / `rgba()`, or `color(srgb …)` from a
 *  `color-mix`), as [r, g, b] in 0–255; the first colour in a shadow list. */
const channels = (value: string): number[] | undefined => {
  const rgb = value.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/);
  if (rgb) return rgb.slice(1, 4).map(Number);
  const srgb = value.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/);
  return srgb ? srgb.slice(1, 4).map((c) => Number(c) * 255) : undefined;
};
const isRed = (value: string) => {
  const c = channels(value);
  return !!c && c[0] > 150 && c[0] > c[1] + 60 && c[0] > c[2] + 60;
};
/** The colour a button's edge is drawn in: its border, or (a flat button) its inset ring. */
const edgeColour = (el: HTMLElement) => {
  const style = getComputedStyle(el);
  return parseFloat(style.borderTopWidth) > 0 && isRed(style.borderTopColor)
    ? style.borderTopColor
    : style.boxShadow;
};

const Specimen = () => (
  <ReqoreControlGroup vertical gapSize='big' fluid>
    <ReqoreControlGroup fluid={false}>
      <ReqoreButton className='specimen-delete' intent='danger' icon='DeleteBinLine'>
        Delete workflow
      </ReqoreButton>
      <ReqoreButton>Cancel</ReqoreButton>
    </ReqoreControlGroup>
    <ReqorePanel
      label='Order intake'
      flat
      actions={[
        { icon: 'EditLine', tooltip: 'Edit' },
        { icon: 'DeleteBinLine', intent: 'danger', tooltip: 'Delete', className: 'specimen-bin' },
      ]}
    >
      <ReqoreP size='small'>Receives orders from the shop and hands them to fulfilment.</ReqoreP>
    </ReqorePanel>
  </ReqoreControlGroup>
);

const Side = ({
  label,
  className,
  theme,
  children,
}: {
  label: string;
  className: string;
  theme: Partial<IReqoreTheme>;
  children: ReactNode;
}) => (
  <div className={className} style={{ padding: 24, flex: '1 1 420px', minWidth: 0 }}>
    <ReqoreUIProvider theme={theme}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ReqoreP size='small' effect={{ opacity: 0.6 }}>
            {label}
          </ReqoreP>
          {children}
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  </div>
);

export const FillAndText: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same buttons with the default fill (left) and with `intentLook: { danger: "text" }` (right): red words on a plain button, and a bin that is grey until hovered.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <Side label='Fill (default)' className='side-fill' theme={FILL}>
        <Specimen />
      </Side>
      <Side label='Text' className='side-text' theme={TEXT}>
        <Specimen />
      </Side>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const fill = canvasElement.querySelector<HTMLElement>('.side-fill .specimen-delete')!;
    const text = canvasElement.querySelector<HTMLElement>('.side-text .specimen-delete')!;
    const bin = canvasElement.querySelector<HTMLElement>('.side-text .specimen-bin')!;
    await expect(fill.getAttribute('data-intent-text')).toBeNull();
    await expect(text.getAttribute('data-intent-text')).toBe('label');
    // Not a red block: the text-look button keeps an ordinary surface.
    await expect(getComputedStyle(text).backgroundColor).not.toBe(
      getComputedStyle(fill).backgroundColor
    );
    await expect(bin.getAttribute('data-intent-text')).toBe('icon');
    await expect(bin.style.color).toBe('');
  },
};

export const Outline: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The default fill (left) and `intentLook: { danger: "outline" }` (right): a destructive control says so at rest — red words and icon and a red border on the ordinary button, never a red block. Under the pointer the border is the full red. The icon-only bin is its red icon, with no border and no fill.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <Side label='Fill (default)' className='side-fill' theme={FILL}>
        <Specimen />
      </Side>
      <Side label='Outline' className='side-outline' theme={OUTLINE}>
        <Specimen />
      </Side>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const fill = canvasElement.querySelector<HTMLElement>('.side-fill .specimen-delete')!;
    const button = canvasElement.querySelector<HTMLElement>('.side-outline .specimen-delete')!;
    const bin = canvasElement.querySelector<HTMLElement>('.side-outline .specimen-bin')!;
    await expect(button.getAttribute('data-intent-text')).toBe('outline');
    // At rest, with no pointer on it: red words and icon, and a red edge.
    await expect(isRed(getComputedStyle(button).color)).toBe(true);
    await expect(isRed(edgeColour(button))).toBe(true);
    // The bin is its red icon, with no edge.
    await expect(bin.getAttribute('data-intent-text')).toBe('outline-icon');
    await expect(isRed(getComputedStyle(bin).color)).toBe(true);
    await expect(isRed(edgeColour(bin))).toBe(false);
    // Not a red block: the outline button keeps an ordinary surface.
    await expect(getComputedStyle(button).backgroundColor).not.toBe(
      getComputedStyle(fill).backgroundColor
    );
  },
};

/** Whether a button draws a box: a fill, a border, an inset ring or a hover ring. */
const drawsABox = (el: HTMLElement) => {
  const style = getComputedStyle(el);
  const fill = channels(style.backgroundColor);
  const filled = !!fill && !/rgba\([^)]*,\s*0\)$|transparent/.test(style.backgroundColor);
  const bordered = parseFloat(style.borderTopWidth) > 0 && !/,\s*0\)$/.test(style.borderTopColor);
  const ringed = style.boxShadow !== 'none';
  const outlined = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
  return filled || bordered || ringed || outlined;
};

export const AnIconOnlyDangerButtonIsItsRedIcon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'With `intentLook: { danger: "outline" }`, an icon-only button with `intent="danger"` is its red icon and nothing else: no border and no fill, at rest, under the pointer and disabled, flat or not, and as a panel action. A labelled danger button beside it keeps its red outline.',
      },
    },
  },
  render: () => (
    <Side label='Outline' className='side-outline' theme={OUTLINE}>
      <ReqoreControlGroup fluid={false}>
        <ReqoreButton className='labelled-delete' intent='danger' icon='DeleteBinLine'>
          Delete workflow
        </ReqoreButton>
        <ReqoreButton className='bin-bordered' intent='danger' icon='DeleteBinLine' tooltip='Delete' />
        <ReqoreButton
          className='bin-flat'
          intent='danger'
          icon='DeleteBinLine'
          flat
          tooltip='Delete'
        />
        <ReqoreButton
          className='bin-disabled'
          intent='danger'
          icon='DeleteBinLine'
          disabled
          tooltip='Delete'
        />
      </ReqoreControlGroup>
      <ReqorePanel
        label='Order intake'
        flat
        actions={[
          { icon: 'EditLine', tooltip: 'Edit' },
          { icon: 'DeleteBinLine', intent: 'danger', tooltip: 'Delete', className: 'panel-bin' },
        ]}
      >
        <ReqoreP size='small'>Receives orders from the shop and hands them to fulfilment.</ReqoreP>
      </ReqorePanel>
    </Side>
  ),
  play: async ({ canvasElement }) => {
    const find = (name: string) => canvasElement.querySelector<HTMLElement>(`.${name}`)!;
    const labelled = find('labelled-delete');
    await expect(isRed(edgeColour(labelled))).toBe(true);

    for (const name of ['bin-bordered', 'bin-flat', 'bin-disabled', 'panel-bin']) {
      const bin = find(name);
      await expect(bin.getAttribute('data-intent-text')).toBe('outline-icon');
      await expect(isRed(getComputedStyle(bin).color)).toBe(true);
      await expect(drawsABox(bin)).toBe(false);
    }
    // under the pointer, still no box
    for (const name of ['bin-bordered', 'bin-flat', 'panel-bin']) {
      await userEvent.hover(find(name));
      await expect(drawsABox(find(name))).toBe(false);
      await expect(isRed(getComputedStyle(find(name)).color)).toBe(true);
    }
    await userEvent.unhover(find('panel-bin'));
  },
};

export const ADangerMenuEntryIsItsRedWords: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'With `intentLook: { danger: "outline" }`, a menu of an editor\'s actions: Save as it is, and Discard, Cancel and Delete with `intent="danger"`. Each danger entry is its red words and icon and nothing else: no border, no fill, no ring, at rest and under the pointer. A menu of them was a column of red boxes.',
      },
    },
  },
  render: () => (
    <Side label='Outline' className='side-outline' theme={OUTLINE}>
      <div style={{ width: 260 }}>
        <ReqoreMenu>
          <ReqoreMenuItem icon='SaveLine'>Save</ReqoreMenuItem>
          <ReqoreMenuItem className='menu-discard' intent='danger' icon='DeleteBack2Line'>
            Discard
          </ReqoreMenuItem>
          <ReqoreMenuItem className='menu-cancel' intent='danger' icon='CloseLine'>
            Cancel
          </ReqoreMenuItem>
          <ReqoreMenuItem className='menu-delete' intent='danger' icon='DeleteBinLine'>
            Delete
          </ReqoreMenuItem>
        </ReqoreMenu>
      </div>
    </Side>
  ),
  play: async ({ canvasElement }) => {
    const entry = (name: string) =>
      canvasElement.querySelector<HTMLElement>(`.menu-${name}.reqore-menu-item`)!;
    for (const name of ['discard', 'cancel', 'delete']) {
      await expect(entry(name).getAttribute('data-intent-text')).toBe('outline');
      await expect(isRed(getComputedStyle(entry(name)).color)).toBe(true);
      await expect(drawsABox(entry(name))).toBe(false);
    }
    // under the pointer, still no box
    await userEvent.hover(entry('delete'));
    await expect(drawsABox(entry('delete'))).toBe(false);
    await userEvent.unhover(entry('delete'));
  },
};

