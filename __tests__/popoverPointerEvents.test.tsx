import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReqoreButton, ReqorePopover, ReqoreUIProvider } from '../src';

/**
 * A tooltip must not swallow the pointer that is reading it.
 *
 * A plain `hover` popover is closed by the trigger's own `mouseleave`, so the
 * pointer can never arrive on its surface: the surface unmounts on the way.
 * What the surface CAN do is sit in the pointer's path — over the thing the
 * tooltip is describing, over the trigger itself — and take the hover away from
 * whatever is underneath it, which makes the tooltip flicker out mid-read and
 * makes the element below it unclickable while it is up. Consumers were
 * reaching into the rendered surface from a ref to set `pointer-events: none`
 * on it, because there was no prop for it.
 *
 * So a hover tooltip is transparent to the pointer by default, and every
 * popover the pointer CAN reach — one held open on hover, one opened by click
 * or focus — keeps it. `interactive` overrides the default either way.
 */

const openPopover = (props: Record<string, unknown>) => {
  render(
    <ReqoreUIProvider>
      <ReqorePopover
        component={ReqoreButton}
        isReqoreComponent
        content='Runs the improvement against the last snapshot'
        openOnMount
        {...props}
      >
        Run
      </ReqorePopover>
    </ReqoreUIProvider>
  );

  return document.querySelector('.reqore-popover-content') as HTMLElement;
};

describe('the pointer and a popover surface', () => {
  it('falls through a hover tooltip', () => {
    const surface = openPopover({});

    expect(surface).toBeInTheDocument();
    expect(surface).toHaveStyle({ pointerEvents: 'none' });
    // The tooltip is still a tooltip: it says what it was given to say.
    expect(screen.getByText('Runs the improvement against the last snapshot')).toBeInTheDocument();
  });

  it('is taken by a popover held open on hover, which exists to be reached', () => {
    const surface = openPopover({ keepOpenOnHover: true });

    expect(surface).not.toHaveStyle({ pointerEvents: 'none' });
  });

  it('is taken by a popover opened by click', () => {
    const surface = openPopover({ handler: 'click' });

    expect(surface).not.toHaveStyle({ pointerEvents: 'none' });
  });

  it('is taken by a popover that stays open after a hover', () => {
    const surface = openPopover({ handler: 'hoverStay' });

    expect(surface).not.toHaveStyle({ pointerEvents: 'none' });
  });

  it('is taken by a popover opened by focus', () => {
    const surface = openPopover({ handler: 'focus' });

    expect(surface).not.toHaveStyle({ pointerEvents: 'none' });
  });

  it('is given back to a hover popover that asks for it', () => {
    const surface = openPopover({ interactive: true });

    expect(surface).not.toHaveStyle({ pointerEvents: 'none' });
  });

  it('is taken from any popover that asks to be transparent', () => {
    const surface = openPopover({ handler: 'click', interactive: false });

    expect(surface).toHaveStyle({ pointerEvents: 'none' });
  });

  it('reaches a tooltip declared the short way, through the tooltip prop', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreButton tooltip={{ content: 'Archive this improvement', openOnMount: true }}>
          Archive
        </ReqoreButton>
      </ReqoreUIProvider>
    );

    expect(document.querySelector('.reqore-popover-content')).toHaveStyle({
      pointerEvents: 'none',
    });
  });
});
