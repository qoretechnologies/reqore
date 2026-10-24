// Copyright 2026 Qore Technologies, s.r.o.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectedWarning } from '../src/stories/utils/expectedWarning';

describe('a warning a story gives on purpose', () => {
  const original = console.warn;

  afterEach(() => {
    console.warn = original;
  });

  it('is kept from the console, any other warning is not, and the console is given back', async () => {
    const printed = vi.fn();
    console.warn = printed;
    const warning = expectedWarning(/^\[ReqoreTable\] `rowHeight`/);
    const restore = warning.beforeEach();

    console.warn('[ReqoreTable] `rowHeight` has no effect on a table that renders every row');
    console.warn('Something else', 1);

    expect(printed.mock.calls).toEqual([['Something else', 1]]);
    await warning.expectWarned();
    restore();
    expect(console.warn).toBe(printed);
  });

  it('fails a story that never gave it, or gave it twice', async () => {
    const warning = expectedWarning(/^expected/);
    warning.beforeEach()();
    await expect(warning.expectWarned()).rejects.toThrow();

    const restore = warning.beforeEach();
    console.warn('expected');
    console.warn('expected');
    restore();
    await expect(warning.expectWarned()).rejects.toThrow();
  });

  it('starts again with each story', async () => {
    const warning = expectedWarning(/^expected/);
    const first = warning.beforeEach();
    console.warn('expected');
    first();
    const second = warning.beforeEach();
    console.warn('expected');
    second();
    await warning.expectWarned();
  });
});
