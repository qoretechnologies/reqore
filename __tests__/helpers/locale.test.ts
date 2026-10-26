import { POSIX_LOCALE, resolveLocale, toLanguageTag } from '../../src/helpers/locale';

describe('toLanguageTag', () => {
  it.each([
    // what Chromium on Linux reports with LANG=C.UTF-8, LANG=C, LANG=POSIX or no LANG
    ['en-US@posix', 'en-US'],
    // POSIX locale names, as a host's environment or server names them
    ['en_US.UTF-8', 'en-US'],
    ['cs_CZ.UTF-8', 'cs-CZ'],
    ['de_DE.ISO-8859-1@euro', 'de-DE'],
    ['sr_RS@latin', 'sr-RS'],
    ['C', POSIX_LOCALE],
    ['C.UTF-8', POSIX_LOCALE],
    ['POSIX', POSIX_LOCALE],
    // BCP 47 tags, canonicalised
    ['en-US', 'en-US'],
    ['cs', 'cs'],
    ['EN-gb', 'en-GB'],
    ['zh-hant-tw', 'zh-Hant-TW'],
    [' fr-CA ', 'fr-CA'],
  ])('reads %j as %j', (tag, expected) => {
    expect(toLanguageTag(tag)).toBe(expected);
    // and Intl formats with what it gives
    expect(() => new Intl.DateTimeFormat(toLanguageTag(tag))).not.toThrow();
  });

  it.each([undefined, null, '', '   ', '@posix', '.UTF-8', 'not a tag', 'en-US-x', '123'])(
    'reads %j as no tag',
    (tag) => {
      expect(toLanguageTag(tag)).toBeUndefined();
    }
  );

  it('drops a codeset or modifier that runs on past a line break', () => {
    // what is after the first `.` or `@` is never part of the tag, wherever the line ends
    expect(toLanguageTag('en_US.UTF\n-8')).toBe('en-US');
    expect(toLanguageTag('sr_RS@lat\rin')).toBe('sr-RS');
    // a run of dots before a line break names no locale (it used to be read again from every dot)
    expect(toLanguageTag(`${'.'.repeat(10_000)}\nx`)).toBeUndefined();
  });

  it('reads a well-formed tag Intl has no data for as no tag', () => {
    // a valid BCP 47 tag of a language no runtime has formats for
    expect(Intl.getCanonicalLocales('qaa')).toEqual(['qaa']);
    expect(toLanguageTag('qaa')).toBeUndefined();
  });

  it('turns what made Intl throw into what it formats with', () => {
    expect(() => new Intl.DateTimeFormat('en-US@posix')).toThrow(RangeError);
    expect(() => new Intl.DateTimeFormat('cs_CZ.UTF-8')).toThrow(RangeError);
    expect(new Intl.DateTimeFormat(toLanguageTag('cs_CZ.UTF-8')).resolvedOptions().locale).toBe(
      'cs-CZ'
    );
  });
});

describe('resolveLocale', () => {
  it('is the first tag that names a locale', () => {
    expect(resolveLocale('cs', 'de-DE')).toBe('cs');
    expect(resolveLocale(undefined, 'not a tag', 'de_DE.UTF-8', 'cs')).toBe('de-DE');
  });

  it('falls back past a tag that names no locale to the next one', () => {
    // a host's own tag that is no locale gives way to the browser's
    expect(resolveLocale('xx_YY_ZZ.UTF-8', 'en-US@posix')).toBe('en-US');
  });

  it('is the runtime default (undefined) when no tag names a locale', () => {
    expect(resolveLocale()).toBeUndefined();
    expect(resolveLocale(undefined, null, '', 'not a tag')).toBeUndefined();
    expect(() => new Intl.DateTimeFormat(resolveLocale('not a tag'))).not.toThrow();
  });
});
