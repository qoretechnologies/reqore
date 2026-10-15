import { fireEvent, render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { ReqoreLayoutContent, ReqoreTable, ReqoreUIProvider } from '../src';
import { IReqoreInputProps } from '../src/components/Input';

/*
 * A narrow table's search is a button until it is used (qorus#646). Shown only for the text in it -
 * the table narrowed with a search in it - the field went away with its last character, or with its
 * clear button, and the focus that was in it fell to the page. And a caller's `filterProps`
 * handlers replaced the ones that close the open field.
 */

/*
 * Every observer reports the width it is told, now and again on `resize`. Installed before the
 * table is imported: react-use's `useMeasure`, which measures the table, settles at import time on
 * a version that measures nothing where there is no ResizeObserver, as under jsdom.
 */
const SizedResizeObserver = vi.hoisted(() => {
  class Observer {
    static width = 900;
    static instances: Observer[] = [];
    readonly targets: Element[] = [];
    constructor(readonly callback: ResizeObserverCallback) {
      Observer.instances.push(this);
    }
    observe(target: Element) {
      this.targets.push(target);
      this.report(target);
    }
    unobserve() {}
    disconnect() {}
    report(target: Element) {
      const width = Observer.width;
      this.callback(
        [
          {
            target,
            contentRect: { x: 0, y: 0, top: 0, left: 0, width, height: 400, right: width },
            contentBoxSize: [{ inlineSize: width, blockSize: 400 }],
          } as unknown as ResizeObserverEntry,
        ],
        this as unknown as ResizeObserver
      );
    }
  }

  (globalThis as Record<string, unknown>).ResizeObserver = Observer;

  return Observer;
});

const resize = (width: number) => {
  SizedResizeObserver.width = width;
  act(() => {
    for (const observer of SizedResizeObserver.instances) {
      observer.targets.forEach((target) => observer.report(target));
    }
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  SizedResizeObserver.width = 900;
  SizedResizeObserver.instances = [];
});

afterEach(() => {
  vi.useRealTimers();
});

const renderTable = (filterProps?: () => IReqoreInputProps) =>
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTable
            label='Workflows'
            filterable
            filterProps={filterProps}
            columns={[{ dataId: 'name', header: { label: 'Name' }, width: 200 }]}
            data={[{ name: 'Alpha' }, { name: 'Beta' }]}
            height={300}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

const searchField = () =>
  document.querySelector<HTMLInputElement>('.reqore-panel-title input.reqore-input');
const searchToggle = () => document.querySelector<HTMLElement>('.reqore-table-search-toggle');
const type = (value: string) => {
  fireEvent.change(searchField()!, { target: { value } });
  act(() => {
    vi.advanceTimersByTime(400);
  });
};

/** A search typed into a wide table, which then narrows with the focus still in the field. */
const narrowWithTextTyped = () => {
  renderTable();
  expect(searchToggle()).toBeNull();
  searchField()!.focus();
  type('alp');
  resize(300);
  // narrow, the field stays for its text, and the focus with it
  expect(searchField()).not.toBeNull();
  expect(document.activeElement).toBe(searchField());
};

test('A folded search emptied while it is typed in stays open, with the focus in it', () => {
  narrowWithTextTyped();

  type('');

  expect(searchField()).not.toBeNull();
  expect(document.activeElement).toBe(searchField());
  // and left empty, it closes as an open search does
  act(() => {
    searchField()!.blur();
  });
  expect(searchField()).toBeNull();
  expect(searchToggle()).not.toBeNull();
});

test('A folded search emptied with its clear button stays open, with the focus in it', () => {
  narrowWithTextTyped();

  fireEvent.click(document.querySelector('.reqore-clear-input-button')!);
  act(() => {
    vi.advanceTimersByTime(400);
  });

  expect(searchField()).not.toBeNull();
  expect(searchField()!.value).toBe('');
  expect(document.activeElement).toBe(searchField());
});

test("A folded search closes on Escape, calling the caller's own key and blur handlers too", () => {
  const onKeyDown = vi.fn();
  const onBlur = vi.fn();
  SizedResizeObserver.width = 300;
  renderTable(() => ({ onKeyDown, onBlur }));

  fireEvent.click(searchToggle()!);
  act(() => {
    vi.advanceTimersByTime(1);
  });
  expect(document.activeElement).toBe(searchField());

  fireEvent.keyDown(searchField()!, { key: 'Escape' });
  act(() => {
    vi.advanceTimersByTime(1);
  });

  expect(onKeyDown).toHaveBeenCalledTimes(1);
  expect(searchField()).toBeNull();
  expect(document.activeElement).toBe(searchToggle());

  // the blur handler too: opened again and left empty, it closes and the caller hears it
  fireEvent.click(searchToggle()!);
  act(() => {
    vi.advanceTimersByTime(1);
  });
  act(() => {
    searchField()!.blur();
  });
  expect(onBlur).toHaveBeenCalledTimes(1);
  expect(searchField()).toBeNull();
});
