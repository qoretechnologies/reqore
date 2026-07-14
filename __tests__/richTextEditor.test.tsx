import { fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import {
  ReqoreContent,
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
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRichTextEditor
            ref={ref}
            value={emptyValue}
            onChange={() => undefined}
            onFocus={onFocus}
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
  expect(ref.current?.selection).toEqual({
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  });
});
