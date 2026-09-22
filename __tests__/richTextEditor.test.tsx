import { fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import {
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreLayoutContent,
  ReqoreRichTextEditor,
  ReqoreUIProvider,
  TReqoreRichTextEditorRef,
} from '../src';

const emptyValue = [
  {
    type: 'paragraph' as const,
    children: [{ text: '' }],
  },
];

test('establishes an empty-editor selection on focus for Firefox input', () => {
  const ref = createRef<TReqoreRichTextEditorRef>();
  const onFocus = vi.fn();
  const onFocusCapture = vi.fn();
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRichTextEditor
            ref={ref}
            value={emptyValue}
            onChange={() => undefined}
            onFocus={onFocus}
            onFocusCapture={onFocusCapture}
            placeholder='Ask a question…'
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const editor = document.querySelector('[contenteditable="true"]');

  expect(editor).toHaveAttribute('role', 'textbox');
  expect(editor?.querySelector('p > [contenteditable="false"]')).toHaveTextContent(
    'Ask a question…'
  );
  expect(editor?.querySelector('[data-slate-zero-width]')).not.toBeNull();
  expect(ref.current?.selection).toBeNull();

  fireEvent.focusIn(editor!);

  expect(onFocus).toHaveBeenCalledOnce();
  // A consumer-provided capture-phase handler must be chained, not swallowed
  // by the internal focus handler wired to `onFocusCapture`.
  expect(onFocusCapture).toHaveBeenCalledOnce();
  expect(ref.current?.selection).toEqual({
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  });
});

test('does not pass a React ref to Slate Editable', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRichTextEditor value={emptyValue} onChange={() => undefined} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('[contenteditable="true"]')).not.toBeNull();
  expect(
    consoleError.mock.calls.some(([message]) =>
      String(message).includes('Function components cannot be given refs')
    )
  ).toBe(false);

  consoleError.mockRestore();
});

test('keeps Reqore styling props off the editor element', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const decorate = vi.fn(() => []);
  const customRenderLeaf = vi.fn((props: any) => <span {...props.attributes}>{props.children}</span>);

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          {/* A control group injects `flat` / `spaceBetween` into every non-tag
              child, and `transparent` is a plain textarea prop — between them
              they cover both React warning shapes. */}
          <ReqoreControlGroup spaceBetween fluid flat>
            <ReqoreRichTextEditor
              value={[{ type: 'paragraph' as const, children: [{ text: 'body' }] }]}
              onChange={() => undefined}
              customRenderLeaf={customRenderLeaf}
              decorate={decorate}
              transparent
            />
          </ReqoreControlGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const editor = document.querySelector('[contenteditable="true"]');

  expect(editor).not.toBeNull();
  // Reqore's own presentational props, the theming payloads, and the
  // textarea-shaped props a contenteditable div cannot use — `value` above all,
  // which would otherwise write the whole serialized document into an attribute.
  expect(
    [
      '_size',
      'cols',
      'effect',
      'flat',
      'minimal',
      'rounded',
      'rows',
      'spacebetween',
      'theme',
      'transparent',
      'value',
    ].filter((attribute) => editor!.hasAttribute(attribute))
  ).toEqual([]);

  // `decorate` and the renderers are not DOM attributes, so a naive
  // DOM-validity filter would drop them and the editor would silently stop
  // decorating.
  expect(decorate).toHaveBeenCalled();
  expect(customRenderLeaf).toHaveBeenCalled();

  expect(
    consoleError.mock.calls.filter(([message]) =>
      /non-boolean attribute|does not recognize the/.test(String(message))
    )
  ).toEqual([]);

  consoleError.mockRestore();
});

/**
 * A caret a click placed is Slate's caret at once — not a throttle later.
 *
 * slate-react adopts the browser's caret through a `selectionchange` handler
 * throttled to 100ms. Until it runs, Slate's own selection is still `null`,
 * and two things go wrong in that window:
 *
 * - `repairCaretBesideVoid`, which exists for exactly this click, returns
 *   without doing anything — it reads `editor.selection` first.
 * - any re-render of the editable treats a browser caret with no Slate
 *   selection as stale and REMOVES it. That removal is itself a selection
 *   change, it spends the throttle window, and the click's own change is pushed
 *   to the trailing edge. A key pressed before then is dropped, and by the time
 *   the handler runs there is no caret left to adopt: the field reads as
 *   frozen. Measured in the Qorus test editor as a model selection of `null` at
 *   the first keystroke while the browser caret sat correctly beside the chip.
 *
 * Adopting the caret in the click's own handler closes the window. The
 * assertion is taken IMMEDIATELY after the mouseup, before any timer can run,
 * because the throttled path is the one this must not depend on.
 */
/* jsdom does not implement `isContentEditable`, and slate-react reads it to
   decide whether a caret is inside an editable region — a real browser always
   answers. Without this, jsdom accepts a caret only in a zero-width node and
   the plain-text case below would be testing jsdom rather than the editor.
   Browser semantics: the nearest explicit `contenteditable` decides. */
const isContentEditableDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'isContentEditable'
);

beforeAll(() => {
  if (typeof document.createElement('div').isContentEditable === 'boolean') {
    return;
  }
  Object.defineProperty(HTMLElement.prototype, 'isContentEditable', {
    configurable: true,
    get(this: HTMLElement) {
      const host = this.closest('[contenteditable]');
      const mode = host?.getAttribute('contenteditable');
      return mode === '' || mode === 'true' || mode === 'plaintext-only';
    },
  });
});

afterAll(() => {
  if (isContentEditableDescriptor) {
    Object.defineProperty(HTMLElement.prototype, 'isContentEditable', isContentEditableDescriptor);
  } else {
    delete (HTMLElement.prototype as { isContentEditable?: boolean }).isContentEditable;
  }
});

const valueWithTag = [
  {
    type: 'paragraph' as const,
    children: [
      { text: 'before' },
      { type: 'tag' as const, value: '$.result', label: 'result', children: [{ text: '' }] },
      { text: '' },
    ],
  },
];

const renderWithTag = (ref: ReturnType<typeof createRef<TReqoreRichTextEditorRef>>) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRichTextEditor
            ref={ref}
            value={valueWithTag as never}
            onChange={() => undefined}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

/** Put the browser caret where a click would, and release the mouse. */
const clickAt = (editable: HTMLElement, node: Node, offset: number) => {
  const selection = document.getSelection()!;
  selection.removeAllRanges();
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  selection.addRange(range);
  fireEvent.mouseUp(editable);
};

test('adopts a click beside a chip into the editor selection immediately', () => {
  const ref = createRef<TReqoreRichTextEditorRef>();
  renderWithTag(ref);
  const editable = document.querySelector<HTMLElement>('[contenteditable="true"]')!;

  expect(ref.current?.selection).toBeNull();

  // The empty text AFTER the chip is rendered as a zero-width node; that is
  // where the browser leaves the caret for a click beside the chip.
  const zeroWidths = editable.querySelectorAll('[data-slate-zero-width]');
  const trailing = zeroWidths[zeroWidths.length - 1];
  clickAt(editable, trailing.firstChild!, 1);

  expect(ref.current?.selection).toEqual({
    anchor: { path: [0, 2], offset: 0 },
    focus: { path: [0, 2], offset: 0 },
  });
});

test('adopts a click in ordinary text immediately, too', () => {
  const ref = createRef<TReqoreRichTextEditorRef>();
  renderWithTag(ref);
  const editable = document.querySelector<HTMLElement>('[contenteditable="true"]')!;

  const before = Array.from(editable.querySelectorAll('[data-slate-string]')).find(
    (el) => el.textContent === 'before'
  )!;
  clickAt(editable, before.firstChild!, 3);

  expect(ref.current?.selection).toEqual({
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 3 },
  });
});

test('leaves the selection alone for a caret outside the editor', () => {
  const ref = createRef<TReqoreRichTextEditorRef>();
  renderWithTag(ref);
  const editable = document.querySelector<HTMLElement>('[contenteditable="true"]')!;

  // A mouseup that reaches the editor while the caret is somewhere else in the
  // page — a drag that ended over it — is not a click INTO it.
  const outside = document.createElement('p');
  outside.textContent = 'elsewhere';
  document.body.appendChild(outside);
  clickAt(editable, outside.firstChild!, 2);

  expect(ref.current?.selection).toBeNull();
  outside.remove();
});

test('adopts nothing while read-only', () => {
  const ref = createRef<TReqoreRichTextEditorRef>();
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRichTextEditor
            ref={ref}
            value={valueWithTag as never}
            onChange={() => undefined}
            readOnly
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
  const editable = document.querySelector<HTMLElement>('[contenteditable]')!;
  const before = Array.from(editable.querySelectorAll('[data-slate-string]')).find(
    (el) => el.textContent === 'before'
  )!;
  clickAt(editable, before.firstChild!, 3);

  expect(ref.current?.selection).toBeNull();
});
