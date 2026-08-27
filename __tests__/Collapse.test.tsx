import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ReqoreCollapse, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

const renderCollapse = (props: Partial<React.ComponentProps<typeof ReqoreCollapse>> = {}) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCollapse collapsed={false} {...props}>
            <button type='button'>Focusable content</button>
          </ReqoreCollapse>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

test('Renders <Collapse /> open', () => {
  const { container } = renderCollapse();

  const collapse = container.querySelector('.reqore-collapse') as HTMLElement;

  expect(collapse).toBeTruthy();
  expect(collapse.getAttribute('aria-hidden')).toBe('false');
  expect(collapse.textContent).toBe('Focusable content');
});

test('Keeps folded content mounted, but out of the tab order', () => {
  /* Unmounting would make the fold a cut. The content stays, and `visibility`
     is what stops a keyboard user landing on a control inside a zero-height
     box — a distinction `display: none` cannot make while animating. */
  const { container } = renderCollapse({ collapsed: true });

  const collapse = container.querySelector('.reqore-collapse') as HTMLElement;
  const content = container.querySelector('.reqore-collapse-content') as HTMLElement;

  expect(collapse.getAttribute('aria-hidden')).toBe('true');
  expect(container.querySelector('button')).toBeTruthy();
  expect(getComputedStyle(collapse).gridTemplateRows).toBe('0fr');
  expect(getComputedStyle(content).visibility).toBe('hidden');
});

test('Pulls the host gap closed with it', () => {
  // A folded block still costs its parent's gap, leaving a hole where the
  // content used to be.
  const { container } = renderCollapse({ collapsed: true, hostGap: 16 });

  const collapse = container.querySelector('.reqore-collapse') as HTMLElement;

  expect(getComputedStyle(collapse).marginBottom).toBe('-16px');
});

test('Does not reserve the host gap while open', () => {
  const { container } = renderCollapse({ collapsed: false, hostGap: 16 });

  const collapse = container.querySelector('.reqore-collapse') as HTMLElement;

  expect(getComputedStyle(collapse).marginBottom).toBe('0px');
});

test('Drops the transition when animation is turned off', () => {
  const { container } = renderCollapse({ animated: false });

  const collapse = container.querySelector('.reqore-collapse') as HTMLElement;

  expect(getComputedStyle(collapse).transition).toBe('');
});
