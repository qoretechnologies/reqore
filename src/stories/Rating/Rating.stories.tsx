import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ReqoreRating, { IReqoreRatingProps } from '../../components/Rating';
import { ReqoreControlGroup } from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Form/Rating/Stories',
  component: ReqoreRating,
} as StoryMeta<typeof ReqoreRating>;

export default meta;
type Story = StoryObj<typeof meta>;

const InteractiveTemplate: StoryFn<IReqoreRatingProps> = (args) => {
  const [value, setValue] = useState(args.value ?? 3);

  return (
    <ReqoreControlGroup vertical gapSize="normal">
      <p>Current value: {value}</p>
      <ReqoreRating {...args} value={value} onChange={setValue} />
    </ReqoreControlGroup>
  );
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
      <ReqoreControlGroup vertical gapSize="big">
        {sizes.map((size) => (
          <ReqoreControlGroup key={size} gapSize="normal" verticalAlign="center">
            <span style={{ width: '80px', display: 'inline-block' }}>{size}</span>
            <ReqoreRating
              {...args}
              size={size}
              value={values[size] ?? 3}
              onChange={(v) => setValues((prev) => ({ ...prev, [size]: v }))}
            />
          </ReqoreControlGroup>
        ))}
      </ReqoreControlGroup>
    );
  },
};

export const Intents: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize="big">
      <ReqoreControlGroup gapSize="normal" verticalAlign="center">
        <span style={{ width: '80px' }}>Default</span>
        <ReqoreRating {...args} value={4} />
      </ReqoreControlGroup>
      <ReqoreControlGroup gapSize="normal" verticalAlign="center">
        <span style={{ width: '80px' }}>Info</span>
        <ReqoreRating {...args} value={4} intent="info" />
      </ReqoreControlGroup>
      <ReqoreControlGroup gapSize="normal" verticalAlign="center">
        <span style={{ width: '80px' }}>Success</span>
        <ReqoreRating {...args} value={4} intent="success" />
      </ReqoreControlGroup>
      <ReqoreControlGroup gapSize="normal" verticalAlign="center">
        <span style={{ width: '80px' }}>Warning</span>
        <ReqoreRating {...args} value={4} intent="warning" />
      </ReqoreControlGroup>
      <ReqoreControlGroup gapSize="normal" verticalAlign="center">
        <span style={{ width: '80px' }}>Danger</span>
        <ReqoreRating {...args} value={4} intent="danger" />
      </ReqoreControlGroup>
      <ReqoreControlGroup gapSize="normal" verticalAlign="center">
        <span style={{ width: '80px' }}>Pending</span>
        <ReqoreRating {...args} value={4} intent="pending" />
      </ReqoreControlGroup>
      <ReqoreControlGroup gapSize="normal" verticalAlign="center">
        <span style={{ width: '80px' }}>Muted</span>
        <ReqoreRating {...args} value={4} intent="muted" />
      </ReqoreControlGroup>
    </ReqoreControlGroup>
  ),
};

export const HalfStars: Story = {
  render: (args) => {
    const [value, setValue] = useState(2.5);

    return (
      <ReqoreControlGroup vertical gapSize="normal">
        <p>Current value: {value}</p>
        <ReqoreRating {...args} value={value} onChange={setValue} allowHalf />
      </ReqoreControlGroup>
    );
  },
};

export const CustomIcons: Story = {
  render: (args) => {
    const [hearts, setHearts] = useState(3);
    const [thumbs, setThumbs] = useState(2);

    return (
      <ReqoreControlGroup vertical gapSize="big">
        <ReqoreControlGroup vertical gapSize="normal">
          <p>Hearts: {hearts}</p>
          <ReqoreRating
            {...args}
            value={hearts}
            onChange={setHearts}
            filledIcon="HeartFill"
            emptyIcon="HeartLine"
            halfIcon="HeartLine"
            intent="danger"
          />
        </ReqoreControlGroup>
        <ReqoreControlGroup vertical gapSize="normal">
          <p>Thumbs: {thumbs}</p>
          <ReqoreRating
            {...args}
            value={thumbs}
            onChange={setThumbs}
            filledIcon="ThumbUpFill"
            emptyIcon="ThumbUpLine"
            halfIcon="ThumbUpLine"
            intent="success"
          />
        </ReqoreControlGroup>
      </ReqoreControlGroup>
    );
  },
};

export const ReadOnly: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize="big">
      <ReqoreRating {...args} value={4} readOnly />
      <ReqoreRating {...args} value={3} readOnly intent="success" />
      <ReqoreRating {...args} value={2.5} readOnly allowHalf intent="warning" />
    </ReqoreControlGroup>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize="big">
      <ReqoreRating {...args} value={3} disabled />
      <ReqoreRating {...args} value={4} disabled intent="info" />
    </ReqoreControlGroup>
  ),
};

export const CustomMax: Story = {
  render: (args) => {
    const [value, setValue] = useState(7);

    return (
      <ReqoreControlGroup vertical gapSize="normal">
        <p>Current value: {value} / 10</p>
        <ReqoreRating {...args} value={value} onChange={setValue} max={10} />
      </ReqoreControlGroup>
    );
  },
};

export const AllowClear: Story = {
  render: (args) => {
    const [value, setValue] = useState(3);

    return (
      <ReqoreControlGroup vertical gapSize="normal">
        <p>Click the same star again to clear. Value: {value}</p>
        <ReqoreRating {...args} value={value} onChange={setValue} allowClear />
      </ReqoreControlGroup>
    );
  },
};
