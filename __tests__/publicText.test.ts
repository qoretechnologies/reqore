// Copyright 2026 Qore Technologies, s.r.o.
import { findInternalNames, publicFiles } from '../scripts/publicTextGate.mjs';

/**
 * Reqore is public: its sources, stories, tests and docs name nothing of the private world it was built in (the apps
 * that use it and their screens, private issues, people, review and board ids, internal documents and hosts). Say
 * what a component does and why, in words anyone can read. See `scripts/publicTextGate.mjs`.
 */
test('the public text names nothing internal', () => {
  const found = findInternalNames(publicFiles()).map(
    ({ file, line, kind, text }) => `${file}:${line}: ${text} (${kind})`
  );

  expect(found).toEqual([]);
});
