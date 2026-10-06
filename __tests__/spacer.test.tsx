import { render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreHorizontalSpacer,
  ReqoreLayoutContent,
  ReqoreUIProvider,
  ReqoreVerticalSpacer,
} from '../src';

const renderInProvider = (children: React.ReactNode, theme?: { main: string }) =>
  render(
    <ReqoreUIProvider theme={theme as any}>
      <ReqoreLayoutContent>
        <ReqoreContent>{children}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const spacer = () => document.querySelector('.reqore-spacer') as HTMLElement;
const label = () => document.querySelector('.reqore-spacer-label') as HTMLElement;
const segments = () =>
  Array.from(document.querySelectorAll('.reqore-spacer-line')) as HTMLElement[];

test('An unlabelled spacer renders exactly what it always has', () => {
  renderInProvider(<ReqoreVerticalSpacer height={24} lineSize='tiny' />);

  expect(spacer().children).toHaveLength(3);
  expect(spacer().getAttribute('role')).toBeNull();
  expect(spacer().classList.contains('reqore-spacer-labelled')).toBe(false);
  expect(label()).toBeNull();
});

test('An empty label renders the plain spacer', () => {
  renderInProvider(<ReqoreVerticalSpacer height={24} lineSize='tiny' label='' />);

  expect(label()).toBeNull();
  expect(spacer().getAttribute('role')).toBeNull();
});

test('A labelled vertical spacer draws a line, the label and a line', () => {
  renderInProvider(<ReqoreVerticalSpacer height={24} lineSize='tiny' label='or' />);

  const run = document.querySelector('.reqore-spacer-labelled-line') as HTMLElement;
  expect(
    Array.from(run.children).map((child) => child.className.includes('reqore-spacer-label'))
  ).toEqual([false, true, false]);
  expect(segments()).toHaveLength(2);
  expect(label().textContent).toBe('or');
  // The run is the line's own thickness, so the spacer keeps its height.
  expect(getComputedStyle(run).height).toBe('1px');
  expect(getComputedStyle(run).width).toBe('100%');
});

test('The label defaults to small, uppercase, spaced and muted text', () => {
  renderInProvider(<ReqoreVerticalSpacer height={24} lineSize='tiny' label='or' />);

  const style = getComputedStyle(label());
  expect(style.textTransform).toBe('uppercase');
  expect(style.letterSpacing).toBe('1px');
  expect(style.fontSize).toBe('12px');
  expect(style.whiteSpace).toBe('nowrap');
  // Muted: neither the full readable white nor the surface.
  expect(style.color).not.toBe('rgb(255, 255, 255)');
  expect(style.color).not.toBe('rgb(51, 51, 51)');
});

test('The muted label colour follows the theme', () => {
  const { unmount } = renderInProvider(<ReqoreVerticalSpacer height={24} label='or' />);
  const dark = getComputedStyle(label()).color;
  unmount();

  renderInProvider(<ReqoreVerticalSpacer height={24} label='or' />, { main: '#f4f4f4' });
  const light = getComputedStyle(label()).color;

  expect(dark).not.toBe(light);
});

test('labelEffect is spread over the label defaults', () => {
  renderInProvider(
    <ReqoreVerticalSpacer
      height={24}
      label='or'
      labelEffect={{ uppercase: false, textSize: '20px', color: '#ff0000' }}
    />
  );

  const style = getComputedStyle(label());
  expect(style.textTransform).not.toBe('uppercase');
  expect(style.fontSize).toBe('20px');
  expect(style.color).toBe('rgb(255, 0, 0)');
});

test('labelProps reach the label and keep its class', () => {
  renderInProvider(
    <ReqoreVerticalSpacer
      height={24}
      label='or'
      labelProps={{ className: 'my-label', id: 'divider-label' }}
    />
  );

  expect(label().classList.contains('my-label')).toBe(true);
  expect(label().id).toBe('divider-label');
});

test('size sets the label text and the gap around it', () => {
  renderInProvider(<ReqoreVerticalSpacer height={40} lineSize='tiny' label='or' size='normal' />);

  const run = document.querySelector('.reqore-spacer-labelled-line') as HTMLElement;
  expect(getComputedStyle(label()).fontSize).toBe('15px');
  expect(getComputedStyle(run).gap).toBe('16px');
});

test.each([
  ['start', ['0 0 24px', '1 1 0%']],
  ['center', ['1 1 0%', '1 1 0%']],
  ['end', ['1 1 0%', '0 0 24px']],
] as const)('labelAlign %s leaves the short line on the right side', (labelAlign, flex) => {
  renderInProvider(
    <ReqoreVerticalSpacer height={24} lineSize='tiny' label='or' labelAlign={labelAlign} />
  );

  expect(segments().map((segment) => getComputedStyle(segment).flex)).toEqual(flex);
});

test('A string label names a horizontal separator and is announced once', () => {
  renderInProvider(<ReqoreVerticalSpacer height={24} lineSize='tiny' label='or sign in with' />);

  expect(spacer().getAttribute('role')).toBe('separator');
  expect(spacer().getAttribute('aria-label')).toBe('or sign in with');
  expect(spacer().getAttribute('aria-orientation')).toBe('horizontal');
  expect(label().getAttribute('aria-hidden')).toBe('true');
});

test('A node label stays readable and gets no role', () => {
  renderInProvider(
    <ReqoreVerticalSpacer
      height={24}
      label={
        <>
          or <b>continue</b>
        </>
      }
    />
  );

  expect(spacer().getAttribute('role')).toBeNull();
  expect(label().getAttribute('aria-hidden')).toBeNull();
  expect(label().textContent).toBe('or continue');
});

test('An aria-label names a node-labelled separator', () => {
  renderInProvider(<ReqoreVerticalSpacer height={24} label={<b>or</b>} aria-label='or' />);

  expect(spacer().getAttribute('role')).toBe('separator');
  expect(spacer().getAttribute('aria-label')).toBe('or');
  expect(label().getAttribute('aria-hidden')).toBe('true');
});

test('A labelled horizontal spacer draws a vertical line broken by the label', () => {
  renderInProvider(<ReqoreHorizontalSpacer width={20} height='120px' lineSize='tiny' label='or' />);

  const run = document.querySelector('.reqore-spacer-labelled-line') as HTMLElement;
  expect(getComputedStyle(run).flexDirection).toBe('column');
  expect(getComputedStyle(run).height).toBe('120px');
  expect(segments().map((segment) => getComputedStyle(segment).width)).toEqual(['1px', '1px']);
  expect(spacer().getAttribute('aria-orientation')).toBe('vertical');
  expect(getComputedStyle(label()).flex).toBe('0 0 auto');
});

test('The line keeps the intent; the label does not take it', () => {
  const { unmount } = renderInProvider(
    <ReqoreVerticalSpacer height={24} lineSize='tiny' label='or' />
  );
  const plainLine = getComputedStyle(segments()[0]).backgroundColor;
  const plainLabel = getComputedStyle(label()).color;
  unmount();

  renderInProvider(<ReqoreVerticalSpacer height={24} lineSize='tiny' label='or' intent='info' />);

  expect(getComputedStyle(segments()[0]).backgroundColor).not.toBe(plainLine);
  expect(getComputedStyle(label()).color).toBe(plainLabel);
});

test('customTheme reaches the muted label colour', () => {
  const { unmount } = renderInProvider(<ReqoreVerticalSpacer height={24} label='or' />);
  const inherited = getComputedStyle(label()).color;
  unmount();

  renderInProvider(
    <ReqoreVerticalSpacer height={24} label='or' customTheme={{ main: '#f4f4f4' }} />
  );

  expect(getComputedStyle(label()).color).not.toBe(inherited);
});
