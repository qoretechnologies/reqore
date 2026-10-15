/**
 * The colours of a breadcrumbs bar: its crumbs' text and what the parts on the bar read as their surface. jsdom lays
 * nothing out, so the trail is not responsive here (the folding is covered by `breadcrumbs.test.tsx`).
 */
import { render } from '@testing-library/react';
import { ReqoreBreadcrumbs, ReqoreUIProvider } from '../src';
import { IReqoreBreadcrumbItem } from '../src/components/Breadcrumbs';
import { DEFAULT_THEME } from '../src/constants/theme';
import { useReqoreSurface } from '../src/context/SurfaceContext';
import {
  buildTheme,
  getDrawnColor,
  getReadableColorFrom,
  getThemeSurface,
} from '../src/helpers/colors';

const ITEMS: IReqoreBreadcrumbItem[] = [
  { label: 'Plain' },
  { label: 'Warning', intent: 'warning' },
  { label: 'Current' },
];

/** The text colour a crumb is drawn in, as a six-digit hex. */
const crumbColor = (label: string): string => {
  const crumb = Array.from(document.querySelectorAll<HTMLElement>('.reqore-breadcrumbs-item')).find(
    (element) => element.textContent?.includes(label)
  );

  return getDrawnColor(getComputedStyle(crumb!).color);
};

const renderBar = (props: Partial<React.ComponentProps<typeof ReqoreBreadcrumbs>> = {}) =>
  render(
    <ReqoreUIProvider>
      <ReqoreBreadcrumbs items={ITEMS} responsive={false} {...props} />
    </ReqoreUIProvider>
  );

const theme = buildTheme(DEFAULT_THEME);

describe("a breadcrumbs bar's crumbs", () => {
  test("are written in the theme's item colour when it names one", () => {
    renderBar({ customTheme: { item: { color: '#123456' } } });

    expect(crumbColor('Plain')).toBe('#123456');
    expect(crumbColor('Current')).toBe('#123456');
  });

  test('in the readable colour of a bar drawn in a colour of its own (e3e8742)', () => {
    renderBar({ customTheme: { main: '#ff69b4' } });

    const readable = getReadableColorFrom(getDrawnColor('#ff69b4', getThemeSurface(theme)), true);

    expect(crumbColor('Plain')).toBe(readable);
  });

  test("a crumb with an intent of its own picks its text against its own colour", () => {
    renderBar({ customTheme: { main: '#ff69b4', item: { color: '#123456' } } });

    expect(crumbColor('Warning')).not.toBe('#123456');
  });
});

/** What a part on the bar reads as its surface. */
const Surface = () => {
  const surface = useReqoreSurface();

  return <span data-testid='surface'>{([] as string[]).concat(surface ?? 'none').join(',')}</span>;
};

test("the right element is drawn on the bar, and reads it as its surface", () => {
  const { getByTestId } = renderBar({
    customTheme: { main: '#ff69b4' },
    rightElement: <Surface />,
  });

  expect(getByTestId('surface').textContent).toBe(
    getDrawnColor('#ff69b4', getThemeSurface(theme))
  );
});
