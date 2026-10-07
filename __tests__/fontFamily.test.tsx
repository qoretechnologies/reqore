import { render } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreInput,
  ReqoreKeyboardShortcut,
  ReqoreLayoutContent,
  ReqoreTag,
  ReqoreTextarea,
  ReqoreUIProvider,
} from '../src';
import { MONO_FONT } from '../src/constants/fonts';
import { IReqoreTheme } from '../src/constants/theme';

const PAGE_FONT = 'Georgia, serif';
// The computed value comes back with the stack's quotes normalised to double quotes.
const MONO = MONO_FONT.replace(/'/g, '"');

const renderControls = (theme?: Partial<IReqoreTheme>, pageFont?: string) =>
  render(
    <ReqoreUIProvider theme={theme}>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <div className='page' style={pageFont ? { fontFamily: pageFont } : undefined}>
            <ReqoreButton>Save</ReqoreButton>
            <ReqoreInput value='Text' onChange={() => undefined} />
            <ReqoreTextarea value='More text' onChange={() => undefined} />
            <ReqoreTag label='Tag' />
            <ReqoreKeyboardShortcut shortcut='mod+k' />
          </div>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const fontOf = (selector: string) =>
  getComputedStyle(document.querySelector(selector) as HTMLElement).fontFamily;

/** The controls that take the font of the text around them: the page's, or the theme's. */
const INHERITING = ['.reqore-button', '.reqore-input'];

/**
 * The ones that keep a face of their own whatever the page or the theme is set in: a tag and a
 * shortcut key name the platform UI font, a textarea keeps the browser's monospace.
 */
const OWN_FONTS: [string, string][] = [
  ['.reqore-tag', 'system-ui'],
  ['.reqore-keyboard-shortcut-key', 'system-ui'],
  ['.reqore-textarea', 'monospace'],
];

const expectFonts = (inheritedFont: string) => {
  INHERITING.forEach((selector) => {
    expect(document.querySelector(selector)).toBeTruthy();
    expect([selector, fontOf(selector)]).toEqual([selector, inheritedFont]);
  });
  OWN_FONTS.forEach(([selector, font]) => {
    expect(document.querySelector(selector)).toBeTruthy();
    expect([selector, fontOf(selector)]).toEqual([selector, font]);
  });
};

/**
 * jsdom has no user-agent stylesheet, so a bare `<button>` would inherit the page font there
 * and prove nothing. A browser gives form controls a font of their own (Chromium:
 * `font: -webkit-small-control`, the platform's control face, and `monospace` for a textarea).
 * These are those rules, at the same element-selector strength, so the test sees what a
 * browser does.
 */
let userAgentControlFont: HTMLStyleElement;

beforeEach(() => {
  userAgentControlFont = document.createElement('style');
  userAgentControlFont.textContent =
    'button, input, select { font-family: system-ui; } textarea { font-family: monospace; }';
  document.head.appendChild(userAgentControlFont);
});

afterEach(() => userAgentControlFont.remove());

test('Buttons and inputs are in the font of the page; tags and textareas keep their own', () => {
  renderControls(undefined, PAGE_FONT);

  expectFonts(PAGE_FONT);
});

test('Without a theme font, Reqore is in the font the page sets on its body', () => {
  document.body.style.fontFamily = PAGE_FONT;

  try {
    renderControls();

    // The layout wrapper and the portal name no font, so the body's reaches everything.
    expect(fontOf('.reqore-layout-wrapper')).toBe(PAGE_FONT);
    expect(fontOf('#reqore-portal')).toBe(PAGE_FONT);
    expectFonts(PAGE_FONT);
  } finally {
    document.body.style.fontFamily = '';
  }
});

test('theme.fontFamily sets the font of the layout, the portal, the buttons and the inputs', () => {
  renderControls({ fontFamily: '"Avenir Next", sans-serif' });

  expect(fontOf('.reqore-layout-wrapper')).toBe('"Avenir Next", sans-serif');
  expect(fontOf('#reqore-portal')).toBe('"Avenir Next", sans-serif');
  // Tags, shortcut keys and textareas are excluded: they keep system-ui and monospace.
  expectFonts('"Avenir Next", sans-serif');
});

test('theme.fontFamily takes the mono and system shorthands', () => {
  const { unmount } = renderControls({ fontFamily: 'mono' });

  expect(fontOf('.reqore-layout-wrapper')).toBe(MONO);
  expect(fontOf('.reqore-button')).toBe(MONO);
  unmount();

  renderControls({ fontFamily: 'system' });

  expect(fontOf('.reqore-layout-wrapper')).toBe('system-ui');
  expect(fontOf('.reqore-input')).toBe('system-ui');
});

test('A text that sets its own font keeps it under a theme font', () => {
  render(
    <ReqoreUIProvider theme={{ fontFamily: PAGE_FONT }}>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTag label='sku' effect={{ fontFamily: 'mono' }} />
          <ReqoreButton effect={{ fontFamily: 'system' }}>Run</ReqoreButton>
          <ReqoreTextarea
            value='Notes'
            onChange={() => undefined}
            effect={{ fontFamily: PAGE_FONT }}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(fontOf('.reqore-tag')).toBe(MONO);
  expect(fontOf('.reqore-button')).toBe('system-ui');
  // A textarea that holds prose can still ask for the page's font.
  expect(fontOf('.reqore-textarea')).toBe(PAGE_FONT);
});
