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
 * Fonts — buttons and inputs are in the page's font, or the theme's; tags and textareas keep
 * their own
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

/** What takes the font of the text around it: the page's, or the theme's. */
const INHERITING_SELECTORS = [
  '.reqore-panel-title .reqore-heading',
  '.reqore-paragraph',
  '.reqore-input',
  '.reqore-button',
];

/**
 * What keeps a face of its own, whatever the page or the theme is set in: tags and shortcut
 * keys name the platform UI font, a textarea keeps the browser's monospace.
 */
const OWN_FONTS: [string, string][] = [
  ['.reqore-tag', 'system-ui'],
  ['.reqore-keyboard-shortcut-key', 'system-ui'],
  ['.reqore-textarea', 'monospace'],
];

const expectFonts = async (root: HTMLElement, inheritedFont: string) => {
  const expected: [string, string][] = [
    ...INHERITING_SELECTORS.map((selector): [string, string] => [selector, inheritedFont]),
    ...OWN_FONTS,
  ];

  for (const [selector, font] of expected) {
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
          'Renders a panel with a paragraph, tags, an input, a textarea, buttons and a shortcut key on a page set in a serif font: the title, the paragraph, the input and the buttons are in the page\'s font, with no browser control font left over, while the tags and the shortcut key keep the platform UI font (system-ui) and the textarea keeps the browser\'s monospace, as they always had.',
      },
    },
  },
  render: () => (
    <div className='story-page' style={{ fontFamily: PAGE_FONT }}>
      <Controls />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectFonts(
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
          'Renders the same panel under a provider with `theme.fontFamily: "mono"`: the layout wrapper sets the monospace stack and the title, the paragraph, the input and the buttons take it; the tags and the shortcut key stay in system-ui and the textarea in the browser\'s monospace, because the theme font excludes them.',
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
    await expectFonts(themed, mono);
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
