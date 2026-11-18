import { createContext, ReactNode, useContext, useMemo } from 'react';
import type { TReqoreSurface } from '../helpers/colors';

/**
 * The color the components inside are drawn on, as the browser draws it (opaque): what a component that paints a
 * background of its own (the layout, a panel, a message, a button) hands to what it holds, so that their text and
 * icons are picked against what is really under them - an intent's text inside a message, a badge on a button.
 * Undefined outside all of them: the theme's surface then (`getThemeSurface`).
 */
const SurfaceContext = createContext<TReqoreSurface | undefined>(undefined);

/** One key for a surface's colors: the same colors, in the same order, are the same key. */
const getSurfaceKey = (surface?: TReqoreSurface): string | undefined =>
  Array.isArray(surface) ? `[${surface.join('|')}]` : surface;

/**
 * Hands `color` (opaque; what this component is drawn in - each color of its gradient, when it has one) to the
 * components inside as their surface. Without a `color` (a component that paints nothing), they keep the surface
 * around it.
 *
 * The surface handed down stays the same value for as long as its colors do. A component that works its colors out
 * again on each render (an inline effect or content effect, a new list each time) would otherwise hand down a new
 * list with the same colors, and every component below that reads the surface would render again with it.
 */
export const ReqoreSurfaceProvider = ({
  color,
  children,
}: {
  color?: TReqoreSurface;
  children?: ReactNode;
}) => {
  const around = useContext(SurfaceContext);
  const surface = color ?? around;
  const key = getSurfaceKey(surface);
  // the first surface with these colors, for as long as they hold
  const value = useMemo(() => surface, [key]);

  return <SurfaceContext.Provider value={value}>{children}</SurfaceContext.Provider>;
};

/** The color this component is drawn on, when a component around it has said; undefined when none has. */
export const useReqoreSurface = (): TReqoreSurface | undefined => useContext(SurfaceContext);
