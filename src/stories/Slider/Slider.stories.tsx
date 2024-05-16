import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import ReqoreControlGroup from '../../components/ControlGroup';
import ReqoreSlider from '../../components/Slider';
import { StoryMeta } from '../utils';
import { DisabledArg, IconArg, MinimalArg, SizeArg } from '../utils/args';

const meta = {
  title: 'Form/Slider/Stories',
  component: ReqoreSlider,
  argTypes: {
    ...MinimalArg,
    ...SizeArg,
    ...DisabledArg,
    ...IconArg('icon', 'Icon'),
    ...IconArg('rightIcon', 'Right Icon'),
    fluid: {
      control: 'boolean',
      defaultValue: true,
    },
    labelsPosition: {
      control: 'select',
      defaultValue: 'top',
      options: ['top', 'bottom'],
    },
  },
  args: {
    value: [2, 9.6],
    min: 0,
    max: 10,
    fluid: true,
  },
  render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <>
        <ReqoreControlGroup style={{ width: '100%' }} vertical gapSize='huge'>
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
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithIcons: Story = {
  args: {
    icon: 'VolumeDownLine',
    rightIcon: 'VolumeUpLine',
  },
};
export const WithIntent: Story = {
  args: {
    intent: 'success',
  },
  render(args, ctx) {
    return (
      <ReqoreControlGroup vertical gapSize='huge'>
        {meta.render({ ...args, intent: 'info' }, ctx)}
        {meta.render({ ...args, intent: 'success', showLabels: true }, ctx)}
        {meta.render(
          {
            ...args,
            intent: 'warning',
            showLabels: true,
            minLabelProps: { intent: 'info' },
            icon: 'WeiboFill',
          },
          ctx
        )}
        {meta.render({ ...args, intent: 'danger' }, ctx)}
      </ReqoreControlGroup>
    );
  },
};
export const WithLabels: Story = {
  args: {
    showLabels: true,
  },
};
export const WithLabelsBelow: Story = {
  args: {
    showLabels: true,
    labelsPosition: 'bottom',
  },
};
export const WithLabelsAndIcons: Story = {
  args: {
    ...WithLabels.args,
    ...WithIcons.args,
  },
};

export const WithCurrentValueOverThumb: Story = {
  args: {
    ...WithLabels.args,
    ...WithIcons.args,
    displayCurrentValueOverThumb: true,
  },
};

export const WithSize: Story = {
  args: {
    ...WithLabels.args,
    ...WithIcons.args,
    size: 'small',
  },
};

export const WithEffect: Story = {
  args: {
    showLabels: true,
    effect: {
      gradient: {
        direction: 'to right bottom',
        colors: { 0: '#ca74da', 100: '#521b6e' },
        animate: 'active',
      },
      spaced: 2,
      uppercase: true,
      weight: 'thick',
      textSize: 'small',
    },

    rangeProps: {
      effect: {
        gradient: {
          direction: 'to right bottom',
          colors: { 0: '#f9f9f9', 100: '#ca55a9' },
          animate: 'always',
        },
      },
    },
    thumbProps: {
      effect: {
        gradient: {
          direction: 'to right bottom',
          colors: { 0: '#f9f9f9', 100: '#ca55a9' },
          animate: 'active',
        },
      },
    },

    currentMaxLabelProps: {
      effect: {
        gradient: {
          type: 'radial',
          colors: { 0: '#41baea', 100: '#80ffd9' },
          animate: 'hover',
        },
      },
    },
  },
};
