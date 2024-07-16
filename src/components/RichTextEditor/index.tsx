import { map, size } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { BaseEditor, createEditor, Descendant, Range, Transforms } from 'slate';
import { Editable, ReactEditor, Slate, useSelected, withReact } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { ReqoreDropdown, ReqoreTextarea } from '../..';
import { getOneLessSize } from '../../helpers/utils';
import { IReqoreDropdownProps } from '../Dropdown';
import { IReqoreDropdownItemProps } from '../Dropdown/item';
import { ReqoreP } from '../Paragraph';
import { ReqoreSpan } from '../Span';
import ReqoreTag, { IReqoreTagProps } from '../Tag';
import { IReqoreTextareaProps } from '../Textarea';

type CustomElement = {
  type: 'paragraph' | 'tag';
  value?: string;
  label?: string;
  children: CustomText[];
};
type CustomText = CustomElement | { text: string };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export interface IReqoreRichTextEditorProps
  extends Omit<IReqoreTextareaProps, 'value' | 'onChange'> {
  value: CustomElement[];
  onChange: (value: Descendant[]) => void;
  tags?: {
    [key: string]: Partial<IReqoreDropdownItemProps> & {
      items?: IReqoreDropdownProps['items'];
    };
  };
  getTagProps?: (tag: CustomElement) => IReqoreTagProps;
  tagsProps?: IReqoreTagProps;
  tagsListProps: Omit<IReqoreDropdownProps, 'items'> & EditableProps;
}

export const TemplateElement = (props) => {
  const selected = useSelected();

  return (
    <>
      <ReqoreTag
        {...props.attributes}
        compact
        labelEffect={{ weight: 'normal' }}
        flat={false}
        asBadge
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        tooltip={props.element.value}
        label={props.element.label}
        onRemoveClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        {...props.tagProps}
        contentEditable={false}
        intent={selected ? 'info' : props.tagProps?.intent}
      />
      {props.children}
    </>
  );
};

export const withTemplates = (editor: BaseEditor & ReactEditor) => {
  const { isInline, isVoid, markableVoid } = editor;

  editor.isInline = (element) => {
    return element.type === 'tag' ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return element.type === 'tag' ? true : isVoid(element);
  };

  editor.markableVoid = (element) => {
    return element.type === 'tag' || markableVoid(element);
  };

  return editor;
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return (
    <ReqoreSpan inline {...attributes}>
      {children}
    </ReqoreSpan>
  );
};

export const DefaultElement = (props) => <ReqoreP {...props.attributes}>{props.children}</ReqoreP>;

const insertTag = (editor, value, label) => {
  const mention: CustomElement = {
    type: 'tag',
    value,
    label,
    children: [{ text: '' }],
  };
  Transforms.insertNodes(editor, mention);
  Transforms.move(editor);
};

export const ReqoreRichTextEditor = ({
  value = [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ],
  onChange,
  tags,
  getTagProps = () => ({}),
  tagsProps = {},
  tagsListProps,
  ...rest
}: IReqoreRichTextEditorProps) => {
  // Create a Slate editor object that won't change across renders.
  const [editor] = useState(() => withTemplates(withReact(createEditor())));
  const [target, setTarget] = useState<Range | undefined>();

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case 'tag': {
        const tagProps = getTagProps(props.element);
        const finalProps = {
          ...tagsProps,
          ...tagProps,
        };

        return (
          <TemplateElement
            {...props}
            tagProps={{
              ...finalProps,
              size: rest.size ? getOneLessSize(rest.size) : finalProps.size || 'small',
            }}
          />
        );
      }
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const EditorWithRef = useMemo(
    () => (props) => {
      return (
        <ReqoreTextarea
          {...props}
          {...rest}
          as={Editable}
          style={{
            lineHeight: 1.5,
            outline: 'none',
          }}
          onClearClick={() => {
            onChange([{ type: 'paragraph', children: [{ text: '' }] }]);
          }}
        />
      );
    },
    []
  );

  const items: IReqoreDropdownProps['items'] = useMemo(() => {
    if (size(tags)) {
      return map(tags, ({ items, ...tag }, key) => ({
        label: tag.label || key,
        ...tag,
        items,
      }));
    }

    return undefined;
  }, [tags]);

  return (
    <Slate
      editor={editor}
      initialValue={value as any}
      onChange={(data) => {
        const { selection } = editor;

        setTarget(selection);

        onChange(data);
      }}
    >
      <ReqoreTextarea
        {...rest}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        as={Editable}
        style={{
          lineHeight: 1.5,
          outline: 'none',
        }}
        onClearClick={() => {
          onChange([{ type: 'paragraph', children: [{ text: '' }] }]);
        }}
        templates={{
          ...tagsListProps,
          items,
          onItemSelect: (item) => {
            if (item.value) {
              Transforms.select(editor, target);
              insertTag(editor, item.value, item.label);
              ReactEditor.focus(editor);
            }
          },
        }}
      />
      <ReqoreDropdown<EditableProps>
        component={EditorWithRef}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        handler='focus'
        useTargetWidth
        filterable
        items={items}
        onItemSelect={(item) => {
          if (item.value) {
            Transforms.select(editor, target);
            insertTag(editor, item.value, item.label);
            ReactEditor.focus(editor);
          }
        }}
        {...tagsListProps}
      />
    </Slate>
  );
};
