/**
 * What a control writes on itself is read on the control's own fill, and what the caller gives explicitly is the
 * caller's (the review of #717): an icon's hex is drawn as given, an effect's color reads on the fill it is
 * written on, a soft or text tag reads on every color of a gradient it sits on, and a color Reqore cannot read is
 * drawn as given rather than thrown on.
 */
import { render } from '@testing-library/react';
import { ReactNode } from 'react';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreTag,
  ReqoreUIProvider,
} from '../src';
import { TReqoreHexColor } from '../src/components/Effect';
import { getTagAppearanceColors } from '../src/components/Tag';
import { DEFAULT_THEME, IReqoreTheme } from '../src/constants/theme';
import { ReqoreSurfaceProvider } from '../src/context/SurfaceContext';
import { buildTheme, getContrastRatio, READABLE_TEXT_CONTRAST } from '../src/helpers/colors';
import { hexOf } from './shared/colorMath';

const wrap = (children: ReactNode) => (
  <ReqoreUIProvider>
    <ReqoreLayoutContent>
      <ReqoreContent>{children}</ReqoreContent>
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);

/** A computed `rgb()` color as a hex. */
/** A computed color as a six-digit hex. */
const toHex = hexOf;

/** The color an icon's glyph is drawn in. */
const iconColor = (container: HTMLElement, index = 0): string =>
  toHex((container.querySelectorAll('.reqore-icon svg')[index] as SVGElement).style.color);

/** Every rule Reqore's styles wrote, as text. */
const styleText = (): string =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent)
    .join('\n');

describe("an icon's explicit hex", () => {
  test.each(['#000000', '#ff0000'])('is drawn as given on a button: %s', (hex) => {
    const { container } = render(
      wrap(
        <>
          <ReqoreButton icon='AlertLine' leftIconColor={hex as TReqoreHexColor}>
            Left
          </ReqoreButton>
          <ReqoreButton icon='AlertLine' leftIconProps={{ color: hex as TReqoreHexColor }}>
            Props
          </ReqoreButton>
          <ReqoreButton rightIcon='AlertLine' rightIconColor={hex as TReqoreHexColor}>
            Right
          </ReqoreButton>
        </>
      )
    );

    expect(iconColor(container, 0)).toBe(hex);
    expect(iconColor(container, 1)).toBe(hex);
    expect(iconColor(container, 2)).toBe(hex);
  });

  test.each(['#000000', '#ff0000'])('is drawn as given on a tag: %s', (hex) => {
    const { container } = render(
      wrap(
        <>
          <ReqoreTag label='Left' icon='AlertLine' leftIconColor={hex as TReqoreHexColor} />
          <ReqoreTag
            label='Props'
            icon='AlertLine'
            leftIconProps={{ color: hex as TReqoreHexColor }}
          />
          <ReqoreTag label='Right' rightIcon='AlertLine' rightIconColor={hex as TReqoreHexColor} />
        </>
      )
    );

    expect(iconColor(container, 0)).toBe(hex);
    expect(iconColor(container, 1)).toBe(hex);
    expect(iconColor(container, 2)).toBe(hex);
  });

  test("a theme's color is still drawn in the shade of it that reads", () => {
    const theme = buildTheme(DEFAULT_THEME);
    const { container } = render(wrap(<ReqoreButton icon='AlertLine' leftIconColor='danger' />));

    expect(iconColor(container)).not.toBe(theme.intents.danger);
  });
});

describe("an effect's color on a control", () => {
  /** The `!important` color the effect writes for an element's classes. */
  const effectColorOf = (element: Element): string => {
    const classes = Array.from(element.classList);
    const rules = styleText().match(/[^{}]+\{[^{}]*\}/g) ?? [];
    const colors = rules
      .filter((rule) => classes.some((name) => rule.split('{')[0].includes(`.${name}`)))
      .map((rule) => rule.match(/(?:^|[;{])\s*color:\s*([^;!}]+)\s*!important/)?.[1])
      .filter(Boolean) as string[];

    return colors[colors.length - 1]?.trim();
  };

  test('reads on the button it is written on, not on the page around it', () => {
    const theme = buildTheme(DEFAULT_THEME);
    const { container } = render(
      wrap(
        <ReqoreButton intent='success' effect={{ color: 'info' }}>
          Info on success
        </ReqoreButton>
      )
    );
    const color = effectColorOf(container.querySelector('.reqore-button'));

    expect(color).toBeTruthy();
    // on the success fill (and a step lighter, hovered)
    expect(getContrastRatio(color, theme.intents.success)).toBeGreaterThanOrEqual(
      READABLE_TEXT_CONTRAST
    );
  });

  test('reads on the tag it is written on', () => {
    const theme = buildTheme(DEFAULT_THEME);
    const { container } = render(
      wrap(<ReqoreTag label='Tag' intent='success' effect={{ color: 'info' }} />)
    );
    const color = effectColorOf(container.querySelector('.reqore-tag'));

    expect(color).toBeTruthy();
    expect(getContrastRatio(color, theme.intents.success)).toBeGreaterThanOrEqual(
      READABLE_TEXT_CONTRAST
    );
  });
});

describe('a soft or text tag on a gradient', () => {
  const theme = buildTheme(DEFAULT_THEME);
  // a dark stop and a lighter one: what reads on the first need not on the second
  const surface = ['#1a1a1a', '#5c5c5c'] as TReqoreHexColor[];

  test.each(['soft', 'text'] as const)('%s: its label reads on every color of it', (appearance) => {
    for (const intent of ['success', 'danger', 'info'] as const) {
      const colors = getTagAppearanceColors(theme, appearance, theme.intents[intent], surface);

      expect(colors.drawnBackgrounds).toHaveLength(2);
      for (const background of colors.drawnBackgrounds) {
        expect(getContrastRatio(colors.text, background)).toBeGreaterThanOrEqual(
          READABLE_TEXT_CONTRAST
        );
      }
    }
  });

  test('rendered, it reads what it is drawn on from the gradient', () => {
    expect(() =>
      render(
        wrap(
          <ReqoreSurfaceProvider color={surface}>
            <ReqoreTag
              label='Soft'
              appearance='soft'
              intent='success'
              labelKey='Key'
              icon='AlertLine'
            />
            <ReqoreTag label='Text' appearance='text' intent='danger' rightIcon='AlertLine' />
          </ReqoreSurfaceProvider>
        )
      )
    ).not.toThrow();
  });
});

describe('a tag in a color Reqore cannot read', () => {
  const theme: IReqoreTheme = {
    ...buildTheme(DEFAULT_THEME),
    intents: { ...buildTheme(DEFAULT_THEME).intents, info: 'var(--brand)' as TReqoreHexColor },
  };

  test('soft: the label is written in it, over a wash of it the browser mixes', () => {
    const colors = getTagAppearanceColors(theme, 'soft', theme.intents.info);

    expect(colors.text).toBe('var(--brand)');
    expect(colors.background).toBe('color-mix(in srgb, var(--brand) 20%, transparent)');
    expect(colors.border).toBe('color-mix(in srgb, var(--brand) 60%, transparent)');
  });

  test('text: the label is written in it', () => {
    expect(getTagAppearanceColors(theme, 'text', theme.intents.info).text).toBe('var(--brand)');
  });
});

describe('a hovered button', () => {
  test('writes its hovered text color as a declaration of its own', () => {
    // animated (the default): the animated content's rules used to run on into the color, which was dropped
    render(wrap(<ReqoreButton minimal intent='info'>Hover me</ReqoreButton>));

    expect(styleText()).not.toMatch(/(?:^|[;{\s])color:[^;{}]*cursor/);
  });
});

test('a tag is a memo component, as the other controls are', () => {
  const { $$typeof } = ReqoreTag as unknown as { $$typeof: symbol };

  expect($$typeof).toBe(Symbol.for('react.memo'));
});
