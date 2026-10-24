// Copyright 2026 Qore Technologies, s.r.o.
import { expect } from 'storybook/test';

/** What a story that warns on purpose is given: the hook that takes its warning, and the check that it came. */
export interface IExpectedWarning {
  /** A story's `beforeEach`: takes the warnings from here on until the story ends. */
  beforeEach: () => () => void;
  /** Checks the component gave the warning, once. */
  expectWarned: () => Promise<void>;
}

/**
 * A story that does on purpose what a component warns about (qorus#646): the warning is what it checks, not noise
 * on the console. From before the story renders, each console warning `matching` it is kept for `expectWarned` and
 * neither printed nor seen by the story run's warning gate (`reactWarningGate.ts`), which fails a story that warns;
 * any other warning goes on as before.
 */
export const expectedWarning = (matching: RegExp): IExpectedWarning => {
  const given: string[] = [];
  return {
    beforeEach: () => {
      given.length = 0;
      const warn = console.warn;
      console.warn = (...args: unknown[]) => {
        const [first] = args;
        if (typeof first === 'string' && matching.test(first)) {
          given.push(first);
          return;
        }
        warn.apply(console, args);
      };
      return () => {
        console.warn = warn;
      };
    },
    expectWarned: async () => {
      await expect(given).toHaveLength(1);
    },
  };
};
