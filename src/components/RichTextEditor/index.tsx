import isPropValid from '@emotion/is-prop-valid';
import { map, size } from 'lodash';
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import { BaseEditor, createEditor, Editor, Range, Transforms } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import {
  Editable,
  ReactEditor,
  Slate,
  useReadOnly,
  useSelected,
  useSlateStatic,
  withReact,
} from 'slate-react';
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

/* Stable identities for the optional props' defaults.
 *
 * Written as literals in the destructuring (`tagsProps = {}`,
 * `getTagProps = () => ({})`) they were rebuilt on EVERY render, which put a
 * new identity into `renderElement`'s dependency list every time — and
 * slate-react's own `ElementComponent` memo compares `renderElement` by
 * identity. So an unstable default made every element in the document
 * re-render on every keystroke, including chips nothing had touched. Hoisting
 * them costs nothing and is the whole fix for the common case, where the
 * consumer passes neither prop. */
const NO_TAG_PROPS = (): IReqoreTagProps => ({});
const EMPTY_TAG_PROPS: IReqoreTagProps = {};
const EMPTY_TAGS_LIST_PROPS: IReqoreRichTextEditorProps['tagsListProps'] = {};

export const TemplateElement = memo((props: RenderElementProps & { tagProps: IReqoreTagProps }) => {
  const selected = useSelected();
  const editor = useSlateStatic();
  /* Slate's own answer, which is the editor's `readOnly` — it reaches `Editable`
     as a DOM-valid prop and Slate reads it back. It is NOT the whole answer: the
     editor's `disabled` never reaches Slate, so `composeTagProps` marks the chip
     read-only for that case and this takes whichever of the two says so. */
  const slateReadOnly = useReadOnly();
  const readOnly = slateReadOnly || !!props.tagProps?.readOnly;

  /* A chip is an inline VOID: it holds no text of its own, so a click on it has
     no text position to land in and the browser places the cursor nowhere. This
     handler used to `preventDefault()` + `stopPropagation()` and stop there,
     which made the chip a dead spot.

     That is not merely a missing convenience. A field whose entire value is one
     reference renders as one chip and nothing else, so the chip IS the control:
     with no way to get a cursor into the editor, nothing could be typed into it
     at all. Reported against a Qorus test assertion's `Value`, where it made a
     path deeper than any offered candidate — the case the rich-text control
     exists for — impossible to write by hand.

     The cursor goes AFTER the chip, which is where a walk is continued
     (`$.order.id` -> `$.order.id.value`). Both calls above are kept and are
     load-bearing: `preventDefault` stops the browser racing us to a position of
     its own, and `stopPropagation` keeps the click from reaching a host row that
     treats a click as "collapse me". The selection is then set explicitly rather
     than left to the browser, so where the cursor lands does not depend on which
     pixel of the chip was hit.

     Removing a chip is unaffected: that is the tag's own `×`
     (`onRemoveClick`), not a click on its body. */
  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      // The consumer's own handler still runs: the editor composes `onTagClick`
      // and any `getTagProps().onClick` into the `tagProps.onClick` below, and
      // this element used to be overridden by it rather than run alongside it.
      props.tagProps?.onClick?.(e);

      // A read-only surface has no cursor to give.
      if (readOnly) {
        return;
      }

      try {
        const path = ReactEditor.findPath(editor, props.element);
        // From the void's END, and skipping voids. Asking for the point after
        // the void's PATH can resolve to a point INSIDE its own empty text
        // child, where typing is silently ignored — the cursor reads as placed
        // (the DOM selection is real and inside the editor) and the editor
        // still accepts nothing, which is a worse failure than an obvious one.
        // The fallback covers a void that ends the document with no text node
        // after it; a well-formed document always has one.
        const point =
          Editor.after(editor, Editor.end(editor, path), { voids: false }) ??
          Editor.end(editor, []);
        // Focus BEFORE selecting. `ReactEditor.focus` restores the editor's
        // previous selection as it takes focus, so focusing afterwards throws
        // away the point just set — which cost the FIRST character typed after
        // a chip click and nothing else, the kind of loss that reads as a
        // flaky keyboard rather than a bug.
        ReactEditor.focus(editor);
        Transforms.select(editor, point);
      } catch {
        // The element can be gone between render and click (a re-render that
        // replaced the value). Losing the cursor is the right outcome then, and
        // it must not take the click handler down with it.
      }
    },
    [editor, props.element, props.tagProps, readOnly]
  );

  return (
    <>
      <ReqoreTag
        {...props.attributes}
        compact
        flat={false}
        asBadge
        fixed='key'
        tooltip={props.element.value?.toString()}
        label={props.element.label}
        {...props.tagProps}
        // AFTER the spread on purpose: `tagProps` carries an `onClick` of its
        // own, so declaring this before it meant this handler never ran at all.
        onClick={handleClick}
        /* And `readOnly` with it, because winning the spread cost the chip the
           one signal that said it could not be pressed. `composeTagProps`
           withholds its `onClick` on a read-only surface; overriding that put a
           handler back unconditionally, and a tag with a handler paints itself
           pressable — pointer cursor, hover lift, a tab stop — for a click this
           element then declines. The handler stays (it still runs the
           consumer's own `onClick`), and this is what says the cursor is not on
           offer. */
        readOnly={readOnly}
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
      getTagProps = NO_TAG_PROPS,
      tagsProps = EMPTY_TAG_PROPS,
      onTagClick,
      tagsListProps = EMPTY_TAGS_LIST_PROPS,
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

    /**
     * The composed chip props, cached PER ELEMENT.
     *
     * Composing them inline in `renderElement` built a new object — and two new
     * closures — every time it ran, for every chip in the document. That object
     * is `TemplateElement`'s only non-trivial prop, so `memo()` on it could
     * never bail out, and `handleClick`'s `useCallback` inside it, which lists
     * `props.tagProps`, could never hit: every chip re-rendered and re-bound its
     * handlers on every keystroke, on the hot path of a control whose whole job
     * is to be typed into.
     *
     * A `WeakMap` keyed by the element is the right cache because Slate's
     * documents are immutable: an untouched node keeps its identity across an
     * edit, and an edited one becomes a new object, which misses and recomposes.
     * Entries are dropped with the elements themselves.
     *
     * The cache is thrown away and rebuilt whenever anything the composition
     * reads changes, so `getTagProps` identity is the invalidation signal — a
     * `useCallback`-stable one is a promise that its answer for a given element
     * is stable too. A `getTagProps` that has to react to something else (a
     * hover, a selection held outside the editor) must list it, exactly as it
     * already must for `renderElement` to see the change at all.
     */
    const tagPropsCache = useMemo(
      () => new WeakMap<CustomElement, IReqoreTagProps>(),
      [editor, getTagProps, tagsProps, onTagClick, rest.size, rest.readOnly, rest.disabled]
    );

    const composeTagProps = useCallback(
      (element: CustomElement): IReqoreTagProps => {
        const cached = tagPropsCache.get(element);

        if (cached) {
          return cached;
        }

        const finalProps: IReqoreTagProps = {
          ...tagsProps,
          ...getTagProps(element),
        };
        const interactive = !rest.readOnly && !rest.disabled;
        const composed: IReqoreTagProps = {
          ...finalProps,
          size: rest.size ? getOneLessSize(rest.size) : finalProps.size || 'small',
          /* Says "not choosable" to the chip itself, which withholding the
             handlers below cannot: `TemplateElement` binds a click of its own to
             place the cursor, so an uninteractive editor still hands the tag a
             handler and a tag with a handler paints itself pressable. This is
             the flag that keeps the cursor, the hover effect and the tab stop
             honest — and it is the ONLY route by which the editor's `disabled`
             reaches the chip, since `disabled` never reaches Slate and
             `useReadOnly()` therefore cannot see it. */
          readOnly: !interactive || finalProps.readOnly,
          onClick: interactive
            ? (event) => {
                onTagClick?.(element);
                finalProps.onClick?.(event);
              }
            : undefined,
          onRemoveClick: interactive
            ? () => {
                try {
                  const path = ReactEditor.findPath(editor, element);
                  Transforms.removeNodes(editor, { at: path });
                } catch (error) {
                  // Element may no longer be in the editor
                  console.warn('Failed to remove tag:', error);
                }
              }
            : undefined,
        };

        tagPropsCache.set(element, composed);

        return composed;
      },
      [
        tagPropsCache,
        editor,
        getTagProps,
        tagsProps,
        onTagClick,
        rest.size,
        rest.readOnly,
        rest.disabled,
      ]
    );

    const renderElement = useCallback(
      (props) => {
        switch (props.element.type) {
          case 'tag': {
            return <TemplateElement {...props} tagProps={composeTagProps(props.element)} />;
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
      // All values read inside the callback must be listed here. Everything
      // the chip composition reads now hangs off `composeTagProps`, which
      // carries those dependencies itself — so this list is short on purpose,
      // and that matters: slate-react's `ElementComponent` memo compares
      // `renderElement` BY IDENTITY, so a dependency that churns re-renders
      // every element in the document, not just the chips.
      //
      // Consumers that pass non-stable callbacks (`getTagProps`, `onTagClick`)
      // or a fresh `placeholderProps` object as inline literals put that churn
      // back; pass stable refs (`useCallback` / `useMemo`) for best
      // performance.
      [isEmpty, placeholder, placeholderProps, composeTagProps]
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

    /* A caret in the empty text BESIDE a chip is a dead cursor.
       
       The position itself is legitimate — it is the point `TemplateElement`
       deliberately moves to when the chip is clicked, and typing works from
       there. What breaks is arriving by clicking the empty text directly: the
       BROWSER owns the DOM caret then, and it resolves the first keystroke back
       into the chip's own text child, where Slate silently ignores it.

       Measured on the reported case: selection `[0,2]` before the key,
       `[0,1,0]` after it, document unchanged, `onChange` fired twice.

       Re-selecting through Slate alone does not help, because Slate's selection
       is ALREADY the right point — `Transforms.select` to the same range is a
       no-op and never re-syncs the DOM. So the DOM range is set explicitly,
       which is the thing the next keystroke actually resolves from.

       Collapsed selections only: a RANGE spanning a chip is how it gets
       selected for deletion and must be left alone. */
    const repairCaretBesideVoid = useCallback(() => {
      if (rest.readOnly || rest.disabled) {
        return;
      }

      /* Adopt the caret this click placed BEFORE reading it.

         slate-react takes the browser's caret into `editor.selection` from a
         `selectionchange` handler throttled to 100ms, so at mouseup Slate may
         still have no selection at all. This handler then used to return
         without repairing anything — and the gap is worse than a missed
         repair: a re-render of the editable in that window sees a browser caret
         with no Slate selection, treats it as stale and REMOVES it, which is
         itself a selection change and spends the throttle window. The click's
         own change is deferred to the trailing edge, a key pressed before then
         is dropped, and by the time the handler runs there is no caret left to
         adopt — the field reads as frozen.

         Measured in the Qorus test editor: Slate's selection `null` at the first
         keystroke while the browser caret sat correctly beside the chip; the
         same story passed only when the key happened to land more than 100ms
         after the last throttled call.

         Only a caret slate-react itself would accept is taken, and never while
         composing — an IME owns the selection then. */
      try {
        const domSelection = ReactEditor.getWindow(editor).getSelection();
        const { anchorNode, focusNode } = domSelection ?? {};

        /* The same test slate-react's own handler applies before it adopts a
           caret, so this takes exactly what that handler would take, only
           sooner. */
        if (
          domSelection &&
          domSelection.rangeCount > 0 &&
          anchorNode &&
          focusNode &&
          !ReactEditor.isComposing(editor) &&
          ReactEditor.hasSelectableTarget(editor, anchorNode) &&
          ReactEditor.hasSelectableTarget(editor, focusNode)
        ) {
          const clicked = ReactEditor.toSlateRange(editor, domSelection, {
            exactMatch: false,
            suppressThrow: true,
          });

          if (clicked && !(editor.selection && Range.equals(editor.selection, clicked))) {
            Transforms.select(editor, clicked);
          }
        }
      } catch {
        // Nothing to adopt is not an error; the throttled handler still runs.
      }

      const { selection } = editor;

      if (!selection || !Range.isCollapsed(selection)) {
        return;
      }

      try {
        /* Either already inside a void (`voids: true`, or the void the point
           is inside is not matched at all), or in the empty text immediately
           after one. `Editor.void` / `Editor.leaf` rather than `Editor.nodes`:
           the latter returns a generator, which this build target cannot
           destructure (TS2802). */
        const inside = Editor.void(editor, { at: selection, voids: true });

        let voidPath = inside?.[1];

        if (!voidPath) {
          const textEntry = Editor.leaf(editor, selection);

          if (!textEntry) {
            return;
          }

          const [textNode, textPath] = textEntry;

          if ((textNode as any).text !== '') {
            return;
          }

          const previous = Editor.previous(editor, { at: textPath });

          if (!previous || !Editor.isVoid(editor, previous[0] as any)) {
            return;
          }

          voidPath = previous[1];
        }

        // The same point `TemplateElement` uses: from the void's END and
        // skipping voids, so it cannot resolve back into another one.
        const point =
          Editor.after(editor, Editor.end(editor, voidPath), { voids: false }) ??
          Editor.end(editor, []);
        const range = { anchor: point, focus: point };

        Transforms.select(editor, range);

        const domRange = ReactEditor.toDOMRange(editor, range);
        const domSelection = ReactEditor.getWindow(editor).getSelection();

        if (domSelection) {
          domSelection.removeAllRanges();
          domSelection.addRange(domRange);
        }
      } catch {
        // A selection can reference a path a concurrent re-render has removed,
        // and `toDOMRange` throws for a point it cannot resolve. Leaving the
        // cursor where it is beats throwing out of an event handler.
      }
    }, [editor, rest.readOnly, rest.disabled]);

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
            onMouseUp={repairCaretBesideVoid}
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
