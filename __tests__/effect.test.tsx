import { render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreEffect,
  ReqoreLayoutContent,
  ReqoreTextEffect,
  ReqoreUIProvider,
} from '../src';
import { FROST_FOOT, getFrostOpacity } from '../src/components/Effect';
import { getColorAtAlpha, getContrastRatio, getDrawnColor } from '../src/helpers/colors';

test('Renders <ReqoreEffect /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEffect
            as='div'
            effect={{
              gradient: {
                type: 'radial',
                shape: 'circle',
                colors: {
                  0: 'danger:lighten:2',
                  100: 'info:darken:1',
                },
              },
              spaced: 10,
              uppercase: true,
              weight: 'bold',
              color: 'main',
            }}
          >
            This is a test
          </ReqoreEffect>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-effect').length).toBe(1);
});

test('Renders <ReqoreTextEffect /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextEffect
            as='p'
            effect={{
              gradient: {
                colors: {
                  0: '#ff0000',
                  100: '#00ff00',
                },
              },
              spaced: 10,
              uppercase: true,
              weight: 'thin',
            }}
          >
            This is a test
          </ReqoreTextEffect>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-text-effect').length).toBe(1);
});

test('Renders <ReqoreTextEffect /> with frost effect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextEffect
            as='p'
            effect={{
              frost: true,
              weight: 'bold',
            }}
          >
            Frosted text
          </ReqoreTextEffect>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-text-effect').length).toBe(1);
  expect(document.querySelector('.reqore-text-effect')!.textContent).toBe('Frosted text');
});

/*
 * Frosted text fades toward its foot. By default it fades only as far as the foot stays readable on what it is
 * drawn on; an opacity the caller gives is drawn as given, as every explicit opacity is (COMPONENTS.md).
 */
describe('frosted text', () => {
  test('is drawn at the opacity its caller gives, even one its foot does not read at', () => {
    expect(getFrostOpacity('#ffffff', '#ffffff', 0.3)).toBe(0.3);
  });

  test('by default fades only as far as its foot stays readable', () => {
    for (const [color, under] of [
      ['#ffffff', '#000000'],
      ['#000000', '#f0f0f0'],
    ]) {
      const opacity = getFrostOpacity(color, under);
      // no fainter than the default, and its foot - the faintest of it - reads by 4.5:1
      expect(opacity).toBeGreaterThanOrEqual(0.72);
      const foot = getDrawnColor(getColorAtAlpha(color, opacity * FROST_FOOT), under);
      expect(getContrastRatio(foot, under)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
