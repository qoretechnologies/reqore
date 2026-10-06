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

const CONTROLS = [
  '.reqore-button',
  '.reqore-input',
  '.reqore-textarea',
  '.reqore-tag',
  '.reqore-keyboard-shortcut-key',
];

/**
 * jsdom has no user-agent stylesheet, so a bare `<button>` would inherit the page font there
 * and prove nothing. A browser gives form controls a font of their own (Chromium:
 * `font: -webkit-small-control`, the platform's control face). This is that rule, at the same
 * element-selector strength, so the test sees what a browser does.
 */
let userAgentControlFont: HTMLStyleElement;

beforeEach(() => {
  userAgentControlFont = document.createElement('style');
  userAgentControlFont.textContent = 'button, input, textarea, select { font-family: system-ui; }';
  document.head.appendChild(userAgentControlFont);
});

afterEach(() => userAgentControlFont.remove());

test('Buttons, inputs, textareas, tags and shortcut keys are in the font of the page', () => {
  renderControls(undefined, PAGE_FONT);

  CONTROLS.forEach((selector) => {
    expect(document.querySelector(selector)).toBeTruthy();
    expect([selector, fontOf(selector)]).toEqual([selector, PAGE_FONT]);
  });
});

test('Without a theme font, Reqore is in the font the page sets on its body', () => {
  document.body.style.fontFamily = PAGE_FONT;

  try {
    renderControls();

    // The layout wrapper and the portal name no font, so the body's reaches everything.
    expect(fontOf('.reqore-layout-wrapper')).toBe(PAGE_FONT);
    expect(fontOf('#reqore-portal')).toBe(PAGE_FONT);
    CONTROLS.forEach((selector) =>
      expect([selector, fontOf(selector)]).toEqual([selector, PAGE_FONT])
    );
  } finally {
    document.body.style.fontFamily = '';
  }
});

test('theme.fontFamily sets the font of the layout, the portal and every control', () => {
  renderControls({ fontFamily: '"Avenir Next", sans-serif' });

  expect(fontOf('.reqore-layout-wrapper')).toBe('"Avenir Next", sans-serif');
  expect(fontOf('#reqore-portal')).toBe('"Avenir Next", sans-serif');
  CONTROLS.forEach((selector) =>
    expect([selector, fontOf(selector)]).toEqual([selector, '"Avenir Next", sans-serif'])
  );
});

test('theme.fontFamily takes the mono and system shorthands', () => {
  const { unmount } = renderControls({ fontFamily: 'mono' });

  expect(fontOf('.reqore-layout-wrapper')).toBe(MONO);
  expect(fontOf('.reqore-button')).toBe(MONO);
  unmount();

  renderControls({ fontFamily: 'system' });

  expect(fontOf('.reqore-layout-wrapper')).toBe('system-ui');
  expect(fontOf('.reqore-tag')).toBe('system-ui');
});

test('A text that sets its own font keeps it under a theme font', () => {
  render(
    <ReqoreUIProvider theme={{ fontFamily: PAGE_FONT }}>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTag label='sku' effect={{ fontFamily: 'mono' }} />
          <ReqoreButton effect={{ fontFamily: 'system' }}>Run</ReqoreButton>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(fontOf('.reqore-tag')).toBe(MONO);
  expect(fontOf('.reqore-button')).toBe('system-ui');
});
