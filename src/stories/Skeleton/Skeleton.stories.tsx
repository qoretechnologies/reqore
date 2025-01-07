import { StoryObj } from '@storybook/react';
import { ReqoreSkeleton } from '../../components/Skeleton';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Other/Skeleton',
  component: ReqoreSkeleton,
} as StoryMeta<typeof ReqoreSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
