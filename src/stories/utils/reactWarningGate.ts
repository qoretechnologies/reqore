// Copyright 2026 Qore Technologies, s.r.o.

/**
 * No story makes React, or anything else, warn (qorus#646).
 *
 * React's development build says what is wrong with a page as a warning on the console and goes on, so a story whose
 * page is wrong passed as long as it looked right: a component that spreads props it does not take onto an element
 * (a control group's `fluid`, `spaceBetween`) makes React warn in every page that uses it, and only the IDE's own
 * warning guard caught one (in reqraft). Each warning now fails the story it was given in, named by its rule
 * ({@link REACT_WARNING_RULES}) with what to do, as the IDE's story run does (qorus-ide 8d847360e), and as this
 * story run already fails a ResizeObserver loop.
 *
 * React warns of some things once in a page (a kind of nesting, a deprecated API), and each story file is a page of
 * its own, so the first story of a file to cause one fails. A warning given before a story starts - as the story
 * file loads, or as the story before it unmounts - fails the next story, saying so; one given after a file's last
 * story fails the file.
 *
 * Any other warning on the console fails a story the same way ({@link CONSOLE_WARNING_RULE}): a library saying it was
 * given a state or a value it cannot use as given (a field that turns from uncontrolled to controlled, a control given
 * a value of another type), styled-components saying a component makes a new class for every value it is drawn with,
 * or a Reqore component saying a prop has no effect. Each was printed in the middle of the run and passed. An error on
 * the console is not a warning: a story that shows what an error does logs it.
 */

/** A kind of React warning: what it means for the page, and what to do about it. */
export interface IReactWarningRule {
  /** The warning, as the failure names it. */
  name: string;
  /** Whether React's message (its format, before the values are put in) is of this kind. */
  matches: (format: string) => boolean;
  /** What a story that gets it renders or does. */
  says: string;
  /** What to change. */
  advice: string;
}

const matching =
  (...patterns: RegExp[]) =>
  (format: string) =>
    patterns.some((pattern) => pattern.test(format));

/**
 * Every kind of React warning a story fails on, the first that matches naming it; React prefixes each of its warnings
 * with "Warning: ", and one no rule names is still a failure ("a React warning").
 */
export const REACT_WARNING_RULES: readonly IReactWarningRule[] = [
  {
    name: "React's validateDOMNesting",
    matches: matching(/validateDOMNesting/),
    says: 'The story renders markup a browser does not build as written',
    advice: 'put the inner element where its parent may hold it, or make it one that can be there.',
  },
  {
    name: "React's deprecation warning",
    matches: matching(
      /\bdeprecated\b/,
      /will be removed/,
      /no longer supported/,
      /has been renamed/,
      /\blegacy (context|childContextTypes|contextTypes)\b/i
    ),
    says: 'The story uses a React API that React deprecates and a later React removes',
    advice: 'use what React names in its place.',
  },
  {
    name: "React's act warning",
    matches: matching(
      /not wrapped in act\(/,
      /\bact\(\.\.\.\) without await\b/,
      /inside an `act` scope/
    ),
    says: 'A component updated outside the step that caused it',
    advice:
      'in a play function, wait for what the update shows before the next step; in a component, update from the ' +
      'event or effect that causes it.',
  },
  {
    name: "React's update-while-rendering warning",
    matches: matching(
      /Cannot update a component .* while rendering a different component/,
      /Cannot update during an existing state transition/
    ),
    says: "A component changes another component's state while it renders",
    advice: 'make the change in the event or effect that causes it.',
  },
  {
    name: "React's unknown DOM property warning",
    matches: matching(
      /React does not recognize the `%s` prop on a DOM element/,
      /Unknown event handler property/,
      /for a non-boolean attribute/,
      /Invalid DOM property/,
      /Invalid attribute name/,
      /Invalid value for prop/
    ),
    says: 'A component gives a DOM element a property it does not take',
    advice:
      "keep the component's own props off the element (take them out before spreading the rest, or name them " +
      '`$prop` for styled-components).',
  },
  {
    name: "React's NaN attribute warning",
    matches: matching(/Received NaN for the/),
    says: 'A component gives an attribute NaN',
    advice: 'give it a number, or leave the attribute out.',
  },
  {
    name: "React's key warning",
    matches: matching(
      /should have a unique "key" prop/,
      /Encountered two children with the same key/
    ),
    says: "A list's items are not told apart",
    advice: 'give each a key that is unique and stable among its siblings.',
  },
  {
    name: 'a React warning',
    matches: () => true,
    says: 'React warned of what the story renders or does',
    advice: 'fix what it names.',
  },
];

/** How many frames that name reqore's own source are kept: the component that drew it, and its callers. */
const SOURCE_FRAMES = 4;

/** The frames of a stack that name reqore's own source, shortened to the path. */
const sourceFrames = (lines: readonly string[]): string[] =>
  lines
    .map((frame) => frame.trim())
    .filter((frame) => /\/(src|\.storybook)\//.test(frame) && !frame.includes('/node_modules/'))
    .filter(
      (frame) =>
        !/\/src\/stories\/(utils\/)?reactWarningGate\.ts|\/\.storybook\/reactWarnings\.ts/.test(
          frame
        )
    )
    .slice(0, SOURCE_FRAMES)
    .map((frame) => frame.replace(/https?:\/\/[^/\s]+\//, ''));

/** A warning React gave, with the rule it falls under. */
export interface IReactWarning {
  rule: IReactWarningRule;
  /** React's message with its values put in, and the first frames that name reqore's source. */
  text: string;
}

/**
 * The React warning in a `console.error` or `console.warn` call, under its rule, as React prints it, with the first
 * frames of its component stack that name reqore's source - or of `callStack`, the stack of the call itself, when
 * the component stack names none (a warning given as a module loads has no component stack); nothing for a call that
 * is not React's warning.
 */
export const reactWarning = (
  args: readonly unknown[],
  callStack = ''
): IReactWarning | undefined => {
  const [format, ...values] = args;
  if (typeof format !== 'string' || !format.startsWith('Warning: ')) {
    return undefined;
  }
  const rule = REACT_WARNING_RULES.find((candidate) => candidate.matches(format));
  if (!rule) {
    return undefined;
  }
  const rest = values.map((value) => String(value));
  const message = format.replace(/%s/g, () => rest.shift() ?? '');
  const [text, ...more] = [message, ...rest].join(' ').split('\n');
  // which component's render React means, when it says ("Check the render method of `MapperCreator`.")
  const where = more.map((line) => line.trim()).filter((line) => /^Check the /.test(line));
  const componentFrames = sourceFrames(more);
  const source = componentFrames.length ? componentFrames : sourceFrames(callStack.split('\n'));
  return { rule, text: [[text.trim(), ...where].join(' '), ...source].join('\n    ') };
};

/**
 * Every other warning on the console (`console.warn`, not React's): what it means for the page, and what to do about
 * it.
 */
export const CONSOLE_WARNING_RULE: IReactWarningRule = {
  name: 'a console warning',
  matches: () => true,
  says: 'Something the story renders or does warned on the console',
  advice: 'give what warned what it asks for, or stop doing what it says has no effect.',
};

/**
 * A `console.warn` call that is not React's warning, under {@link CONSOLE_WARNING_RULE}: its first line, with the
 * values its format names put in, and the first frames of `callStack` that name reqore's source.
 */
export const consoleWarning = (args: readonly unknown[], callStack = ''): IReactWarning => {
  const [first, ...values] = args;
  const rest = values.map((value) => String(value));
  const message =
    typeof first === 'string'
      ? first.replace(/%[sdifoOc]/g, () => rest.shift() ?? '')
      : String(first);
  const text = [message, ...rest].join(' ').trim().split('\n')[0].trim();
  return {
    rule: CONSOLE_WARNING_RULE,
    text: [text, ...sourceFrames(callStack.split('\n'))].join('\n    '),
  };
};

/** What a watch on a console gives: the React warnings since it was last asked, and the console as it was. */
export interface IReactWarningWatch {
  take: () => IReactWarning[];
  restore: () => void;
}

/**
 * Keeps every React warning the console is given from here on, through `console.error` and `console.warn`, and every
 * other `console.warn` ({@link consoleWarning}). The console still prints it, and everything else, as before; a call
 * it cannot read is passed on unread.
 */
export const watchReactWarnings = (
  target: Pick<Console, 'error' | 'warn'> = console
): IReactWarningWatch => {
  const originals = { error: target.error, warn: target.warn };
  const warnings: IReactWarning[] = [];
  const watched =
    (original: (...args: unknown[]) => void, warns: boolean) =>
    (...args: unknown[]) => {
      try {
        const stack = new Error().stack ?? '';
        const warning =
          reactWarning(args, stack) ?? (warns ? consoleWarning(args, stack) : undefined);
        if (warning) {
          warnings.push(warning);
        }
      } catch {
        // an argument that cannot be read as text is not React's warning
      }
      original.apply(target, args);
    };
  target.error = watched(originals.error, false);
  target.warn = watched(originals.warn, true);
  return {
    take: () => warnings.splice(0),
    restore: () => {
      target.error = originals.error;
      target.warn = originals.warn;
    },
  };
};

/** When a warning was given, as the failure says it: while the story ran, or before or after it. */
export interface IReactWarningsGiven {
  /** while the story ran */
  during?: readonly IReactWarning[];
  /** before it started: as its file loaded, or as the story before it unmounted */
  before?: readonly IReactWarning[];
  /** after a story file's last story */
  after?: readonly IReactWarning[];
}

const WHEN: Record<keyof IReactWarningsGiven, string> = {
  during: '',
  before: 'before the story started (as its file loaded, or as the story before it unmounted): ',
  after: "after the file's last story: ",
};

/**
 * The failure for the React warnings given while a story ran, before it or after a file's last story: for each rule,
 * what it says and what to do, then the warnings under it; nothing when there are none.
 */
export const reactWarningsFailure = (given: IReactWarningsGiven): Error | undefined => {
  const parts = [...REACT_WARNING_RULES, CONSOLE_WARNING_RULE].flatMap((rule) => {
    const lines = (['before', 'during', 'after'] as const).flatMap((when) =>
      (given[when] ?? [])
        .filter((warning) => warning.rule === rule)
        .map((warning) => `  - ${WHEN[when]}${warning.text}`)
    );
    return lines.length ? [`${rule.says} (${rule.name}): ${rule.advice}\n${lines.join('\n')}`] : [];
  });
  return parts.length ? new Error(parts.join('\n')) : undefined;
};
