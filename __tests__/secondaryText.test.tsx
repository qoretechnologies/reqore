// Copyright 2026 Qore Technologies, s.r.o.
import { render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreMarkdownBlock,
  ReqorePanel,
  ReqoreStatistic,
  ReqoreUIProvider,
} from '../src';
import { IReqoreTheme } from '../src/constants/theme';
import { getSecondaryTextColor, getSecondaryTextEffect } from '../src/helpers/colors';

/**
 * A theme names its secondary text color once (`text.secondary`), and descriptions, statistic
 * labels and Markdown prose draw in it, where each was the readable color at an opacity of its own
 * (in an app, a template's description read brighter than the drawer's other secondary text).
 * Unset, everything is as before.
 */
const CALM: Partial<IReqoreTheme> = { main: '#141418', text: { secondary: '#a6a6af' } };

describe('the secondary text color', () => {
  test('is the theme’s where it reads on the surface, and nothing otherwise', () => {
    expect(getSecondaryTextColor({ main: '#141418' })).toBeUndefined();
    expect(getSecondaryTextColor({ main: '#141418', text: { secondary: '#a6a6af' } })).toBe(
      '#a6a6af'
    );
    // On a light surface the grey reads at under 3:1: the component keeps its own.
    expect(getSecondaryTextColor({ main: '#f4f4f6', text: { secondary: '#a6a6af' } })).toBe(
      undefined
    );
    expect(getSecondaryTextEffect({ main: '#141418' }, 0.7)).toEqual({ opacity: 0.7 });
    expect(getSecondaryTextEffect(CALM as IReqoreTheme, 0.7)).toEqual({ color: '#a6a6af' });
  });

  const mount = (theme?: Partial<IReqoreTheme>) =>
    render(
      <ReqoreUIProvider theme={theme}>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqorePanel label='Order sync' description='Moves orders to the warehouse'>
              Body
            </ReqorePanel>
            <ReqoreStatistic label='Running' value={12} description='workflows in flight' />
            <ReqoreMarkdownBlock>
              <p className='prose'>Two labels were printed.</p>
            </ReqoreMarkdownBlock>
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  const colorOf = (selector: string) =>
    getComputedStyle(document.querySelector(selector) as HTMLElement).color;
  const opacityOf = (selector: string) =>
    getComputedStyle(document.querySelector(selector) as HTMLElement).opacity;

  test('descriptions, statistic labels and Markdown prose draw in it', () => {
    mount(CALM);

    for (const selector of [
      '.reqore-panel-title-description',
      '.reqore-statistic-label',
      '.reqore-statistic-description',
      '.reqore-markdown-block',
    ]) {
      expect([selector, colorOf(selector)]).toEqual([selector, 'rgb(166, 166, 175)']);
    }
  });

  test('without it, each keeps its own opacity', () => {
    mount({ main: '#141418' });

    expect(opacityOf('.reqore-panel-title-description')).toBe('0.7');
    expect(opacityOf('.reqore-statistic-label')).toBe('0.7');
    expect(opacityOf('.reqore-statistic-description')).toBe('0.6');
  });
});
