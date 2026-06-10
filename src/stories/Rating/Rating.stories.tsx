import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ReqoreRating, { IReqoreRatingProps } from '../../components/Rating';
import { ReqoreControlGroup } from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Form/Rating',
  component: ReqoreRating,
} as StoryMeta<typeof ReqoreRating>;

export default meta;
type Story = StoryObj<typeof meta>;

const InteractiveTemplate: StoryFn<IReqoreRatingProps> = (args) => {
  const [value, setValue] = useState(args.value ?? 3);

  return <ReqoreRating {...args} label='Rating' value={value} onChange={setValue} />;
};

export const Basic: Story = {
  render: InteractiveTemplate,
  args: {
    value: 3,
  },
};

export const Sizes: Story = {
  render: (args) => {
    const [values, setValues] = useState<Record<string, number>>({});
    const sizes = ['micro', 'tiny', 'small', 'normal', 'big', 'huge', 'massive'] as const;

    return (
      <ReqoreControlGroup vertical gapSize='big'>
        {sizes.map((size) => (
          <ReqoreRating
            key={size}
            {...args}
            size={size}
            label={size}
            value={values[size] ?? 3}
            onChange={(v) => setValues((prev) => ({ ...prev, [size]: v }))}
          />
        ))}
      </ReqoreControlGroup>
    );
  },
};

export const Intents: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big'>
      <ReqoreRating {...args} value={4} label='Default' />
      <ReqoreRating {...args} value={4} label='Info' intent='info' />
      <ReqoreRating {...args} value={4} label='Success' intent='success' />
      <ReqoreRating {...args} value={4} label='Warning' intent='warning' />
      <ReqoreRating {...args} value={4} label='Danger' intent='danger' />
      <ReqoreRating {...args} value={4} label='Pending' intent='pending' />
      <ReqoreRating {...args} value={4} label='Muted' intent='muted' />
    </ReqoreControlGroup>
  ),
};

export const HalfStars: Story = {
  render: (args) => {
    const [value, setValue] = useState(2.5);

    return (
      <ReqoreRating {...args} label='Half stars' value={value} onChange={setValue} allowHalf />
    );
  },
};

export const CustomIcons: Story = {
  render: (args) => {
    const [hearts, setHearts] = useState(3);
    const [thumbs, setThumbs] = useState(2);

    return (
      <ReqoreControlGroup vertical gapSize='big'>
        <ReqoreRating
          {...args}
          label='Hearts'
          value={hearts}
          onChange={setHearts}
          filledIcon='HeartFill'
          emptyIcon='HeartLine'
          halfIcon='HeartLine'
          intent='danger'
        />
        <ReqoreRating
          {...args}
          label='Thumbs'
          value={thumbs}
          onChange={setThumbs}
          filledIcon='ThumbUpFill'
          emptyIcon='ThumbUpLine'
          halfIcon='ThumbUpLine'
          intent='success'
        />
      </ReqoreControlGroup>
    );
  },
};

export const ReadOnly: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big'>
      <ReqoreRating {...args} value={4} label='Default' readOnly />
      <ReqoreRating {...args} value={3} label='Success' readOnly intent='success' />
      <ReqoreRating
        {...args}
        value={2.5}
        label='Warning (half)'
        readOnly
        allowHalf
        intent='warning'
      />
    </ReqoreControlGroup>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big'>
      <ReqoreRating {...args} value={3} label='Default' disabled />
      <ReqoreRating {...args} value={4} label='Info' disabled intent='info' />
    </ReqoreControlGroup>
  ),
};

export const CustomMax: Story = {
  render: (args) => {
    const [value, setValue] = useState(7);

    return (
      <ReqoreRating
        {...args}
        label='Rating (out of 10)'
        value={value}
        onChange={setValue}
        max={10}
      />
    );
  },
};

export const NoLabelAndRatingValue: Story = {
  render: (args) => {
    const [value, setValue] = useState(7);

    return <ReqoreRating {...args} showRatingValue={false} value={value} onChange={setValue} />;
  },
};

export const WithIconProps: Story = {
  render: (args) => {
    const [value, setValue] = useState(4);

    return (
      <ReqoreControlGroup vertical gapSize='big'>
        <ReqoreRating
          {...args}
          label='Spinning icons'
          value={value}
          onChange={setValue}
          iconProps={{ animation: 'spin' }}
          intent='warning'
        />
        <ReqoreRating
          {...args}
          label='Rotated icons'
          value={value}
          onChange={setValue}
          iconProps={{ rotation: 15 }}
          intent='success'
        />
      </ReqoreControlGroup>
    );
  },
};

export const AllowClear: Story = {
  render: (args) => {
    const [value, setValue] = useState(3);

    return (
      <ReqoreRating
        {...args}
        label='Click the same star again to clear'
        value={value}
        onChange={setValue}
        allowClear
      />
    );
  },
};
