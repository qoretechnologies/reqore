/**
 * A color Reqore cannot read - a CSS variable, `currentColor`, a typo - is the caller's to draw, as it was before the
 * contrast pass: the helpers leave it as it is instead of throwing while a component renders, and a component
 * writes it to its CSS. `'transparent'` is no surface at all, so text is read on what is under it, not on black.
 */
import { render } from '@testing-library/react';
import { ReactNode } from 'react';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreIcon,
  ReqoreLayoutContent,
  ReqoreLink,
  ReqoreP,
  ReqoreSpan,
  ReqoreTag,
  ReqoreUIProvider,
} from '../src';
import { TReqoreEffectColor, TReqoreHexColor } from '../src/components/Effect';
import { DEFAULT_THEME, IReqoreTheme } from '../src/constants/theme';
import { ReqoreSurfaceProvider } from '../src/context/SurfaceContext';
import {
  buildTheme,
  changeLightness,
  getColorFromMaybeString,
  getContrastRatio,
  getDrawnColor,
  getReadableAccentColorOn,
  getReadableAlpha,
  getReadableColorFrom,
  getReadableColorOn,
  getReadableFadedColor,
  getReadableIntentColor,
  getReadableThemeColor,
  getThemeSurface,
  getThemeSurfaces,
} from '../src/helpers/colors';

const UNREADABLE = ['var(--brand)', 'currentColor', '#12345', 'not-a-color'];

describe('a color the helpers cannot read', () => {
  test('is returned as it is', () => {
    for (const color of UNREADABLE) {
      expect(getDrawnColor(color)).toBe(color);
      expect(getDrawnColor(color, '#000000')).toBe(color);
      expect(getReadableAccentColorOn(color as TReqoreHexColor, ['#000000'])).toBe(color);
      expect(changeLightness(color as TReqoreHexColor, 0.1)).toBe(color);
      expect(getReadableFadedColor(color, '#000000', 0.5)).toBe(color);
    }
  });

  test('has no contrast to speak of', () => {
    expect(getContrastRatio('var(--brand)', '#000000')).toBeNaN();
    expect(getContrastRatio('#000000', 'currentColor')).toBeNaN();
  });

  test('keeps the alpha it is drawn at, and never throws', () => {
    for (const color of [undefined, 'red', ...UNREADABLE]) {
      expect(() => getReadableAlpha(color as string, '#000000', 0.5)).not.toThrow();
      expect(() => getReadableAlpha('#ffffff', color as string, 0.5)).not.toThrow();
      expect(() => getReadableAlpha('#ffffff', [color as string, '#000000'], 0.5)).not.toThrow();
    }

    expect(getReadableAlpha('var(--x)', '#000000', 0.5)).toBe(0.5);
    expect(getReadableAlpha(undefined as unknown as string, '#000000', 0.5)).toBe(0.5);
    expect(getReadableAlpha('#ffffff', 'var(--x)', 0.5)).toBe(0.5);
    // a named color is a color: white on it is raised until it reads
    expect(getReadableAlpha('#ffffff', 'red', 0.2)).toBeGreaterThan(0.2);
  });

  test('as a surface, is left out: what is read on is what can be', () => {
    const theme = buildTheme(DEFAULT_THEME);

    expect(getThemeSurfaces(theme, ['var(--x)' as TReqoreHexColor, '#000000'])).toEqual([
      '#000000',
    ]);
    expect(getThemeSurface(theme, 'var(--x)')).toBe(getThemeSurface(theme));
    expect(getReadableColorOn(['var(--x)', '#000000'])).toBe(getReadableColorOn(['#000000']));
  });
});

describe('a theme color that is a CSS variable', () => {
  const theme: IReqoreTheme = {
    ...buildTheme(DEFAULT_THEME),
    intents: { ...buildTheme(DEFAULT_THEME).intents, info: 'var(--brand)' as TReqoreHexColor },
  };

  test('is passed through as it is, shaded or not', () => {
    expect(getColorFromMaybeString(theme, 'info')).toBe('var(--brand)');
    expect(getColorFromMaybeString(theme, 'info:lighten:2')).toBe('var(--brand)');
    expect(getReadableIntentColor(theme, 'info')).toBe('var(--brand)');
    expect(getReadableThemeColor(theme, 'info:lighten:2')).toBe('var(--brand)');
  });

  test('a color Reqore cannot name, but CSS can, is the color', () => {
    expect(getColorFromMaybeString(theme, 'red' as TReqoreEffectColor)).toBe('red');
    expect(getColorFromMaybeString(theme, 'var(--x)' as TReqoreEffectColor)).toBe('var(--x)');
    expect(getColorFromMaybeString(theme, 'currentColor' as TReqoreEffectColor)).toBe(
      'currentColor'
    );
  });
});

describe("'transparent'", () => {
  test('is no surface: text is read on what is under it, or on the theme', () => {
    const theme = buildTheme(DEFAULT_THEME);

    expect(getDrawnColor('transparent', '#ffffff')).toBe('#ffffff');
    expect(getThemeSurface(theme, 'transparent')).toBe(getThemeSurface(theme));
    expect(getThemeSurfaces(theme, ['transparent' as TReqoreHexColor])).toEqual([
      getThemeSurface(theme),
    ]);
    // on white under it, dark text: not the light text black would get
    expect(getReadableColorFrom('transparent', false, undefined, undefined, '#ffffff')).toBe(
      getReadableColorFrom('#ffffff')
    );
  });
});

const wrap = (children: ReactNode, theme?: Partial<IReqoreTheme>) => (
  <ReqoreUIProvider theme={theme}>
    <ReqoreLayoutContent>
      <ReqoreContent>{children}</ReqoreContent>
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);

describe('components given a color they cannot read', () => {
  const brand = { intents: { info: 'var(--brand)' } } as unknown as Partial<IReqoreTheme>;

  test('render, with an intent that is a CSS variable', () => {
    expect(() =>
      render(
        wrap(
          <>
            <ReqoreIcon icon='AlertLine' intent='info' />
            <ReqoreIcon icon='AlertLine' color='info:lighten:2' />
            <ReqoreSpan intent='info'>Span</ReqoreSpan>
            <ReqoreP intent='info'>Paragraph</ReqoreP>
            <ReqoreLink intent='info' onClick={() => undefined}>
              Link
            </ReqoreLink>
            <ReqoreSpan effect={{ color: 'info' }}>Effect color</ReqoreSpan>
            <ReqoreSpan effect={{ gradient: { colors: 'info' } }}>Effect gradient</ReqoreSpan>
            <ReqoreButton icon='AlertLine' leftIconColor='info' effect={{ color: 'info' }}>
              Button
            </ReqoreButton>
            <ReqoreTag label='Tag' icon='AlertLine' leftIconColor='info' />
            <ReqoreTag label='Soft' intent='info' appearance='soft' />
            {/* every way a button and a tag paint their color: a wash, a hover, a key, a gradient */}
            <ReqoreButton intent='info' minimal icon='AlertLine' description='Minimal'>
              Minimal
            </ReqoreButton>
            <ReqoreButton intent='info' transparent rightIcon='AlertLine'>
              Transparent
            </ReqoreButton>
            <ReqoreButton intent='info' active flat={false} description='Active' badge={1}>
              Active
            </ReqoreButton>
            <ReqoreButton minimal effect={{ gradient: { colors: { 0: 'info', 100: 'success' } } }}>
              Minimal gradient
            </ReqoreButton>
            <ReqoreTag
              label='Minimal'
              labelKey='Key'
              intent='info'
              minimal
              icon='AlertLine'
              onClick={() => undefined}
              onRemoveClick={() => undefined}
              actions={[{ icon: 'AddLine', intent: 'info' }]}
            />
            <ReqoreTag label='Text' intent='info' appearance='text' labelKey='Key' />
            <ReqoreTag label='Gradient' minimal effect={{ gradient: { colors: 'info' } }} />
            <ReqoreIcon icon='AlertLine' intent='info' glow />
            <ReqoreLink intent='info' icon='AlertLine' onClick={() => undefined}>
              Link with an icon
            </ReqoreLink>
          </>,
          brand
        )
      )
    ).not.toThrow();

    expect(document.querySelector('.reqore-span')).toBeTruthy();
    expect(getComputedStyle(document.querySelector('.reqore-span') as Element).color).toBe(
      'var(--brand)'
    );
  });

  test('render, with a color Reqore cannot name', () => {
    expect(() =>
      render(
        wrap(
          <>
            <ReqoreIcon icon='AlertLine' color={'red' as TReqoreEffectColor} />
            <ReqoreIcon icon='AlertLine' color={'var(--x)' as TReqoreEffectColor} />
            <ReqoreSpan effect={{ color: 'red' as TReqoreEffectColor }}>Red</ReqoreSpan>
            <ReqoreButton leftIconColor={'red' as TReqoreEffectColor} icon='AlertLine'>
              Button
            </ReqoreButton>
            <ReqoreTag
              label='Tag'
              color={'var(--x)' as TReqoreEffectColor}
              icon='AlertLine'
              leftIconColor={'currentColor' as TReqoreEffectColor}
            />
            <ReqoreSurfaceProvider
              color={['red', 'var(--x)', 'transparent'] as unknown as TReqoreHexColor[]}
            >
              <ReqoreSpan intent='info'>On a surface it cannot read</ReqoreSpan>
              <ReqoreButton icon='AlertLine' minimal>
                Button
              </ReqoreButton>
              <ReqoreTag label='Tag' appearance='soft' intent='success' />
            </ReqoreSurfaceProvider>
          </>
        )
      )
    ).not.toThrow();

    const svgs = document.querySelectorAll('.reqore-icon svg');

    // a CSS variable is written as it is
    expect((svgs[1] as SVGElement).style.color).toBe('var(--x)');
  });
});
