// Copyright 2026 Qore Technologies, s.r.o.
import { act, render } from '@testing-library/react';
import { createRef, startTransition, useLayoutEffect, useState } from 'react';
import { Editor, Transforms } from 'slate';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreRichTextEditor,
  ReqoreUIProvider,
  TReqoreRichTextEditorRef,
} from '../src';

/**
 * A value the editor is given is compared with its document when it is committed, not later.
 *
 * The comparison ran in a passive effect, which the browser runs after painting - and, under load, after
 * the next key. A value that matched the document when it was rendered was compared with a document that
 * had a key more by then, read as a value from outside, and put in place of the document: the key was lost
 * and the caret went to the end (reqraft's With Markdown Docs typed "arr.for" and got "arr.fr" in CI).
 */
const doc = (text: string) => [{ type: 'paragraph' as const, children: [{ text }] }];
const textOf = (editor: TReqoreRichTextEditorRef) => Editor.string(editor as never, []);

let setValue: (text: string) => void = () => undefined;
/** Runs once the commit that renders a new value is laid out - before its passive effects. */
let onCommit: (() => void) | undefined;

const CommitProbe = ({ value }: { value: string }) => {
  useLayoutEffect(() => {
    const run = onCommit;
    onCommit = undefined;
    run?.();
  }, [value]);
  return null;
};

const Host = ({ editorRef }: { editorRef: React.RefObject<TReqoreRichTextEditorRef> }) => {
  const [value, setState] = useState('ab');
  setValue = setState;
  return (
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRichTextEditor ref={editorRef} value={doc(value)} onChange={() => undefined} />
          <CommitProbe value={value} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

test('a key typed between a value and its passive effects is kept', async () => {
  const editorRef = createRef<TReqoreRichTextEditorRef>();
  render(<Host editorRef={editorRef} />);
  const editor = editorRef.current!;
  // the user typed "c": the editor holds "abc", and its host hands that back
  act(() => {
    Transforms.select(editor as never, Editor.end(editor as never, []));
    Transforms.insertText(editor as never, 'c');
  });
  expect(textOf(editor)).toBe('abc');
  // the host's render of "abc" is committed; before its passive effects run, the next key comes in
  onCommit = () => Transforms.insertText(editor as never, 'd');
  await act(async () => {
    startTransition(() => setValue('abc'));
  });
  // the key is kept: "abc" matched the document when it was committed, and is not applied after
  expect(textOf(editor)).toBe('abcd');
});

test('a value from outside still replaces the document', async () => {
  const editorRef = createRef<TReqoreRichTextEditorRef>();
  render(<Host editorRef={editorRef} />);
  await act(async () => {
    setValue('x == 1');
  });
  expect(textOf(editorRef.current!)).toBe('x == 1');
});
