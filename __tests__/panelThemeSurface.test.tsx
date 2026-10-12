import { render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreIcon,
  ReqoreLayoutContent,
  ReqorePanel,
  ReqoreSpan,
  ReqoreStatistic,
  ReqoreUIProvider,
} from '../src';
import { IReqoreTheme } from '../src/constants/theme';
import {
  getPanelBackgroundColor,
  getPanelHairlineColor,
  getThemePanelSurface,
} from '../src/helpers/colors';

const SURFACE = '#141417';
const HAIRLINE = '#2d2d33';
const THEMED: Partial<IReqoreTheme> = {
  main: '#121212',
  panel: { main: SURFACE, border: HAIRLINE },
};

const Wrapper = ({ theme, children }: { theme?: Partial<IReqoreTheme>; children: any }) => (
  <ReqoreUIProvider theme={theme}>
    <ReqoreLayoutContent>
      <ReqoreContent>{children}</ReqoreContent>
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);

describe('theme.panel', () => {
  test('a panel paints the themed surface and hairline', () => {
    render(
      <Wrapper theme={THEMED}>
        <ReqorePanel label='Themed'>Body</ReqorePanel>
      </Wrapper>
    );

    const panel = document.querySelector('.reqore-panel');
    expect(panel).toHaveStyle(`background-color: rgb(20, 20, 23)`);
    expect(panel).toHaveStyle(`border-color: rgb(45, 45, 51)`);
  });

  test('a panel with its own customTheme main keeps deriving from it', () => {
    render(
      <Wrapper theme={THEMED}>
        <ReqorePanel label='Custom' customTheme={{ main: '#ff0000' }}>
          Body
        </ReqorePanel>
      </Wrapper>
    );

    const panel = document.querySelector('.reqore-panel');
    expect(panel).not.toHaveStyle(`background-color: rgb(20, 20, 23)`);
    expect(panel).not.toHaveStyle(`border-color: rgb(45, 45, 51)`);
  });

  test('an intent still tints the panel edge', () => {
    render(
      <Wrapper theme={THEMED}>
        <ReqorePanel label='Danger' intent='danger'>
          Body
        </ReqorePanel>
      </Wrapper>
    );

    expect(document.querySelector('.reqore-panel')).not.toHaveStyle(
      `border-color: rgb(45, 45, 51)`
    );
  });

  test('a statistic tile sits on the same surface', () => {
    render(
      <Wrapper theme={THEMED}>
        <ReqoreStatistic value={42} label='Answers' rounded flat={false} />
      </Wrapper>
    );

    expect(document.querySelector('.reqore-statistic')).toHaveStyle(
      `background-color: rgb(20, 20, 23)`
    );
  });

  test('without theme.panel the surface is derived exactly as before', () => {
    const theme = { main: '#121212', originalMain: '#121212', intents: {}, notifications: {} } as IReqoreTheme;

    expect(getThemePanelSurface(theme)).toBeUndefined();
    expect(getPanelBackgroundColor(theme)).not.toBe(SURFACE);
    expect(getPanelHairlineColor(theme)).not.toBe(HAIRLINE);
  });

  test('the themed surface applies only while main is the theme’s own', () => {
    const base = {
      main: '#121212',
      originalMain: '#121212',
      intents: {},
      notifications: {},
      panel: THEMED.panel,
    } as IReqoreTheme;
    const customised = { ...base, main: '#ff0000' } as IReqoreTheme;

    expect(getPanelBackgroundColor(base)).toBe(SURFACE);
    expect(getPanelHairlineColor(base)).toBe(HAIRLINE);
    expect(getThemePanelSurface(customised)).toBeUndefined();
  });
});

describe('ReqoreStatistic description', () => {
  test('renders a description line under the value', () => {
    render(
      <Wrapper>
        <ReqoreStatistic value='8,782' label='Events processed' description='Last 24 hours' />
      </Wrapper>
    );

    expect(document.querySelector('.reqore-statistic-description')?.textContent).toBe(
      'Last 24 hours'
    );
  });

  test('renders no description element when none is given', () => {
    render(
      <Wrapper>
        <ReqoreStatistic value='8,782' label='Events processed' />
      </Wrapper>
    );

    expect(document.querySelector('.reqore-statistic-description')).toBeNull();
  });
});

describe('ReqoreIcon heartbeat', () => {
  test('a heartbeat icon is animated', () => {
    render(
      <Wrapper>
        <ReqoreIcon icon='CircleFill' animation='heartbeat' />
      </Wrapper>
    );

    const icon = document.querySelector('.reqore-icon');
    expect(getComputedStyle(icon!).animationName).not.toBe('');
  });
});

describe('effect.tabularNums', () => {
  test('sets tabular figures', () => {
    render(
      <Wrapper>
        <ReqoreSpan effect={{ tabularNums: true }}>1,234</ReqoreSpan>
      </Wrapper>
    );

    const css = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent)
      .join('');
    expect(css).toContain('font-variant-numeric:tabular-nums');
  });
});
