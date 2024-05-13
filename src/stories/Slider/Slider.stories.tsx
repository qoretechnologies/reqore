import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import ReqoreControlGroup from '../../components/ControlGroup';
import ReqoreSlider from '../../components/Slider';
import { StoryMeta } from '../utils';
import { DisabledArg, FlatArg, IconArg, MinimalArg } from '../utils/args';

const meta = {
  title: 'Form/Slider/Stories',
  component: ReqoreSlider,
  argTypes: {
    ...MinimalArg,
    ...FlatArg,
    ...DisabledArg,
    ...IconArg('icon', 'Icon'),
    ...IconArg('rightIcon', 'Right Icon'),
    fluid: {
      control: 'boolean',
      defaultValue: true,
    },
  },
  args: {
    value: [2, 8],
    min: 0,
    max: 10,
  },
  render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <>
        <ReqoreControlGroup vertical gapSize='huge'>
          <ReqoreSlider {...args} value={value[0]} onChange={(min) => setValue([min, value[1]])} />

          <ReqoreSlider {...args} value={value} onChange={setValue} />
          <ReqoreControlGroup gapSize='huge'>
            <ReqoreSlider
              {...args}
              orientation='vertical'
              value={value[0]}
              onChange={(min) => setValue([min, value[1]])}
            />
            <ReqoreSlider {...args} orientation='vertical' value={value} onChange={setValue} />
          </ReqoreControlGroup>
        </ReqoreControlGroup>
      </>
    );
  },
} as StoryMeta<typeof ReqoreSlider>;
type Story = StoryObj<typeof meta>;

export default meta;
export const Default: Story = {};

export const WithIcons: Story = {
  args: {
    icon: 'VolumeDownLine',
    rightIcon: 'VolumeUpLine',
  },
};
export const WithLabels: Story = {
  args: {
    showLabels: true,
  },
};
export const WithLabelsAndIcons: Story = {
  args: {
    ...WithLabels.args,
    ...WithIcons.args,
  },
};
