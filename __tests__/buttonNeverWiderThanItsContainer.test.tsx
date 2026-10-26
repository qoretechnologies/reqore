// A button is never wider than what holds it (qorus#646). A `fixed` button had no cap at all: one saying a value and
// its description stayed as wide as both on one line, 487-712px in a 346px card on a phone. The browser stories
// (Button · Fixed Button Stays Inside Its Container, and its phone story) measure the layout; these check the rule
// that makes it.
import { render } from '@testing-library/react';
import { ReqoreButton, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

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

    expect(maxWidthOf(container.querySelector('.reqore-button'))).toBe('100%');
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
