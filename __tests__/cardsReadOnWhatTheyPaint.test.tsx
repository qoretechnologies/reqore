// A card is read on what it paints - its fill and the gradient its effect draws - not on what is around it
// (qorus#646): its own text, an `effect.color` given for it or for what it holds, and the surface it hands down.
import { render } from '@testing-library/react';
import {
  ReqoreCallout,
  ReqoreContent,
  ReqoreEntityRow,
  ReqoreFeatureCard,
  ReqoreLayoutContent,
  ReqoreStatistic,
  ReqoreTestimonial,
  ReqoreUIProvider,
} from '../src';
import { IReqoreEffect } from '../src/components/Effect';
import { getContrastRatio, getDrawnColor } from '../src/helpers/colors';
import { SurfaceProbe } from './shared/surfaces';

/** A near-white gradient: on the dark default theme, what reads on the page does not read on it. */
const LIGHT: IReqoreEffect['gradient'] = { colors: { 0: '#ffffff', 100: '#f2f2f2' } };

const inLayout = (node: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{node}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

/** How an element's text stands out from the white the gradient starts in. */
const contrastOnWhite = (selector: string) =>
  getContrastRatio(
    getDrawnColor(getComputedStyle(document.querySelector(selector) as HTMLElement).color),
    '#ffffff'
  );

describe('a card with a light gradient on a dark page', () => {
  test("an entity row's text reads on its gradient", () => {
    inLayout(<ReqoreEntityRow label='Process order' effect={{ gradient: LIGHT }} />);

    expect(contrastOnWhite('.reqore-entity-row')).toBeGreaterThanOrEqual(4.5);
  });

  test("an entity row's own effect.color is a shade that reads on its gradient", () => {
    inLayout(<ReqoreEntityRow label='Process order' effect={{ gradient: LIGHT, color: 'info' }} />);

    expect(contrastOnWhite('.reqore-entity-row')).toBeGreaterThanOrEqual(4.5);
  });

  test("a statistic's text reads on its gradient", () => {
    inLayout(<ReqoreStatistic value={42} label='Orders' effect={{ gradient: LIGHT }} />);

    expect(contrastOnWhite('.reqore-statistic')).toBeGreaterThanOrEqual(4.5);
  });

  test("a callout's content effect.color is a shade that reads on its gradient", () => {
    inLayout(
      <ReqoreCallout effect={{ gradient: LIGHT }} contentEffect={{ color: 'info' }}>
        The run stopped at its last step.
      </ReqoreCallout>
    );

    expect(contrastOnWhite('.reqore-callout-content')).toBeGreaterThanOrEqual(4.5);
  });

  test("a testimonial's text reads on its gradient", () => {
    inLayout(<ReqoreTestimonial quote='It just works.' author='Ana' effect={{ gradient: LIGHT }} />);

    expect(contrastOnWhite('.reqore-testimonial')).toBeGreaterThanOrEqual(4.5);
  });

  test("a feature card's text reads on its gradient, and it hands its body the gradient", () => {
    inLayout(
      <ReqoreFeatureCard label='Fast' description={<SurfaceProbe />} effect={{ gradient: LIGHT }} />
    );

    expect(contrastOnWhite('.reqore-feature-card')).toBeGreaterThanOrEqual(4.5);
    // its description is drawn on the card, not on what is around it
    expect(document.querySelector('[data-testid="surfaces"]')!.textContent).toContain('#ffffff');
  });
});

describe('a statistic with an intent', () => {
  test('reads on the gradient it draws, not on the gradient surface color it does not', () => {
    // an intent rings the gradient, and a ringed gradient is drawn without its own surface color
    inLayout(
      <ReqoreStatistic
        value={42}
        label='Orders'
        intent='info'
        effect={{ gradient: { ...LIGHT, surface: '#000000' } }}
      />
    );

    expect(contrastOnWhite('.reqore-statistic')).toBeGreaterThanOrEqual(4.5);
  });
});
