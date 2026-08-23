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
