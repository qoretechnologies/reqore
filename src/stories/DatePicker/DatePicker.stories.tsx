import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DatePicker } from '../../components/DatePicker';
import { StoryMeta } from '../utils';
import { FlatArg, IconArg, MinimalArg, SizeArg } from '../utils/args';

const meta = {
  title: 'Form/DatePicker/Stories',
  component: DatePicker,
  argTypes: {
    ...MinimalArg,
    ...FlatArg,
    ...SizeArg,
    ...IconArg('icon', 'Icon'),
  },
  args: {
    fluid: false,
  },
  render(args) {
    const [value, setValue] = useState<Date>(new Date());
    return (
      <DatePicker
        {...args}
        value={value}
        onChange={(v) => {
          setValue(v);
          args.onChange?.(v);
        }}
      />
    );
  },
} as StoryMeta<typeof DatePicker>;
type Story = StoryObj<typeof meta>;

export default meta;
export const Default: Story = {};
