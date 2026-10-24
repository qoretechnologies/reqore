// Copyright 2026 Qore Technologies, s.r.o.

/**
 * The Vitest project the stories tagged `posix-locale` run in a second time (vitest.config.ts): a
 * desktop whose browser reports its language as Chromium does in the POSIX locale
 * (`POSIX_LANGUAGE`), as it does for a Linux user whose locale is C or POSIX, or who has none.
 * Tag a story `posix-locale` when what it draws hands the browser's language to `Intl` or a date
 * library, as `ReqoreDatePicker` does.
 */
export const POSIX_LOCALE_STORY_PROJECT = 'storybook-posix-locale';

/**
 * The language Chromium reports (`navigator.language`) where it takes it from the POSIX locale (C,
 * C.UTF-8, POSIX, or no locale at all): no BCP 47 tag, so `Intl` throws a `RangeError` on it. The
 * `posix-locale` project gives its browser this language through Playwright's `locale`, because
 * not every build takes it from the platform: the amd64 Linux one the CI runs reports `en-US`
 * whatever the locale says.
 */
export const POSIX_LANGUAGE = 'en-US@posix';
