// Copyright 2026 Qore Technologies, s.r.o.
import { act, fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreRichTextEditor,
  ReqoreTextarea,
  ReqoreUIProvider,
} from '../src';

/**
 * A field that offers templates lists them when the author comes into it, by a click, a tap or the keyboard
 * (qorus#646, David: a value's field, tabbed into, offered nothing). The list a click opens is the click's:
 * the focus the click brings does not open it a second time, which would close it again. And focus that
 * comes back to the field from the list - a template picked - does not open it again.
 */

const isOpen = () => document.querySelectorAll('.reqore-popover-content').length === 1;

const items = [
  { label: 'qty', value: '$record:{qty}' },
  { label: 'price', value: '$record:{price}' },
];

const show = () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <button className='before'>before</button>
          <ReqoreTextarea templates={{ items }} onChange={() => undefined} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
  return {
    field: document.querySelector('.reqore-textarea') as HTMLElement,
    before: document.querySelector('.before') as HTMLElement,
  };
};

describe('a template list', () => {
  it('opens when the field is come into from the keyboard', () => {
    const { field, before } = show();
    act(() => {
      fireEvent.focusIn(field, { relatedTarget: before });
    });
    expect(isOpen()).toBe(true);
  });

  it('opens once for a click, which brings the focus too', () => {
    const { field, before } = show();
    act(() => {
      fireEvent.pointerDown(field);
      fireEvent.focusIn(field, { relatedTarget: before });
      fireEvent.click(field);
    });
    expect(isOpen()).toBe(true);
  });

  it('opens from the keyboard after a click on the field while it had the focus', () => {
    const { field, before } = show();
    act(() => {
      field.focus();
    });
    // a click on the field that already has the focus brings no focus: it lists the templates, as a click does
    act(() => {
      fireEvent.pointerDown(field);
      fireEvent.click(field);
    });
    expect(isOpen()).toBe(true);
    act(() => {
      fireEvent.keyDown(field, { key: 'Escape' });
    });
    expect(isOpen()).toBe(false);
    // away and back by the keyboard: that focus is the keyboard's
    act(() => {
      before.focus();
    });
    act(() => {
      fireEvent.focusIn(field, { relatedTarget: before });
    });
    expect(isOpen()).toBe(true);
  });

  it('opens from the keyboard after a click that brought no focus', () => {
    const { field, before } = show();
    // a press whose focus the page held back (its default prevented): the click still ends it
    act(() => {
      fireEvent.pointerDown(field);
      fireEvent.click(document.body);
    });
    act(() => {
      fireEvent.focusIn(field, { relatedTarget: before });
    });
    expect(isOpen()).toBe(true);
  });

  it('does not open for focus that comes back from the list', () => {
    const { field } = show();
    act(() => {
      fireEvent.focusIn(field, { relatedTarget: null });
    });
    expect(isOpen()).toBe(false);
  });
});

/**
 * A chip in a rich-text field takes the focus from the editor for the moment it is pressed, and its click
 * hands it back. That focus never left the field: it is not the author coming into it from the keyboard.
 * Taken for one, it opened the list, whose keep-below rule scrolled the page by the list's height, and
 * handing the focus back closed it again: the page jumped by ~137px and showed nothing (qorus-ide).
 */
describe('a chip in a rich-text field that offers templates', () => {
  const value = [
    {
      type: 'paragraph',
      children: [
        { text: 'before' },
        { type: 'tag', value: '$.result', label: 'result', children: [{ text: '' }] },
        { text: '' },
      ],
    },
  ];

  const showRichText = () => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <button className='before'>before</button>
            <ReqoreRichTextEditor
              value={value as never}
              onChange={() => undefined}
              tags={{ template: { label: 'Templates', items } } as never}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
    const editor = document.querySelector<HTMLElement>('[contenteditable="true"]');
    return {
      editor,
      chip: editor.querySelector<HTMLElement>('.reqore-tag'),
      before: document.querySelector<HTMLElement>('.before'),
    };
  };

  /** A press on the chip: its focus moves from the editor to the chip, and its click hands it back. */
  const pressChip = (editor: HTMLElement, chip: HTMLElement) => {
    act(() => {
      fireEvent.pointerDown(chip);
      chip.focus();
    });
    const openOnFocus = isOpen();
    act(() => {
      fireEvent.click(chip);
      editor.focus();
    });
    return openOnFocus;
  };

  it('does not list them when the cursor is already in the editor', () => {
    const { editor, chip } = showRichText();
    act(() => {
      editor.focus();
    });
    expect(isOpen()).toBe(false);

    // Neither the focus moving to the chip nor the chip's click lists them.
    expect(pressChip(editor, chip)).toBe(false);
    expect(isOpen()).toBe(false);
    expect(document.activeElement).toBe(editor);
  });

  it('leaves a list that is open as it is', () => {
    const { editor, chip } = showRichText();
    // a click in the text lists them
    act(() => {
      fireEvent.pointerDown(editor);
      editor.focus();
      fireEvent.click(editor);
    });
    expect(isOpen()).toBe(true);

    expect(pressChip(editor, chip)).toBe(true);
    expect(isOpen()).toBe(true);
  });

  it('still lists them for a click in the text, and when the field is come into from the keyboard', () => {
    const { editor, chip, before } = showRichText();
    act(() => {
      editor.focus();
    });
    pressChip(editor, chip);
    expect(isOpen()).toBe(false);

    act(() => {
      fireEvent.pointerDown(editor);
      fireEvent.click(editor);
    });
    expect(isOpen()).toBe(true);

    // away, and back by the keyboard
    act(() => {
      before.focus();
    });
    expect(isOpen()).toBe(false);
    act(() => {
      fireEvent.focusIn(editor, { relatedTarget: before });
    });
    expect(isOpen()).toBe(true);
  });

  it("still lists them for a click on a chip's remove button", () => {
    const { editor } = showRichText();
    act(() => {
      editor.focus();
    });
    // an editable field's chip can be removed
    const remove = editor.querySelector<HTMLElement>('.reqore-tag-remove');
    expect(remove).not.toBeNull();
    act(() => {
      fireEvent.pointerDown(remove);
      fireEvent.click(remove);
    });
    expect(isOpen()).toBe(true);
  });

  it('puts the list away when the focus leaves the field', () => {
    const { editor, before } = showRichText();
    act(() => {
      fireEvent.pointerDown(editor);
      editor.focus();
      fireEvent.click(editor);
    });
    expect(isOpen()).toBe(true);
    act(() => {
      before.focus();
    });
    expect(isOpen()).toBe(false);
  });
});
