// A date picker given a value it cannot read as an instant never throws from its render (qorus#646: the Qorus
// IDE's Workflow Orders page went to the router's error page for "2026-06-02T08:00:00", a date-time with no zone).
//
// The rule: a value with a zone or an offset is that instant, shown in the user's time zone; a date-time without one
// is that wall-clock time in the user's time zone (ISO 8601 reads it as local time); a date alone is that day at
// midnight, local. Anything else - text that is no date, an invalid Date - is no date: the field is empty, and says it
// was given a value it cannot read (it is invalid). A bound it cannot read is no bound.
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { DatePicker, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import { reqoreFormatScalar } from '../src/components/DataView/helpers';

const DIRECTIONAL_FORMATTING_CHARACTERS = /[‎‏⁦-⁩]/g;

const renderPicker = (props: Partial<React.ComponentProps<typeof DatePicker>>) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <DatePicker value={null} onChange={vi.fn()} locale='en-CA' {...(props as object)} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

/** What the date field shows, its segments as text. */
const shown = (): string =>
  document
    .querySelector('[data-type="day"]')
    ?.parentElement?.textContent?.replace(DIRECTIONAL_FORMATTING_CHARACTERS, '') ?? '';

/** Whether the field says its value is invalid, as the date picker says one out of its bounds. */
const saysInvalid = () => !!document.querySelector('[data-invalid="true"], [aria-invalid="true"]');

describe('a date picker given a value with no zone', () => {
  test('a date-time is that wall-clock time, local', () => {
    renderPicker({ value: '2026-06-02T08:00:00' });

    expect(shown()).toContain('2026-06-02, 08:00');
    expect(saysInvalid()).toBe(false);
  });

  test('a date alone is that day at midnight, local', () => {
    renderPicker({ value: '2026-10-17' });

    expect(shown()).toContain('2026-10-17, 00:00');
    expect(saysInvalid()).toBe(false);
  });
});

describe('a date picker given a value that is no date', () => {
  test.each([
    ['text', 'not a date'],
    ['an invalid Date', new Date('not a date')],
  ])('%s: the field is empty, and invalid', (_kind, value) => {
    renderPicker({ value: value as never });

    expect(shown()).not.toMatch(/\d/);
    expect(saysInvalid()).toBe(true);
  });
});

describe('a date picker given bounds it cannot read', () => {
  test('a bound that is no date is no bound; one with no zone is read as local', () => {
    renderPicker({
      value: '2026-06-02T08:00:00Z',
      minValue: 'not a date',
      maxValue: '2026-12-31',
    });

    expect(shown()).toMatch(/2026-06-02/);
  });

  test('an invalid Date as a bound is no bound', () => {
    renderPicker({
      value: '2026-06-02T08:00:00Z',
      minValue: new Date('nope'),
      maxValue: new Date('nope'),
    });

    expect(shown()).toMatch(/2026-06-02/);
  });
});

describe("a data view's value", () => {
  test('an invalid Date is shown as what it is, not thrown', () => {
    expect(reqoreFormatScalar(new Date('nope')).display).toBe('Invalid Date');
  });
});
