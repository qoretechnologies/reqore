import { render } from '@testing-library/react';
import { ReqoreUIProvider, useReqoreProperty } from '../../src/index';

const HoverProbe = () => {
  const isHoverCapable = useReqoreProperty('isHoverCapable');
  const isMobile = useReqoreProperty('isMobile');

  return (
    <>
      <span id='hover-capable'>{String(isHoverCapable)}</span>
      <span id='is-mobile'>{String(isMobile)}</span>
    </>
  );
};

describe('isHoverCapable context property', () => {
  it('is exposed on the context and readable through useReqoreProperty', () => {
    render(
      <ReqoreUIProvider>
        <HoverProbe />
      </ReqoreUIProvider>
    );

    // Not `undefined` — the provider must actually publish the property, which
    // is what a consumer gating a hover-revealed control depends on.
    expect(document.querySelector('#hover-capable').textContent).toBe('true');
  });

  it('defaults to true so hover-gated UI keeps its desktop behaviour', () => {
    // Where the media query cannot be evaluated the safe answer is "this pointer
    // hovers": degrading to `false` would move every hover affordance into a
    // fallback on plain desktop renders.
    render(
      <ReqoreUIProvider>
        <HoverProbe />
      </ReqoreUIProvider>
    );

    expect(document.querySelector('#hover-capable').textContent).not.toBe('undefined');
    expect(document.querySelector('#hover-capable').textContent).toBe('true');
  });

  it('is independent of the width-based mobile flag', () => {
    // The two answer different questions: `isMobile` is viewport WIDTH, this is
    // pointer CAPABILITY. A narrow desktop window hovers; a large tablet does
    // not — so a consumer must not substitute one for the other.
    render(
      <ReqoreUIProvider>
        <HoverProbe />
      </ReqoreUIProvider>
    );

    expect(document.querySelector('#is-mobile').textContent).toBe('false');
    expect(document.querySelector('#hover-capable').textContent).toBe('true');
    expect(document.querySelector('#hover-capable').textContent).not.toBe(
      document.querySelector('#is-mobile').textContent
    );
  });
});
