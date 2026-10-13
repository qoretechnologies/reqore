// first: it watches the console for React's warnings before any other module loads (`reactWarnings.ts`)
import { reactWarnings } from './reactWarnings';
import { setProjectAnnotations } from '@storybook/react-vite';
import { createElement } from 'react';
import { afterAll, afterEach, beforeAll, beforeEach, expect } from 'vitest';
import { server } from 'vitest/browser';
import * as previewAnnotations from './preview';
import { reactWarningsFailure, type IReactWarning } from '../src/stories/utils/reactWarningGate';
import { TOUCH_STORY_PROJECT } from '../src/stories/utils/touchScreen';

/** Whether this run's browser is the phone the stories tagged `touch` run on (vitest.config.ts). */
const onThePhone = (): boolean => {
  // a project's browser runs as a project of its own, named after both:
  // "storybook-touch (chromium)"
  const project = server.config.name ?? '';

  return project === TOUCH_STORY_PROJECT || project.startsWith(`${TOUCH_STORY_PROJECT} (`);
};

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
    beforeEach: ({ tags, title, name }) => {
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
   the next story here. */
beforeEach(() => {
  const project = server.config.name ?? '';
  const promised = onThePhone()
    ? '(hover: none) and (pointer: coarse)'
    : '(hover: hover) and (pointer: fine)';

  expect(matchMedia(promised).matches, `the "${project}" project's browser matches ${promised}`).toBe(true);
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
