import { render } from '@testing-library/react';
import { forwardRef, ReactNode } from 'react';
import { ReqoreLayoutContent, ReqorePanel, ReqoreUIProvider } from '../src';

/**
 * A panel renders the caller's `as` when one is given, re-resizable's `Resizable` when it is
 * resizable, and a `div` otherwise. `as={rest.as || resizable ? Resizable : 'div'}` binds as
 * `(rest.as || resizable) ? Resizable : 'div'`, so a panel given `as` rendered a `Resizable`
 * and the caller's element never appeared.
 */

const renderPanel = (panel: ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>{panel}</ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const getPanel = () => document.querySelector('.reqore-panel') as HTMLElement;

// re-resizable draws each enabled handle as a div with an inline `*-resize` cursor.
const getResizeHandles = () =>
  Array.from(document.querySelectorAll<HTMLElement>('*')).filter((element) =>
    /-resize$/.test(element.style?.cursor || '')
  );

const Section = forwardRef<HTMLElement, { children?: ReactNode; className?: string }>(
  ({ children, className }, ref) => (
    <section ref={ref} className={className} data-custom-panel>
      {children}
    </section>
  )
);

test('a panel given an element in `as` renders that element', () => {
  renderPanel(
    <ReqorePanel as='section' label='Panel'>
      Body
    </ReqorePanel>
  );

  expect(getPanel().tagName).toBe('SECTION');
  expect(getResizeHandles()).toHaveLength(0);
});

test('a panel given a component in `as` renders that component', () => {
  renderPanel(
    <ReqorePanel as={Section} label='Panel'>
      Body
    </ReqorePanel>
  );

  expect(getPanel().hasAttribute('data-custom-panel')).toBe(true);
  expect(getResizeHandles()).toHaveLength(0);
});

test('`as` wins over `resizable`', () => {
  renderPanel(
    <ReqorePanel as='section' label='Panel' resizable={{ enable: { top: true } }}>
      Body
    </ReqorePanel>
  );

  expect(getPanel().tagName).toBe('SECTION');
  expect(getResizeHandles()).toHaveLength(0);
  // re-resizable's own props are not spread onto the caller's element either.
  expect(getPanel().hasAttribute('enable')).toBe(false);
});

test('a resizable panel without `as` renders a Resizable', () => {
  renderPanel(
    <ReqorePanel label='Panel' resizable={{ enable: { top: true } }}>
      Body
    </ReqorePanel>
  );

  expect(getPanel().tagName).toBe('DIV');
  expect(getResizeHandles().map((element) => element.style.cursor)).toEqual(['row-resize']);
});

test('a panel that is neither renders a div', () => {
  renderPanel(<ReqorePanel label='Panel'>Body</ReqorePanel>);

  expect(getPanel().tagName).toBe('DIV');
  expect(getResizeHandles()).toHaveLength(0);
});
