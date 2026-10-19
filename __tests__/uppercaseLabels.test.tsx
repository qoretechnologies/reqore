import { render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreDescriptionList,
  ReqoreLayoutContent,
  ReqoreMenu,
  ReqoreMenuDivider,
  ReqoreStatistic,
  ReqoreUIProvider,
} from '../src';
import { IReqoreTheme } from '../src/constants/theme';

/* `theme.uppercaseLabels` decides, once, whether the small labels Reqore names things with are
   tracked uppercase. Default `true` (every existing app unchanged); `false` sets them in sentence
   case everywhere — a statistic's label, a menu's heading, a description list's row labels. */

const renderWith = (theme: Partial<IReqoreTheme> | undefined, children: React.ReactNode) =>
  render(
    <ReqoreUIProvider theme={theme}>
      <ReqoreLayoutContent>
        <ReqoreContent>{children}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const transformOf = (selector: string) =>
  getComputedStyle(document.querySelector(selector) as Element).textTransform;

describe('theme.uppercaseLabels', () => {
  test('a statistic label is uppercase by default and sentence case when the theme says so', () => {
    const { unmount } = renderWith(undefined, <ReqoreStatistic value={3} label='Open issues' />);
    expect(transformOf('.reqore-statistic-label')).toBe('uppercase');
    unmount();

    renderWith({ uppercaseLabels: false }, <ReqoreStatistic value={3} label='Open issues' />);
    expect(transformOf('.reqore-statistic-label')).not.toBe('uppercase');
  });

  test('a menu heading follows the theme', () => {
    renderWith(
      { uppercaseLabels: false },
      <ReqoreMenu>
        <ReqoreMenuDivider label='Recent' />
      </ReqoreMenu>
    );
    expect(transformOf('.reqore-menu-divider')).not.toBe('uppercase');
  });

  test('a description list follows the theme unless the caller says otherwise', () => {
    const { unmount } = renderWith(
      { uppercaseLabels: false },
      <ReqoreDescriptionList items={[{ key: 'a', label: 'Timeout', content: '30' }]} />
    );
    expect(document.body.innerHTML).not.toMatch(/text-transform:\s*uppercase/);
    unmount();

    renderWith(
      { uppercaseLabels: false },
      <ReqoreDescriptionList uppercaseLabels items={[{ key: 'a', label: 'Timeout', content: '30' }]} />
    );
    expect(document.querySelector('.reqore-description-list, .reqore-panel')).toBeTruthy();
  });
});
