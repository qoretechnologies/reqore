import { render } from '@testing-library/react';
import { ReqoreContent, ReqoreDrawer, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import { BACKDROP_BLUR_DEFAULT, backdropScrimColor } from '../src/components/Drawer/backdrop';
import { DEFAULT_THEME, IReqoreTheme } from '../src/constants/theme';
import { getMainBackgroundColor } from '../src/helpers/colors';
import { rgba } from 'polished';

/*
 * A dialog over a busy page read as part of it: the page's panels and the dialog's are the same
 * surfaces, and the backdrop was a 30% tint with no blur unless the app asked. The page behind every
 * dialog (a modal, a drawer, a sheet: one backdrop) is now set back by a low blur and a scrim darker
 * than the page, in both themes.
 */
const backdropStyle = () =>
  window.getComputedStyle(document.querySelector('.reqore-drawer-backdrop') as HTMLElement);

const renderDrawer = (options: Record<string, unknown> = {}, props: Record<string, unknown> = {}) =>
  render(
    <ReqoreUIProvider options={{ animations: { dialogs: false }, ...options } as any}>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreDrawer isOpen {...props}>
            Hello
          </ReqoreDrawer>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

test('the page behind a dialog is blurred a little when neither the dialog nor the app says', () => {
  renderDrawer();
  expect(backdropStyle().backdropFilter).toBe(`blur(${BACKDROP_BLUR_DEFAULT}px)`);
});

test("the app's backdropBlur, and a dialog's own blur, still win (0 is none)", () => {
  renderDrawer({ backdropBlur: 0 });
  expect(backdropStyle().backdropFilter).not.toMatch(/blur/);
  document.body.innerHTML = '';
  renderDrawer({}, { blur: 2 });
  expect(backdropStyle().backdropFilter).toBe('blur(2px)');
});

test('the scrim is darker than the page in both themes', () => {
  // dark: the page colour, mostly opaque; light: black, as a scrim
  const dark: IReqoreTheme = { ...DEFAULT_THEME, main: '#121212' };
  expect(backdropScrimColor(dark)).toBe(rgba(getMainBackgroundColor(dark), 0.6));
  const light: IReqoreTheme = { ...DEFAULT_THEME, main: '#f4f4f6' };
  expect(backdropScrimColor(light)).toBe('rgba(0,0,0,0.32)');
});
