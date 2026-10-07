/**
 * `responsiveLayout` on ReqoreDrawer.
 *
 * jsdom has no `matchMedia`, so every breakpoint is fixed `false` here
 * (`CAN_QUERY_MEDIA` in `src/hooks/useReqoreMedia.ts`) and a rendered sheet
 * cannot be produced. The DECISION is a pure function, which is what this
 * file proves; the rendered geometry is proven by the `Dialogs/Drawer`
 * `ResponsiveSheet*` stories in a real browser at 380px and 800px. What IS
 * asserted on a render here is the contract the wide-screen branch makes: no
 * sheet class, and the caller's geometry props untouched.
 */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  DRAWER_RESPONSIVE_LAYOUT_DEFAULTS,
  DRAWER_SHEET_BREAKPOINT,
  drawerSheetBreakpointPx,
  ReqoreContent,
  ReqoreDrawer,
  ReqoreLayoutContent,
  ReqoreModal,
  ReqoreUIProvider,
  resolveDrawerResponsiveLayout,
} from '../src';

// The four bands a viewport can fall in, as the resolver sees them.
const wide = { isMobile: false, isMobileOrTablet: false, belowSheetBreakpoint: false };
// 481–900px: a small desktop window — below the sheet breakpoint, above the provider's.
const narrowDesktop = { isMobile: false, isMobileOrTablet: false, belowSheetBreakpoint: true };
const tablet = { isMobile: false, isMobileOrTablet: true, belowSheetBreakpoint: true };
const phone = { isMobile: true, isMobileOrTablet: true, belowSheetBreakpoint: true };

const SHEET = { active: true, position: 'bottom', size: '100%', maxSize: '90vh' };

describe('resolveDrawerResponsiveLayout', () => {
  it('is inactive when the prop is absent or false, on every viewport', () => {
    expect(resolveDrawerResponsiveLayout(undefined, phone)).toEqual({ active: false });
    expect(resolveDrawerResponsiveLayout(false, phone)).toEqual({ active: false });
    expect(resolveDrawerResponsiveLayout(true, wide)).toEqual({ active: false });
  });

  it('`true` is the IDE behaviour: a bottom sheet, full width, 90% high, at 900px', () => {
    expect(DRAWER_SHEET_BREAKPOINT).toBe(900);
    expect(DRAWER_RESPONSIVE_LAYOUT_DEFAULTS).toEqual({
      below: 900,
      position: 'bottom',
      size: '100%',
      maxSize: '90vh',
    });
    expect(resolveDrawerResponsiveLayout(true, phone)).toEqual(SHEET);
    expect(resolveDrawerResponsiveLayout(true, tablet)).toEqual(SHEET);
    // The band the provider breakpoints cannot express: a small desktop window.
    expect(resolveDrawerResponsiveLayout(true, narrowDesktop)).toEqual(SHEET);
  });

  it('the default reads only the sheet-breakpoint flag, never the provider flags', () => {
    // Cannot happen in a browser (a phone is below 900px), but it pins down
    // which flag the default consults.
    expect(
      resolveDrawerResponsiveLayout(true, {
        isMobile: true,
        isMobileOrTablet: true,
        belowSheetBreakpoint: false,
      })
    ).toEqual({ active: false });
  });

  it("`below: 'mobile'` narrows the switch to the provider's phone breakpoint", () => {
    expect(resolveDrawerResponsiveLayout({ below: 'mobile' }, phone)).toEqual(SHEET);
    expect(resolveDrawerResponsiveLayout({ below: 'mobile' }, tablet)).toEqual({ active: false });
    expect(resolveDrawerResponsiveLayout({ below: 'mobile' }, narrowDesktop)).toEqual({
      active: false,
    });
  });

  it("`below: 'tablet'` widens the switch to the provider's tablet breakpoint", () => {
    expect(resolveDrawerResponsiveLayout({ below: 'tablet' }, tablet)).toEqual(SHEET);
    expect(resolveDrawerResponsiveLayout({ below: 'tablet' }, wide)).toEqual({ active: false });
  });

  it('a numeric `below` is a px width, answered by the same flag as the default', () => {
    expect(resolveDrawerResponsiveLayout({ below: 700 }, narrowDesktop)).toEqual(SHEET);
    expect(resolveDrawerResponsiveLayout({ below: 700 }, wide)).toEqual({ active: false });
  });

  it('honours a caller-chosen edge, size and cap, filling in what it did not say', () => {
    expect(resolveDrawerResponsiveLayout({ position: 'top', size: '80%' }, phone)).toEqual({
      active: true,
      position: 'top',
      size: '80%',
      maxSize: '90vh',
    });
    expect(resolveDrawerResponsiveLayout({ maxSize: '100%' }, phone)).toEqual({
      ...SHEET,
      maxSize: '100%',
    });
    expect(resolveDrawerResponsiveLayout({ position: 'left' }, phone)).toEqual({
      ...SHEET,
      position: 'left',
    });
  });

  it('never turns a modal into a sheet', () => {
    expect(resolveDrawerResponsiveLayout(true, phone, true)).toEqual({ active: false });
    expect(resolveDrawerResponsiveLayout({ below: 'tablet' }, phone, true)).toEqual({
      active: false,
    });
  });
});

describe('drawerSheetBreakpointPx', () => {
  it('is the numeric `below`, and the default for everything else', () => {
    expect(drawerSheetBreakpointPx(undefined)).toBe(900);
    expect(drawerSheetBreakpointPx(false)).toBe(900);
    expect(drawerSheetBreakpointPx(true)).toBe(900);
    expect(drawerSheetBreakpointPx({ below: 'tablet' })).toBe(900);
    expect(drawerSheetBreakpointPx({ position: 'top' })).toBe(900);
    expect(drawerSheetBreakpointPx({ below: 700 })).toBe(700);
  });
});

const renderInProvider = (ui: React.ReactElement) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{ui}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

describe('ReqoreDrawer responsiveLayout on a wide screen', () => {
  it('renders the caller’s edge panel unchanged and without the sheet class', () => {
    renderInProvider(
      <ReqoreDrawer isOpen responsiveLayout size='720px' position='right' label='Wide'>
        content
      </ReqoreDrawer>
    );

    const box = document.querySelector('.reqore-drawer-resizable') as HTMLElement;
    expect(box).toBeTruthy();
    expect(box.classList.contains('reqore-drawer-sheet')).toBe(false);
    // The caller's own size still drives the box: `re-resizable` writes it inline.
    expect(box.style.width).toBe('720px');
  });

  it('a modal ignores the prop entirely', () => {
    renderInProvider(
      <ReqoreModal isOpen responsiveLayout label='Modal'>
        content
      </ReqoreModal>
    );

    const box = document.querySelector('.reqore-drawer-resizable') as HTMLElement;
    expect(box).toBeTruthy();
    expect(box.classList.contains('reqore-drawer-sheet')).toBe(false);
  });
});
