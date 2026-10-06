import { StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';
import { TReqoreHexColor } from '../../components/Effect';
import { MONO_FONT } from '../../constants/fonts';
import ReqoreUIProvider from '../../containers/UIProvider';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreInput,
  ReqoreKeyboardShortcut,
  ReqoreLayoutContent,
  ReqoreP,
  ReqorePanel,
  ReqoreTag,
  ReqoreTextarea,
} from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Utilities/UI Provider',
  component: ReqoreUIProvider,
} as StoryMeta<typeof ReqoreUIProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------------------------------------
 * Fonts — controls are in the page's font, or the theme's
 * ---------------------------------------------------------------------------------------------- */

const Controls = () => (
  <ReqorePanel label='Order #48213' icon='TruckLine' style={{ maxWidth: 520 }}>
    <ReqoreControlGroup vertical gapSize='big'>
      <ReqoreP>Two labels were printed for one order thirty seconds apart.</ReqoreP>
      <ReqoreControlGroup>
        <ReqoreTag label='Duplicate' intent='danger' />
        <ReqoreTag label='Carrier: Parcel' />
        <ReqoreTag label='L-20931' appearance='soft' intent='info' />
      </ReqoreControlGroup>
      <ReqoreInput value='Resend the label' onChange={() => undefined} />
      <ReqoreTextarea value='Notes for the warehouse' onChange={() => undefined} />
      <ReqoreControlGroup>
        <ReqoreButton intent='info' icon='PlayLine'>
          Resume
        </ReqoreButton>
        <ReqoreButton>
          Search <ReqoreKeyboardShortcut shortcut='mod+k' />
        </ReqoreButton>
      </ReqoreControlGroup>
    </ReqoreControlGroup>
  </ReqorePanel>
);

const CONTROL_SELECTORS = [
  '.reqore-panel-title .reqore-heading',
  '.reqore-paragraph',
  '.reqore-tag',
  '.reqore-input',
  '.reqore-textarea',
  '.reqore-button',
  '.reqore-keyboard-shortcut-key',
];

const expectFontEverywhere = async (root: HTMLElement, font: string) => {
  for (const selector of CONTROL_SELECTORS) {
    const elements = Array.from(root.querySelectorAll(selector)) as HTMLElement[];

    await expect([selector, elements.length > 0]).toEqual([selector, true]);
    elements.forEach((element) =>
      expect([selector, getComputedStyle(element).fontFamily]).toEqual([selector, font])
    );
  }
};

const PAGE_FONT = 'Georgia, "Times New Roman", serif';

export const PageFont: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a panel with a paragraph, tags, an input, a textarea, buttons and a shortcut key on a page set in a serif font: every one of them is in the page\'s font, with no browser control font and no system-ui left over.',
      },
    },
  },
  render: () => (
    <div className='story-page' style={{ fontFamily: PAGE_FONT }}>
      <Controls />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectFontEverywhere(
      canvasElement.querySelector('.story-page') as HTMLElement,
      getComputedStyle(canvasElement.querySelector('.story-page') as HTMLElement).fontFamily
    );
  },
};

export const ThemeFontFamily: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the same panel under a provider with `theme.fontFamily: "mono"`: the layout wrapper sets the monospace stack and the text, the tags, the fields, the buttons and the shortcut key all take it.',
      },
    },
  },
  render: () => (
    <ReqoreUIProvider theme={{ fontFamily: 'mono' }}>
      <ReqoreLayoutContent>
        <ReqoreContent className='story-themed'>
          <Controls />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  ),
  play: async ({ canvasElement }) => {
    const themed = canvasElement.querySelector('.story-themed') as HTMLElement;
    const wrapper = themed.closest('.reqore-layout-wrapper') as HTMLElement;
    const mono = getComputedStyle(wrapper).fontFamily;

    // The computed stack comes back with double quotes.
    await expect(mono).toBe(MONO_FONT.replace(/'/g, '"'));
    await expectFontEverywhere(themed, mono);
  },
};

/* ------------------------------------------------------------------------------------------------
 * layoutWrapperProps.transparent — the page colour through the layout
 * ---------------------------------------------------------------------------------------------- */

const Page = ({
  background,
  main,
  transparent,
}: {
  background: string;
  main: TReqoreHexColor;
  transparent?: boolean;
}) => (
  <div
    className='story-page-surface'
    style={{ background, padding: 24, height: 220, flex: '1 1 0', minWidth: 0 }}
  >
    <ReqoreUIProvider theme={{ main }} layoutWrapperProps={{ transparent }}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ padding: 16 }}>
          <ReqoreP>{transparent ? 'layoutWrapperProps.transparent' : 'Default wrapper'}</ReqoreP>
          <ReqoreButton>A button on the page</ReqoreButton>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  </div>
);

export const TransparentLayout: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders two app layouts on a dark plum page and two on a light grey page: the default layout wrapper paints the theme\'s surface, a box of another colour on the page, while `layoutWrapperProps={{ transparent: true }}` paints nothing and the page shows through, text colour kept.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big' fluid>
      <div style={{ display: 'flex', gap: 16 }}>
        <Page background='#2a1631' main='#0b0b10' />
        <Page background='#2a1631' main='#0b0b10' transparent />
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <Page background='#e8e4ee' main='#fafafa' />
        <Page background='#e8e4ee' main='#fafafa' transparent />
      </div>
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const wrappers = Array.from(
      canvasElement.querySelectorAll('.story-page-surface > .reqore-layout-wrapper')
    ) as HTMLElement[];
    const background = (element: HTMLElement) => getComputedStyle(element).backgroundColor;

    await expect(wrappers).toHaveLength(4);

    const [darkDefault, darkTransparent, lightDefault, lightTransparent] = wrappers;

    // The default paints the theme surface (main, a step lighter on dark, darker on light).
    await expect(background(darkDefault)).toBe('rgb(15, 15, 22)');
    await expect(background(lightDefault)).toBe('rgb(245, 245, 245)');
    // Transparent paints nothing, and keeps the readable text colour of its theme.
    await expect(background(darkTransparent)).toBe('rgba(0, 0, 0, 0)');
    await expect(background(lightTransparent)).toBe('rgba(0, 0, 0, 0)');
    const color = (element: HTMLElement) => getComputedStyle(element).color;
    await expect(color(darkTransparent)).toBe(color(darkDefault));
    await expect(color(lightTransparent)).toBe(color(lightDefault));
  },
};
