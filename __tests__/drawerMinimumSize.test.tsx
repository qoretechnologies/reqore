import { render } from '@testing-library/react';
import React from 'react';
import {
  ReqoreContent,
  ReqoreDrawer,
  ReqoreLayoutContent,
  ReqoreModal,
  ReqoreUIProvider,
} from '../src';
import {
  DRAWER_MIN_SIZE,
  MODAL_MIN_HEIGHT,
  MODAL_MIN_WIDTH,
} from '../src/components/Drawer';

/**
 * A modal resizes from every edge and corner, and the floor on both axes was
 * 40px — so any dialog could be dragged into a sliver that still held its
 * search box, its list and its close button, stacked and unreadable. Reported
 * against reqraft's "Select from items" picker at roughly 45px wide.
 *
 * Two separate defects, and both are covered here: the floor itself, and the
 * fact that `minSize` — the documented way to raise it — reached edge drawers
 * only and was dead on every modal.
 */
const inLayout = (node: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{node}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

/** The element `re-resizable` sizes and drags — the floor lives on its style. */
const resizable = (): HTMLElement =>
  document.querySelector('.reqore-drawer-resizable') as HTMLElement;

const floor = () => {
  const el = resizable();
  return { width: el.style.minWidth, height: el.style.minHeight };
};

describe('the size a modal cannot be dragged below', () => {
  it('keeps its own chrome on screen', () => {
    inLayout(
      <ReqoreModal isOpen label='Select from items' onClose={() => undefined}>
        Contents
      </ReqoreModal>
    );

    // The measured chrome floor, reaching the DOM as a real CSS length. A
    // length re-resizable cannot parse is silently dropped, which is how a
    // floor becomes no floor at all — so the assertion is on the px value, not
    // on the props.
    expect(floor()).toEqual({ width: MODAL_MIN_WIDTH, height: MODAL_MIN_HEIGHT });
    expect(MODAL_MIN_WIDTH).toBe('200px');
    expect(MODAL_MIN_HEIGHT).toBe('80px');
  });

  it('lets a modal that knows its content raise the floor on both axes', () => {
    // What reqraft's picker does: it knows its list column is 300px and that a
    // row plus the search field need room, so it says so.
    inLayout(
      <ReqoreModal isOpen label='Select from items' minSize='320px' onClose={() => undefined}>
        Contents
      </ReqoreModal>
    );

    expect(floor()).toEqual({ width: '320px', height: '320px' });
  });

  it('lets it raise each axis on its own', () => {
    inLayout(
      <ReqoreModal
        isOpen
        label='Select from items'
        minWidth='320px'
        minHeight='160px'
        onClose={() => undefined}
      >
        Contents
      </ReqoreModal>
    );

    expect(floor()).toEqual({ width: '320px', height: '160px' });
  });

  it('takes the per-axis floor over the shared one', () => {
    inLayout(
      <ReqoreModal
        isOpen
        label='Select from items'
        minSize='320px'
        minHeight='160px'
        onClose={() => undefined}
      >
        Contents
      </ReqoreModal>
    );

    expect(floor()).toEqual({ width: '320px', height: '160px' });
  });

  it('is still under every modal it is applied to, so nothing is resized by it', () => {
    // The floor may not push a modal about: the narrowest modal across reqore,
    // reqraft and qorus-ide is 480px, and every one of them is taller than its
    // own 55px header.
    inLayout(
      <ReqoreModal isOpen label='Narrow' width='480px' onClose={() => undefined}>
        Contents
      </ReqoreModal>
    );

    expect(resizable().style.width).toBe('480px');
    expect(parseInt(MODAL_MIN_WIDTH, 10)).toBeLessThan(480);
  });
});

describe('an edge drawer keeps the floor it had', () => {
  it('resizes on one axis and floors that one', () => {
    inLayout(
      <ReqoreDrawer isOpen position='right' onClose={() => undefined}>
        Contents
      </ReqoreDrawer>
    );

    // A side drawer is sized across, not down: only the axis it drags has a
    // floor, and it is the long-standing default.
    expect(floor()).toEqual({ width: DRAWER_MIN_SIZE, height: '' });
    expect(DRAWER_MIN_SIZE).toBe('150px');
  });

  it('still takes minSize on the axis it drags', () => {
    inLayout(
      <ReqoreDrawer isOpen position='bottom' minSize='220px' onClose={() => undefined}>
        Contents
      </ReqoreDrawer>
    );

    expect(floor()).toEqual({ width: '', height: '220px' });
  });
});
