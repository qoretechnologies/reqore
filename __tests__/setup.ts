// Vitest global setup for the unit-test project (jsdom).
import '@testing-library/jest-dom/vitest';
import React from 'react';
import {
  resetIntersectionMocking,
  setupIntersectionMocking,
} from 'react-intersection-observer/test-utils';
import { afterEach, beforeEach, vi } from 'vitest';

// Ensure a React symbol exists on the global for any module compiled with the
// classic runtime (React.createElement without an explicit import).
(globalThis as typeof globalThis & { React: typeof React }).React = React;

// Silence noisy log levels during tests (mirrors the previous Jest setup).
global.console = {
  ...console,
  debug: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
};

// react-intersection-observer/test-utils installs its IntersectionObserver mock as
// `vi.fn((cb, options) => {...})`. Vitest 4 refuses to call `new` on a mock whose
// implementation is an arrow function, which breaks components that do
// `new IntersectionObserver(...)` (e.g. Paging) as well as the `useInView` hook.
// Re-run the setup here with a `function`-based mock factory (constructable in
// Vitest 4) so the mock stays a real vi.fn — keeping `mockAllIsIntersecting` working —
// while becoming newable. The library auto-registers its own (broken) beforeEach on
// first import above; this beforeEach registers afterwards and therefore wins.
const newableMockFn = ((impl?: (...args: any[]) => any) =>
  vi.fn(
    impl
      ? function (this: unknown, ...args: any[]) {
          return impl.apply(this, args);
        }
      : function () {}
  )) as unknown as typeof vi.fn;

beforeEach(() => {
  setupIntersectionMocking(newableMockFn);
});

afterEach(() => {
  resetIntersectionMocking();
});
