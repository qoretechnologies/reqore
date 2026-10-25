// Copyright 2026 Qore Technologies, s.r.o.

/** What a `C` or `POSIX` locale name stands for: the POSIX locale is American English. */
export const POSIX_LOCALE = 'en-US';

/**
 * `tag` as a BCP 47 language tag that `Intl` can format with, or `undefined` when it names none.
 *
 * Browsers and hosts hand over POSIX locale names as well as BCP 47 tags, and `Intl` throws a
 * `RangeError` on a POSIX one. Chromium on Linux reports `navigator.language` as `en-US@posix` when
 * its environment's locale is C or POSIX (`LANG=C.UTF-8`, `LANG=C`, or no `LANG` at all, as in most
 * Linux containers), and a server may send `cs_CZ.UTF-8`. So the codeset (`.UTF-8`) and the
 * modifier (`@posix`) are dropped, `_` becomes `-`, and `C` and `POSIX` become `en-US`. A tag that
 * is still not one `Intl` accepts, or names a locale it has no data for, is `undefined`.
 */
export const toLanguageTag = (tag: string | null | undefined): string | undefined => {
  // No BCP 47 tag holds a `.` or an `@`: from the first one on, it is a POSIX codeset or modifier. It is cut off
  // there by position. `/[.@].*$/` did not reach past a line break (`.` stops at one, and `$` is only the end), so it
  // left a codeset in place when one followed it, and for every `.` before the break it tried again: quadratic in
  // the length of what a browser or host hands over (CodeQL js/polynomial-redos).
  const trimmed = tag?.trim() ?? '';
  const end = trimmed.search(/[.@]/);
  const name = (end < 0 ? trimmed : trimmed.slice(0, end)).replace(/_/g, '-');

  if (!name) {
    return undefined;
  }

  if (name === 'C' || name === 'POSIX') {
    return POSIX_LOCALE;
  }

  try {
    const [canonical] = Intl.getCanonicalLocales(name);

    return Intl.DateTimeFormat.supportedLocalesOf([canonical]).length ? canonical : undefined;
  } catch {
    return undefined;
  }
};

/**
 * The first of `tags` that `Intl` can format with, as a BCP 47 tag (see `toLanguageTag`), or
 * `undefined` (the runtime's own default) when none can. Pass the tags in order of preference: a
 * caller's own, then the browser's.
 */
export const resolveLocale = (...tags: (string | null | undefined)[]): string | undefined => {
  for (const tag of tags) {
    const languageTag = toLanguageTag(tag);

    if (languageTag) {
      return languageTag;
    }
  }

  return undefined;
};
