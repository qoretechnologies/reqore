// Copyright 2026 Qore Technologies, s.r.o.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectedError, expectedWarning } from '../src/stories/utils/expectedConsole';

const original = { warn: console.warn, error: console.error };

afterEach(() => {
  vi.restoreAllMocks();
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

describe('the errors a story gives on purpose', () => {
  const thrown = () =>
    expectedError({
      uncaught: /^This is a test error$/,
      logged: [/^ReqoreErrorBoundary caught an error: Error: This is a test error/],
    });
  /**
   * The window's report of `error` as uncaught, as a browser dispatches it. That the story cancels it, so a browser
   * does not print it, is seen in a browser (the Error Boundary stories in Storybook print nothing): the unit
   * environment cancels every error event itself.
   */
  const reportUncaught = (error: Error) =>
    window.dispatchEvent(
      new ErrorEvent('error', { error, message: `Uncaught ${error}`, cancelable: true })
    );
  const logBoundary = () =>
    console.error(
      'ReqoreErrorBoundary caught an error:',
      new Error('This is a test error'),
      '\n    at ThrowsError'
    );

  it("are kept from the console, and so is the story run's report of the uncaught one; any other error is not", async () => {
    const printed = vi.fn();
    console.error = printed;
    const errors = thrown();
    const restore = errors.beforeEach();

    // the story run reports the uncaught error on the console, as Vitest does in a browser it runs
    console.error(new Error('Uncaught Error: This is a test error'));
    reportUncaught(new Error('This is a test error'));
    logBoundary();
    console.error('Request failed', 404);

    expect(printed.mock.calls).toEqual([['Request failed', 404]]);
    await errors.expectErrored();
    const stopListening = vi.spyOn(window, 'removeEventListener');
    restore();
    expect(console.error).toBe(printed);
    // the window is given back too
    expect(stopListening).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('pass without the story run reporting the uncaught error on the console, as in Storybook', async () => {
    const errors = thrown();
    const restore = errors.beforeEach();
    reportUncaught(new Error('This is a test error'));
    logBoundary();
    restore();
    await errors.expectErrored();
  });

  it('fail a story whose error was not reported, was reported twice, or was not logged', async () => {
    const errors = thrown();

    let restore = errors.beforeEach();
    logBoundary();
    restore();
    await expect(errors.expectErrored()).rejects.toThrow(/uncaught error reported once/);

    restore = errors.beforeEach();
    reportUncaught(new Error('This is a test error'));
    reportUncaught(new Error('This is a test error'));
    logBoundary();
    restore();
    await expect(errors.expectErrored()).rejects.toThrow();

    restore = errors.beforeEach();
    reportUncaught(new Error('This is a test error'));
    restore();
    await expect(errors.expectErrored()).rejects.toThrow();
  });

  it('fail a story that reports any other error as uncaught', async () => {
    const errors = thrown();
    const restore = errors.beforeEach();
    reportUncaught(new Error('This is a test error'));
    logBoundary();
    reportUncaught(new TypeError('something else'));
    restore();

    await expect(errors.expectErrored()).rejects.toThrow(/TypeError: something else/);
  });

  it("leave Storybook's own check to them only for an uncaught error they expect", () => {
    expect(thrown().parameters).toEqual({ test: { dangerouslyIgnoreUnhandledErrors: true } });
    expect(expectedError({ logged: [/^x/] }).parameters).toEqual({});
  });

  it('pass a call that cannot be read as text on, unread', () => {
    const printed = vi.fn();
    console.error = printed;
    const restore = thrown().beforeEach();
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
