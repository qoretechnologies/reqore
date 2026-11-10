import { render } from '@testing-library/react';
import { ReqoreErrorBoundary, ReqoreUIProvider } from '../src';

// A child that always throws during render so the boundary catches it.
const Boom = () => {
  throw new Error('boom-from-child');
};

/**
 * Renders a boundary around Boom. React, in development, reports the error the boundary catches as uncaught too, by
 * dispatching it to the window, and jsdom printed every such report on the test run's output. The error is what these
 * tests are about, so they take its report (cancelled, as a page that handles it does) and check it came.
 */
const renderBoundary = () => {
  const reported: Error[] = [];
  const onError = (event: ErrorEvent) => {
    if (event.error instanceof Error && event.error.message === 'boom-from-child') {
      reported.push(event.error);
      event.preventDefault();
    }
  };
  window.addEventListener('error', onError);
  let rendered: ReturnType<typeof render>;
  try {
    rendered = render(
      <ReqoreUIProvider>
        <ReqoreErrorBoundary>
          <Boom />
        </ReqoreErrorBoundary>
      </ReqoreUIProvider>
    );
  } finally {
    window.removeEventListener('error', onError);
  }
  expect(reported.length).toBeGreaterThan(0);
  return rendered;
};

test('ReqoreErrorBoundary logs the caught error to the console', () => {
  // React also logs caught errors in jsdom/dev; mute the noise but capture calls
  // so we can assert our own log fired (in a production build React stays quiet,
  // which is exactly why the boundary must log itself).
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  try {
    renderBoundary();

    const logged = spy.mock.calls.some(
      (args) =>
        typeof args[0] === 'string' &&
        args[0].includes('ReqoreErrorBoundary caught an error') &&
        args.some((a) => a instanceof Error && a.message === 'boom-from-child')
    );
    expect(logged).toBe(true);
  } finally {
    spy.mockRestore();
  }
});

test('ReqoreErrorBoundary still renders a visible fallback when a child throws', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  try {
    const { getByText } = renderBoundary();
    expect(getByText('Something went wrong')).toBeTruthy();
  } finally {
    spy.mockRestore();
  }
});
