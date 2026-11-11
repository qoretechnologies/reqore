/**
 * A stacked bar's segments: their text is read on the segment as it is drawn over the bar and
 * over what the bar is drawn on (`useReqoreSurface`), not over the theme's page; and the dark
 * shadow that lifts light text off a segment is not drawn under dark text, which it only blurred.
 */
import { render } from '@testing-library/react';
import { getLuminance } from 'polished';
import { ReqoreStackedBar, ReqoreUIProvider } from '../src';
import { TReqoreEffectColor } from '../src/components/Effect';
import { ReqoreSurfaceProvider } from '../src/context/SurfaceContext';

const segment = () => document.querySelector('.reqore-stacked-bar-segment') as HTMLElement;

const textIsDark = () => getLuminance(getComputedStyle(segment()).color) < 0.5;

const bar = (color: string) => (
  <ReqoreStackedBar
    transparent
    showValues
    items={[{ value: 1, color: color as TReqoreEffectColor }]}
  />
);

describe('a segment', () => {
  test('in a translucent color is read as it is drawn over what the bar is drawn on', () => {
    render(
      <ReqoreUIProvider>
        {/* half black over white: a mid gray, dark text reads on it (over the dark page: black) */}
        <ReqoreSurfaceProvider color='#ffffff'>{bar('#00000080')}</ReqoreSurfaceProvider>
      </ReqoreUIProvider>
    );

    expect(textIsDark()).toBe(true);
  });

  test('written in dark text draws no shadow under it', () => {
    render(<ReqoreUIProvider>{bar('#f0f0f0')}</ReqoreUIProvider>);

    expect(textIsDark()).toBe(true);
    expect(getComputedStyle(segment()).textShadow).not.toContain('1px');
  });

  test('written in light text keeps the shadow that lifts it', () => {
    render(<ReqoreUIProvider>{bar('#202020')}</ReqoreUIProvider>);

    expect(textIsDark()).toBe(false);
    expect(getComputedStyle(segment()).textShadow).toContain('1px');
  });
});
