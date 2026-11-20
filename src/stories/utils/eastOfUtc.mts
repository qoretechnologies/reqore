// Copyright 2026 Qore Technologies, s.r.o.

/**
 * The Vitest project the stories tagged `east-of-utc` run in a second time (vitest.config.mts): a
 * desktop whose browser is in a time zone well east of UTC (`EAST_OF_UTC_ZONE`), where the start of
 * a local day is the day before in UTC. Tag a story `east-of-utc` when what it draws or gives back
 * depends on the browser's zone: a date read or written as a day (`ReqoreDatePicker plainDate`),
 * which a conversion through UTC moves to the day before there and nowhere west of Greenwich, where
 * the CI runs (UTC).
 */
export const EAST_OF_UTC_STORY_PROJECT = 'storybook-east-of-utc';

/** 13 hours ahead of UTC in the southern summer (12 in its winter): a local midnight is the day before in UTC. */
export const EAST_OF_UTC_ZONE = 'Pacific/Auckland';
