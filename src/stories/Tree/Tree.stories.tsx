import { StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import { IReqoreTreeProps, ReqoreTree } from '../../components/Tree';
import MockObject from '../../mock/object.json';
import { StoryMeta } from '../utils';
import { SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreTreeProps>();

const meta: StoryMeta<typeof ReqoreTree> = {
  title: 'Collections/Tree/Stories',
  component: ReqoreTree,
  args: {
    withLabelCopy: true,
    showTypes: true,
    expanded: false,
    onItemClick: noop,
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
