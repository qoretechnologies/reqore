import { setProjectAnnotations } from '@storybook/react-vite';
import { createElement } from 'react';
import { afterEach, beforeAll, beforeEach, expect } from 'vitest';
import { server } from 'vitest/browser';
import * as previewAnnotations from './preview';
import { TOUCH_STORY_PROJECT } from '../src/stories/utils/touchScreen';

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
  // a project's browser runs as a project of its own, named after both: "storybook-touch (chromium)"
  const project = server.config.name ?? '';
  const phone = project === TOUCH_STORY_PROJECT || project.startsWith(`${TOUCH_STORY_PROJECT} (`);
  const promised = phone ? '(hover: none) and (pointer: coarse)' : '(hover: hover) and (pointer: fine)';

  expect(matchMedia(promised).matches, `the "${project}" project's browser matches ${promised}`).toBe(true);
});
