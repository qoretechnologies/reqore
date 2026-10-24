// Copyright 2026 Qore Technologies, s.r.o.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectedError, expectedWarning } from '../src/stories/utils/expectedConsole';

const original = { warn: console.warn, error: console.error };

afterEach(() => {
  console.warn = original.warn;
  console.error = original.error;
});

describe('a warning a story gives on purpose', () => {
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

describe('the errors a story logs on purpose', () => {
  const thrown = () =>
    expectedError(
      /^Error: Uncaught Error: This is a test error$/,
      /^The above error occurred in the <ThrowsError> component:/,
      /^ReqoreErrorBoundary caught an error: Error: This is a test error/
    );
  const logAll = () => {
    console.error(new Error('Uncaught Error: This is a test error'));
    console.error('The above error occurred in the <ThrowsError> component:\n\n    at ThrowsError');
    console.error(
      'ReqoreErrorBoundary caught an error:',
      new Error('This is a test error'),
      '\n    at ThrowsError'
    );
  };

  it('are kept from the console, read as they say (an error by its name and message), and any other is not', async () => {
    const printed = vi.fn();
    console.error = printed;
    const errors = thrown();
    const restore = errors.beforeEach();

    logAll();
    console.error('Request failed', 404);

    expect(printed.mock.calls).toEqual([['Request failed', 404]]);
    await errors.expectErrored();
    restore();
    expect(console.error).toBe(printed);
  });

  it('fail a story that logged one of them twice, or not at all', async () => {
    const errors = thrown();
    const restore = errors.beforeEach();
    logAll();
    console.error(new Error('Uncaught Error: This is a test error'));
    restore();
    await expect(errors.expectErrored()).rejects.toThrow(/each expected error given once/);

    const again = errors.beforeEach();
    console.error(new Error('Uncaught Error: This is a test error'));
    again();
    await expect(errors.expectErrored()).rejects.toThrow();
  });

  it('pass a call that cannot be read as text on, unread', async () => {
    const printed = vi.fn();
    console.error = printed;
    const errors = thrown();
    const restore = errors.beforeEach();
    const unreadable = {
      toString: () => {
        throw new Error('no text');
      },
    };

    console.error('This is a test error', unreadable);
    restore();

    expect(printed.mock.calls).toEqual([['This is a test error', unreadable]]);
  });
});
