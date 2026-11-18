import { render } from '@testing-library/react';
import { ReqoreControlGroup, ReqoreMenu, ReqoreMenuDivider, ReqoreUIProvider } from '../src';
import { getEffectTextColor, IReqoreEffect, TReqoreHexColor } from '../src/components/Effect';
import { DEFAULT_THEME } from '../src/constants/theme';
import { ReqoreSurfaceProvider } from '../src/context/SurfaceContext';
import {
  buildTheme,
  getContrastRatio,
  getDrawnColor,
  getThemeSurface,
  READABLE_TEXT_CONTRAST,
} from '../src/helpers/colors';
import { SurfaceProbe } from './shared/surfaces';

describe("an effect's text color", () => {
  const theme = buildTheme(DEFAULT_THEME);

  test("a theme's color is drawn in a shade of it that reads", () => {
    for (const color of ['warning', 'danger', 'success:lighten:2', 'info'] as const) {
      expect(
        getContrastRatio(getEffectTextColor(theme, color), getThemeSurface(theme))
      ).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);
    }
  });

  test('on the surface it is drawn on', () => {
    const onLight = getEffectTextColor(theme, 'warning', '#f4f4f4');

    expect(getContrastRatio(onLight, '#f4f4f4')).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);
  });

  test('any other color is as given', () => {
    expect(getEffectTextColor(theme, '#123456')).toBe('#123456');
  });
});

const gradient: IReqoreEffect = { gradient: { colors: { 0: '#5e00ff', 100: '#c20058' } } };

describe('a component drawn in a gradient hands each of its colors to what it holds', () => {
  test('a control group with a gradient effect', () => {
    const { getByTestId } = render(
      <ReqoreUIProvider>
        <ReqoreControlGroup effect={gradient}>
          <SurfaceProbe />
        </ReqoreControlGroup>
      </ReqoreUIProvider>
    );

    expect(getByTestId('surfaces').textContent).toBe('#5e00ff,#c20058');
  });

  test('a control group that paints nothing keeps what is around it', () => {
    const { getByTestId } = render(
      <ReqoreUIProvider>
        <ReqoreSurfaceProvider color='#111111'>
          <ReqoreControlGroup>
            <SurfaceProbe />
          </ReqoreControlGroup>
        </ReqoreSurfaceProvider>
      </ReqoreUIProvider>
    );

    expect(getByTestId('surfaces').textContent).toBe('#111111');
  });

  test('a menu: its gradient, or its own color', () => {
    const { getAllByTestId } = render(
      <ReqoreUIProvider>
        <ReqoreSurfaceProvider color='#111111'>
          <ReqoreMenu effect={gradient}>
            <SurfaceProbe />
          </ReqoreMenu>
          <ReqoreMenu>
            <SurfaceProbe />
          </ReqoreMenu>
          <ReqoreMenu transparent>
            <SurfaceProbe />
          </ReqoreMenu>
        </ReqoreSurfaceProvider>
      </ReqoreUIProvider>
    );
    const [inGradient, inColor, inNothing] = getAllByTestId('surfaces').map(
      (each) => each.textContent
    );

    expect(inGradient).toBe('#5e00ff,#c20058');
    // its own color as it is drawn over what is around it: what it hands down is what it paints
    const menus = Array.from(document.querySelectorAll<HTMLElement>('.reqore-menu'));
    expect(inColor).toBe(getDrawnColor(getComputedStyle(menus[1]).backgroundColor, '#111111'));
    expect(inColor).not.toBe('#111111');
    // a transparent menu paints nothing
    expect(inNothing).toBe('#111111');
  });
});

/* A minimal menu hands `minimal` to what it holds, and a text gradient took the "step lighter" a minimal fill
   takes - for a light color a step darker - after its colors were made to read: a divider drawn in a gradient on
   the menu was 4.21:1 again. */
test("a minimal menu's divider drawn in a gradient reads on the menu", () => {
  const { container, getByTestId } = render(
    <ReqoreUIProvider>
      <ReqoreMenu minimal>
        <SurfaceProbe />
        <ReqoreMenuDivider
          label='Fancy divider'
          effect={{ gradient: { colors: { 0: '#0d5ba5', 100: '#ff5dfd' } } }}
        />
      </ReqoreMenu>
    </ReqoreUIProvider>
  );
  const menu = getByTestId('surfaces').textContent as TReqoreHexColor;
  const colors = [
    ...getComputedStyle(container.querySelector('.reqore-menu-divider')!).backgroundImage.matchAll(
      /rgb\(([^)]+)\)/g
    ),
  ].map(([, parts]) => `rgb(${parts})`);

  expect(colors).toHaveLength(2);
  for (const color of colors) {
    expect(getContrastRatio(color, menu)).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);
  }
});
