import { StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { useState } from 'react';
import { ReqoreRichTextEditor } from '../../components/RichTextEditor';
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
 * KNOWN GAP, and the reason those defects reach the live IDE instead of this
 * file: the template LIST cannot be driven in a story at all. Giving
 * `ReqoreRichTextEditor` a `tags` map — the prop the list is built from — hangs
 * the runner. Four such stories blew through a 240s cap where this entire
 * 18-story component finishes in about a minute, and two independent attempts
 * hung identically. Until that is fixed there can be no coverage of opening the
 * list, of typing over it, or of where it is positioned — which is exactly the
 * set of defects that keeps escaping. Un-hanging it is the prerequisite.
 */
const WITH_CHIP = [
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
  title: 'Form/RichTextEditor/AuthorActions',
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

/** Typing into an empty field puts the text in. The floor of the matrix. */
export const TypeIntoAnEmptyField: Story = {
  args: { value: [{ type: 'paragraph', children: [{ text: '' }] }], onChange: fn() },
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const editor = await editorIn(doc);
    await userEvent.click(editor);
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
    await userEvent.click(editor);
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

/** ...and writing a value instead of picking one puts it away. */
export const TypingDismissesTheList: Story = {
  args: { value: [{ type: 'paragraph', children: [{ text: '' }] }], tags: TAGS, onChange: fn() },
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

    await userEvent.click(editor);
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
