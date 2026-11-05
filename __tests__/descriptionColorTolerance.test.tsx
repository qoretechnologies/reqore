// Copyright 2026 Qore Technologies, s.r.o.
/**
 * A description given a color the theme cannot resolve still renders.
 *
 * A panel faded its description as far as its color stays readable, and read that color through the theme:
 * a CSS color name, a variable or a four-digit hex resolved to nothing, and working out the contrast of
 * nothing threw in render - the panel, and whatever held it, was unmounted. The bar's text color is read
 * instead, which is what such a description is drawn in: a text effect draws no color it cannot resolve.
 */
import { render } from '@testing-library/react';
import {
  ReqoreCallout,
  ReqoreEntityRow,
  ReqoreFeatureCard,
  ReqorePanel,
  ReqoreStatistic,
  ReqoreUIProvider,
} from '../src';

const UNRESOLVABLE = ['red', 'var(--x)', '#f00a'];

describe.each(UNRESOLVABLE)('a description in %s', (color) => {
  test('renders in a panel', () => {
    render(
      <ReqoreUIProvider>
        <ReqorePanel label='Panel' description='What it is' descriptionEffect={{ color } as any}>
          content
        </ReqorePanel>
      </ReqoreUIProvider>
    );

    expect(document.querySelector('.reqore-panel-title-description')?.textContent).toBe(
      'What it is'
    );
  });

  test('renders in a callout, an entity row, a feature card and a statistic', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreCallout label='Callout' description='Callout text' descriptionEffect={{ color } as any} />
        <ReqoreEntityRow
          label='Row'
          description='Row text'
          metadata='Row metadata'
          descriptionEffect={{ color } as any}
          metadataEffect={{ color } as any}
        />
        <ReqoreFeatureCard label='Card' description='Card text' descriptionEffect={{ color } as any} />
        <ReqoreStatistic value={1} label='Statistic' labelEffect={{ color } as any} />
      </ReqoreUIProvider>
    );

    expect(document.querySelector('.reqore-callout-description')?.textContent).toBe(
      'Callout text'
    );
    expect(document.querySelector('.reqore-entity-row-description')?.textContent).toBe('Row text');
    expect(document.querySelector('.reqore-feature-card-description')?.textContent).toBe(
      'Card text'
    );
    expect(document.querySelector('.reqore-statistic-label')?.textContent).toBe('Statistic');
  });
});
