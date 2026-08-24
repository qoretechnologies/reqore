import isPropValid from '@emotion/is-prop-valid';
import { map, size } from 'lodash';
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useState } from 'react';
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
import { IReqoreSpanProps, ReqoreSpan } from '../Span';
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
  customRenderLeaf?: (props: RenderLeafProps) => JSX.Element;
  /**
   * Slate `decorate` function. Receives a `[Node, Path]` entry and returns
   * `Range[]` with custom properties applied to each range. Each range's
   * properties are then passed to `renderLeaf` / `customRenderLeaf` as leaf
   * marks, which is the standard Slate way to overlay syntax highlighting,
   * search highlights, error underlines, etc. on top of the document without
   * mutating it.
   */
  decorate?: EditableProps['decorate'];
  getTagProps?: (tag: CustomElement) => IReqoreTagProps;
  onTagClick?: (tag: CustomElement) => void;
  tagsProps?: IReqoreTagProps;
  tagsListProps?: Omit<IReqoreDropdownProps, 'items'> & EditableProps;
  panelProps?: IReqorePanelProps;

  placeholderProps?: IReqoreSpanProps;
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

export const DefaultElement = (
  props: RenderElementProps & { placeholder?: string; placeholderProps?: IReqoreSpanProps }
) => (
  <ReqoreP {...props.attributes} style={{ position: 'relative' }}>
    {props.placeholder && (
      <ReqoreSpan
        inline
        effect={{ opacity: 0.3 }}
        {...props.placeholderProps}
        contentEditable={false}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          pointerEvents: 'none',
          userSelect: 'none',
          ...props.placeholderProps?.style,
        }}
      >
        {props.placeholder}
      </ReqoreSpan>
    )}
    {props.children}
  </ReqoreP>
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

export type TReqoreRichTextEditorRef = BaseEditor & ReactEditor & HistoryEditor;

/**
 * Slate props that are not DOM attributes and must survive the filter below.
 *
 * `isPropValid` only knows HTML/SVG attributes, so without this list the very
 * props that make the editor work -- the renderers, the decorator -- would be
 * dropped along with Reqore's styling props.
 */
const SLATE_EDITABLE_PROPS = new Set<string>([
  'as',
  'decorate',
  'disableDefaultStyles',
  'onDOMBeforeInput',
  'renderElement',
  'renderLeaf',
  'renderPlaceholder',
  'scrollSelectionIntoView',
]);

/**
 * Props that survive `isPropValid` but that Slate's editable cannot use.
 *
 * `EditableProps` widens to `TextareaHTMLAttributes`, so `rows` / `cols` /
 * `value` read as valid DOM props -- but the element underneath is a
 * contenteditable `div`, where the first two mean nothing and `value` writes
 * the entire serialized document into an attribute on every keystroke.
 * Reqore's `fill` (a flex instruction a control group injects into every child)
 * survives for a different reason: it is a real SVG paint attribute, and this
 * element is not an SVG.
 */
const NON_EDITABLE_PROPS = new Set<string>(['cols', 'fill', 'rows', 'value']);

/**
 * `ReqoreTextarea` is polymorphic and attaches an input ref to its rendered component. Slate's
 * `Editable` owns its DOM node through `ReactEditor` and intentionally does not accept a React
 * ref. Present a ref-capable boundary to the polymorphic textarea while leaving Slate in charge
 * of its DOM mapping; rich-text focus and selection are handled through `ReactEditor` below.
 *
 * The boundary also filters props, because this is the one place where Reqore's
 * styling props reach an element Reqore does not render. `omitStyleProps`
 * deliberately forwards everything when the styled target is a component rather
 * than a tag -- that is what keeps `renderElement` / `renderLeaf` / `decorate`
 * working -- but `Editable` is a pass-through: whatever it does not recognise
 * lands on its `div`. So `transparent`, `flat`, `rounded` and `spaceBetween`
 * reached the DOM and React warned about each one on every mount, while
 * `theme`, `effect`, `_size` and the serialized Slate `value` were written out
 * silently. Apply the same rule styled-components applies for a tag target,
 * plus the Slate props it has no way to know about.
 */
const RefSafeSlateEditable = memo(
  forwardRef<HTMLDivElement, EditableProps>((props, ref) => {
    // Accept the polymorphic input's DOM-ref contract without passing it to
    // Slate's function component. Slate owns this element through ReactEditor.
    void ref;

    // Not memoised: `memo` above already skips the re-render when the props are
    // shallow-equal, so every render that reaches here has new props to filter.
    const editableProps = Object.keys(props).reduce<Record<string, unknown>>((acc, key) => {
      if (!NON_EDITABLE_PROPS.has(key) && (SLATE_EDITABLE_PROPS.has(key) || isPropValid(key))) {
        acc[key] = props[key];
      }

      return acc;
    }, {});

    return <Editable {...editableProps} />;
  })
);

RefSafeSlateEditable.displayName = 'RefSafeSlateEditable';

export const ReqoreRichTextEditor = forwardRef<
  TReqoreRichTextEditorRef,
  IReqoreRichTextEditorProps
>(
  (
    {
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
      customRenderLeaf,
      decorate,
      placeholder,
      placeholderProps,
      onFocus,
      onFocusCapture,
      ...rest
    }: IReqoreRichTextEditorProps,
    ref
  ) => {
    // Create a Slate editor object that won't change across renders.
    const [editor] = useState(() => withTemplates(withReact(withHistory(createEditor()))));

    useImperativeHandle(ref, () => editor, [editor]);
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

    const isEmpty = useMemo(() => {
      return size(value) === 1 && size(value[0].children) === 1 && value[0].children[0].text === '';
    }, [value]);

    const renderElement = useCallback(
      (props) => {
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
            return (
              <DefaultElement
                {...props}
                placeholder={isEmpty ? placeholder : undefined}
                placeholderProps={isEmpty ? placeholderProps : undefined}
              />
            );
        }
      },
      // All values read inside the callback must be listed here.
      // `editor` is stable (created once via `useState` initializer)
      // but listed for completeness. The callback-shaped props
      // (`getTagProps`, `onTagClick`) and the `rest`-derived flags
      // (`size`, `readOnly`, `disabled`) need to be tracked so the
      // memo invalidates when the parent passes new ones — otherwise
      // tag chips render with stale click handlers / sizes.
      // Consumers that pass non-stable callbacks via inline arrow
      // functions will cause re-memoization on every render; pass
      // stable refs (`useCallback`) for best performance.
      [
        isEmpty,
        placeholder,
        placeholderProps,
        editor,
        getTagProps,
        tagsProps,
        onTagClick,
        rest.size,
        rest.readOnly,
        rest.disabled,
      ]
    );

    const handleFocus = useCallback(
      (event) => {
        // Firefox does not always create a DOM selection when an empty Slate
        // editor contains an absolutely positioned, non-editable placeholder.
        // Establish the corresponding Slate selection before the first key
        // event so keyboard input is not discarded.
        if (isEmpty && !editor.selection && !rest.readOnly && !rest.disabled) {
          Transforms.select(editor, Editor.start(editor, []));
        }
        // Chain any consumer-provided focus handlers. Slate's `Editable`
        // gates its internal `onFocus` wrapper behind editable-target/selection
        // checks and does not reliably forward a passed-through `onFocus`, so
        // both handlers are invoked explicitly here to guarantee they run.
        onFocusCapture?.(event);
        onFocus?.(event);
      },
      [editor, isEmpty, onFocus, onFocusCapture, rest.disabled, rest.readOnly]
    );

    const renderLeaf = useCallback(
      (props: RenderLeafProps) =>
        customRenderLeaf ? customRenderLeaf(props) : <Leaf {...props} />,
      [customRenderLeaf]
    );

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
          <ReqoreTextarea<Pick<EditableProps, 'renderElement' | 'renderLeaf' | 'decorate'>>
            {...rest}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            decorate={decorate}
            onFocusCapture={handleFocus}
            as={RefSafeSlateEditable}
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
  }
);
