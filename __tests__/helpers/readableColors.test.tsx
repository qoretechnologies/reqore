import { getLuminance } from 'polished';
import {
  buildGradientColorsFromString,
  buildTheme,
  changeLightness,
  getColorFromMaybeString,
  fadeColor,
  getContrastRatio,
  getDrawnColor,
  getReadableAccentColor,
  getReadableAccentColorOn,
  getReadableAlpha,
  getReadableColor,
  getReadableColorFrom,
  getReadableColorOn,
  getReadableFadedColor,
  getReadableGroupOpacity,
  getReadableIntentColor,
  getThemeSurface,
  READABLE_ICON_CONTRAST,
  READABLE_TEXT_CONTRAST,
} from '../../src/helpers/colors';
import { Colors } from '../../src/constants/colors';
import { TReqoreHexColor } from '../../src/components/Effect';
import { DEFAULT_THEME, IReqoreTheme } from '../../src/constants/theme';

/**
 * Text and icon colors are chosen against what they are actually drawn on, and always stand out from it by WCAG
 * AA's 4.5:1 (text) or 3:1 (icons): qorus#646, David's review, "black text on a dark grey background - extremely
 * difficult to read".
 */

describe('getContrastRatio', () => {
  test('is the WCAG ratio, not rounded', () => {
    expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(getContrastRatio('#ffffff', '#ffffff')).toBe(1);
    // polished rounds this one to 4.5; it is under it, and a checker says so
    expect(getContrastRatio('#767676', '#ffffff')).toBeGreaterThan(4.5);
    expect(getContrastRatio('#777777', '#ffffff')).toBeLessThan(4.5);
  });

  test('is the same either way round', () => {
    expect(getContrastRatio('#0776cb', '#f2f2f2')).toBe(getContrastRatio('#f2f2f2', '#0776cb'));
  });
});

describe('getDrawnColor', () => {
  test('blends a translucent color into what is under it', () => {
    // the muted intent of the dark theme over its page: a dark gray, not the near-white it is made of
    expect(getDrawnColor('rgba(217, 217, 217, 0.19)', '#1e1e1e')).toBe('#424242');
    expect(getDrawnColor('#ffffff80', '#000000')).toBe('#808080');
  });

  test('draws an opaque color as it is', () => {
    expect(getDrawnColor('#0776cb', '#000000')).toBe('#0776cb');
    expect(getDrawnColor('rgb(10, 102, 64)')).toBe('#0a6640');
  });

  test('without anything under it, a translucent color is its own hue', () => {
    expect(getDrawnColor('#44444450')).toBe('#444444');
  });

  test('what is under a color is itself drawn opaque', () => {
    expect(getDrawnColor('#ffffff80', '#00000040')).toBe('#808080');
  });
});

describe('getReadableColorFrom', () => {
  test('picks the dimmed text color when it reads', () => {
    expect(getReadableColorFrom('#000000', true)).toBe('#f2f2f2');
    expect(getReadableColorFrom('#ffffff', true)).toBe('#0d0d0d');
  });

  test('gives up the dimming where it would not read', () => {
    // #f2f2f2 on the orange intent is 4.24:1; white is 4.73:1
    expect(getContrastRatio('#f2f2f2', '#a66321')).toBeLessThan(READABLE_TEXT_CONTRAST);
    expect(getReadableColorFrom('#a66321', true)).toBe(Colors.LIGHT);
    expect(getReadableColorFrom('#0776cb', true)).toBe(Colors.LIGHT);
  });

  test('picks by contrast, not by a luminance threshold', () => {
    // a light-enough blue: black reads (5.48:1), white does not (3.83:1)
    expect(getReadableColorFrom('#0785e4')).toBe(Colors.DARK);
  });

  test('reads a translucent background as it is drawn over what is under it', () => {
    // David's review: the muted intent picked its text from the near-white it is made of - black - and it was drawn
    // on a dark gray
    const text = getReadableColorFrom('#d9d9d930', true, undefined, undefined, '#1e1e1e');

    expect(getLuminance(text)).toBeGreaterThan(0.5);
    expect(getContrastRatio(text, getDrawnColor('#d9d9d930', '#1e1e1e'))).toBeGreaterThanOrEqual(
      READABLE_TEXT_CONTRAST
    );
  });

  test('always reads, whatever the background', () => {
    for (let gray = 0; gray <= 255; gray += 5) {
      const background = `rgb(${gray}, ${gray}, ${gray})`;

      for (const dim of [false, true]) {
        expect(
          getContrastRatio(getReadableColorFrom(background, dim), background)
        ).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);
      }
    }

    for (const intent of Object.values(DEFAULT_THEME.intents)) {
      expect(
        getContrastRatio(
          getReadableColorFrom(intent, true, undefined, undefined, '#333333'),
          getDrawnColor(intent, '#333333')
        )
      ).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);
    }
  });
});

describe('getReadableColor', () => {
  test("reads a theme's translucent main as drawn over the theme it was taken from", () => {
    const base = buildTheme(DEFAULT_THEME);
    const muted: IReqoreTheme = { ...base, main: base.intents.muted, originalMain: base.main };
    const text = getReadableColor(muted, undefined, undefined, true);

    expect(getContrastRatio(text, getDrawnColor(muted.main, base.main))).toBeGreaterThanOrEqual(
      READABLE_TEXT_CONTRAST
    );
  });

  test("keeps a theme's own text color", () => {
    expect(getReadableColor({ main: '#000000', text: { color: '#123456' } })).toBe('#123456');
  });
});

describe('getReadableColorOn', () => {
  test('reads on every color of a gradient', () => {
    // a light and a dark blue: the dimmed white is 4.2:1 on the light one, white reads on both
    const stops = ['#0776cb', '#063e6b'];
    const text = getReadableColorOn(stops, true);

    for (const stop of stops) {
      expect(getContrastRatio(text, stop)).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);
    }
  });

  test('when nothing reads on all of them, the color that stands out most from the worst', () => {
    expect(getReadableColorOn(['#000000', '#ffffff'], true)).toMatch(/^#(000000|ffffff)$/);
  });
});

describe('getReadableAlpha', () => {
  test('keeps an alpha that already reads', () => {
    expect(getReadableAlpha('#ffffff', '#000000', 0.7)).toBe(0.7);
  });

  test('raises an alpha until the faded color reads', () => {
    const alpha = getReadableAlpha('#f2f2f2', '#383838', 0.5);
    const faded = getDrawnColor(`rgba(242, 242, 242, ${alpha})`, '#383838');

    expect(alpha).toBeGreaterThan(0.5);
    expect(alpha).toBeLessThan(1);
    expect(getContrastRatio(faded, '#383838')).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);
    // and no further than it needs to
    expect(
      getContrastRatio(getDrawnColor(`rgba(242, 242, 242, ${alpha - 0.02})`, '#383838'), '#383838')
    ).toBeLessThan(READABLE_TEXT_CONTRAST);
  });

  test('an icon needs less', () => {
    expect(getReadableAlpha('#f2f2f2', '#383838', 0.5, READABLE_ICON_CONTRAST)).toBeLessThan(
      getReadableAlpha('#f2f2f2', '#383838', 0.5, READABLE_TEXT_CONTRAST)
    );
  });

  test('is 1 when even the full color does not read', () => {
    expect(getReadableAlpha('#444444', '#383838', 0.5)).toBe(1);
  });

  test('a faded color carries the alpha', () => {
    expect(getReadableFadedColor('#ffffff', '#000000', 0.7)).toBe('rgba(255,255,255,0.7)');
  });
});

describe('getReadableAccentColor', () => {
  test('reaches the ratio itself, not the rounded one', () => {
    for (const intent of ['#0A6640', '#A82A2A', '#A66321', '#0776CB', '#d1a036'] as const) {
      for (const background of ['#333333', '#1e1e1e', '#f4f4f4'] as const) {
        expect(
          getContrastRatio(getReadableAccentColor(intent, background), background)
        ).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);
      }
    }
  });

  test('reads on every background it is given, moving the way that can', () => {
    // a minimal white button: dark gray at rest, mid gray hovered. Lightening for the first and then darkening for
    // the second ended on the dark purple it started from, which reads on neither.
    const backgrounds = ['#606060', '#8f8f8f'] as const;

    for (const color of ['#5d046d', '#ed9bfc', '#38fdb2'] as const) {
      const icon = getReadableAccentColorOn(color, [...backgrounds], READABLE_ICON_CONTRAST);

      for (const background of backgrounds) {
        expect(getContrastRatio(icon, background)).toBeGreaterThanOrEqual(READABLE_ICON_CONTRAST);
      }
    }
  });

  test('reaches a lesser ratio for an icon', () => {
    const icon = getReadableAccentColor('#A82A2A', '#1e1e1e', READABLE_ICON_CONTRAST);

    expect(getContrastRatio(icon, '#1e1e1e')).toBeGreaterThanOrEqual(READABLE_ICON_CONTRAST);
  });
});

describe('getThemeSurface', () => {
  test("is the layout's surface of the theme a component was picked in, unless told", () => {
    const base = buildTheme(DEFAULT_THEME);
    // a theme made from an intent is drawn on the theme it was made from
    const intentTheme: IReqoreTheme = { ...base, main: base.intents.info, originalMain: base.main };

    expect(getThemeSurface(base)).toBe('#383838');
    expect(getThemeSurface(intentTheme)).toBe('#383838');
    expect(getThemeSurface(intentTheme, '#0776cb')).toBe('#0776cb');
  });
});

describe('getReadableIntentColor', () => {
  test("an intent's text reads on what it is drawn on, in a shade of the intent", () => {
    const theme = buildTheme(DEFAULT_THEME);

    for (const intent of ['info', 'success', 'warning', 'danger', 'muted', 'pending'] as const) {
      for (const surface of [undefined, '#1e1e1e', '#f4f4f4'] as const) {
        const text = getReadableIntentColor(theme, intent, READABLE_TEXT_CONTRAST, surface);

        expect(getContrastRatio(text, getThemeSurface(theme, surface))).toBeGreaterThanOrEqual(
          READABLE_TEXT_CONTRAST
        );
      }
    }
  });

  test('an icon needs less, and keeps more of the intent', () => {
    const theme = buildTheme(DEFAULT_THEME);
    const icon = getReadableIntentColor(theme, 'danger', READABLE_ICON_CONTRAST);
    const text = getReadableIntentColor(theme, 'danger');

    expect(getContrastRatio(icon, getThemeSurface(theme))).toBeGreaterThanOrEqual(
      READABLE_ICON_CONTRAST
    );
    expect(getLuminance(icon)).toBeLessThanOrEqual(getLuminance(text));
  });
});

describe('a gradient made from one color', () => {
  test('keeps the text that reads on the color readable at both ends', () => {
    const theme = buildTheme(DEFAULT_THEME);

    for (const intent of ['info', 'success', 'warning', 'danger'] as const) {
      const text = getReadableColorFrom(theme.intents[intent]);
      const stops = Object.values(buildGradientColorsFromString(theme, intent));

      for (const stop of stops) {
        expect(getContrastRatio(text, stop)).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);
      }
      // and is still a gradient
      expect(stops[0]).not.toBe(stops[1]);
    }
  });

  /* A button or a reveal drawn in it is drawn a step lighter when hovered or pressed: its text reads on that too,
     even where the color itself is too light for a lighter end (info: #f2f2f2 was 4.3:1 on its lightened end). */
  test('and on each end a step lighter, as it is drawn hovered or pressed', () => {
    const theme = buildTheme(DEFAULT_THEME);

    for (const color of [
      'info',
      'success',
      'warning',
      'danger',
      'muted',
      '#0776cb',
      '#a66321',
    ] as const) {
      const text = getReadableColorFrom(getColorFromMaybeString(theme, color) as TReqoreHexColor);

      for (const stop of Object.values(buildGradientColorsFromString(theme, color))) {
        expect(
          getContrastRatio(text, changeLightness(stop as TReqoreHexColor, 0.05))
        ).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);
      }
    }
  });
});

describe('fadeColor', () => {
  test('fades a color by the alpha it already has', () => {
    expect(fadeColor('#ffffff', 0.5)).toBe('rgba(255,255,255,0.5)');
    // the muted intent (19%) at a panel's full opacity stays at 19%, not opaque
    expect(fadeColor('rgba(242, 242, 242, 0.19)', 1)).toBe('rgba(242,242,242,0.19)');
    expect(fadeColor('rgba(242, 242, 242, 0.2)', 0.5)).toBe('rgba(242,242,242,0.1)');
  });
});

describe('a group faded as a whole', () => {
  /** A mark and what it is on, both faded into `under` at `opacity`. */
  const contrastAt = (
    color: string,
    alpha: number,
    on: TReqoreHexColor,
    under: TReqoreHexColor,
    opacity: number
  ) => {
    const mark = getDrawnColor(fadeColor(color, alpha), on);

    return getContrastRatio(
      getDrawnColor(fadeColor(mark, opacity), under),
      getDrawnColor(fadeColor(on, opacity), under)
    );
  };

  /* An idle rail resting at a third: its icons (70%) and the active mark's (black on blue) were 2.3:1. */
  test('fades only as far as each mark in it still stands out', () => {
    const marks = [
      { color: '#f2f2f2', alpha: 0.7, on: '#3c3c3c' as TReqoreHexColor },
      { color: '#000000', alpha: 0.83, on: '#0d97ff' as TReqoreHexColor },
    ];
    const opacity = getReadableGroupOpacity(marks, '#383838', 0.34, READABLE_ICON_CONTRAST);

    expect(opacity).toBeGreaterThan(0.34);
    expect(opacity).toBeLessThan(1);
    for (const { color, alpha, on } of marks) {
      expect(contrastAt(color, alpha, on, '#383838', opacity)).toBeGreaterThanOrEqual(
        READABLE_ICON_CONTRAST
      );
    }
  });

  test('stays as faded as asked where that reads', () => {
    expect(
      getReadableGroupOpacity(
        [{ color: '#ffffff', alpha: 1, on: '#000000' }],
        '#000000',
        0.9,
        READABLE_ICON_CONTRAST
      )
    ).toBe(0.9);
  });

  test('is drawn whole when nothing less reads', () => {
    expect(
      getReadableGroupOpacity(
        [{ color: '#777777', alpha: 1, on: '#666666' }],
        '#383838',
        0.3,
        READABLE_ICON_CONTRAST
      )
    ).toBe(1);
  });
});
