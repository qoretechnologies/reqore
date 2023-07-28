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

export const WithDefaultZoom: Story = {
  args: {
    label: 'Collection of items',
    zoomable: true,
    size: 'tiny',
    defaultZoom: 2,
  },
};
