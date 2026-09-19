import { StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { useState } from 'react';
import { IReqoreRichTextEditorProps, ReqoreRichTextEditor } from '../../components/RichTextEditor';
import { sleep } from '../../helpers/utils';
import { StoryMeta } from '../utils';

/**
 * The interactions an author actually performs on a reference field.
 *
 * Written after a run of defects that were each reported from the live IDE
 * rather than caught here: a caret placed past a chip that discarded every
 * keystroke, a template list that opened on the click starting an edit and
 * then covered the text being typed, and a value that reads as a chip in one
 * mode and as plain text in the other. They share a shape — the field had been
 * exercised as a set of RENDERS, never as a sequence of author ACTIONS.
 *
 * The template LIST is driven here too: `ClickingInOffersTheList`,
 * `TypingDismissesTheList` and `TypingKeepsTheListWhenAsked` each hand the
 * editor a `tags` map and then open, dismiss or hold the list the way an author
 * does. That is the set of defects that used to escape — the list opening on
 * the click that starts an edit and then covering the text being typed — so
 * those three are the guards against it coming back.
 */
const WITH_CHIP: IReqoreRichTextEditorProps['value'] = [
  {
    type: 'paragraph',
    children: [
      { text: '' },
      { type: 'tag', value: '$.result', label: 'result', children: [{ text: '' }] },
      { text: '' },
    ],
  },
];

const meta = {
  title: 'Form/RichTextEditor',
  component: ReqoreRichTextEditor,
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return (
      <ReqoreRichTextEditor
        {...args}
        value={value}
        onChange={(val) => {
          setValue(val);
          args.onChange?.(val);
        }}
      />
    );
  },
} as StoryMeta<typeof ReqoreRichTextEditor>;
type Story = StoryObj<typeof meta>;

export default meta;

const editorIn = async (doc: Document) =>
  waitFor(() => {
    const el = doc.querySelector<HTMLElement>('[contenteditable="true"]');
    expect(el).toBeTruthy();
    return el!;
  });

/**
 * Click, then wait for the editor to actually HOLD focus before typing.
 *
 * Without the wait the keystrokes are dispatched at whatever had focus when
 * the click was still settling, which under a loaded full-suite run is nothing
 * at all — `Type Into An Empty Field` passed alone and timed out at 6.2s in the
 * suite. The same wait is why `ErasingAReferenceKeepsTheEditor` is stable.
 */
const focusEditor = async (doc: Document, editor: HTMLElement) => {
  await userEvent.click(editor);
  await waitFor(() =>
    expect(editor === doc.activeElement || editor.contains(doc.activeElement)).toBe(true)
  );
};

/** Typing into an empty field puts the text in. The floor of the matrix. */
export const TypeIntoAnEmptyField: Story = {
  args: { value: [{ type: 'paragraph', children: [{ text: '' }] }], onChange: fn() },
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const editor = await editorIn(doc);
    await focusEditor(doc, editor);
    await userEvent.keyboard('hello');
    await waitFor(() => expect(editor.innerText.replace(/[\s﻿]/g, '')).toContain('hello'));
  },
};

/** Typing when a chip is already there. */
export const TypeWithAChipPresent: Story = {
  args: { value: WITH_CHIP, onChange: fn() },
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const editor = await editorIn(doc);
    await focusEditor(doc, editor);
    await userEvent.keyboard('xy');
    await waitFor(() => expect(editor.innerText.replace(/[\s﻿]/g, '')).toContain('xy'));
  },
};

const TAGS = {
  template: {
    label: 'Templates',
    items: [
      { label: 'result', value: '$.result' },
      { label: 'output', value: '$.output' },
    ],
  },
};

const listIsOpen = (doc: Document) => !!doc.querySelector('.reqore-popover-content');

/** Clicking in offers the list. That is what the field is for. */
export const ClickingInOffersTheList: Story = {
  args: { value: [{ type: 'paragraph', children: [{ text: '' }] }], tags: TAGS, onChange: fn() },
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const editor = await editorIn(doc);
    await userEvent.click(editor);
    await waitFor(() => expect(listIsOpen(doc)).toBe(true));
  },
};

/**
 * ...and writing a value instead of picking one puts it away.
 *
 * `actions` is set because the Qorus IDE's `RichTextField` sets it on every
 * rich-text field, and it is load-bearing here: the styling / undo / redo
 * buttons render as `customElements` of this SAME popover. A first cut of the
 * dismiss fix exempted surfaces carrying controls, which read as reasonable and
 * disabled the fix on every field it was written for. Without these args the
 * story passes while the real field does nothing.
 *
 * This is the DEFAULT; a field that inserts many references in a row can opt
 * out with `keepTemplatesOpenWhileTyping` — see *Typing Keeps The List When
 * Asked*.
 */
export const TypingDismissesTheList: Story = {
  args: {
    value: [{ type: 'paragraph', children: [{ text: '' }] }],
    tags: TAGS,
    actions: { redo: true, undo: true, styling: false },
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const editor = await editorIn(doc);

    await userEvent.click(editor);
    await waitFor(() => expect(listIsOpen(doc)).toBe(true));

    await userEvent.keyboard('abc');
    await waitFor(() => expect(listIsOpen(doc)).toBe(false));
    // Closing the list must not eat the keystroke.
    await waitFor(() => expect(editor.innerText.replace(/[\s\uFEFF]/g, '')).toContain('abc'));
  },
};

/**
 * The list can be told to stay put while typing.
 *
 * Dismissing is the default because a list that stays open covers the text
 * being written. A field that exists to insert MANY references in a row wants
 * the opposite — re-opening the list by clicking back into the input between
 * every insertion costs more than the covered text does — so
 * `keepTemplatesOpenWhileTyping` opts out of the dismissal.
 */
export const TypingKeepsTheListWhenAsked: Story = {
  args: {
    value: [{ type: 'paragraph', children: [{ text: '' }] }],
    tags: TAGS,
    actions: { redo: true, undo: true, styling: false },
    keepTemplatesOpenWhileTyping: true,
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const editor = await editorIn(doc);

    await userEvent.click(editor);
    await waitFor(() => expect(listIsOpen(doc)).toBe(true));

    await userEvent.keyboard('abc');
    // The text lands AND the list is still there to pick from.
    await waitFor(() => expect(editor.innerText.replace(/[\s\uFEFF]/g, '')).toContain('abc'));
    expect(listIsOpen(doc)).toBe(true);
  },
};

/**
 * A reference is SELECTED, never typed.
 *
 * Typing beside a chip must produce literal text and leave the reference
 * alone. It used to extend it — `$.result` + `a` became the single invalid
 * reference `$.resulta`, which resolves to nothing and which no picker would
 * ever have produced.
 */
export const TypingBesideAChipDoesNotExtendIt: Story = {
  args: { value: WITH_CHIP, onChange: fn() },
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const editor = await editorIn(doc);

    await focusEditor(doc, editor);
    await userEvent.keyboard('a');
    await sleep(300);

    /* Asserted against the DOCUMENT, not the chip's rendered label. The label
       is a fixed prop and reads `result` whatever the value underneath has
       become — a test that checks it passes while the reference is being
       corrupted, which is how `$.resulta` reached a user. */
    const isSlate = (o: any) =>
      o && typeof o === 'object' && Array.isArray(o.children) && Array.isArray(o.operations) &&
      typeof o.apply === 'function' && 'selection' in o;
    const fk = Object.keys(editor).find((k) => k.startsWith('__reactFiber$'))!;
    let f: any = (editor as any)[fk];
    let slate: any = null;
    let depth = 0;
    while (f && depth < 60 && !slate) {
      for (const bag of [f.memoizedProps, f.memoizedState]) {
        if (!bag) continue;
        if (isSlate(bag)) { slate = bag; break; }
        if (bag.value && isSlate(bag.value)) { slate = bag.value; break; }
        for (const k of Object.keys(bag)) { if (isSlate(bag[k])) { slate = bag[k]; break; } }
        if (slate) break;
      }
      f = f.return;
      depth++;
    }
    expect(slate).toBeTruthy();

    const nodes = slate.children[0].children;
    const tag = nodes.find((n: any) => n.type === 'tag');
    const typed = nodes.filter((n: any) => typeof n.text === 'string').map((n: any) => n.text).join('');

    expect({
      // The reference is untouched — it can only ever be SELECTED.
      reference: tag?.value,
      // ...and the keystroke landed as literal text of its own.
      typed,
    }).toMatchObject({ reference: '$.result', typed: 'a' });
  },
};
