import { render } from '@testing-library/react';
import { useAutoFocus } from '../src/hooks/useAutoFocus';

/* An auto-focused field is focused once, when it appears — not again while it is being edited. A controlled
   input hands React a new ref callback on every render, so the SAME element arrives under a changing identity
   on each keystroke. useAutoFocus used to re-apply focus and move the selection to the end each time, which
   dropped a character being typed (qorus#646). It now focuses an element once and leaves a re-appearing same
   element alone. */

const Harness = ({ element }: { element: HTMLInputElement | null }) => {
  useAutoFocus(element as HTMLInputElement, { type: 'auto' });
  return null;
};

test('useAutoFocus focuses an element once, not again when the same element reappears', () => {
  const input = document.createElement('input');
  document.body.appendChild(input);
  const focus = vi.spyOn(input, 'focus');

  // the element is not there on the first render, then arrives — and is auto-focused
  const { rerender } = render(<Harness element={null} />);
  rerender(<Harness element={input} />);
  expect(focus).toHaveBeenCalledTimes(1);

  // the same node is handed back under a changing reference, as a controlled input does on each keystroke
  rerender(<Harness element={null} />);
  rerender(<Harness element={input} />);

  // it is NOT focused again — no "jump to end" re-applied mid-edit
  expect(focus).toHaveBeenCalledTimes(1);

  focus.mockRestore();
  document.body.removeChild(input);
});

test('useAutoFocus focuses a genuinely new element that takes the first one’s place', () => {
  const first = document.createElement('input');
  const second = document.createElement('input');
  document.body.append(first, second);
  const firstFocus = vi.spyOn(first, 'focus');
  const secondFocus = vi.spyOn(second, 'focus');

  const { rerender } = render(<Harness element={null} />);
  rerender(<Harness element={first} />);
  expect(firstFocus).toHaveBeenCalledTimes(1);

  // a DIFFERENT element replaces it — that is a new field opening, so it is focused
  rerender(<Harness element={second} />);
  expect(secondFocus).toHaveBeenCalledTimes(1);

  firstFocus.mockRestore();
  secondFocus.mockRestore();
  first.remove();
  second.remove();
});
