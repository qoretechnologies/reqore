import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreTag,
  ReqoreUIProvider,
} from '../src';
import { ReqoreRichTextEditor } from '../src/components/RichTextEditor';

/**
 * A read-only thing must not ADVERTISE itself as pressable.
 *
 * `readOnly` is reqore's word for "present, readable, not choosable", and the
 * refusal is only half of it: a surface that still paints a pointer cursor, a
 * hover lift and a tab stop has promised something it then declines, which is
 * the failure that reads as a broken control rather than a disallowed one.
 *
 * Both halves are asserted here because they are wired in different places —
 * the tag's own `readOnly`, and the editor routing its `readOnly` / `disabled`
 * through to the chips it renders.
 */

const wrap = (ui: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{ui}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

describe('a read-only tag', () => {
  it('keeps its handler but is neither a tab stop nor pointer-cursored', () => {
    const { container } = wrap(
      <ReqoreTag readOnly label='Cannot be chosen' onClick={() => undefined} />
    );
    const tag = container.querySelector('.reqore-tag') as HTMLElement;

    expect(tag).toBeTruthy();
    // The tab order is the same advertisement made to the keyboard.
    expect(tag.getAttribute('tabindex')).toBeNull();
    expect(getComputedStyle(tag).cursor).toBe('not-allowed');
  });

  it('is still a tab stop when it is genuinely pressable', () => {
    const { container } = wrap(<ReqoreTag label='Choose me' onClick={() => undefined} />);
    const tag = container.querySelector('.reqore-tag') as HTMLElement;

    expect(tag.getAttribute('tabindex')).toBe('0');
    expect(getComputedStyle(tag).cursor).toBe('pointer');
  });
});

describe("a template chip in an editor that cannot be typed into", () => {
  const value: any = [
    {
      type: 'paragraph',
      children: [
        { text: '' },
        { type: 'tag', label: '$.order.id', value: '$.order.id', children: [{ text: '' }] },
        { text: '' },
      ],
    },
  ];

  const chipOf = (container: HTMLElement) =>
    container.querySelector('.reqore-tag') as HTMLElement;

  it('does not offer a cursor it will refuse — readOnly', () => {
    const { container } = wrap(
      <ReqoreRichTextEditor readOnly value={value} onChange={() => undefined} />
    );
    const chip = chipOf(container);

    expect(chip).toBeTruthy();
    expect(chip.getAttribute('tabindex')).toBeNull();
    expect(getComputedStyle(chip).cursor).toBe('not-allowed');
  });

  it('does not offer a cursor it will refuse — disabled', () => {
    /* `disabled` never reaches Slate, so `useReadOnly()` cannot see it. The chip
       learns about it only because the editor marks it read-only when composing
       the chip's props — which is what this asserts. */
    const { container } = wrap(
      <ReqoreRichTextEditor disabled value={value} onChange={() => undefined} />
    );
    const chip = chipOf(container);

    expect(chip.getAttribute('tabindex')).toBeNull();
    expect(getComputedStyle(chip).cursor).toBe('not-allowed');
  });

  it('is pressable in an ordinary editor, where the click places a cursor', () => {
    const { container } = wrap(
      <ReqoreRichTextEditor value={value} onChange={() => undefined} />
    );
    const chip = chipOf(container);

    expect(chip.getAttribute('tabindex')).toBe('0');
    expect(getComputedStyle(chip).cursor).toBe('pointer');
  });
});
