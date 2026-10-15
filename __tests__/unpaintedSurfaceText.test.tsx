// Copyright 2026 Qore Technologies, s.r.o.
/**
 * Text is read on what it is drawn on (qorus#646, the review of #708).
 *
 * - An element that paints nothing (transparent) and was given a `customTheme`, with no component around
 *   it that says what it is drawn on, is drawn on what its consumer painted - which its customTheme's main
 *   says. It read the provider's page instead: a light card a consumer painted, given that light main, had
 *   near-white text (1:1). An intent alone is no surface: on the page, it is drawn on the page.
 * - A transparent statistic is drawn at no opacity, and was read as if it were opaque.
 * - A component's own text color (what it holds that sets none of its own) is read where it is drawn: a
 *   callout's on its fill, a transparent panel's or testimonial's on what is under it - where what they hold
 *   is read too.
 * - What an entity row and a feature card hold beside their text - their actions - is drawn on them.
 */
import { render } from '@testing-library/react';
import {
  ReqoreCallout,
  ReqoreEntityRow,
  ReqoreFeatureCard,
  ReqorePanel,
  ReqoreStatistic,
  ReqoreTestimonial,
  ReqoreUIProvider,
} from '../src';
import { DEFAULT_THEME } from '../src/constants/theme';
import { ReqoreSurfaceProvider, useReqoreSurface } from '../src/context/SurfaceContext';
import {
  buildTheme,
  getContrastRatio,
  getThemeSurface,
  READABLE_TEXT_CONTRAST,
} from '../src/helpers/colors';

const LIGHT = '#f5f5f5';
const PAGE = getThemeSurface(buildTheme(DEFAULT_THEME));

const colorOf = (selector: string) =>
  getComputedStyle(document.querySelector(selector) as HTMLElement).color;

const expectReadable = (color: string, on: string) =>
  expect(getContrastRatio(color, on)).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);

/** Every color a component reads as what it is drawn on. */
const Surfaces = ({ id }: { id: string }) => {
  const surface = useReqoreSurface();

  return (
    <span data-testid={id}>
      {surface === undefined ? 'none' : ([] as string[]).concat(surface).join(',')}
    </span>
  );
};

const surfaceOf = (id: string) => document.querySelector(`[data-testid='${id}']`)?.textContent;

describe('transparent, given a customTheme, with nothing around it that says what it is on', () => {
  test('an entity row is read on its customTheme main', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreEntityRow transparent customTheme={{ main: LIGHT }} label='Row' />
      </ReqoreUIProvider>
    );

    expectReadable(colorOf('.reqore-entity-row'), LIGHT);
  });

  test("a callout's content is read on its customTheme main", () => {
    render(
      <ReqoreUIProvider>
        <ReqoreCallout transparent customTheme={{ main: LIGHT }}>
          Body
        </ReqoreCallout>
      </ReqoreUIProvider>
    );

    expectReadable(colorOf('.reqore-callout-content'), LIGHT);
    expectReadable(colorOf('.reqore-callout'), LIGHT);
  });

  test('a statistic, a testimonial and a feature card hand it down, and are read on it', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreStatistic
          transparent
          customTheme={{ main: LIGHT }}
          value={12}
          label={(<Surfaces id='in-statistic' />) as any}
        />
        <ReqoreTestimonial
          transparent
          customTheme={{ main: LIGHT }}
          quote={<Surfaces id='in-testimonial' />}
        />
        <ReqoreFeatureCard
          transparent
          customTheme={{ main: LIGHT }}
          label='Card'
          footer={<Surfaces id='in-card' />}
        />
      </ReqoreUIProvider>
    );

    expect(surfaceOf('in-statistic')).toBe(LIGHT);
    expect(surfaceOf('in-testimonial')).toBe(LIGHT);
    expect(surfaceOf('in-card')).toBe(LIGHT);
    expectReadable(colorOf('.reqore-statistic'), LIGHT);
    expectReadable(colorOf('.reqore-testimonial'), LIGHT);
    expectReadable(colorOf('.reqore-feature-card'), LIGHT);
  });

  test('a panel hands its customTheme main to what it holds, and reads its own text on it', () => {
    render(
      <ReqoreUIProvider>
        <ReqorePanel transparent customTheme={{ main: LIGHT }}>
          <Surfaces id='in-panel' />
        </ReqorePanel>
      </ReqoreUIProvider>
    );

    expect(surfaceOf('in-panel')).toBe(LIGHT);
    expectReadable(colorOf('.reqore-panel'), LIGHT);
  });

  test('a surface a component around it says wins over its customTheme', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreSurfaceProvider color='#111111'>
          <ReqoreEntityRow transparent customTheme={{ main: LIGHT }} label='Row' />
        </ReqoreSurfaceProvider>
      </ReqoreUIProvider>
    );

    expectReadable(colorOf('.reqore-entity-row'), '#111111');
  });

  test('an intent alone is no surface: on the page, it is read on the page', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreEntityRow transparent intent='info' label='Row' />
        <ReqoreCallout transparent intent='info'>
          Body
        </ReqoreCallout>
      </ReqoreUIProvider>
    );

    expectReadable(colorOf('.reqore-entity-row'), PAGE);
    expectReadable(colorOf('.reqore-callout-content'), PAGE);
  });

  test('an opaque one is read on its own fill, as before', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreEntityRow customTheme={{ main: LIGHT }} label='Row' />
      </ReqoreUIProvider>
    );

    const row = document.querySelector('.reqore-entity-row') as HTMLElement;

    expectReadable(getComputedStyle(row).color, getComputedStyle(row).backgroundColor);
  });
});

test('a transparent statistic is read on what it is drawn on, not as if it were opaque', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreSurfaceProvider color='#ffffff'>
        <ReqoreStatistic transparent value={12} label='Runs' />
      </ReqoreSurfaceProvider>
    </ReqoreUIProvider>
  );

  expectReadable(colorOf('.reqore-statistic'), '#ffffff');
});

describe("a component's own text is read where it is drawn", () => {
  test('a callout in a light panel on the dark theme: on its own fill', () => {
    render(
      <ReqoreUIProvider>
        <ReqorePanel customTheme={{ main: '#ffffff' }}>
          <ReqoreCallout label='Heads up' description='Read me' />
        </ReqorePanel>
      </ReqoreUIProvider>
    );

    const callout = document.querySelector('.reqore-callout') as HTMLElement;

    expectReadable(getComputedStyle(callout).color, getComputedStyle(callout).backgroundColor);
  });

  test('a transparent panel and testimonial: on what is under them', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreSurfaceProvider color='#ffffff'>
          <ReqorePanel transparent>content</ReqorePanel>
          <ReqoreTestimonial transparent quote='It works.' />
        </ReqoreSurfaceProvider>
      </ReqoreUIProvider>
    );

    expectReadable(colorOf('.reqore-panel'), '#ffffff');
    expectReadable(colorOf('.reqore-testimonial'), '#ffffff');
  });
});

describe('what a component holds beside its text is drawn on it', () => {
  test("an entity row's actions are on the row", () => {
    render(
      <ReqoreUIProvider>
        <ReqoreSurfaceProvider color='#ffffff'>
          <ReqoreEntityRow
            label='Row'
            description={<Surfaces id='row-text' />}
            effect={{ gradient: { colors: { 0: '#5e00ff', 100: '#c20058' } } }}
            actions={[{ label: (<Surfaces id='row-action' />) as any, transparent: true }]}
          />
        </ReqoreSurfaceProvider>
      </ReqoreUIProvider>
    );

    expect(surfaceOf('row-action')).not.toBe('#ffffff');
    expect(surfaceOf('row-action')).toBe(surfaceOf('row-text'));
  });

  test("a feature card's footer is on the card", () => {
    render(
      <ReqoreUIProvider>
        <ReqoreSurfaceProvider color='#ffffff'>
          <ReqoreFeatureCard label='Card' footer={<Surfaces id='card-footer' />} />
        </ReqoreSurfaceProvider>
      </ReqoreUIProvider>
    );

    const card = document.querySelector('.reqore-feature-card') as HTMLElement;

    expect(surfaceOf('card-footer')).not.toBe('#ffffff');
    // the card's own fill, drawn over what is around it
    expect(
      getContrastRatio(surfaceOf('card-footer') as string, getComputedStyle(card).backgroundColor)
    ).toBe(1);
  });
});
