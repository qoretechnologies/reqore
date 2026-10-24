// Copyright 2026 Qore Technologies, s.r.o.
import { expect } from 'storybook/test';
import { consoleCallText } from './reactWarningGate';

/** What a story that warns on purpose is given: the hook that takes its warning, and the check that it came. */
export interface IExpectedWarning {
  /** A story's `beforeEach`: takes the warning from here on until the story ends. */
  beforeEach: () => () => void;
  /** Checks the component gave the warning, once. */
  expectWarned: () => Promise<void>;
}

/** What a story that logs errors on purpose is given: the hook that takes them, and the check that they came. */
export interface IExpectedError {
  /** A story's `beforeEach`: takes the errors from here on until the story ends. */
  beforeEach: () => () => void;
  /** Checks each error was logged, once. */
  expectErrored: () => Promise<void>;
}

/**
 * Takes each `method` call that says (`consoleCallText`) what one of `matching` matches, from `beforeEach` until the
 * story ends: kept for the check, and neither printed nor seen by the story run's gate (`reactWarningGate.ts`), which
 * fails a story that warns or logs an error. Any other call goes on as before.
 */
const expectedConsoleCalls = (method: 'warn' | 'error', matching: readonly RegExp[]) => {
  const given: string[] = [];
  return {
    beforeEach: () => {
      given.length = 0;
      const original = console[method];
      console[method] = (...args: unknown[]) => {
        let text: string | undefined;
        try {
          text = consoleCallText(args);
        } catch {
          // a call that cannot be read as text is none of the expected ones
        }
        if (text !== undefined && matching.some((pattern) => pattern.test(text as string))) {
          given.push(text);
          return;
        }
        original.apply(console, args);
      };
      return () => {
        console[method] = original;
      };
    },
    /** Each of `matching` was given once (a call counts for the first that matches it). */
    expectGiven: async () => {
      const counts = matching.map(
        (pattern) =>
          given.filter((text) => matching.find((candidate) => candidate.test(text)) === pattern)
            .length
      );
      await expect(counts, `each expected ${method} given once: ${JSON.stringify(given)}`).toEqual(
        matching.map(() => 1)
      );
    },
  };
};

/**
 * A story that does on purpose what a component warns about (qorus#646): the warning is what it checks, not noise on
 * the console. Its `beforeEach` takes each console warning `matching` it; `expectWarned` checks it was given once.
 */
export const expectedWarning = (matching: RegExp): IExpectedWarning => {
  const calls = expectedConsoleCalls('warn', [matching]);
  return { beforeEach: calls.beforeEach, expectWarned: calls.expectGiven };
};

/**
 * A story that shows what an error does (qorus#646): the errors it logs are what it checks, not noise on the console.
 * Its `beforeEach` takes each console error that one of `matching` matches; `expectErrored` checks each was logged
 * once.
 */
export const expectedError = (...matching: RegExp[]): IExpectedError => {
  const calls = expectedConsoleCalls('error', matching);
  return { beforeEach: calls.beforeEach, expectErrored: calls.expectGiven };
};
