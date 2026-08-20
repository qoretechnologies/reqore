import { render } from '@testing-library/react';
import { useRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFocusTrap } from '../src/hooks/useFocusTrap';

/**
 * The trap performs two kinds of programmatic focus — auto-focusing the first
 * element on arm, and restoring the previously focused element on disarm. Both
 * run inside requestAnimationFrame, by which time the page may have re-laid
 * out (e.g. a form re-grouping after a value commits), so a scrolling focus
 * teleports the scroll container to wherever the target landed — the template
 * drawer jumped half a screen every time a select-dialog closed. Both calls
 * must pass `preventScroll`, and the restore must never steal focus the user
 * has meanwhile placed elsewhere. Tab-cycling is exempt: a keyboard user needs
 * the element they tabbed to scrolled into view.
 */

const Trap = ({ active = true }: { active?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, { active });
  return (
    <div ref={ref}>
      <button data-testid='inside'>inside</button>
    </div>
  );
};

const flushRaf = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

describe('useFocusTrap scroll preservation', () => {
  let focusSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');
  });

  it('auto-focuses without scrolling', async () => {
    render(<Trap />);
    await flushRaf();

    const autoFocusCall = focusSpy.mock.calls.find((c) => c.length > 0);
    expect(autoFocusCall?.[0]).toEqual({ preventScroll: true });
  });

  it('restores focus without scrolling, when focus is unclaimed', async () => {
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();

    const { unmount } = render(<Trap />);
    await flushRaf();
    focusSpy.mockClear();
    (document.activeElement as HTMLElement)?.blur();

    unmount();
    await flushRaf();

    const restore = focusSpy.mock.calls.at(-1);
    expect(restore?.[0]).toEqual({ preventScroll: true });
    expect(document.activeElement).toBe(outside);
    outside.remove();
  });

  it('does not steal focus the user has meanwhile placed elsewhere', async () => {
    const outside = document.createElement('button');
    const meanwhile = document.createElement('input');
    document.body.append(outside, meanwhile);
    outside.focus();

    const { unmount } = render(<Trap />);
    await flushRaf();

    meanwhile.focus();
    unmount();
    await flushRaf();

    // the user's focus wins; the trap must not pull it back to `outside`
    expect(document.activeElement).toBe(meanwhile);
    outside.remove();
    meanwhile.remove();
  });
});
