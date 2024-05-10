import { StoryObj } from '@storybook/react';
import ReqoreControlGroup from '../../components/ControlGroup';
import ReqoreInput from '../../components/Input';
import { ReqoreLabel } from '../../components/Label';
import { StoryMeta } from '../utils';
import { FlatArg, IconArg, MinimalArg, SizeArg } from '../utils/args';

const meta = {
  title: 'Form/Label/Stories',
  component: ReqoreLabel,
  argTypes: {
    ...MinimalArg,
    ...FlatArg,
    ...SizeArg,
    ...IconArg('icon', 'Icon'),
  },
  args: {
    icon: 'SearchLine',
    label: 'Search',
  },
  render(args) {
    return (
      <ReqoreControlGroup vertical>
        <ReqoreLabel htmlFor='search' {...args} />
        <ReqoreInput id='search' placeholder='Search' />
      </ReqoreControlGroup>
    );
  },
} as StoryMeta<typeof ReqoreLabel>;
type Story = StoryObj<typeof meta>;

export default meta;
export const Default: Story = {};
