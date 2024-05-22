import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { userEvent, within } from '@storybook/testing-library';
import { size } from 'lodash';
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
  parameters: {
    chromatic: {
      viewports: [1440],
    },
    mockingDate: new Date(2024, 4, 10, 8, 0, 0),
  },

  args: {
    fluid: false,
    value: new Date(2024, 4, 10, 8, 0, 0),
    popoverProps: {
      openOnMount: process.env.NODE_ENV === 'production',
    },
    'aria-label': 'Datepicker',
    onChange: fn(),
    onClearClick: fn(),
  },
  render(args) {
    const [value, setValue] = useState<Date | string>(args.value);
    return (
      <DatePicker
        {...args}
        value={value}
        onChange={(v) => {
          setValue(v);
          args.onChange(v);
        }}
      />
    );
  },
} as StoryMeta<typeof DatePicker>;
type Story = StoryObj<typeof meta>;

const getDateElements = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const month = await canvas.findByLabelText('month, Datepicker');
  const day = await canvas.findByLabelText('day, Datepicker');
  const year = await canvas.findByLabelText('year, Datepicker');
  const hour = await canvas.findByLabelText('hour, Datepicker');
  const minute = await canvas.findByLabelText('minute, Datepicker');
  const popover = await canvasElement.querySelector('reqore-popover-content');
  const input = await canvasElement.querySelector('input');

  return {
    month,
    day,
    year,
    hour,
    minute,
    popover,
    input,
    canvas,
  };
};
const getPopoverElements = async (canvasElement: HTMLElement) => {
  const popover = canvasElement.querySelector('.reqore-popover-content');
  const popoverCanvas = within(popover as HTMLElement);
  const previousMonth = canvasElement.querySelector('button[aria-label="Previous"]');
  const nextMonth = canvasElement.querySelector('button[aria-label="Next"]');
  const hourTimeField = popoverCanvas.getByLabelText('hour, Time');
  const minuteTimeField = popoverCanvas.getByLabelText('minute, Time');
  const headingCanvas = within(canvasElement.querySelector('.reqore-panel .reqore-panel-title'));

  return {
    popoverCanvas,
    headingCanvas,
    popover,
    previousMonth,
    nextMonth,
    hourTimeField,
    minuteTimeField,
  };
};
export default meta;
export const Default: Story = {
  args: {
    value: new Date(2024, 4, 10, 8, 0, 0),
  },
  async play({ canvasElement }) {
    const { month, year, day, hour, minute, input } = await getDateElements(canvasElement);

    await expect(month).toBeInTheDocument();
    await expect(day).toBeInTheDocument();
    await expect(year).toBeInTheDocument();
    await expect(hour).toBeInTheDocument();
    await expect(minute).toBeInTheDocument();
    await expect(input).toBeInTheDocument();

    await expect(month).toHaveTextContent('05');
    await expect(day).toHaveTextContent('10');
    await expect(year).toHaveTextContent('2024');
    await expect(hour).toHaveTextContent('08');
    await expect(minute).toHaveTextContent('00');
  },
};

export const WithAM_PM: Story = {
  args: {
    hourCycle: 12,
  },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const AM_PM = await canvas.findByLabelText('AM/PM, Datepicker');

    await expect(AM_PM).toBeInTheDocument();
  },
};
export const WithoutDefaultValue: Story = {
  args: {
    value: null,
    popoverProps: {},
  },
  async play({ canvasElement }) {
    const { month, year, day, hour, minute, input } = await getDateElements(canvasElement);
    await expect(month).toHaveTextContent('mm');
    await expect(day).toHaveTextContent('d');
    await expect(year).toHaveTextContent('yyyy');
    await expect(hour).toHaveTextContent('––');
    await expect(minute).toHaveTextContent('––');

    await userEvent.click(input);
    const { headingCanvas, hourTimeField, minuteTimeField } =
      await getPopoverElements(canvasElement);
    const heading = headingCanvas.queryByText('May 2024');
    await expect(heading).toBeInTheDocument();
    await expect(hourTimeField).toHaveTextContent('––');
    await expect(minuteTimeField).toHaveTextContent('––');
  },
};

export const WithoutTimePicker: Story = {
  args: {
    granularity: 'day',
    popoverProps: { openOnMount: true },
  },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const hour = await canvas.queryByLabelText('hour, Datepicker');
    const minute = await canvas.queryByLabelText('minute, Datepicker');
    const timefield = canvasElement.querySelector('.reqore-popover-content .reqore-input');

    await expect(hour).toBeNull();
    await expect(minute).toBeNull();
    await expect(timefield).toBeNull();
  },
};
export const WithIntent: Story = {
  args: {
    popoverProps: {
      openOnMount: false,
    },
  },
  render(args, ctx) {
    return (
      <ReqoreControlGroup gapSize='big' vertical>
        {Object.keys(DEFAULT_INTENTS)
          .reverse()
          .map((intent, index) =>
            meta.render(
              {
                ...args,
                intent: intent as TReqoreIntent,
                pickerActiveDayProps: {
                  intent: intent as TReqoreIntent,
                },
                popoverProps: {
                  openOnMount: index === size(DEFAULT_INTENTS) - 1,
                },
              },
              ctx
            )
          )}
      </ReqoreControlGroup>
    );
  },
};

export const WithEffect: Story = {
  args: {
    pickerProps: {
      contentEffect: {
        gradient: {
          colors: 'info',
        },
      },
    },
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

export const ValueCanBeTyped: Story = {
  args: {
    parameters: {
      chromatic: { disableSnapshot: true },
    },
  },
  async play({ canvasElement }) {
    const { month, year, day, hour, minute } = await getDateElements(canvasElement);

    await userEvent.type(month, '05');
    await userEvent.type(day, '15');
    await userEvent.type(year, '2023');
    await userEvent.type(hour, '08');
    await userEvent.type(minute, '30');

    await expect(month).toHaveTextContent('05');
    await expect(day).toHaveTextContent('15');
    await expect(year).toHaveTextContent('2023');
    await expect(hour).toHaveTextContent('08');
    await expect(minute).toHaveTextContent('30');
  },
};
export const ValueCanBeCleared: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  args: {
    value: new Date(2024, 4, 10, 8, 0, 0),
  },
  async play({ canvasElement, args }) {
    const { month, year, day, hour, minute } = await getDateElements(canvasElement);
    const clearBtn = await canvasElement.querySelector('.reqore-clear-input-button');
    await expect(clearBtn).toBeInTheDocument();
    await userEvent.click(clearBtn);
    await expect(month).toHaveTextContent('mm');
    await expect(day).toHaveTextContent('dd');
    await expect(year).toHaveTextContent('yyyy');
    await expect(hour).toHaveTextContent('––');
    await expect(minute).toHaveTextContent('––');

    await expect(args.onClearClick).toBeCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith(null);
  },
};
export const ValueCanBeChosenFromPopover: Story = {
  args: {
    popoverProps: {},
    value: new Date(2024, 4, 10, 8, 0, 0),
    parameters: {
      chromatic: { disableSnapshot: true },
    },
  },
  async play({ canvasElement }) {
    const { month, year, day, hour, minute, input } = await getDateElements(canvasElement);
    await userEvent.click(input);
    const { popover, popoverCanvas, nextMonth } = await getPopoverElements(canvasElement);
    await expect(popover).toBeInTheDocument();
    await userEvent.click(nextMonth);
    const cell = popoverCanvas.getByText('25');
    await userEvent.click(cell);
    await expect(month).toHaveTextContent('06');
    await expect(day).toHaveTextContent('25');
    await expect(year).toHaveTextContent('2024');
    await expect(hour).toHaveTextContent('08');
    await expect(minute).toHaveTextContent('00');
  },
};

export const CurrentCalendarMonthCanBeChanged: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  args: {
    popoverProps: {},
  },
  async play({ canvasElement }) {
    const { input } = await getDateElements(canvasElement);
    await userEvent.click(input);
    const { popover, headingCanvas, nextMonth, previousMonth } =
      await getPopoverElements(canvasElement);
    await expect(popover).toBeInTheDocument();
    await userEvent.click(nextMonth);
    let heading = headingCanvas.queryByText('June 2024');
    await expect(heading).toBeInTheDocument();

    await userEvent.click(previousMonth);
    heading = headingCanvas.queryByText('May 2024');
    await expect(heading).toBeInTheDocument();
  },
};
export const TimeCanBeChangedFromPopover: Story = {
  args: {
    popoverProps: {},
  },
  async play({ canvasElement }) {
    const { input, hour, minute } = await getDateElements(canvasElement);
    await userEvent.click(input);
    const { hourTimeField, minuteTimeField } = await getPopoverElements(canvasElement);

    await userEvent.type(hourTimeField, '10');
    await userEvent.type(minuteTimeField, '15');

    await expect(hour).toHaveTextContent('10');
    await expect(minute).toHaveTextContent('15');
  },
};
export const ShouldSaveTimeWhenDateValueIsNull: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  args: {
    value: null,
    popoverProps: {},
  },
  async play({ canvasElement }) {
    const { input } = await getDateElements(canvasElement);

    await userEvent.click(input);
    const { month, day, year, hour, minute } = await getDateElements(canvasElement);
    const { hourTimeField, minuteTimeField } = await getPopoverElements(canvasElement);
    await userEvent.type(hourTimeField, '08');
    await userEvent.type(minuteTimeField, '15');
    await userEvent.click(canvasElement);
    await userEvent.click(input);
    await expect(hourTimeField).toHaveTextContent('08');
    await expect(minuteTimeField).toHaveTextContent('15');

    const { popoverCanvas } = await getPopoverElements(canvasElement);

    const cell = popoverCanvas.getByText('25');
    await userEvent.click(cell);
    await expect(month).toHaveTextContent('05');
    await expect(day).toHaveTextContent('25');
    await expect(year).toHaveTextContent('2024');
    await expect(hour).toHaveTextContent('08');
    await expect(minute).toHaveTextContent('15');
  },
};
