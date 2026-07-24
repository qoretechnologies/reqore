import { render } from '@testing-library/react';
import {
  DatePicker,
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';

const DIRECTIONAL_FORMATTING_CHARACTERS = /[\u200e\u200f\u2066-\u2069]/g;

const renderDatePicker = (dateTimeSeparator?: string) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <DatePicker
            value={new Date(2024, 3, 10, 8, 0, 0)}
            onChange={vi.fn()}
            locale='en-CA'
            dateTimeSeparator={dateTimeSeparator}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const getVisibleDateInputText = (): string =>
  document
    .querySelector('[data-type="day"]')
    ?.parentElement?.textContent?.replace(DIRECTIONAL_FORMATTING_CHARACTERS, '') ?? '';

test('<DatePicker /> preserves the locale date-time separator by default', () => {
  renderDatePicker();

  expect(getVisibleDateInputText()).toContain('2024-04-10, 08:00');
});

test('<DatePicker /> replaces the locale date-time separator', () => {
  renderDatePicker(' ');

  expect(getVisibleDateInputText()).toContain('2024-04-10 08:00');
  expect(getVisibleDateInputText()).not.toContain(',');
});

test('<DatePicker /> only replaces the date-time separator in select-only mode', () => {
  const { getByRole } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <DatePicker
            value={new Date(2024, 3, 10, 8, 0, 0)}
            onChange={vi.fn()}
            locale='en-US'
            dateTimeSeparator=' '
            selectOnly
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(getByRole('button', { name: /Apr 10, 2024 08:00/ })).toBeInTheDocument();
});
