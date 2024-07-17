import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { userEvent } from '@storybook/testing-library';
import { useState } from 'react';
import { _testsClickButton } from '../../../__tests__/utils';
import { ReqoreRichTextEditor } from '../../components/RichTextEditor';
import { sleep } from '../../helpers/utils';
import { StoryMeta } from '../utils';
import { FlatArg, IconArg, MinimalArg, SizeArg } from '../utils/args';

const meta = {
  title: 'Form/RichTextEditor',
  component: ReqoreRichTextEditor,
  args: {
    onChange: (data) => console.log(data),
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);

    return <ReqoreRichTextEditor {...args} value={value} onChange={(val) => setValue(val)} />;
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

export const Readonly: Story = {
  args: {
    ...WithDefaultValue.args,
    readOnly: true,
  },
};

export const Disabled: Story = {
  args: {
    ...WithDefaultValue.args,
    disabled: true,
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
      if (tag.value.toString().startsWith('@')) {
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
  play: async () => {
    await expect(document.querySelectorAll('.reqore-tag')).toHaveLength(3);
    await userEvent.click(document.querySelectorAll('.reqore-tag-remove')[1]);
    await expect(document.querySelectorAll('.reqore-tag')).toHaveLength(2);
    await _testsClickButton({ label: 'Mentions' });
    await userEvent.click(document.querySelector('div[contenteditable]'));
    await sleep(500);
    await _testsClickButton({ label: 'Brad Pitt' });
    await expect(document.querySelectorAll('.reqore-tag')).toHaveLength(3);
  },
};

export const WithActions: Story = {
  args: {
    actions: {
      undo: true,
      redo: true,
    },
  },
  play: async () => {
    await userEvent.click(document.querySelector('div[contenteditable]'));
    await userEvent.keyboard('Hello');

    await expect(document.querySelector('.reqore-button')).toBeEnabled();
    await expect(document.querySelectorAll('.reqore-button')[1]).toBeDisabled();

    await userEvent.click(document.querySelector('.reqore-button'));
    await expect(document.querySelector('.reqore-button')).toBeDisabled();
    await expect(document.querySelectorAll('.reqore-button')[1]).toBeEnabled();

    await userEvent.click(document.querySelectorAll('.reqore-button')[1]);
    await expect(document.querySelector('.reqore-textarea')).toHaveTextContent('Hello');
  },
};
