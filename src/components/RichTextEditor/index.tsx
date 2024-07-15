import { createEditor } from 'slate';
import { Editable, Slate, useSelected, withReact } from 'slate-react';

// TypeScript users only add this code
import { useCallback, useState } from 'react';
import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import ReqoreButton from '../Button';
import { ReqoreP } from '../Paragraph';

type CustomElement = { type: 'paragraph' | 'template'; children: CustomText[] };
type CustomText = { text: string };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
  {
    type: 'template',
    children: [{ text: 'Test' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
];

export const TemplateElement = (props) => {
  const selected = useSelected();

  console.log({ selected, props });

  return (
    <>
      <ReqoreButton
        {...props.attributes}
        contentEditable={false}
        intent={selected ? 'info' : undefined}
        icon='MoneyDollarCircleLine'
        size='small'
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {props.element.children[0].text}
      </ReqoreButton>
      {props.children}
    </>
  );
};

export const DefaultElement = (props) => <ReqoreP {...props.attributes}>{props.children}</ReqoreP>;

export const ReqoreRichTextEditor = () => {
  // Create a Slate editor object that won't change across renders.
  const [editor] = useState(() => withReact(createEditor()));

  editor.isVoid = (element) => element.type === 'template';
  editor.isInline = (element) => element.type === 'template';

  // Define a rendering function based on the element passed to `props`. We use
  // `useCallback` here to memoize the function for subsequent renders.
  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case 'template':
        return <TemplateElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  return (
    <Slate editor={editor} initialValue={initialValue as any}>
      <Editable renderElement={renderElement} />
    </Slate>
  );
};
