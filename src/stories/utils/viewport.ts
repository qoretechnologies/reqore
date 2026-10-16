// Copyright 2026 Qore Technologies, s.r.o.

/**
 * Run `body` with the story's own viewport narrowed to `width` x `height`, then put it back.
 *
 * qlip's `parameters.qlip.viewport` sizes the CAPTURE, which happens after the play has finished - the play
 * itself runs at the test browser's width. A play that asserts the phone layout narrows the viewport itself,
 * with the same `page.viewport` call qlip makes. It is a DYNAMIC import: `vitest/browser` throws on import
 * outside Browser Mode, so a static one would take the Storybook dev server down. Where the call is
 * unavailable, `body` runs at the width it already had and is told so (`narrowed` is false).
 */
export const withViewport = async (
  width: number,
  height: number,
  body: (narrowed: boolean) => Promise<void>
) => {
  let resize: ((w: number, h: number) => Promise<void>) | undefined;
  try {
    ({
      page: { viewport: resize },
    } = (await import('vitest/browser')) as never);
  } catch {
    resize = undefined;
  }

  const was = { width: window.innerWidth, height: window.innerHeight };
  await resize?.(width, height);
  try {
    await body(!!resize && window.innerWidth === width);
  } finally {
    // Unconditional: a viewport left narrowed would narrow every later story.
    await resize?.(was.width, was.height);
  }
};
