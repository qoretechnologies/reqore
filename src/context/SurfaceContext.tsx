import { createContext, ReactNode, useContext } from 'react';
import type { TReqoreSurface } from '../helpers/colors';

/**
 * The color the components inside are drawn on, as the browser draws it (opaque): what a component that paints a
 * background of its own (the layout, a panel, a message, a button) hands to what it holds, so that their text and
 * icons are picked against what is really under them - an intent's text inside a message, a badge on a button.
 * Undefined outside all of them: the theme's surface then (`getThemeSurface`).
 */
const SurfaceContext = createContext<TReqoreSurface | undefined>(undefined);

/**
 * Hands `color` (opaque; what this component is drawn in - each color of its gradient, when it has one) to the
 * components inside as their surface. Without a `color` (a component that paints nothing), they keep the surface
 * around it.
 */
export const ReqoreSurfaceProvider = ({
  color,
  children,
}: {
  color?: TReqoreSurface;
  children?: ReactNode;
}) => {
  const around = useContext(SurfaceContext);

  return <SurfaceContext.Provider value={color ?? around}>{children}</SurfaceContext.Provider>;
};

/** The color this component is drawn on, when a component around it has said; undefined when none has. */
export const useReqoreSurface = (): TReqoreSurface | undefined => useContext(SurfaceContext);
