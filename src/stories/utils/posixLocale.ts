// Copyright 2026 Qore Technologies, s.r.o.

/**
 * The Vitest project the stories tagged `posix-locale` run in a second time (vitest.config.ts): a
 * desktop whose browser is launched in the POSIX locale (`LANG=C.UTF-8`, `LC_ALL=C.UTF-8`). On
 * Linux, Chromium then reports its language as `en-US@posix`, which is no BCP 47 tag, as it does
 * for a Linux user whose locale is C or POSIX, or who has none. Tag a story `posix-locale` when
 * what it draws hands the browser's language to `Intl` or a date library, as `ReqoreDatePicker`
 * does.
 */
export const POSIX_LOCALE_STORY_PROJECT = 'storybook-posix-locale';
