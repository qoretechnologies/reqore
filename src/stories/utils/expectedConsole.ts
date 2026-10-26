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

/** The errors a story that shows what an error does expects. */
export interface IExpectedErrors {
  /**
   * The error the page reports as uncaught, by its message: what a component throws that a boundary catches, which
   * React, in development, reports to the window too.
   */
  uncaught?: RegExp;
  /** What is logged on the console (`console.error`), each once. */
  logged?: readonly RegExp[];
}

/** What a story that shows what an error does is given: the hook that takes its errors, and the check they came. */
export interface IExpectedError {
  /** A story's `beforeEach`: takes the errors from here on until the story ends. */
  beforeEach: () => () => void;
  /**
   * Checks the uncaught error was reported once and no other was, and each logged error was logged once.
   */
  expectErrored: () => Promise<void>;
  /**
   * The story's parameters for an `uncaught` error: Storybook's own check, which marks a story whose page reports
   * any error to the window as errored - cancelled or not - is left to `expectErrored`, which checks the one it
   * expects and that there is no other.
   */
  parameters: { test?: { dangerouslyIgnoreUnhandledErrors: boolean } };
}

/** What one of `matching` matches, for a console call it can read (`consoleCallText`); nothing for one it cannot. */
const matchingText = (args: unknown[], matching: (text: string) => boolean): string | undefined => {
  try {
    const text = consoleCallText(args);
    return matching(text) ? text : undefined;
  } catch {
    // a call that cannot be read as text is none of the expected ones
    return undefined;
  }
};

/** How many of `given` each of `matching` matches (a text counts for the first that matches it). */
const countsOf = (given: readonly string[], matching: readonly RegExp[]) =>
  matching.map(
    (pattern) =>
      given.filter((text) => matching.find((candidate) => candidate.test(text)) === pattern).length
  );

/**
 * A story that does on purpose what a component warns about (qorus#646): the warning is what it checks, not noise on
 * the console. Its `beforeEach` takes each console warning `matching` it, kept for the check and neither printed nor
 * seen by the story run's gate (`reactWarningGate.ts`); `expectWarned` checks it was given once.
 */
export const expectedWarning = (matching: RegExp): IExpectedWarning => {
  const given: string[] = [];
  return {
    beforeEach: () => {
      given.length = 0;
      const warn = console.warn;
      console.warn = (...args: unknown[]) => {
        const text = matchingText(args, (said) => matching.test(said));
        if (text === undefined) {
          warn.apply(console, args);
        } else {
          given.push(text);
        }
      };
      return () => {
        console.warn = warn;
      };
    },
    expectWarned: async () => {
      await expect(
        countsOf(given, [matching]),
        `the warning given once: ${JSON.stringify(given)}`
      ).toEqual([1]);
    },
  };
};

/** The story run's report of an uncaught error on the console: "Error: Uncaught Error: <its message>". */
const RUNNER_REPORT = /^Error: Uncaught (?:\w+: )?(.*)$/;

/**
 * A story that shows what an error does (qorus#646): the errors are what it checks, not noise on the console.
 *
 * Its `beforeEach` takes, until the story ends:
 * - the window's error event for the `uncaught` error, cancelled as a page that handles it cancels it, so the browser
 *   does not print it (React, in development, reports an error a boundary caught to the window as uncaught too; and
 *   seeing it cancelled, does not log it again);
 * - the story run's report of that event on the console (Vitest's, which a browser opened in Storybook does not
 *   make);
 * - each console error one of `logged` matches.
 *
 * Neither is printed nor seen by the story run's gate (`reactWarningGate.ts`), which fails a story that logs an error;
 * any other error goes on as before. `expectErrored` checks the uncaught error was reported once and each logged error
 * logged once.
 */
export const expectedError = ({ uncaught, logged = [] }: IExpectedErrors): IExpectedError => {
  const reported: string[] = [];
  const otherReports: string[] = [];
  const given: string[] = [];
  const isRunnerReport = (text: string) =>
    !!uncaught && uncaught.test(RUNNER_REPORT.exec(text)?.[1] ?? '\u0000');
  const onWindowError = (event: Event) => {
    const { error, message } = event as ErrorEvent;
    if (uncaught && error instanceof Error && uncaught.test(error.message)) {
      reported.push(error.message);
      event.preventDefault();
    } else {
      otherReports.push(
        error instanceof Error ? `${error.name}: ${error.message}` : String(message)
      );
    }
  };

  return {
    beforeEach: () => {
      reported.length = 0;
      otherReports.length = 0;
      given.length = 0;
      const error = console.error;
      console.error = (...args: unknown[]) => {
        const text = matchingText(
          args,
          (said) => isRunnerReport(said) || logged.some((pattern) => pattern.test(said))
        );
        if (text === undefined) {
          error.apply(console, args);
        } else if (!isRunnerReport(text)) {
          given.push(text);
        }
      };
      /* While a page has an error listener of its own, the story run logs an uncaught error rather than failing the
         story on it, and the gate fails the story on that log: an error the story does not expect fails it either
         way. */
      window.addEventListener('error', onWindowError);
      return () => {
        console.error = error;
        window.removeEventListener('error', onWindowError);
      };
    },
    expectErrored: async () => {
      await expect(
        [uncaught ? reported.length : 1, otherReports, ...countsOf(given, logged)],
        `the uncaught error reported once, no other, and each logged error logged once: ${JSON.stringify(
          { reported, otherReports, given }
        )}`
      ).toEqual([1, [], ...logged.map(() => 1)]);
    },
    parameters: uncaught ? { test: { dangerouslyIgnoreUnhandledErrors: true } } : {},
  };
};
