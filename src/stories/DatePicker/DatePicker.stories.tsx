import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
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
  },
  render(args) {
    const [value, setValue] = useState<Date | string>(args.value);
    return (
      <DatePicker
        {...args}
        value={value}
        onChange={(v) => {
          setValue(v);
        }}
      />
    );
  },
} as StoryMeta<typeof DatePicker>;
type Story = StoryObj<typeof meta>;

export default meta;
export const Default: Story = {
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const month = await canvas.findByLabelText('month, Datepicker');
    const day = await canvas.findByLabelText('day, Datepicker');
    const year = await canvas.findByLabelText('year, Datepicker');
    const hour = await canvas.findByLabelText('hour, Datepicker');
    const minute = await canvas.findByLabelText('minute, Datepicker');
    const input = await canvasElement.querySelector('input');

    await expect(month).toBeInTheDocument();
    await expect(day).toBeInTheDocument();
    await expect(year).toBeInTheDocument();
    await expect(hour).toBeInTheDocument();
    await expect(minute).toBeInTheDocument();
    await expect(input).toBeInTheDocument();

    await userEvent.type(month, '08');
    await userEvent.type(day, '07');
    await userEvent.type(year, '2020');
    await userEvent.type(hour, '08');
    await userEvent.type(minute, '30');

    const activeCell = canvasElement.querySelector('td [data-selected="true"]');
    await expect(activeCell).toBeInTheDocument();
    await expect(activeCell).toHaveTextContent('7');

    const cell = canvas.getByText('10');
    await userEvent.click(cell);

    const popover = await canvasElement.querySelector('reqore-popover-content');
    await expect(popover).not.toBeInTheDocument();

    const clearBtn = await canvasElement.querySelector('.reqore-clear-input-button');
    await userEvent.click(clearBtn);

    await expect(month).toHaveTextContent('mm');
    await expect(day).toHaveTextContent('d');
    await expect(year).toHaveTextContent('yyyy');
    await expect(hour).toHaveTextContent('––');
    await expect(minute).toHaveTextContent('––');

    await userEvent.click(input);
    await userEvent.click(canvas.getByText('10'));

    await userEvent.type(month, '05');
    await userEvent.type(day, '10');
    await userEvent.type(year, '2024');
    await userEvent.type(hour, '00');
    await userEvent.type(minute, '00');

    await userEvent.click(input);
    const hourTimeField = canvas.getByLabelText('hour, Time');
    const minuteTimeField = canvas.getByLabelText('minute, Time');

    await expect(hourTimeField).toBeInTheDocument();
    await expect(minuteTimeField).toBeInTheDocument();

    await userEvent.type(hourTimeField, '08');
    await userEvent.type(minuteTimeField, '30');

    await expect(hour).toHaveTextContent('08');
    await expect(minute).toHaveTextContent('30');

    const previousMonth = await canvasElement.querySelector('button[aria-label="Previous"]');
    const nextMonth = await canvasElement.querySelector('button[aria-label="Next"]');

    await userEvent.click(previousMonth);
    const headingCanvas = within(canvasElement.querySelector('.reqore-panel .reqore-panel-title'));
    let heading = headingCanvas.queryByText('April 2024');
    await expect(heading).toBeInTheDocument();
    await userEvent.click(nextMonth);
    heading = headingCanvas.queryByText('May 2024');
    await expect(heading).toBeInTheDocument();
  },
};

export const Clearable: Story = {
  args: {
    isClearable: true,
  },
  async play() {},
};
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
