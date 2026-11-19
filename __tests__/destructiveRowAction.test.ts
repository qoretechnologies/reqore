// Copyright 2026 Qore Technologies, s.r.o.
import { describe, expect, test } from 'vitest';
// the library first, as an app loads it: the module alone meets its imports in the wrong order
import '../src';
import { isDestructiveRowAction, ownLineRowActionProps } from '../src/components/RowActionsMenu';

// A row's action says it destroys something apart from its look: a calm theme draws a delete
// as a red icon on a quiet button, with no danger intent, and must still be able to say so.
describe('a destructive row action', () => {
  test('is one marked destructive, whatever its intent', () => {
    expect(isDestructiveRowAction({ destructive: true })).toBe(true);
    expect(isDestructiveRowAction({ destructive: true, intent: 'info' })).toBe(true);
    expect(isDestructiveRowAction({ destructive: true }, false)).toBe(true);
  });

  test("is, on an entity row, one whose intent is danger; on a severity row the intent is the severity's", () => {
    expect(isDestructiveRowAction({ intent: 'danger' })).toBe(true);
    expect(isDestructiveRowAction({ intent: 'danger' }, false)).toBe(false);
    expect(isDestructiveRowAction({ intent: 'info' })).toBe(false);
    expect(isDestructiveRowAction(undefined)).toBe(false);
  });

  test('keeps its own width where the row\'s actions span it, and the others take the row', () => {
    expect(ownLineRowActionProps({ destructive: true }, true)).toEqual({
      fluid: false,
      wrap: true,
      style: { alignSelf: 'flex-start' },
    });
    expect(ownLineRowActionProps({}, true)).toEqual({ fluid: true, wrap: true });
    // where nothing spans, nothing is held
    expect(ownLineRowActionProps({ destructive: true }, false)).toEqual({ fluid: false, wrap: true });
  });
});
