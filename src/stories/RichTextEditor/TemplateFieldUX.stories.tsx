import { StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { useState } from 'react';
import { IReqoreRichTextEditorProps, ReqoreRichTextEditor } from '../../components/RichTextEditor';
import { sleep } from '../../helpers/utils';
import { StoryMeta } from '../utils';
import { withTouchScreen } from '../utils/touchScreen';
import { withViewport } from '../utils/viewport';

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
  parameters: {
    docs: {
      description: {
        story:
          'Renders an empty reference field. When it is clicked and typed into, the text appears in it.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders a reference field holding a template chip. When it is clicked and typed into, the text appears beside the chip.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders an empty reference field that offers templates. When it is clicked, the template list opens.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders an empty reference field with templates and its undo and redo buttons. When it is clicked, the template list opens; when text is typed, the list closes and every key typed is in the field.',
      },
    },
  },
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
 * ...even when the text comes straight after the click that opened the list.
 *
 * The list's controls answered for the moment they were handed to the field, which got a fresh copy only
 * a render later: a key typed in that gap found the list "closed", did not put it away, and the list
 * opened over the text (qorus#646: a field chosen into a value, clicked back into and " Stk." typed after
 * it). No wait between the click and the keys: that gap is the case.
 */
export const TypingStraightAfterTheClickDismissesTheList: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a reference field holding a chip, with templates. When text is typed straight after the click into the field, the template list stays closed and the text is in the field.',
      },
    },
  },
  args: {
    value: WITH_CHIP,
    tags: TAGS,
    actions: { redo: true, undo: true, styling: false },
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const editor = await editorIn(doc);
    await userEvent.click(editor);
    await userEvent.keyboard(' Stk.');
    await sleep(500);
    await expect(listIsOpen(doc)).toBe(false);
    await waitFor(() => expect(editor.innerText.replace(/[\s\uFEFF]/g, '')).toContain('Stk.'));
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders an empty reference field with templates and `keepTemplatesOpenWhileTyping`. When it is clicked and text is typed, the text is in the field and the template list stays open.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          "Renders a reference field holding the chip `$.result`. When a letter is typed beside it, the letter is text of its own and the chip's reference stays `$.result`.",
      },
    },
  },
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

/**
 * The list opens UNDER the field, even when the field sits low on the page.
 *
 * Popper flips a surface to the opposite side when the preferred one is too
 * tight, which for a field's own menu is the worst of the two: it covers the
 * form the field belongs to — the rows the author is reading to decide what to
 * pick — while the space below holds the rows they have already passed.
 *
 * Reported from a Qorus test assertion's `Value`. A field carrying a
 * validation message is ~270px tall with the control at its BOTTOM, so it sits
 * low enough that the list flipped every time, and the same field with no
 * message placed it correctly — one field, two behaviours, decided by how tall
 * the message happened to be.
 *
 * The decorator reproduces that: a scroll container with the field pushed most
 * of a screen down, so the room below is far less than the list needs.
 */
export const TheListOpensBelowAFieldNearTheBottom: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a reference field most of a screen down a scrolling page. When it is clicked, the template list opens below the field, on screen, the page scrolled to make room.',
      },
    },
  },
  args: { value: [{ type: 'paragraph', children: [{ text: '' }] }], tags: TAGS, onChange: fn() },
  decorators: [
    (Story: any) => (
      <div style={{ height: '100vh', overflowY: 'auto' }} data-testid='scroller'>
        <div style={{ height: '85vh' }} />
        <Story />
        <div style={{ height: '85vh' }} />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const editor = await editorIn(doc);

    await userEvent.click(editor);
    await waitFor(() => expect(listIsOpen(doc)).toBe(true));

    const control = (editor.closest('.reqore-control-wrapper') as HTMLElement) ?? editor;

    /* Re-queried inside the wait: making room scrolls the field, so both rects
       move, and a pair captured beforehand describes the layout the fix exists
       to change. */
    await waitFor(async () => {
      const list = doc.querySelector<HTMLElement>('.reqore-popover-content')!;
      const listTop = list.getBoundingClientRect().top;
      const fieldBottom = control.getBoundingClientRect().bottom;

      // Below the field — not over the form above it.
      await expect(Math.round(listTop)).toBeGreaterThanOrEqual(Math.round(fieldBottom) - 1);
      // And on screen, rather than hanging off the bottom.
      await expect(list.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        doc.documentElement.clientHeight + 1
      );
    });
  },
};

/**
 * THE FLOOR UNDER `keepPlacement`.
 *
 * Holding the list below its field means clamping its height to the room that
 * is there. That is a good trade while the room is worth having, and it decays
 * badly: the clamp bottoms out at `max-height: 0px`, which is an open list
 * nobody can see, with `flip` switched off so there is nowhere else for it to
 * go. Measured on this exact layout before the floor existed — computed
 * max-height 0px, rendered height 0, sitting at y=885 of a 900px window.
 * Nothing told the author the list had opened at all.
 *
 * So the preference yields under `MIN_USABLE_SPACE_BELOW`. Covering the form is
 * the cost `keepPlacement` exists to avoid, and it is still the cheaper of the
 * two once the alternative is showing nothing.
 *
 * The layout is the case scrolling cannot rescue: the field is pinned to the
 * foot of the viewport and there is no scrollable ancestor, so there is no room
 * to be found and none to be made.
 */
export const TheListFlipsRatherThanVanishWithNoRoomBelow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a reference field pinned to the foot of the screen with nothing to scroll. When it is clicked, the template list opens above the field rather than below it with no height.',
      },
    },
  },
  args: { value: [{ type: 'paragraph', children: [{ text: '' }] }], tags: TAGS, onChange: fn() },
  decorators: [
    (Story: any) => (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ width: '100%' }}>
          <Story />
        </div>
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const editor = await editorIn(doc);

    await userEvent.click(editor);
    await waitFor(() => expect(listIsOpen(doc)).toBe(true));

    const control = (editor.closest('.reqore-control-wrapper') as HTMLElement) ?? editor;

    await waitFor(async () => {
      const list = doc.querySelector<HTMLElement>('.reqore-popover-content')!;
      const rect = list.getBoundingClientRect();

      // Visible at all, which is the whole point.
      await expect(rect.height).toBeGreaterThan(0);
      await expect(getComputedStyle(list).maxHeight).not.toBe('0px');
      // And it went UP, because down was not a place.
      await expect(rect.top).toBeLessThan(control.getBoundingClientRect().top);
      // Still on screen.
      await expect(rect.bottom).toBeLessThanOrEqual(doc.documentElement.clientHeight + 1);
    });
  },
};

/**
 * The layout of `TheListOpensBelowAFieldNearTheBottom`: a scroll container with the field most of a
 * screen down.
 */
const nearTheBottom = (Story: any) => (
  <div style={{ height: '100vh', overflowY: 'auto' }} className='story-scroller'>
    <div style={{ height: '85vh' }} />
    <Story />
    <div style={{ height: '85vh' }} />
  </div>
);

/**
 * Two frames: whatever a click put in motion - a list opening, the page scrolled to make room for
 * it - has been drawn.
 */
const afterTwoFrames = (win: Window) =>
  new Promise<void>((resolve) =>
    win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve()))
  );

/** Click a field's chip, and wait for the chip to hand the cursor back to the editor. */
const clickChip = async (doc: Document, editor: HTMLElement) => {
  await userEvent.click(editor.querySelector<HTMLElement>('.reqore-tag')!);
  await waitFor(() => expect(doc.activeElement).toBe(editor));
  await afterTwoFrames(doc.defaultView!);
};

/**
 * A click on a chip puts the cursor after it, and that is all: it does not list the templates, and
 * the page stays where it is.
 *
 * Reported from the Qorus IDE: with the cursor already in a reference field low on the page, a
 * click on a chip scrolled the page about 137px and showed nothing. The chip takes the focus from
 * the editor for the moment of the press; that move was taken for the author coming into the field
 * from the keyboard, the list opened, its keep-below rule scrolled the page by its height, and the
 * chip, handing the focus back to the editor, closed it again.
 */
export const ClickingAChipNeitherListsNorScrolls: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a reference field holding a chip, low on a scrolling page, with the cursor in it and the template list closed. When the chip is clicked, the cursor goes after it, no list opens and the page does not move.',
      },
    },
  },
  args: { value: WITH_CHIP, tags: TAGS, onChange: fn() },
  decorators: [nearTheBottom],
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const editor = await editorIn(doc);
    const scroller = doc.querySelector<HTMLElement>('.story-scroller')!;

    // The cursor in the field, and the list a click offers put away.
    await focusEditor(doc, editor);
    await waitFor(() => expect(listIsOpen(doc)).toBe(true));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(listIsOpen(doc)).toBe(false));
    await afterTwoFrames(doc.defaultView!);
    const scrollTop = scroller.scrollTop;

    await clickChip(doc, editor);

    await expect(listIsOpen(doc)).toBe(false);
    await expect(scroller.scrollTop).toBe(scrollTop);
  },
};

/**
 * ...and a click on a chip leaves an open list as it is: moving the focus to the chip and back
 * stays inside the field, and a press inside the field does not put the list away. The page does
 * not move either.
 */
export const ClickingAChipLeavesAnOpenListOpen: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a reference field holding a chip, low on a scrolling page, with the template list open. When the chip is clicked, the list stays open and the page does not move.',
      },
    },
  },
  args: { value: WITH_CHIP, tags: TAGS, onChange: fn() },
  decorators: [nearTheBottom],
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const editor = await editorIn(doc);
    const scroller = doc.querySelector<HTMLElement>('.story-scroller')!;

    await focusEditor(doc, editor);
    await waitFor(() => expect(listIsOpen(doc)).toBe(true));
    await afterTwoFrames(doc.defaultView!);
    const scrollTop = scroller.scrollTop;

    await clickChip(doc, editor);

    await expect(listIsOpen(doc)).toBe(true);
    await expect(scroller.scrollTop).toBe(scrollTop);
  },
};

/** Templates enough that their list is taller than a short window: twenty fields of a record. */
const MANY_TAGS = {
  template: {
    label: 'Templates',
    items: Array.from({ length: 20 }, (_, index) => ({
      label: `field_${index + 1}`,
      value: `$.field_${index + 1}`,
    })),
  },
};

/** A scrolling page with the field 200px down it, and room below to scroll into. */
const aShortWayDown = (Story: any) => (
  <div style={{ height: '100vh', overflowY: 'auto' }} className='story-scroller'>
    <div style={{ height: 200 }} />
    <Story />
    <div style={{ height: '150vh' }} />
  </div>
);

/**
 * In a window shorter than the list, clicking the field opens the list, and it stays open: the field is scrolled
 * at most to the top of the page, never out of it, and the list takes the room under it.
 */
const expectTheListOpensBelowTheFieldInView = async (
  doc: Document,
  open: (editor: HTMLElement) => Promise<void>
) => {
  const editor = await editorIn(doc);
  const control = (editor.closest('.reqore-control-wrapper') as HTMLElement) ?? editor;
  const scroller = doc.querySelector<HTMLElement>('.story-scroller')!;

  await open(editor);
  await waitFor(() => expect(listIsOpen(doc)).toBe(true));
  // what the click put in motion - the page scrolled to make room - has been drawn, and the list is still open
  await afterTwoFrames(doc.defaultView!);
  await afterTwoFrames(doc.defaultView!);

  await waitFor(async () => {
    const list = doc.querySelector<HTMLElement>('.reqore-popover-content');
    await expect(list, 'the list stays open').toBeTruthy();
    const field = control.getBoundingClientRect();
    const shownFrom = Math.max(scroller.getBoundingClientRect().top, 0);
    // the field is in view: not scrolled above the top of the page
    await expect(field.top).toBeGreaterThanOrEqual(shownFrom - 0.5);
    await expect(field.bottom).toBeLessThanOrEqual(doc.documentElement.clientHeight + 0.5);
    const rect = list!.getBoundingClientRect();
    // below the field, on screen, and tall enough to read
    await expect(Math.round(rect.top)).toBeGreaterThanOrEqual(Math.round(field.bottom) - 1);
    await expect(rect.bottom).toBeLessThanOrEqual(doc.documentElement.clientHeight + 1);
    await expect(rect.height).toBeGreaterThan(90);
  });
};

export const TheListOpensInAShortWindow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a reference field 200px down a scrolling page, in a window 380px high, shorter than its list of twenty templates. When it is clicked, the list opens below the field and stays open: the page is scrolled until the field is at its top, never past it, and the list takes the room left under the field. Before, the page was scrolled by the whole list, the field went out of view, and the list closed as it opened (qorus#646).',
      },
    },
    qlip: { viewport: { width: 980, height: 380 } },
  },
  args: {
    value: [{ type: 'paragraph', children: [{ text: '' }] }],
    tags: MANY_TAGS,
    onChange: fn(),
  },
  decorators: [aShortWayDown],
  play: async ({ canvasElement }) => {
    await withViewport(980, 380, async () => {
      await expectTheListOpensBelowTheFieldInView(canvasElement.ownerDocument, (editor) =>
        userEvent.click(editor)
      );
    });
  },
};

export const TheListOpensOnAPhoneInLandscape: Story = {
  tags: ['touch'],
  parameters: {
    docs: {
      description: {
        story:
          'The same field on a phone turned on its side (844 × 390): a tap on the field opens its list of twenty templates below it, and it stays open, the field still in view at the top of the page.',
      },
    },
    qlip: { viewport: { width: 844, height: 390 } },
  },
  args: {
    value: [{ type: 'paragraph', children: [{ text: '' }] }],
    tags: MANY_TAGS,
    onChange: fn(),
  },
  decorators: [aShortWayDown],
  play: async ({ canvasElement }) => {
    // a phone on its side: the touch screen at 844 x 390
    await withTouchScreen(
      async (touch) => {
        await expectTheListOpensBelowTheFieldInView(canvasElement.ownerDocument, (editor) =>
          touch.tap(editor)
        );
      },
      { width: 844, height: 390 }
    );
  },
};
