import { map, size } from 'lodash';
import { memo, useCallback, useMemo, useState } from 'react';
import { useUpdateEffect } from 'react-use';
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
  metadata?: Record<string, any>;
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
  tagsListProps?: Omit<IReqoreDropdownProps, 'items'> & EditableProps;
  panelProps?: IReqorePanelProps;

  actions?: {
    styling?: boolean;
    undo?: boolean;
    redo?: boolean;
  };
}

export const TemplateElement = memo((props: RenderElementProps & { tagProps: IReqoreTagProps }) => {
  const selected = useSelected();

  const handleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <>
      <ReqoreTag
        {...props.attributes}
        compact
        flat={false}
        asBadge
        fixed='key'
        onClick={handleClick}
        tooltip={props.element.value?.toString()}
        label={props.element.label}
        {...props.tagProps}
        contentEditable={false}
        intent={selected ? 'info' : props.tagProps?.intent}
      />
      {props.children}
    </>
  );
});

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

const insertTag = (
  editor: Editor,
  value: string | number,
  label: string | number,
  metadata: CustomElement['metadata']
) => {
  const mention: CustomElement = {
    type: 'tag',
    value,
    label,
    metadata,
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
  tagsListProps = {},
  panelProps,
  actions,
  ...rest
}: IReqoreRichTextEditorProps) => {
  // Create a Slate editor object that won't change across renders.
  const [editor] = useState(() => withTemplates(withReact(withHistory(createEditor()))));
  const [target, setTarget] = useState<Range | undefined>();

  useUpdateEffect(() => {
    // Only update the editor's children if the value has changed
    if (JSON.stringify(value) === JSON.stringify(editor.children)) {
      return;
    }
    // Use Slate transforms instead of direct mutation
    try {
      Editor.withoutNormalizing(editor, () => {
        // Deselect before replacing content
        Transforms.deselect(editor);
        // Remove all existing top-level nodes
        while (editor.children.length) {
          Transforms.removeNodes(editor, { at: [0] });
        }
        // Insert new content
        Transforms.insertNodes(editor, value, { at: [0] });
        // Move selection to end
        Transforms.select(editor, Editor.end(editor, []));
      });
    } catch (error) {
      // Fallback to direct mutation if transforms fail
      editor.selection = null;
      editor.children = value;
    }
  }, [JSON.stringify(value)]);

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
                      try {
                        const path = ReactEditor.findPath(editor, props.element);
                        Transforms.removeNodes(editor, { at: path });
                      } catch (error) {
                        // Element may no longer be in the editor
                        console.warn('Failed to remove tag:', error);
                      }
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

  const isMarkActive = useCallback((editor: Editor, format: string) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  }, []);

  const toggleMark = useCallback(
    (editor: Editor, format: string) => {
      const isActive = isMarkActive(editor, format);

      if (isActive) {
        Editor.removeMark(editor, format);
      } else {
        Editor.addMark(editor, format, true);
      }
    },
    [isMarkActive]
  );

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
            active: isMarkActive(editor, 'bold') ? true : undefined,
            onMouseDown: () => {
              toggleMark(editor, 'bold');
            },
          },
          {
            icon: 'Italic',
            compact: true,
            active: isMarkActive(editor, 'italic') ? true : undefined,
            onMouseDown: () => {
              toggleMark(editor, 'italic');
            },
          },
          {
            icon: 'Underline',
            compact: true,
            active: isMarkActive(editor, 'underline') ? true : undefined,
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
          fixed: true,
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
          fixed: true,
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
                  try {
                    ReactEditor.focus(editor);
                  } catch (error) {
                    // Editor may not be mounted
                  }
                }
          }
          value={JSON.stringify(value || [])}
          onChange={useCallback(() => {}, [])}
          templates={{
            customElements: size(panelActions)
              ? [
                  <ReqoreControlGroup spaceBetween size='small' key={0} fixed>
                    {panelActions.map((action, index) => {
                      if (action.group) {
                        return (
                          <ReqoreControlGroup stack key={index}>
                            {action.group?.map((action, index) => (
                              <ReqoreButton
                                key={index}
                                customTheme={tagsListProps?.listCustomTheme}
                                intent={tagsListProps?.listIntent}
                                {...action}
                              />
                            ))}
                          </ReqoreControlGroup>
                        );
                      }

                      return (
                        <ReqoreButton
                          key={index}
                          customTheme={tagsListProps?.listCustomTheme}
                          intent={tagsListProps?.listIntent}
                          {...action}
                        />
                      );
                    })}
                  </ReqoreControlGroup>,
                ]
              : undefined,
            ...tagsListProps,
            items,
            closeOnInsideClick: false,
            onItemSelect: (item) => {
              if (item.value) {
                try {
                  // Use current selection or fallback to end of document
                  const selection = editor.selection || {
                    anchor: Editor.end(editor, []),
                    focus: Editor.end(editor, []),
                  };
                  Transforms.select(editor, selection);
                  insertTag(editor, item.value, item.label, item.metadata);
                  ReactEditor.focus(editor);
                } catch (error) {
                  // Fallback: just insert at current position
                  try {
                    insertTag(editor, item.value, item.label, item.metadata);
                  } catch (e) {
                    console.warn('Failed to insert tag:', e);
                  }
                }
              }
            },
          }}
        />
      </Slate>
    </ReqorePanel>
  );
};
