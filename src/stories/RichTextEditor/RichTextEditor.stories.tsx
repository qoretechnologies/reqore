import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { StoryObj } from '@storybook/react';
import { useCallback, useState } from 'react';
import { NodeEntry, Range, Text } from 'slate';
import { RenderLeafProps } from 'slate-react/dist/components/editable';
import { ReqoreSpan } from '../../components/Span';
import { useMount } from 'react-use';
import { _testsClickButton, _testsWaitForText } from '../../../__tests__/utils';
import { ReqoreRichTextEditor } from '../../components/RichTextEditor';
import { IReqoreTagProps } from '../../components/Tag';
import { sleep } from '../../helpers/utils';
import { StoryMeta } from '../utils';
import { FlatArg, IconArg, MinimalArg, SizeArg } from '../utils/args';

const meta = {
  title: 'Form/RichTextEditor',
  component: ReqoreRichTextEditor,
  render: (args) => {
    const [value, setValue] = useState(args.value);

    return (
      <ReqoreRichTextEditor
        {...args}
        value={value}
        onChange={(val) => {
          setValue(val);
          args.onChange?.(val);
        }}
      />
    );
  },
  argTypes: {
    ...MinimalArg,
    ...FlatArg,
    ...SizeArg,
    ...IconArg('icon', 'Icon'),
  },
} as StoryMeta<typeof ReqoreRichTextEditor>;
type Story = StoryObj<typeof meta>;

export default meta;
export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RichTextEditor in its empty state.',
      },
    },
  },};
export const WithPlaceholder: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RichTextEditor with a placeholder set.',
      },
    },
  },
  args: {
    placeholder: 'Type something here...',
  },
};
export const WithDefaultValue: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RichTextEditor with a default value pre-set.',
      },
    },
  },
  args: {
    value: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is a template ' },
          {
            type: 'tag',
            value: '$data:{id:1}',
            label: 'Discord Message Content',
            children: [{ text: '' }],
          },
          { text: ' inline with text' },
        ],
      },

      {
        type: 'paragraph',
        children: [{ text: 'This is already a new paragraph.' }],
      },
    ],
  },
};

/**
 * Clicking a chip gives the editor a cursor.
 *
 * A chip is an inline VOID — it holds no text of its own — so a click on it has
 * no text position to land in and the browser puts the cursor nowhere. When the
 * whole value IS one chip, as it is for a field holding a single reference,
 * that made the editor impossible to type into at all: the chip covers the
 * control, and clicking it did nothing.
 *
 * Reported against a Qorus test assertion's `Value`, where it made a path
 * deeper than any offered candidate — the case a rich-text control exists for —
 * impossible to write by hand.
 *
 * The cursor lands AFTER the chip, which is where a walk is continued.
 */
export const ClickingATagPlacesTheCursor: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Clicks a chip that is the entire value and types — the cursor must land after the chip so the text is appended to it.',
      },
    },
  },
  args: {
    value: [
      {
        type: 'paragraph',
        children: [
          { text: '' },
          {
            type: 'tag',
            value: '$.order.id',
            label: 'id',
            children: [{ text: '' }],
          },
          { text: '' },
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const editor = await waitFor(() => {
      const el = doc.querySelector<HTMLElement>('[contenteditable="true"]');
      expect(el).toBeTruthy();
      return el!;
    });

    // Slate wraps a void in its own span and the tag that carries the click
    // handler is a CHILD of it, so a click dispatched on the wrapper never
    // reaches it — events bubble up, not down. Click the tag's LABEL: on a
    // short label the chip's geometric centre is its `×`, which removes the
    // chip and would make this pass or fail for the wrong reason.
    const chip = await waitFor(() => {
      const wrapper = doc.querySelector<HTMLElement>('[data-slate-void="true"]');
      expect(wrapper).toBeTruthy();
      const label = Array.from(wrapper!.querySelectorAll<HTMLElement>('*')).find(
        (el) =>
          el.textContent === 'id' && !el.className.toString().includes('reqore-tag-remove')
      );
      expect(label).toBeTruthy();
      return label!;
    });

    await userEvent.click(chip);
    await userEvent.keyboard('.value');

    // Appended to the chip, not inserted before it: the reference is extended.
    // Appended to the chip, not inserted before it: the reference is extended.
    // The chip and the typed run are separate DOM nodes, so `innerText` puts
    // layout whitespace between them; the ORDER is what is being asserted.
    await waitFor(() =>
      expect(editor.innerText.replace(/[\s\uFEFF]/g, '')).toContain('id.value')
    );
  },
};

export const WithCustomStyle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RichTextEditor with custom inline styling.',
      },
    },
  },
  args: {
    ...WithDefaultValue.args,
    size: 'small',
    intent: 'warning',
    minimal: true,
  },
};

export const Readonly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RichTextEditor in its read-only state.',
      },
    },
  },
  args: {
    ...WithDefaultValue.args,
    readOnly: true,
  },
};

export const WithCustomTags: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RichTextEditor with custom tag content.',
      },
    },
  },
  args: {
    actions: {
      styling: true,
      undo: true,
      redo: true,
    },
    value: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is a template ' },
          {
            type: 'tag',
            value: '$data:{id:1}',
            label: 'Discord Message Content',
            children: [{ text: '' }],
          },
          {
            type: 'tag',
            value: '$data:{id:3}',
            label: 'Item With Metadata',
            metadata: {
              image:
                'https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4',
              labelKey: 'Qore',
            },
            children: [{ text: '' }],
          },
          { text: ' inline with text' },
        ],
      },

      {
        type: 'paragraph',
        children: [{ text: 'This is already a new paragraph.' }],
      },

      {
        type: 'paragraph',
        children: [
          {
            type: 'tag',
            value: '$data:{id:2}',
            label: 'Discord Message Embed',
            children: [{ text: '' }],
          },
        ],
      },

      {
        type: 'paragraph',
        children: [
          { text: 'Another paragraph with a custom tag ' },
          {
            type: 'tag',
            value: '@test',
            label: 'Someone Mentioned',
            children: [{ text: '' }],
          },
        ],
      },
    ],
    getTagProps: (tag): IReqoreTagProps => {
      if (tag.value.toString().startsWith('@')) {
        return {
          intent: 'success',
          icon: 'AtLine',
        };
      } else {
        if (tag.metadata) {
          return {
            intent: 'warning',
            icon: 'AtLine',
            leftIconProps: {
              image: tag.metadata.image,
            },
            labelKey: tag.metadata.labelKey,
          };
        }

        return {
          intent: 'info',
          icon: 'MoneyDollarCircleLine',
        };
      }
    },
    tagsProps: {
      icon: 'UserLine',
    },
    tags: {
      template: {
        label: 'Templates',
        icon: 'MoneyDollarCircleLine',
        description: 'Templates to be used in the editor',
        items: [
          {
            label: 'Discord Message Content',
            value: '$data:{id:1}',
          },
          {
            label: 'Discord Message Embed',
            value: '$data:{id:2}',
          },
          {
            label: 'Item With Metadata',
            value: '$data:{id:3}',
            metadata: {
              image:
                'https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4',
              labelKey: 'Qore',
            },
          },
        ],
      },
      mention: {
        label: 'Mentions',
        icon: 'AtLine',
        description: 'Mentions to be used in the editor',
        items: [
          {
            label: 'Brad Pitt',
            value: '@brad',
          },
          {
            label: 'Angelina Jolie',
            value: '@angelina',
          },
          {
            label: 'Tom Cruise',
            value: '@tom',
          },
        ],
      },
    },
  },
  play: async () => {
    await expect(document.querySelectorAll('.reqore-tag')).toHaveLength(4);
    await userEvent.click(document.querySelectorAll('.reqore-tag-remove')[1]);
    await expect(document.querySelectorAll('.reqore-tag')).toHaveLength(3);
    await _testsClickButton({ label: 'Mentions' });
    await userEvent.click(document.querySelector('div[contenteditable]'));
    await sleep(500);
    await _testsClickButton({ label: 'Brad Pitt' });
    await sleep(500);
    await expect(document.querySelectorAll('.reqore-tag')).toHaveLength(4);
  },
};

export const ListWithCustomTheme: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RichTextEditor list with a custom theme applied.',
      },
    },
  },
  ...WithCustomTags,
  args: {
    ...WithCustomTags.args,
    tagsListProps: {
      listCustomTheme: {
        main: '#160437',
      },
    },
  },
  play: async () => {
    await expect(document.querySelectorAll('.reqore-tag')).toHaveLength(4);
    await userEvent.click(document.querySelectorAll('.reqore-tag-remove')[1]);
  },
};

export const ListWithCustomIntent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RichTextEditor list with a custom intent.',
      },
    },
  },
  ...WithCustomTags,
  args: {
    ...WithCustomTags.args,
    tagsListProps: {
      listIntent: 'success',
    },
  },
  play: async () => {
    await expect(document.querySelectorAll('.reqore-tag')).toHaveLength(4);
    await userEvent.click(document.querySelectorAll('.reqore-tag-remove')[1]);
  },
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RichTextEditor in its disabled state.',
      },
    },
  },
  args: {
    ...WithCustomTags.args,
    disabled: true,
  },
};

export const WithActions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RichTextEditor with action buttons attached.',
      },
    },
  },
  args: {
    actions: {
      styling: true,
      undo: true,
      redo: true,
    },
    onChange: (val) => console.log(val),
  },
  play: async () => {
    await userEvent.click(document.querySelector('div[contenteditable]'));
    await userEvent.click(document.querySelector('div[contenteditable]'));
    await userEvent.keyboard('Papa', { delay: 100 });

    await expect(document.querySelectorAll('.reqore-button')[3]).toBeEnabled();
    await expect(document.querySelectorAll('.reqore-button')[4]).toBeDisabled();

    await userEvent.click(document.querySelectorAll('.reqore-button')[3]);

    await sleep(1000);

    await expect(document.querySelectorAll('.reqore-button')[3]).toBeDisabled();
    await expect(document.querySelectorAll('.reqore-button')[4]).toBeEnabled();

    await userEvent.click(document.querySelectorAll('.reqore-button')[4]);

    await sleep(1000);

    await expect(document.querySelector('.reqore-textarea')).toHaveTextContent('Papa');
  },
};

export const WithStyling: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RichTextEditor with additional inline styling.',
      },
    },
  },
  args: {
    actions: {
      styling: true,
    },
    value: [
      {
        type: 'paragraph',
        children: [{ text: 'This is a styled text', bold: true, italic: true, underline: true }],
      },
    ],
    onChange: (val) => console.log(val),
  },
  play: async () => {
    await userEvent.click(document.querySelector('div[contenteditable]'));
    await userEvent.click(document.querySelector('div[contenteditable]'));
  },
};

export const UpdatesFromInside: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RichTextEditor and updates it from inside the component.',
      },
    },
  },
  args: {
    value: [
      {
        type: 'paragraph',
        children: [{ text: 'This is the default text' }],
      },
    ],
    onChange: fn(),
  },
  play: async ({ args }) => {
    await userEvent.click(document.querySelector('div[contenteditable]'));
    await sleep(500);
    // Press left arrow key a few times
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}', {
      delay: 100,
    });
    console.log(args);
    // Type "UPDATED" and a space using the keyboard
    await userEvent.keyboard('UPDATED ', { delay: 100 });
    await sleep(500);
    await expect(args.onChange).toHaveBeenLastCalledWith([
      {
        type: 'paragraph',
        children: [{ text: 'This is the default UPDATED text' }],
      },
    ]);
  },
};

/**
 * Demonstrates the `decorate` prop, used to overlay syntax-highlighting-style
 * marks on top of the document without mutating it. The decorate function
 * receives a `[Node, Path]` entry and returns `Range[]` with custom mark
 * properties; those marks are then read by `customRenderLeaf` to apply
 * styling. This is the standard Slate pattern for syntax highlighting,
 * search highlights, error underlines, etc.
 */
export const WithDecorate: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RichTextEditor with the decorate transform applied.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);

    // Highlight occurrences of "TODO" and "ERROR" — the classic
    // syntax-highlighting-via-decorate pattern.
    const decorate = useCallback(([node, path]: NodeEntry): Range[] => {
      const ranges: Range[] = [];
      if (!Text.isText(node)) {
        return ranges;
      }
      const text = node.text;
      const pattern = /\b(TODO|ERROR)\b/g;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        ranges.push({
          anchor: { path, offset: match.index },
          focus: { path, offset: match.index + match[0].length },
          highlight: match[1] === 'TODO' ? 'todo' : 'error',
        } as Range & { highlight: string });
      }
      return ranges;
    }, []);

    const customRenderLeaf = useCallback(
      ({ attributes, children, leaf }: RenderLeafProps & { leaf: { highlight?: string } }) => (
        <ReqoreSpan
          inline
          {...attributes}
          style={{
            backgroundColor:
              leaf.highlight === 'todo'
                ? 'rgba(255, 217, 0, 0.25)'
                : leaf.highlight === 'error'
                ? 'rgba(255, 60, 60, 0.25)'
                : undefined,
            fontWeight: leaf.highlight ? 600 : undefined,
          }}
        >
          {children}
        </ReqoreSpan>
      ),
      []
    );

    return (
      <ReqoreRichTextEditor
        {...args}
        value={value}
        onChange={(val) => {
          setValue(val);
          args.onChange?.(val);
        }}
        decorate={decorate}
        customRenderLeaf={customRenderLeaf}
      />
    );
  },
  args: {
    value: [
      {
        type: 'paragraph',
        children: [{ text: 'TODO: ship this feature. ERROR if not done by Friday.' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Plain second paragraph with no highlights.' }],
      },
    ],
  },
  play: async () => {
    // Confirm the editor mounted and the document contains the source text;
    // the decorate ranges are applied by Slate as React reconciles, so the
    // text content survives intact.
    await expect(document.querySelector('div[contenteditable]')).toBeInTheDocument();
    await expect(document.querySelector('div[contenteditable]')).toHaveTextContent('TODO');
    await expect(document.querySelector('div[contenteditable]')).toHaveTextContent('ERROR');
  },
};

export const WithCustomRenderLeaf: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RichTextEditor with a custom leaf renderer for the rich-text editor.',
      },
    },
  },
  args: {
    value: [
      {
        type: 'paragraph',
        children: [
          { text: 'Normal text, ' },
          { text: 'bold text', bold: true },
          { text: ', and ' },
          { text: 'italic text', italic: true },
          { text: '.' },
        ],
      },
    ],
    customRenderLeaf: ({ attributes, children, leaf }: RenderLeafProps) => (
      <ReqoreSpan
        inline
        {...attributes}
        style={{
          fontWeight: leaf.bold ? 900 : undefined,
          fontStyle: leaf.italic ? 'italic' : undefined,
          color: leaf.bold ? '#ff6b6b' : leaf.italic ? '#4ecdc4' : undefined,
          letterSpacing: leaf.bold ? '0.05em' : undefined,
        }}
      >
        {children}
      </ReqoreSpan>
    ),
  },
  play: async () => {
    await expect(document.querySelector('div[contenteditable]')).toBeInTheDocument();
  },
};

export const UpdatesFromOutside: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders RichTextEditor and updates it from outside via the ref/props.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);

    useMount(() => {
      setTimeout(() => {
        setValue([
          {
            type: 'paragraph',
            children: [
              { text: 'This is a NEW UPDATED TEXT', bold: true, italic: true, underline: true },
            ],
          },
        ]);
      }, 1000);
    });

    return (
      <ReqoreRichTextEditor
        {...args}
        value={value}
        onChange={(val) => {
          setValue(val);
          args.onChange?.(val);
        }}
      />
    );
  },
  args: {
    actions: {
      styling: true,
    },
    value: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'This is a styled text that is longer than the one that will be here soon',
            bold: true,
            italic: true,
            underline: true,
          },
        ],
      },
    ],
    onChange: (val) => console.log(val),
  },
  play: async () => {
    await _testsWaitForText('This is a NEW UPDATED TEXT');
  },
};

/**
 * Two clicks, then typing, on a value that already holds a tag.
 *
 * Reported from the Qorus IDE's assertion `Value` field: the row holds a
 * `$.result` reference, the author clicks once to focus and again to put the
 * cursor after the template, and the control is then frozen — nothing types,
 * and the template does not go away either.
 *
 * The existing typing stories miss this shape. `WithActions` double-clicks an
 * EMPTY editor, `UpdatesFromInside` types into one holding only plain text, and
 * `ClickingATagPlacesTheCursor` clicks the chip ITSELF rather than the empty
 * text after it. This one is text + tag + the trailing empty text node, which
 * is where a click past the chip puts the caret.
 */
export const TypingAfterTwoClicksWithATag: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Clicks twice to place the cursor and types — a value that already holds a tag must still accept keyboard input.',
      },
    },
  },
  args: {
    value: [
      {
        type: 'paragraph',
        children: [
          { text: 'cvcvcvcv' },
          {
            type: 'tag',
            value: '$.result',
            label: 'result',
            children: [{ text: '' }],
          },
          { text: '' },
        ],
      },
    ],
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const editor = await waitFor(() => {
      const el = doc.querySelector<HTMLElement>('[contenteditable="true"]');
      expect(el).toBeTruthy();
      return el!;
    });

    // Exactly as reported: one click to focus, a second to place the cursor.
    await userEvent.click(editor);
    await userEvent.click(editor);

    await userEvent.keyboard('abc');

    // The typed run must actually arrive. Whitespace is stripped because the
    // chip and the typed text are separate DOM nodes and `innerText` puts
    // layout whitespace between them.
    await waitFor(() =>
      expect(editor.innerText.replace(/[\s﻿]/g, '')).toContain('abc')
    );
  },
};

/**
 * Clicking AFTER the tag, then typing.
 *
 * "Trying to position the cursor after the template" is the reported action,
 * and it is not the same click as the ones already covered. `userEvent.click`
 * on the editor lands in its geometric centre — which, on this value, is the
 * text BEFORE the chip. The caret the author is actually asking for goes in the
 * empty text node that follows the void, and that is the position under test.
 */
export const TypingAfterClickingPastTheTag: Story = {
  /* KNOWN FAILING — this is a reproduction of an OPEN defect, not a guard.
     Excluded from the run so the suite still reports real regressions; open it
     in Storybook to watch it happen.

     Measured with the Slate editor read out of the React fiber:

       selection before the key  {"anchor":{"path":[0,2],"offset":0}, ...}
       selection after the key   {"anchor":{"path":[0,1,0],"offset":0}, ...}
       document                  unchanged
       onChange                  fired twice, with the same document

     `[0,2]` is the empty text AFTER the chip — a legitimate caret position.
     `[0,1,0]` is inside the chip's own text child, and `TemplateElement`'s
     click handler already documents that typing there is silently ignored.
     The caret is pulled in as the keystroke is handled, so the value never
     changes and the control reads as frozen.

     Three fixes were tried and none of them takes; do not assume the obvious
     one works without running this:
       - moving the selection out of the void in `Slate`'s `onChange`;
       - the same on the editable's `onMouseUp` (it IS called, but the point it
         moves to is the one the caret already claims, so it is a no-op);
       - claiming `insertText` in `onDOMBeforeInput` and inserting past the
         void by hand. */
  parameters: {
    docs: {
      description: {
        story:
          'Clicks the empty text after the chip to place the cursor there, then types — the keystrokes must arrive.',
      },
    },
  },
  args: {
    value: [
      {
        type: 'paragraph',
        children: [
          { text: 'cvcvcvcv' },
          {
            type: 'tag',
            value: '$.result',
            label: 'result',
            children: [{ text: '' }],
          },
          { text: '' },
        ],
      },
    ],
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const doc = canvasElement.ownerDocument;
    const editor = await waitFor(() => {
      const el = doc.querySelector<HTMLElement>('[contenteditable="true"]');
      expect(el).toBeTruthy();
      return el!;
    });

    await userEvent.click(editor);

    // The leaf that FOLLOWS the void — the position "after the template".
    const trailing = await waitFor(() => {
      const voidEl = doc.querySelector<HTMLElement>('[data-slate-void="true"]');
      expect(voidEl).toBeTruthy();
      let n: Element | null = voidEl!.nextElementSibling;
      while (n && !n.querySelector('[data-slate-leaf="true"]') && !n.matches('[data-slate-leaf="true"]')) {
        n = n.nextElementSibling;
      }
      expect(n).toBeTruthy();
      return n as HTMLElement;
    });

    await userEvent.click(trailing);
    await userEvent.keyboard('abc');

    // The typed run must actually arrive. Whitespace is stripped because the
    // chip and the typed text are separate DOM nodes and `innerText` puts
    // layout whitespace between them.
    await waitFor(() =>
      expect(editor.innerText.replace(/[\s\uFEFF]/g, '')).toContain('abc')
    );
  },
};
