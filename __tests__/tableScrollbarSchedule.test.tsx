import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { ReqoreUIProvider } from '../src';
import { ReqoreTableScrollbar } from '../src/components/Table/scrollbar';

/* A table's scrollbar thumb shows while its body scrolls and fades a while after. That while now waits on the app's
   clock when the app gives one (`options.schedule`), as the navigation rail's dwell does: an app that captures its
   pages (the IDE's story runner) caught the thumb on one run and not on the next (qorus#646). */

/** An app's clock: what waits on it, run when the test says. */
const appSchedule = () => {
  const waiting: Array<{ ms: number; fire: () => void; cancelled: boolean }> = [];
  const schedule = (ms: number, fire: () => void) => {
    const wait = { ms, fire, cancelled: false };
    waiting.push(wait);
    return () => {
      wait.cancelled = true;
    };
  };
  return { waiting, schedule };
};

let body: HTMLDivElement | null = null;

const Table = () => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={(element) => {
          body = element;
          (ref as { current: HTMLDivElement | null }).current = element;
        }}
      />
      <ReqoreTableScrollbar targetRef={ref} />
    </div>
  );
};

/** The body, 200 px tall over 1000 px of rows, scrolled to `top`, as a browser reports it. */
const scrollBodyTo = (top: number) =>
  act(() => {
    Object.defineProperties(body!, {
      scrollHeight: { configurable: true, get: () => 1000 },
      clientHeight: { configurable: true, get: () => 200 },
      scrollTop: { configurable: true, get: () => top },
    });
    body!.dispatchEvent(new Event('scroll'));
  });

const thumbOpacity = (container: HTMLElement) => {
  const thumb = container.querySelector('.reqore-table-scrollbar-thumb');
  return thumb ? getComputedStyle(thumb).opacity : undefined;
};

beforeEach(() => {
  vi.useFakeTimers();
  const track = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (
    this: HTMLElement
  ) {
    // the scrollbar's track runs the body's height
    return this.classList.contains('reqore-table-scrollbar') ? 200 : (track?.get?.call(this) ?? 0);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

test("the thumb fades on the app's schedule, not on the machine's clock", () => {
  const { waiting, schedule } = appSchedule();
  const { container } = render(
    <ReqoreUIProvider options={{ schedule }}>
      <Table />
    </ReqoreUIProvider>
  );

  scrollBodyTo(400);
  const shown = thumbOpacity(container);
  act(() => {
    vi.advanceTimersByTime(60_000);
  });
  // however long the machine waits, the thumb waits for the app
  expect(thumbOpacity(container)).toBe(shown);
  expect(waiting.filter(({ cancelled }) => !cancelled).map(({ ms }) => ms)).toEqual([1200]);

  act(() => waiting.filter(({ cancelled }) => !cancelled)[0].fire());
  expect(thumbOpacity(container)).not.toBe(shown);
});

test('another scroll puts off the fade: the pending one is cancelled', () => {
  const { waiting, schedule } = appSchedule();
  render(
    <ReqoreUIProvider options={{ schedule }}>
      <Table />
    </ReqoreUIProvider>
  );

  scrollBodyTo(400);
  scrollBodyTo(500);

  expect(waiting.map(({ cancelled }) => cancelled)).toEqual([true, false]);
});

test('without an app schedule the thumb fades on a timer, as before', () => {
  const { container } = render(
    <ReqoreUIProvider>
      <Table />
    </ReqoreUIProvider>
  );

  scrollBodyTo(400);
  const shown = thumbOpacity(container);
  act(() => {
    vi.advanceTimersByTime(1200);
  });
  expect(thumbOpacity(container)).not.toBe(shown);
});
