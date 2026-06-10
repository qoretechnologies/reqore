import { render } from '@testing-library/react';
import { ReqoreErrorBoundary, ReqoreUIProvider } from '../src';

// A child that always throws during render so the boundary catches it.
const Boom = () => {
  throw new Error('boom-from-child');
};

const renderBoundary = () =>
  render(
    <ReqoreUIProvider>
      <ReqoreErrorBoundary>
        <Boom />
      </ReqoreErrorBoundary>
    </ReqoreUIProvider>
  );

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
