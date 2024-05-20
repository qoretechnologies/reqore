import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import ReqoreControlGroup from '../../components/ControlGroup';
import { DatePicker } from '../../components/DatePicker';
import { DEFAULT_INTENTS, TReqoreIntent } from '../../constants/theme';
import { StoryMeta } from '../utils';
import { FlatArg, IntentArg, MinimalArg, SizeArg } from '../utils/args';

const meta = {
  title: 'Form/DatePicker/Stories',
  component: DatePicker,
  argTypes: {
    ...MinimalArg,
    ...FlatArg,
    ...SizeArg,
    ...IntentArg,
  },
  args: {
    fluid: false,
    value: new Date(),
  },
  render(args) {
    const [value, setValue] = useState<Date | string>(args.value);
    return <DatePicker {...args} value={value} onChange={setValue} />;
  },
} as StoryMeta<typeof DatePicker>;
type Story = StoryObj<typeof meta>;

export default meta;
export const Default: Story = {};
export const WithAM_PM: Story = {
  args: {
    hourCycle: 12,
  },
};
export const WithoutDefaultValue: Story = {
  args: {
    value: null,
  },
};
export const WithoutTimePicker: Story = {
  args: {
    granularity: 'day',
  },
};
export const WithIntent: Story = {
  render(args, ctx) {
    return (
      <ReqoreControlGroup gapSize='big' vertical>
        {Object.keys(DEFAULT_INTENTS).map((intent) =>
          meta.render({ ...args, intent: intent as TReqoreIntent }, ctx)
        )}
      </ReqoreControlGroup>
    );
  },
};
export const Minimal: Story = {
  args: { minimal: true },
};
export const Pill: Story = {
  args: { pill: true },
};
export const WithTooltip: Story = {
  args: {
    tooltip: `Tooltip content`,
  },
};
