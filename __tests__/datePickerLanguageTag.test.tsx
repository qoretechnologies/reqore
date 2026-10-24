import { cleanup, render } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { DatePicker, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

const DIRECTIONAL_FORMATTING_CHARACTERS = /[‎‏⁦-⁩]/g;
const VALUE = new Date(2024, 3, 10, 8, 0, 0);

const renderDatePicker = (props: { locale?: string; selectOnly?: boolean } = {}) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <DatePicker value={VALUE} onChange={vi.fn()} {...props} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

/** What the field shows: the date in its typed segments, or on its select-only button. */
const shown = (selectOnly?: boolean): string =>
  (selectOnly
    ? document.querySelector('.reqore-datepicker button, button')?.textContent
    : document.querySelector('[data-type="day"]')?.parentElement?.textContent
  )?.replace(DIRECTIONAL_FORMATTING_CHARACTERS, '') ?? '';

/** What the field shows for `locale`, as a valid tag, to compare a POSIX name's with. */
const shownFor = (locale: string, selectOnly?: boolean): string => {
  renderDatePicker({ locale, selectOnly });
  const text = shown(selectOnly);
  cleanup();

  return text;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe.each([false, true])('<DatePicker selectOnly={%s} />', (selectOnly) => {
  it('shows the date in the locale it is given', () => {
    // what the cases below compare is the locale's own format: Czech and American differ
    expect(shownFor('cs-CZ', selectOnly)).not.toBe(shownFor('en-US', selectOnly));
  });

  it.each([
    ['C', 'en-US'],
    ['POSIX', 'en-US'],
    ['C.UTF-8', 'en-US'],
    ['en_US.UTF-8', 'en-US'],
    ['en-US@posix', 'en-US'],
    ['cs_CZ.UTF-8', 'cs-CZ'],
  ])('shows the date with a %j locale as %j does', (locale, tag) => {
    const expected = shownFor(tag, selectOnly);
    expect(expected).toMatch(/2024|24/);

    renderDatePicker({ locale, selectOnly });

    expect(shown(selectOnly)).toBe(expected);
  });

  it('shows the date where the browser reports its language as en-US@posix', () => {
    // Chromium on Linux with LANG=C.UTF-8, LANG=C or no LANG
    const expected = shownFor('en-US', selectOnly);
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('en-US@posix');
    vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['en-US@posix']);

    renderDatePicker({ selectOnly });

    expect(shown(selectOnly)).toBe(expected);
  });

  it("falls back to the browser's language past a locale that names none", () => {
    const expected = shownFor('cs-CZ', selectOnly);
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('cs-CZ');
    vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['cs-CZ']);

    renderDatePicker({ locale: 'not a locale', selectOnly });

    expect(shown(selectOnly)).toBe(expected);
  });
});
