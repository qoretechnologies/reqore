/**
 * A drawer that becomes a sheet after it has entered takes the sheet's offsets.
 *
 * A `floating` drawer sits 10px off its edge. That offset used to be animated by the enter spring,
 * so it was fixed at the values of the render the drawer entered in: a floating side panel that
 * became a phone sheet - the window narrowed, or the media query answered a render late - kept
 * `right: 10px`, and the sheet ended 10px short of the screen's edge. The offset is the box's own
 * style now, worked out on every render from the edge the drawer is on.
 *
 * jsdom has no `matchMedia`, so the breakpoints are mocked: every query answers `narrow`.
 */
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

let narrow = false;

vi.mock('../src/hooks/useReqoreMedia', () => ({
  CAN_QUERY_MEDIA: true,
  useReqoreMedia: () => narrow,
}));

const { ReqoreContent, ReqoreDrawer, ReqoreLayoutContent, ReqoreUIProvider } = await import(
  '../src'
);

const show = () => (
  <ReqoreUIProvider options={{ animations: { dialogs: false } }}>
    <ReqoreLayoutContent>
      <ReqoreContent>
        <ReqoreDrawer isOpen floating responsiveLayout position='right' size='720px' label='Drawer'>
          Content
        </ReqoreDrawer>
      </ReqoreContent>
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);

const box = () => document.querySelector('.reqore-drawer-resizable') as HTMLElement;

describe('a floating drawer with `responsiveLayout`', () => {
  afterEach(() => {
    narrow = false;
  });

  it('is a floating side panel on a wide screen', () => {
    render(show());

    expect(box().classList.contains('reqore-drawer-sheet')).toBe(false);
    expect(box().style.right).toBe('10px');
    expect(box().style.top).toBe('10px');
  });

  it('becomes a sheet flush with the screen when the screen narrows after it entered', () => {
    const { rerender } = render(show());

    expect(box().style.right).toBe('10px');

    narrow = true;
    rerender(show());

    expect(box().classList.contains('reqore-drawer-sheet')).toBe(true);
    expect(box().style.left).toBe('0px');
    expect(box().style.right).toBe('0px');
    expect(box().style.bottom).toBe('0px');
  });

  it('is a sheet flush with the screen when it enters on a narrow one', () => {
    narrow = true;
    render(show());

    expect(box().classList.contains('reqore-drawer-sheet')).toBe(true);
    expect(box().style.left).toBe('0px');
    expect(box().style.right).toBe('0px');
  });
});
