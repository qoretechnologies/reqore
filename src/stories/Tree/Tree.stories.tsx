import { Meta, Story } from '@storybook/react/types-6-0';
import { noop } from 'lodash';
import { IReqoreTreeProps, ReqoreTree } from '../../components/Tree';
import MockObject from '../../mock/object.json';
import { SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreTreeProps>();

export default {
  title: 'Collections/Tree/Stories',
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
} as Meta<IReqoreTreeProps>;

const data = MockObject;

const Template: Story<IReqoreTreeProps> = (args: IReqoreTreeProps) => {
  return <ReqoreTree data={data} onItemClick={noop} {...args} />;
};

export const Basic = Template.bind({});
export const TextView = Template.bind({});
TextView.args = {
  mode: 'copy',
};

export const NoControls = Template.bind({});
NoControls.args = {
  showControls: false,
};

export const Zoomable = Template.bind({});
Zoomable.args = {
  zoomable: true,
};

export const WithDefaultZoom = Template.bind({});
WithDefaultZoom.args = {
  label: 'Collection of items',
  zoomable: true,
  size: 'tiny',
  defaultZoom: 2,
};
