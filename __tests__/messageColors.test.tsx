/**
 * The text colour of a message: picked against what it is drawn on, as far as it is known.
 */
import { render } from '@testing-library/react';
import { ReqoreMessage, ReqoreUIProvider } from '../src';
import { DEFAULT_THEME } from '../src/constants/theme';
import { ReqoreSurfaceProvider } from '../src/context/SurfaceContext';
import {
  buildTheme,
  getDrawnColor,
  getReadableColorFrom,
  getThemeSurface,
} from '../src/helpers/colors';

const theme = buildTheme(DEFAULT_THEME);

/** The text colour the message is written in, as a six-digit hex. */
const messageColor = () =>
  getDrawnColor(getComputedStyle(document.querySelector('.reqore-message')!).color);

describe('a minimal message', () => {
  test('in a colour of its own, on nothing it knows of, is read against that colour', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreMessage minimal customTheme={{ main: '#f2f2f2' }}>
          Light
        </ReqoreMessage>
      </ReqoreUIProvider>
    );

    expect(messageColor()).toBe(
      getReadableColorFrom(getDrawnColor('#f2f2f2', getThemeSurface(theme)), true)
    );
  });

  test('with only an intent, on nothing it knows of, is written in the colour around it', () => {
    render(
      <ReqoreUIProvider>
        <div style={{ color: 'rgb(1, 2, 3)' }}>
          <ReqoreMessage minimal intent='info'>
            Around
          </ReqoreMessage>
        </div>
      </ReqoreUIProvider>
    );

    expect(messageColor()).toBe('#010203');
  });

  test('on a surface it is told of, is read against that surface', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreSurfaceProvider color='#f2f2f2'>
          <ReqoreMessage minimal customTheme={{ main: '#111111' }}>
            On a surface
          </ReqoreMessage>
        </ReqoreSurfaceProvider>
      </ReqoreUIProvider>
    );

    expect(messageColor()).toBe(getReadableColorFrom('#f2f2f2', true));
  });
});
