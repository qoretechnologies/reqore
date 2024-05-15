import { CalendarDateTime, getLocalTimeZone } from '@internationalized/date';
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
    icon: 'SearchLine',
    label: 'Search',
  },
  render(args) {
    const [value, setValue] = useState<CalendarDateTime>();
    console.log(new Date(value ? value?.toDate(getLocalTimeZone()) : new Date()).toISOString());
    return <DatePicker {...args} value={value} onChange={setValue} />;
  },
} as StoryMeta<typeof DatePicker>;
type Story = StoryObj<typeof meta>;

export default meta;
export const Default: Story = {};
