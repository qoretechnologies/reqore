// Copyright 2026 Qore Technologies, s.r.o.

// the frame loop `@react-spring/web` runs its springs on: its dependency, the only copy installed
import { frameLoop } from '@react-spring/shared';

/** The next animation frame. */
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/** The CSS transitions running in the document now. */
const runningTransitions = (): Animation[] =>
  document
    .getAnimations()
    .filter((animation) => animation instanceof CSSTransition && animation.playState === 'running');

/**
 * Resolves once nothing Reqore draws is moving: no spring is running (react-spring's frame loop,
 * which drives every spring Reqore draws, is idle) and no CSS transition is. A keyframe animation
 * (a spinner, a pulse) is not waited for: it is what the page shows while it is there.
 *
 * Reqore draws its fades and slides as springs, and a spring that was already running when reduced
 * motion was asked for runs on to its end: reduced motion makes the springs that start under it
 * immediate. Waiting a fixed number of frames measured a field's clear button 5% into its fade-in,
 * wherever nothing else (a capture) had waited first. A spring that is still running after `limit`
 * frames fails, saying so: it never settles.
 */
export const motionSettled = async (limit = 600): Promise<void> => {
  // the reduced-motion request reaches the page, and what answers it is drawn
  await nextFrame();
  await nextFrame();

  for (let frames = 0; ; frames += 1) {
    const transitions = runningTransitions();

    if (frameLoop.idle && !transitions.length) {
      return;
    }

    if (frames === limit) {
      throw new Error(`motion was still running after ${limit} frames: a spring never settles`);
    }

    // a transition ends with its own event; a spring is followed frame by frame, as it advances
    await Promise.all(transitions.map((transition) => transition.finished.catch(() => undefined)));
    await nextFrame();
  }
};
