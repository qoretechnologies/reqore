// Copyright 2026 Qore Technologies, s.r.o.
import type { ReactNode } from 'react';

/**
 * Whether an action's `label` draws anything: not missing, empty or blank text, or a boolean. A module of
 * its own, importing nothing, so the table's helpers can ask it without loading the menu's components.
 */
export const hasRowActionLabel = (label: ReactNode): boolean =>
  label !== undefined &&
  label !== null &&
  typeof label !== 'boolean' &&
  !(typeof label === 'string' && !label.trim());
