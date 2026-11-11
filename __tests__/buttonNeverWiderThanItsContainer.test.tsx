// A button is never wider than what holds it (qorus#646). A `fixed` button had no cap at all: one saying a value and
// its description stayed as wide as both on one line, 487-712px in a 346px card on a phone. The browser stories
// (Button · Fixed Button Stays Inside Its Container, and its phone story) measure the layout; these check the rule
// that makes it.
import { render } from '@testing-library/react';
import { CSSProperties } from 'react';
import { ReqoreButton, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import { CONTROL_GROUP_COLLAPSE_VARIABLE } from '../src/constants/controlGroup';

const inLayout = (node: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{node}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const maxWidthOf = (element: Element | null) => getComputedStyle(element as Element).maxWidth;

describe('a button', () => {
  test.each([
    ['fixed', { fixed: true }],
    ['fluid', { fluid: true }],
    ['fixed and fluid', { fixed: true, fluid: true }],
    ['neither fixed nor fluid', {}],
  ])('that is %s is never wider than its container', (_name, props) => {
    const { container } = inLayout(
      <ReqoreButton {...props} label='omquser' description='The Qorus system datasource' />
    );

    // CONTROL_GROUP_CHILD_MAX_WIDTH, its variables resolved: outside a wrapped stack nothing pulls the button over
    expect(maxWidthOf(container.querySelector('.reqore-button'))).toBe('calc(100% + 0px)');
  });

  test('that a wrapped stack pulls over its padding reaches that much further', () => {
    const { container } = inLayout(
      <ReqoreButton
        label='omquser'
        style={{ [CONTROL_GROUP_COLLAPSE_VARIABLE]: '1px' } as CSSProperties}
      />
    );

    expect(maxWidthOf(container.querySelector('.reqore-button'))).toBe('calc(100% + 1px)');
  });

  test('with its own maxWidth keeps it', () => {
    const { container } = inLayout(<ReqoreButton fixed maxWidth='200px' label='omquser' />);

    expect(maxWidthOf(container.querySelector('.reqore-button'))).toBe('200px');
  });

  test('that is square keeps its side', () => {
    const { container } = inLayout(<ReqoreButton square label='M' />);

    expect(maxWidthOf(container.querySelector('.reqore-button'))).toMatch(/^\d+px$/);
  });
});
