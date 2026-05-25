import { expect, jest } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { userEvent } from '@storybook/testing-library';
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
export const Empty: Story = {};
export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Type something here...',
  },
};
export const WithDefaultValue: Story = {
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

export const WithCustomStyle: Story = {
  args: {
    ...WithDefaultValue.args,
    size: 'small',
    intent: 'warning',
    minimal: true,
  },
};

export const Readonly: Story = {
  args: {
    ...WithDefaultValue.args,
    readOnly: true,
  },
};

export const WithCustomTags: Story = {
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
  args: {
    ...WithCustomTags.args,
    disabled: true,
  },
};

export const WithActions: Story = {
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
  args: {
    value: [
      {
        type: 'paragraph',
        children: [{ text: 'This is the default text' }],
      },
    ],
    onChange: jest.fn(),
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
