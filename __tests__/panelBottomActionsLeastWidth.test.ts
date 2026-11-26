// Copyright 2026 Qore Technologies, s.r.o.
// the library first: a component module on its own meets its imports half made
import '../src';
import {
  BOTTOM_ACTIONS_TEXT_LEAST_WIDTH,
  bottomActionsDoNotFit,
  getBottomActionsLeastWidth,
} from '../src/components/Panel';

/**
 * An element `width` wide (jsdom lays nothing out, so each width is given); at `max-content` it is `whole` wide.
 */
const sized = (className: string, width: number, whole = width) => {
  const element = document.createElement('div');
  element.className = className;
  element.getBoundingClientRect = () =>
    ({ width: element.style.width === 'max-content' ? whole : width, top: 0 }) as DOMRect;

  return element;
};

/** A bottom bar `width` wide holding `groups`, each a list of children. */
const bar = (width: number, groups: HTMLElement[][]) => {
  const element = document.createElement('div');
  Object.defineProperty(element, 'clientWidth', { value: width });
  Object.defineProperty(element, 'scrollWidth', { value: width });
  groups.forEach((children) => {
    const group = sized('reqore-control-group', 0);
    children.forEach((child) => group.appendChild(child));
    element.appendChild(group);
  });

  return element;
};

const close = () => sized('reqore-control reqore-button', 93);
const run = () => sized('reqore-control reqore-button', 82);
/** A sentence that can wrap: 420px whole, drawn at whatever its line leaves it. */
const reason = () => sized('reason', 120, 420);

describe('a bottom bar with text that can wrap beside its actions', () => {
  it('counts the text at a readable width, never its whole sentence', () => {
    expect(getBottomActionsLeastWidth(bar(583, [[close()], [run(), reason()]]))).toBe(
      93 + 82 + BOTTOM_ACTIONS_TEXT_LEAST_WIDTH
    );
  });

  it('counts short text at its whole width', () => {
    expect(getBottomActionsLeastWidth(bar(583, [[run(), sized('reason', 50, 80)]]))).toBe(82 + 80);
  });

  it('puts the measured text back as it was', () => {
    const text = reason();
    text.style.flex = '0 1 auto';
    getBottomActionsLeastWidth(bar(583, [[run(), text]]));
    expect(text.style.width).toBe('');
    expect(text.style.flex).toBe('0 1 auto');
  });

  it('fits a desktop drawer, so its bar keeps one line', () => {
    expect(bottomActionsDoNotFit(bar(583, [[close()], [run(), reason()]]))).toBe(false);
  });

  it('does not fit a phone, so its bar stacks', () => {
    expect(bottomActionsDoNotFit(bar(340, [[close()], [run(), reason()]]))).toBe(true);
  });

  it('does not fit where the bar is narrower than its buttons', () => {
    expect(bottomActionsDoNotFit(bar(160, [[close()], [run()]]))).toBe(true);
  });
});
