import { StoryObj } from '@storybook/react';
import { ReqoreRichTextEditor } from '../../components/RichTextEditor';
import { StoryMeta } from '../utils';
import { FlatArg, IconArg, MinimalArg, SizeArg } from '../utils/args';

const meta = {
  title: 'Form/RichTextEditor',
  component: ReqoreRichTextEditor,
  args: {
    onChange: (data) => console.log(data),
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
export const WithCustomTags: Story = {
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

      {
        type: 'tag',
        value: '$data:{id:1}',
        label: 'Gmail Email Body',
        children: [{ text: '' }],
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
    getTagProps: (tag) => {
      if (tag.value.startsWith('@')) {
        return {
          intent: 'success',
          icon: 'AtLine',
        };
      } else {
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
};
