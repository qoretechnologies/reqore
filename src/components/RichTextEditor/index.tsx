import { map, size } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { BaseEditor, createEditor, Editor, Range, Transforms } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, useSelected, withReact } from 'slate-react';
import {
  EditableProps,
  RenderElementProps,
  RenderLeafProps,
} from 'slate-react/dist/components/editable';
import { ReqoreButton, ReqoreControlGroup, ReqorePanel, ReqoreTextarea } from '../..';
import { getOneLessSize } from '../../helpers/utils';
import { IReqoreDropdownProps } from '../Dropdown';
import { IReqoreDropdownItemProps } from '../Dropdown/item';
import { IReqorePanelAction, IReqorePanelProps } from '../Panel';
import { ReqoreP } from '../Paragraph';
import { ReqoreSpan } from '../Span';
import ReqoreTag, { IReqoreTagProps } from '../Tag';
import { IReqoreTextareaProps } from '../Textarea';

type CustomElement = {
  type: 'paragraph' | 'tag';
  value?: string | number;
  label?: string | number;
  children: CustomText[];
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  text?: string;
};
type CustomText =
  | CustomElement
  | { text: string; bold?: boolean; italic?: boolean; underline?: boolean; code?: boolean };

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
  onChange: (value: CustomElement[]) => void;
  tags?: {
    [key: string]: Partial<IReqoreDropdownItemProps> & {
      items?: IReqoreDropdownProps['items'];
    };
  };
  getTagProps?: (tag: CustomElement) => IReqoreTagProps;
  onTagClick?: (tag: CustomElement) => void;
  tagsProps?: IReqoreTagProps;
  tagsListProps: Omit<IReqoreDropdownProps, 'items'> & EditableProps;
  panelProps?: IReqorePanelProps;

  actions?: {
    styling?: boolean;
    undo?: boolean;
    redo?: boolean;
  };
}

export const TemplateElement = (props: RenderElementProps & { tagProps: IReqoreTagProps }) => {
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
        tooltip={props.element.value?.toString()}
        label={props.element.label}
        {...props.tagProps}
        contentEditable={false}
        intent={selected ? 'info' : props.tagProps?.intent}
      />
      {props.children}
    </>
  );
};

export const withTemplates = (editor: HistoryEditor & ReactEditor) => {
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

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
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
    <ReqoreSpan
      inline
      {...attributes}
      effect={{
        weight: leaf.bold ? 'bold' : 'normal',
        italic: leaf.italic,
        underline: leaf.underline,
      }}
    >
      {children}
    </ReqoreSpan>
  );
};

export const DefaultElement = (props: RenderElementProps) => (
  <ReqoreP {...props.attributes}>{props.children}</ReqoreP>
);

const insertTag = (editor: Editor, value: string | number, label: string | number) => {
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
  onTagClick,
  tagsListProps,
  panelProps,
  actions,
  ...rest
}: IReqoreRichTextEditorProps) => {
  // Create a Slate editor object that won't change across renders.
  const [editor] = useState(() => withTemplates(withReact(withHistory(createEditor()))));
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
              onClick:
                !rest.readOnly && !rest.disabled
                  ? (event) => {
                      onTagClick?.(props.element);
                      finalProps.onClick?.(event);
                    }
                  : undefined,
              onRemoveClick:
                !rest.readOnly && !rest.disabled
                  ? () => {
                      Transforms.removeNodes(editor, {
                        at: ReactEditor.findPath(editor, props.element),
                      });
                    }
                  : undefined,
            }}
          />
        );
      }
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);

  const isEmpty = useMemo(() => {
    return size(value) === 1 && size(value[0].children) === 1 && value[0].children[0].text === '';
  }, [value]);

  const isMarkActive = useCallback(
    (editor: Editor, format: string) => {
      const marks = Editor.marks(editor);
      return marks ? marks[format] === true : false;
    },
    [editor, Editor, target]
  );

  const toggleMark = useCallback((editor: Editor, format: string) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  }, []);

  const panelActions = useMemo<IReqorePanelAction[]>(() => {
    const _actions: IReqorePanelAction[] = [...(panelProps?.actions || [])];

    if (!actions) {
      return _actions;
    }

    if (actions.styling) {
      _actions.push({
        group: [
          {
            icon: 'Bold',
            compact: true,
            intent: isMarkActive(editor, 'bold') ? 'info' : undefined,
            onMouseDown: () => {
              toggleMark(editor, 'bold');
            },
          },
          {
            icon: 'Italic',
            compact: true,
            intent: isMarkActive(editor, 'italic') ? 'info' : undefined,
            onMouseDown: () => {
              toggleMark(editor, 'italic');
            },
          },
          {
            icon: 'Underline',
            compact: true,
            intent: isMarkActive(editor, 'underline') ? 'info' : undefined,
            onMouseDown: () => {
              toggleMark(editor, 'underline');
            },
          },
        ],
      });
    }

    if (actions.undo || actions.redo) {
      const undoRedoActions: IReqorePanelAction = {
        fixed: true,
        group: [],
      };

      if (actions.undo) {
        undoRedoActions.group.push({
          disabled: editor.history.undos.length === 0,
          compact: true,
          icon: 'ArrowGoBackLine',
          onClick: () => {
            editor.undo();
          },
        });
      }

      if (actions.redo) {
        undoRedoActions.group.push({
          disabled: editor.history.redos.length === 0,
          compact: true,
          icon: 'ArrowGoForwardLine',
          onClick: () => {
            editor.redo();
          },
        });
      }

      _actions.push(undoRedoActions);
    }

    return _actions;
  }, [actions, value, target, Editor.marks(editor), editor]);

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
    <ReqorePanel flat padded={false} minimal transparent size='small' {...panelProps}>
      <Slate
        editor={editor}
        initialValue={value as any}
        onChange={(data) => {
          const { selection } = editor;

          setTarget(selection);
          onChange?.(data as CustomElement[]);
        }}
      >
        <ReqoreTextarea<Pick<EditableProps, 'renderElement' | 'renderLeaf'>>
          {...rest}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          as={Editable}
          style={{
            lineHeight: 1.5,
            outline: 'none',
          }}
          onClearClick={
            isEmpty
              ? undefined
              : () => {
                  Transforms.delete(editor, {
                    at: {
                      anchor: Editor.start(editor, []),
                      focus: Editor.end(editor, []),
                    },
                  });
                  // Focus the editor
                  ReactEditor.focus(editor);
                }
          }
          value={JSON.stringify(value || [])}
          onChange={useCallback(() => {}, [])}
          templates={{
            customElements: size(panelActions)
              ? [
                  <ReqoreControlGroup spaceBetween size='small' key={0}>
                    {panelActions.map((action, index) => {
                      if (action.group) {
                        return (
                          <ReqoreControlGroup stack key={index}>
                            {action.group?.map((action, index) => (
                              <ReqoreButton key={index} {...action} />
                            ))}
                          </ReqoreControlGroup>
                        );
                      }

                      return <ReqoreButton key={index} {...action} />;
                    })}
                  </ReqoreControlGroup>,
                ]
              : undefined,
            ...tagsListProps,
            items,
            closeOnInsideClick: false,
            onItemSelect: (item) => {
              if (item.value) {
                Transforms.select(editor, target);
                insertTag(editor, item.value, item.label);
                ReactEditor.focus(editor);
              }
            },
          }}
        />
      </Slate>
    </ReqorePanel>
  );
};
