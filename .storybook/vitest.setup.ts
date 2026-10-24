// first: it watches the console for React's warnings before any other module loads (`reactWarnings.ts`)
import { reactWarnings } from './reactWarnings';
import { setProjectAnnotations } from '@storybook/react-vite';
import { createElement } from 'react';
import { afterAll, afterEach, beforeAll, beforeEach, expect } from 'vitest';
import { commands, server } from 'vitest/browser';
import * as previewAnnotations from './preview';
import { lowContrastIn } from '../src/stories/utils/contrastGate';
import { motionSettled } from '../src/stories/utils/motion';
import { reactWarningsFailure, type IReactWarning } from '../src/stories/utils/reactWarningGate';
import { POSIX_LANGUAGE, POSIX_LOCALE_STORY_PROJECT } from '../src/stories/utils/posixLocale';
import { SCROLLBARS_STORY_PROJECT, scrollbarWidth } from '../src/stories/utils/scrollbars';
import { TOUCH_STORY_PROJECT } from '../src/stories/utils/touchScreen';

/** Whether this run's browser is the one of the story project `name` (vitest.config.ts). */
const inProject = (name: string): boolean => {
  // a project's browser runs as a project of its own, named after both:
  // "storybook-touch (chromium)"
  const project = server.config.name ?? '';

  return project === name || project.startsWith(`${name} (`);
};

/** Whether this run's browser is the phone the stories tagged `touch` run on (vitest.config.ts). */
const onThePhone = (): boolean => inProject(TOUCH_STORY_PROJECT);

// Registers the React renderer (renderToCanvas) plus the project's global
// decorators/parameters from .storybook/preview for the Storybook Vitest project.
const annotations = setProjectAnnotations([
  previewAnnotations,
  {
    decorators: [
      // The vitest tester mounts stories into an auto-height <div> under <body>,
      // unlike the dev preview where .storybook/preview-body.html gives the
      // html/body/#storybook-root chain `height: 100%`. Without a definite
      // height, height-filling stories (`fill`, `fillParent`) cannot resolve
      // their 100% heights — the Table's fill measure loop never settles and
      // the story test times out. A 100vh frame resolves regardless of parent.
      (Story: any) => createElement('div', { style: { height: '100vh' } }, createElement(Story)),
    ],
    /* A story tagged `touch` runs on the phone. The two story projects tell those stories from the
       others by the tags Storybook reads from the story file before it runs it (vitest.config.ts);
       a tag the story only has once it runs - spread into it from a shared object - is not one of
       them, and the story would run here, on the desktop, with a mouse. It fails instead, saying
       how to tag it. */
    beforeEach: async ({ tags, title, name }) => {
      /* A story runs with the motion the user would see, unless it is about reduced motion (tagged
         `reduced-motion`): the contrast gate after the story before it asked for reduced motion. */
      await commands.emulateReducedMotion(tags.includes('reduced-motion'));

      if (tags.includes('touch') && !onThePhone()) {
        throw new Error(
          `"${title} / ${name}" is tagged 'touch' only once it runs, so it ran in the ` +
            `"${server.config.name}" project, whose browser has a mouse. Write the tag in the ` +
            `story file, as a string in the story's or its meta's own \`tags\` ` +
            `(tags: ['touch']), so that it runs on the phone.`
        );
      }
    },
  },
]);

beforeAll(annotations.beforeAll);

// Font parity with .storybook/preview-body.html.
const style = document.createElement('style');
style.textContent = `
  html,
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
`;
document.head.appendChild(style);

/* A story fails when a ResizeObserver callback changes the layout it observes in the same frame: the
   browser leaves the change unreported until the next one and says so with an error event whose message
   is "ResizeObserver loop completed with undelivered notifications" (qorus#646). Vitest only logs that
   event (it carries no error object), so it is caught here. The listener goes on through EventTarget, not
   `window.addEventListener`: Vitest counts the error listeners a page adds that way and stops reporting
   any unhandled error once there is one. */
const resizeLoops: string[] = [];

EventTarget.prototype.addEventListener.call(window, 'error', (event: Event) => {
  const { message } = event as ErrorEvent;

  if (typeof message === 'string' && message.includes('ResizeObserver loop')) {
    resizeLoops.push(message);
  }
});

beforeEach(() => {
  resizeLoops.length = 0;
});

afterEach(async () => {
  // the browser reports it after the frame's layout: let the frames after the story's last change pass
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
  expect(
    resizeLoops,
    'a ResizeObserver callback changed the layout it observes in the same frame - defer that change to the next frame'
  ).toEqual([]);
});

/* Each story's browser is the one its project promises (vitest.config.ts): a desktop with a mouse, or, for
   the stories tagged `touch`, a phone. The phone's stories run first, so every desktop story checks, after
   them, that it still has its mouse: a touch screen that left a desktop page without one (qorus#646) fails
   the next story here.

   And its scrollbars: hidden, taking no room, but in the project of the stories tagged `scrollbars`, whose
   browser draws them. On Linux, where the CI runs, they take room there: a browser that hid them again
   (a Playwright that hides them another way) would pass those stories without checking anything. On a Mac
   they take room only when it is set to always show them, so there it is not asked.

   And the browser of the stories tagged `posix-locale` reports the POSIX locale's language
   (`POSIX_LANGUAGE`), on every platform: given it another way (the platform's locale, which the
   amd64 Chromium the CI runs does not follow), it reported `en-US` there and passed those stories
   without checking anything. */
beforeEach(() => {
  const project = server.config.name ?? '';
  const promised = onThePhone()
    ? '(hover: none) and (pointer: coarse)'
    : '(hover: hover) and (pointer: fine)';

  expect(matchMedia(promised).matches, `the "${project}" project's browser matches ${promised}`).toBe(true);

  if (!inProject(SCROLLBARS_STORY_PROJECT)) {
    expect(scrollbarWidth(), `the "${project}" project's browser hides its scrollbars`).toBe(0);
  } else if (server.platform === 'linux') {
    expect(
      scrollbarWidth(),
      `the "${project}" project's browser draws scrollbars that take room`
    ).toBeGreaterThan(0);
  }

  if (inProject(POSIX_LOCALE_STORY_PROJECT)) {
    expect(
      [navigator.language, ...navigator.languages],
      `the "${project}" project's browser reports the POSIX locale's language`
    ).toEqual([POSIX_LANGUAGE, POSIX_LANGUAGE]);
  }
});

// No story makes React warn (`src/stories/utils/reactWarningGate.ts`): each warning fails the story it was given in.
// One given before the story started - as its file loaded, or as the story before it unmounted - fails it too, saying
// so; one given after a file's last story fails the file.
let reactWarningsBeforeStory: IReactWarning[] = [];

beforeEach(() => {
  reactWarningsBeforeStory = reactWarnings.take();
});

afterEach(() => {
  const failure = reactWarningsFailure({
    before: reactWarningsBeforeStory,
    during: reactWarnings.take(),
  });
  reactWarningsBeforeStory = [];
  if (failure) {
    throw failure;
  }
});

afterAll(() => {
  const failure = reactWarningsFailure({ after: reactWarnings.take() });
  if (failure) {
    throw failure;
  }
});

/* No story draws text or an icon too close to what it is drawn on (`src/stories/utils/contrastGate.ts`, qorus#646:
   David's review found black text on dark gray): text at 4.5:1 (3:1 when large) by axe-core, measured over the
   background it is drawn on - a translucent one over what is under it, a gradient as each of its colors - and an
   icon at 3:1, as the Qorus IDE's story run checks its own. Measured once the story has settled, in its theme, and
   under reduced motion, which Reqore honours: what stays on screen, never a frame of a fade or a spring. */
afterEach(async () => {
  await commands.emulateReducedMotion(true);
  /* Settled on its own, not on another plugin's timing: a fade already running when reduced motion is
     asked for runs on to its end, and in the projects that make captures qlip's capture used to be
     what waited for it. Without one, the gate measured a date field's clear button 5% into its
     fade-in, at 1.3:1 (`motionSettled`). */
  await motionSettled();
  expect(
    await lowContrastIn(document.body),
    'text (4.5:1, large 3:1) or icons (3:1) too close to what they are drawn on'
  ).toEqual([]);
});

declare module 'vitest/browser' {
  interface BrowserCommands {
    /** Asks for reduced motion, or stops asking (vitest.config.ts). */
    emulateReducedMotion: (reduce: boolean) => Promise<void>;
  }
}
