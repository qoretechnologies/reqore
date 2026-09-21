import { ReactNode, ReactPortal } from 'react';
import { createPortal } from 'react-dom';

export const REQORE_PORTAL_ID = 'reqore-portal';

/**
 * Where Reqore's floating UI (modals, drawers, popovers, floating actions)
 * mounts.
 *
 * - On the server there is no `document`, so there is no target and callers
 *   render nothing. That is the correct output: nothing floating is open in
 *   the initial HTML, and the server renderer does not support portals.
 * - In the browser the provider's portal node may not have been committed yet
 *   on the very first render — the provider no longer withholds its children
 *   until it has, because doing so is what emptied the server HTML. For that
 *   one render fall back to `document.body`; the provider re-renders once the
 *   node commits and React re-parents the portal.
 */
export const getPortalTarget = (customPortalId?: string): Element | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.querySelector(customPortalId || `#${REQORE_PORTAL_ID}`) ?? document.body;
};

export const renderInPortal = (
  node: ReactNode,
  customPortalId?: string
): ReactPortal | null => {
  const target = getPortalTarget(customPortalId);

  return target ? createPortal(node, target) : null;
};
