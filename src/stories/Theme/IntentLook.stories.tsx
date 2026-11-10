import { StoryObj } from '@storybook/react';
import { ReactNode } from 'react';
import { expect } from 'storybook/test';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreUIProvider from '../../containers/UIProvider';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreLayoutContent,
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
          'The default fill (left) and `intentLook: { danger: "outline" }` (right): a destructive control says so at rest — red words and icon and a red border on the ordinary button, the bin included, never a red block. Under the pointer the border is the full red.',
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
    for (const el of [button, bin]) {
      await expect(el.getAttribute('data-intent-text')).toBe('outline');
      // At rest, with no pointer on it: red words or icon, and a red edge.
      await expect(isRed(getComputedStyle(el).color)).toBe(true);
      await expect(isRed(edgeColour(el))).toBe(true);
    }
    // Not a red block: the outline button keeps an ordinary surface.
    await expect(getComputedStyle(button).backgroundColor).not.toBe(
      getComputedStyle(fill).backgroundColor
    );
  },
};
