/**
 * A popover and a drawer are drawn on the layout, not on what opened them.
 *
 * Both render through the portal, over the page, but in the React tree of what opened them, and so
 * took its surface (`useReqoreSurface`): a tag in a popover opened from a danger message picked its
 * shade against the message's red, not against the popover it is drawn on. They hand down the
 * layout's surface now; the popover's message and the drawer's panel draw their fill on it and hand
 * that fill to what they hold.
 */
import { render, screen } from '@testing-library/react';
import { cloneDeep } from 'lodash';
import { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import {
  ReqoreContent,
  ReqoreDrawer,
  ReqoreLayoutContent,
  ReqorePopover,
  ReqoreSurfaceProvider,
  ReqoreUIProvider,
  useReqoreSurface,
} from '../src';
import { DEFAULT_THEME } from '../src/constants/theme';
import { buildTheme, getThemeSurface } from '../src/helpers/colors';

const RED = '#ff0000';

/** What a component inside reads as the surface it is drawn on. */
const Surface = () => (
  <span data-testid='surface'>{JSON.stringify(useReqoreSurface() ?? 'none')}</span>
);

const surface = () => JSON.parse(screen.getByTestId('surface').textContent ?? '"none"');

/** The layout's surface: the default theme's, where nothing around says otherwise. */
const LAYOUT_SURFACE = getThemeSurface(buildTheme(cloneDeep(DEFAULT_THEME)));

/** `children` opened in the app, inside a surface of `color` when one is given. */
const show = (children: ReactNode, color?: string) =>
  render(
    <ReqoreUIProvider options={{ animations: { dialogs: false, popovers: false } }}>
      <ReqoreLayoutContent>
        <ReqoreContent>
          {color ? (
            <ReqoreSurfaceProvider color={color as `#${string}`}>{children}</ReqoreSurfaceProvider>
          ) : (
            children
          )}
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

/** The surface what `children` holds reads, opened inside a red surface and outside any. */
const surfacesOf = (children: ReactNode) => {
  const inRed = show(children, RED);
  const opened = surface();
  inRed.unmount();

  show(children);

  return { inRed: opened, onThePage: surface() };
};

describe('what a popover holds', () => {
  it("is drawn on the popover's fill, wherever it was opened from", () => {
    const { inRed, onThePage } = surfacesOf(
      <ReqorePopover component='span' content={<Surface />} openOnMount handler='click'>
        Trigger
      </ReqorePopover>
    );

    expect(JSON.stringify(inRed)).not.toContain(RED);
    expect(inRed).toEqual(onThePage);
  });

  it("is drawn on the layout's surface when the popover draws no fill (noWrapper)", () => {
    show(
      <ReqorePopover component='span' content={<Surface />} openOnMount noWrapper handler='click'>
        Trigger
      </ReqorePopover>,
      RED
    );

    expect(surface()).toBe(LAYOUT_SURFACE);
  });

  it("is drawn on the layout's surface under a transparent message", () => {
    const { inRed, onThePage } = surfacesOf(
      <ReqorePopover component='span' content={<Surface />} openOnMount transparent handler='click'>
        Trigger
      </ReqorePopover>
    );

    expect(JSON.stringify(inRed)).not.toContain(RED);
    expect(inRed).toEqual(onThePage);
  });
});

describe('what a drawer holds', () => {
  it("is drawn on the drawer's fill, wherever it was opened from", () => {
    const { inRed, onThePage } = surfacesOf(
      <ReqoreDrawer isOpen label='Drawer'>
        <Surface />
      </ReqoreDrawer>
    );

    expect(JSON.stringify(inRed)).not.toContain(RED);
    expect(inRed).toEqual(onThePage);
  });

  it("is drawn on the drawer's fill over the layout when the drawer is see-through", () => {
    const { inRed, onThePage } = surfacesOf(
      <ReqoreDrawer isOpen label='Drawer' opacity={0.5}>
        <Surface />
      </ReqoreDrawer>
    );

    expect(JSON.stringify(inRed)).not.toContain(RED);
    expect(inRed).toEqual(onThePage);
  });
});
