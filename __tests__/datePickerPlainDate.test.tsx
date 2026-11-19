import { resetLocalTimeZone, setLocalTimeZone } from '@internationalized/date';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import { DatePicker } from '../src/components/DatePicker';
import { readDate, toPlainDate } from '../src/helpers/dates';

/**
 * A plain date (queue item 33, the IDE's test rows): a day with no time and no zone, read and written as
 * `YYYY-MM-DD`, the same day whatever zone the browser is in. An instant written as ISO in UTC came back as the day
 * before east of UTC.
 */

/** East of UTC (13 hours ahead in October) and west of it. */
const ZONES = ['Pacific/Auckland', 'America/Los_Angeles'];

/* The zone the dates are read in: `@internationalized/date`'s, and Node's own, which it reads a local offset from
   (a zone set for the library alone kept the machine's offset). */
const SYSTEM_ZONE = process.env.TZ;

afterEach(() => {
  resetLocalTimeZone();
  // `process.env` holds strings: an `undefined` written there is the word "undefined"
  if (SYSTEM_ZONE === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = SYSTEM_ZONE;
  }
});

describe.each(ZONES)('in %s', (zone) => {
  beforeEach(() => {
    process.env.TZ = zone;
    setLocalTimeZone(zone);
  });

  it('a day read is the same day written', () => {
    expect(toPlainDate(readDate('2026-10-17')!)).toBe('2026-10-17');
  });

  it('an instant is the day it falls on there', () => {
    // 18:00 UTC on the 16th is the 17th in Auckland and still the 16th in Los Angeles
    expect(toPlainDate(readDate('2026-10-16T18:00:00Z')!)).toBe(
      zone === 'Pacific/Auckland' ? '2026-10-17' : '2026-10-16'
    );
  });

  it('the picker shows the day, no time, and gives back the next day as a plain date', () => {
    const onChange = vi.fn();
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <DatePicker
              plainDate
              value='2026-10-17'
              onChange={onChange}
              aria-label='Due'
              locale='en-US'
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    const day = screen.getByLabelText('day, Due');
    expect(day.textContent).toBe('17');
    expect(screen.queryByLabelText('hour, Due')).toBeNull();

    fireEvent.keyDown(day, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenLastCalledWith('2026-10-18');
  });
});
