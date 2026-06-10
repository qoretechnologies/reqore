import { expect, fireEvent } from 'storybook/test';
import { StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import { ChangeEvent, useState } from 'react';
import {
  _testsClickButton,
  _testsClickNonButton,
  _testsWaitForText,
} from '../../../__tests__/utils';
import ReqoreInput from '../../components/Input';
import ReqoreTag from '../../components/Tag';
import ReqoreTextarea from '../../components/Textarea';
import { IReqoreTreeProps, ReqoreTree } from '../../components/Tree';
import MockObject from '../../mock/object.json';
import { StoryMeta } from '../utils';
import { SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreTreeProps>();

const meta: StoryMeta<typeof ReqoreTree> = {
  title: 'Collections/Tree',
  component: ReqoreTree,
  args: {
    withLabelCopy: true,
    showTypes: true,
    expanded: false,
    onItemClick: noop,
    getItemTooltip: (path, element, pathWithoutArrayKeys) => {
      return `This is a tooltip for ${element} at path ${path.join(
        '.'
      )}, path without array keys ${pathWithoutArrayKeys.join('.')}`;
    },
    data: MockObject,
  },
  argTypes: {
    ...createArg('withLabelCopy', {
      name: 'With label copy',
      description: 'With label copy',
      control: 'boolean',
      defaultValue: true,
    }),
    ...createArg('showTypes', {
      name: 'Show types',
      description: 'Show types',
      control: 'boolean',
      defaultValue: true,
    }),
    ...createArg('expanded', {
      name: 'Expanded',
      description: 'Expanded',
      control: 'boolean',
      defaultValue: false,
    }),
    ...SizeArg,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const TextView: Story = {
  args: {
    mode: 'copy',
  },
};

export const NoControls: Story = {
  args: {
    showControls: false,
  },
};

export const Zoomable: Story = {
  args: {
    zoomable: true,
  },
};

export const Exportable: Story = {
  args: {
    zoomable: true,
    exportable: true,
  },
};

export const Empty: Story = {
  args: {
    data: {},
  },
};

export const EmptyEditable: Story = {
  args: {
    data: [],
    editable: true,
  },
};

export const EditableArray: Story = {
  render: (args) => {
    const [data, setData] = useState(args.data);

    return (
      <ReqoreTree
        {...args}
        data={data}
        onDataChange={(newData) => {
          setData(() => newData);
        }}
      />
    );
  },
  args: {
    showTypes: false,
    editable: true,
  },
};

export const EditableObject: Story = {
  render: (args) => {
    const [data, setData] = useState(args.data);

    return (
      <ReqoreTree
        {...args}
        data={data}
        onDataChange={(newData) => {
          setData(() => newData);
        }}
      />
    );
  },
  args: {
    showTypes: false,
    editable: true,
    data: {
      _id: '606d4c955f96372fd1b8bcd1',
      index: 0,
      guid: 'd08cde5f-e18e-4d7f-80a9-6541848ab830',
      isActive: false,
      balance: '$3,219.32',
      picture: 'http://placehold.it/32x32',
      age: 25,
      eyeColor: 'brown',
      name: 'Zelma Short',
      gender: 'female',
      company: 'LINGOAGE',
      email: 'zelmashort@lingoage.com',
      phone: '+1 (840) 429-2274',
      address: '757 Woodside Avenue, Winchester, Marshall Islands, 2032',
      about:
        'Ipsum est ex nisi veniam proident adipisicing. Occaecat Lorem minim amet aliqua laboris excepteur sint eu mollit laborum sunt. Duis aliquip nulla cillum labore culpa ullamco labore non in nostrud. Cupidatat nisi enim ullamco quis voluptate Lorem voluptate minim dolore esse irure eiusmod aliquip amet. Dolore laboris Lorem laboris irure magna sint dolor. In irure adipisicing minim ullamco commodo ad dolore elit occaecat dolor. Cillum commodo est commodo dolor enim velit.\r\n',
      registered: '2015-03-19T05:00:22 -01:00',
      latitude: -8.97737,
      longitude: 110.576471,
      tags: ['aute', 'qui', 'ut', 'mollit', 'culpa', 'qui', 'irure'],
      friends: [
        {
          id: 0,
          name: 'Angel Gallagher',
        },
        {
          id: 1,
          name: 'Rose Farmer',
        },
        {
          id: 2,
          name: 'Jaclyn Keith',
        },
      ],
      greeting: 'Hello, Zelma Short! You have 5 unread messages.',
      favoriteFruit: 'banana',
    },
  },
};

export const Object: Story = {
  args: {
    exportable: true,
    data: {
      _id: '606d4c955f96372fd1b8bcd1',
      index: 0,
      guid: 'd08cde5f-e18e-4d7f-80a9-6541848ab830',
      isActive: false,
      balance: '$3,219.32',
      picture: 'http://placehold.it/32x32',
      age: 25,
      eyeColor: 'brown',
      name: 'Zelma Short',
      gender: 'female',
      company: 'LINGOAGE',
      email: 'zelmashort@lingoage.com',
      phone: '+1 (840) 429-2274',
      address: '757 Woodside Avenue, Winchester, Marshall Islands, 2032',
      about:
        'Ipsum est ex nisi veniam proident adipisicing. Occaecat Lorem minim amet aliqua laboris excepteur sint eu mollit laborum sunt. Duis aliquip nulla cillum labore culpa ullamco labore non in nostrud. Cupidatat nisi enim ullamco quis voluptate Lorem voluptate minim dolore esse irure eiusmod aliquip amet. Dolore laboris Lorem laboris irure magna sint dolor. In irure adipisicing minim ullamco commodo ad dolore elit occaecat dolor. Cillum commodo est commodo dolor enim velit.\r\n',
      registered: '2015-03-19T05:00:22 -01:00',
      latitude: -8.97737,
      longitude: 110.576471,
      tags: ['aute', 'qui', 'ut', 'mollit', 'culpa', 'qui', 'irure'],
      friends: [
        {
          id: 0,
          name: 'Angel Gallagher',
        },
        {
          id: 1,
          name: 'Rose Farmer',
        },
        {
          id: 2,
          name: 'Jaclyn Keith',
        },
      ],
      greeting: 'Hello, Zelma Short! You have 5 unread messages.',
      favoriteFruit: 'banana',
    },
  },
};

export const WithDefaultZoom: Story = {
  args: {
    label: 'Collection of items',
    zoomable: true,
    size: 'tiny',
    defaultZoom: 2,
  },
};

export const NewArrayItemCanBeAdded: Story = {
  ...EditableArray,
  play: async () => {
    await expect(document.querySelectorAll('.reqore-tree-item').length).toBe(8);
    await _testsClickButton({ selector: '.reqore-tree-add' });
    await _testsWaitForText('Adding new item');
    await expect(document.querySelector('.reqore-tree-save')).toBeDisabled();
    await fireEvent.change(document.querySelector('.reqore-textarea'), {
      target: { value: 'New item' },
    });
    await expect(document.querySelector('.reqore-tree-save')).toBeEnabled();
    await _testsClickButton({ selector: '.reqore-tree-save' });
    await expect(document.querySelectorAll('.reqore-tree-item').length).toBe(9);
    await _testsWaitForText('"New item"');
  },
};

export const NewArrayItemCanBeEdited: Story = {
  ...NewArrayItemCanBeAdded,
  play: async (args) => {
    await NewArrayItemCanBeAdded.play(args);
    await _testsClickButton({ selector: '.reqore-tree-edit' });
    await fireEvent.change(document.querySelectorAll('.reqore-textarea')[0], {
      target: { value: 'New item edited' },
    });
    await expect(document.querySelector('.reqore-tree-save')).toBeEnabled();
    await _testsClickButton({ selector: '.reqore-tree-save' });
    await expect(document.querySelectorAll('.reqore-tree-item').length).toBe(9);
    await _testsWaitForText('"New item edited"');
  },
};

export const NewObjectItemCanBeAdded: Story = {
  ...EditableObject,
  play: async () => {
    await expect(document.querySelectorAll('.reqore-tree-item').length).toBe(22);
    await _testsClickButton({ selector: '.reqore-tree-add' });
    await _testsWaitForText('Adding new item');
    await expect(document.querySelector('.reqore-tree-save')).toBeDisabled();
    await fireEvent.change(document.querySelector('.reqore-input'), {
      target: { value: 'New item' },
    });
    await fireEvent.change(document.querySelectorAll('.reqore-textarea')[0], {
      target: { value: 'New item value' },
    });
    await expect(document.querySelector('.reqore-tree-save')).toBeEnabled();
    await _testsClickButton({ selector: '.reqore-tree-save' });
    await expect(document.querySelectorAll('.reqore-tree-item').length).toBe(23);
    await _testsWaitForText('New item:');
    await _testsWaitForText('"New item value"');
  },
};

export const ObjectItemCanBeEdited: Story = {
  ...EditableObject,
  play: async () => {
    await _testsClickButton({ selector: '.reqore-tree-edit', nth: 19 });
    await fireEvent.change(document.querySelectorAll('.reqore-input')[0], {
      target: { value: 'updated item key' },
    });
    await expect(document.querySelector('.reqore-tree-save')).toBeEnabled();
    await _testsClickButton({ selector: '.reqore-tree-save' });
    await expect(document.querySelectorAll('.reqore-tree-item').length).toBe(22);
    await _testsWaitForText('updated item key:');
    await _testsClickNonButton({ label: 'updated item key:', selector: 'p' });
    await _testsClickNonButton({ label: '1:', selector: 'p' });
  },
};

export const ItemsCanBeDeleted: Story = {
  ...EditableObject,
  play: async () => {
    await _testsClickButton({ selector: '.reqore-tree-delete', nth: 4 });
    await _testsClickButton({ selector: '.reqore-tree-delete', nth: 18 });
    await expect(document.querySelectorAll('.reqore-tree-item').length).toBe(20);
  },
};

export const CustomRenderers: Story = {
  ...EditableObject,
  args: {
    ...EditableObject.args,
    KeyRenderer: ({ value, onChange, isEditing }) => {
      if (isEditing) {
        return (
          <ReqoreInput
            value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            className='reqore-tree-input'
          />
        );
      }

      console.log(value);

      return <ReqoreTag label={value} />;
    },
    ValueRenderer: ({ value, onChange, isEditing, ...rest }) => {
      return (
        <ReqoreTextarea
          value={value}
          readOnly={!isEditing}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          className='reqore-tree-input'
          {...rest}
        />
      );
    },
  },
};
