/**
 * The mask a box that scrolls sideways draws on the edges that still have content past them: the
 * content fades out over `fadePx`, so it reads as going on past the edge, and whatever the box sits
 * on shows through. A phone draws no scrollbar, so without it a sideways scroller hides content
 * without saying so. Shared by `ReqoreTable` and `ReqoreStatisticGroup`; `undefined` when neither
 * edge fades.
 */
export const sidewaysFadeMask = (start: boolean, end: boolean, fadePx: number) => {
  if (!start && !end) return undefined;
  const fade = `${fadePx}px`;
  const gradient = `linear-gradient(to right, ${[
    start ? `transparent 0, #000 ${fade}` : '#000 0',
    end ? `#000 calc(100% - ${fade}), transparent 100%` : '#000 100%',
  ].join(', ')})`;
  return `-webkit-mask-image: ${gradient}; mask-image: ${gradient};`;
};
