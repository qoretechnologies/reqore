import { fireEvent, render, screen } from '@testing-library/react';
import { ReqoreButton, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import { IReqoreTheme } from '../src/constants/theme';

const MAIN = '#121212';
const DANGER = '#a82a2a';
const TEXT_LOOK: Partial<IReqoreTheme> = {
  main: MAIN,
  intents: { danger: DANGER } as IReqoreTheme['intents'],
  buttons: { intentLook: { danger: 'text' } },
};

const Wrapper = ({ theme, children }: { theme?: Partial<IReqoreTheme>; children: any }) => (
  <ReqoreUIProvider theme={theme}>
    <ReqoreLayoutContent>
      <ReqoreContent>{children}</ReqoreContent>
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);

/** WCAG contrast of two `rgb()` / `#rrggbb` colours. */
const contrast = (a: string, b: string): number => {
  const channels = (color: string) =>
    color.startsWith('#')
      ? [1, 3, 5].map((start) => parseInt(color.slice(start, start + 2), 16))
      : (color.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
  const luminance = (color: string) => {
    const [r, g, b] = channels(color).map((value) => {
      const c = value / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

/**
 * `theme.buttons.intentLook`: a theme can draw an intent as TEXT instead of a fill. A calm
 * theme's destructive button is red words on a plain button, and a row of delete bins is a row
 * of ordinary icons that turn red only under the pointer.
 */
describe('theme.buttons.intentLook', () => {
  test('a labelled button says its intent in readable words, on the ordinary button', () => {
    render(
      <Wrapper theme={TEXT_LOOK}>
        <ReqoreButton intent='danger'>Delete</ReqoreButton>
      </Wrapper>
    );
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button.getAttribute('data-intent-text')).toBe('label');
    const color = button.style.color;
    expect(color).not.toBe('');
    // Readable on the near-black theme, which the danger fill itself is not.
    expect(contrast(DANGER, MAIN)).toBeLessThan(4.5);
    expect(contrast(color, MAIN)).toBeGreaterThanOrEqual(4.5);
    // Not painted in the intent.
    expect(getComputedStyle(button).backgroundColor).not.toBe('rgb(168, 42, 42)');
  });

  test('an icon-only button is the ordinary button at rest and carries the colour for its hover', () => {
    render(
      <Wrapper theme={TEXT_LOOK}>
        <ReqoreButton intent='danger' icon='DeleteBinLine' tooltip='Delete' />
      </Wrapper>
    );
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button.getAttribute('data-intent-text')).toBe('icon');
    expect(button.style.color).toBe('');
    expect(button.style.getPropertyValue('--reqore-button-intent-text')).not.toBe('');
    fireEvent.mouseOver(button);
    expect(button.getAttribute('data-intent-text')).toBe('icon');
  });

  test("a caller's own style still wins", () => {
    render(
      <Wrapper theme={TEXT_LOOK}>
        <ReqoreButton intent='danger' style={{ color: 'rgb(1, 2, 3)' }}>
          Delete
        </ReqoreButton>
      </Wrapper>
    );
    expect(screen.getByRole('button', { name: 'Delete' }).style.color).toBe('rgb(1, 2, 3)');
  });

  test('without the option, an intent is a fill as before', () => {
    render(
      <Wrapper theme={{ main: MAIN }}>
        <ReqoreButton intent='danger'>Delete</ReqoreButton>
      </Wrapper>
    );
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button.getAttribute('data-intent-text')).toBeNull();
    expect(button.style.color).toBe('');
  });

  test('only the intents the theme names are drawn as text', () => {
    render(
      <Wrapper theme={TEXT_LOOK}>
        <ReqoreButton intent='success'>Save</ReqoreButton>
      </Wrapper>
    );
    expect(screen.getByRole('button', { name: 'Save' }).getAttribute('data-intent-text')).toBeNull();
  });
});
