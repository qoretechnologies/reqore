// Copyright 2026 Qore Technologies, s.r.o.

/**
 * What a button says: its text, without the copies a long label is scrolled with (they are aria-hidden). An
 * icon-only button says nothing (`''`).
 */
export const buttonSays = (button: Element): string => {
  const copy = button.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
  return (copy.textContent ?? '').trim();
};
